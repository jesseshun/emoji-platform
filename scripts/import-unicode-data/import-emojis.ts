/**
 * Emoji Import Script
 *
 * Reads a local JSON file of emoji data, validates fields,
 * auto-generates slugs, creates categories and translations,
 * and imports emojis into the database via Prisma.
 *
 * Usage: pnpm import:emoji [file-path]
 *   Default file: scripts/import-unicode-data/sample-emojis.json
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// ─── Slug utility (inline to avoid ESM/CJS issues with workspace packages) ───

function generateSlug(name: string, codepoint?: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug && codepoint) {
    slug = codepoint.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  if (!slug) {
    slug = 'unknown';
  }

  return slug;
}

// ─── Types ───────────────────────────────────────────────

interface EmojiRecord {
  emoji: string;
  name: string;
  unicode: string;
  category: string;
  subcategory: string;
  emojiVersion: string;
  unicodeVersion: string;
  shortcode: string;
}

interface ImportReport {
  totalRead: number;
  newEmojis: number;
  updatedEmojis: number;
  newCategories: number;
  skipped: number;
  errors: number;
}

// ─── Chinese category name mapping ───────────────────────

const categoryZhNames: Record<string, string> = {
  'Smileys & Emotion': '笑脸与表情',
  'People & Body': '人物与身体',
  'Animals & Nature': '动物与自然',
  'Food & Drink': '食物与饮料',
  'Travel & Places': '旅行与地点',
  'Activities': '活动',
  'Objects': '物品',
  'Symbols': '符号',
  'Flags': '旗帜',
  'Component': '组件',
};

const subcategoryZhNames: Record<string, string> = {
  'face-smiling': '笑脸',
  'face-affection': '情感表情',
  'face-tongue': '吐舌表情',
  'face-hand': '手势表情',
  'face-neutral-skeptical': '中性怀疑',
  'face-sleepy': '困倦表情',
  'face-unwell': '不适表情',
  'face-hat': '帽子表情',
  'face-glasses': '眼镜表情',
  'face-concerned': '担忧表情',
  'face-negative': '负面表情',
  'face-costume': '装扮表情',
  'hand-fingers': '手势',
  'heart': '爱心',
  'food-fruit': '水果',
  'food-vegetable': '蔬菜',
  'animal-mammal': '哺乳动物',
  'animal-bird': '鸟类',
};

// ─── Main import function ────────────────────────────────

async function importEmojis(filePath: string): Promise<ImportReport> {
  const report: ImportReport = {
    totalRead: 0,
    newEmojis: 0,
    updatedEmojis: 0,
    newCategories: 0,
    skipped: 0,
    errors: 0,
  };

  // Read and parse JSON
  let records: EmojiRecord[];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    records = JSON.parse(raw) as EmojiRecord[];
    report.totalRead = records.length;
  } catch (err) {
    console.error(`❌ Failed to read or parse ${filePath}:`, err);
    report.errors = 1;
    return report;
  }

  console.log(`📄 Read ${records.length} emoji records from ${filePath}\n`);

  // Validate fields
  const validRecords: EmojiRecord[] = [];
  for (const record of records) {
    if (!record.emoji || !record.name || !record.unicode) {
      console.warn(`⚠️  Skipping invalid record (missing emoji/name/unicode): ${JSON.stringify(record)}`);
      report.skipped++;
      continue;
    }
    validRecords.push(record);
  }

  console.log(`✅ Valid records: ${validRecords.length} (skipped ${report.skipped})\n`);

  // Track existing slugs for uniqueness
  const slugSet = new Set<string>();

  // Process each emoji
  for (const record of validRecords) {
    try {
      // ─── Ensure category exists ────────────────────────
      const categorySlug = generateSlug(record.category);
      let category = await prisma.category.findUnique({ where: { slug: categorySlug } });

      if (!category) {
        category = await prisma.category.create({
          data: {
            slug: categorySlug,
            status: 'published',
          },
        });
        report.newCategories++;

        // English category translation
        await prisma.categoryTranslation.create({
          data: {
            categoryId: category.id,
            locale: 'en',
            name: record.category,
          },
        });

        // Chinese category translation (placeholder if unknown)
        const zhCatName = categoryZhNames[record.category] ?? record.category;
        await prisma.categoryTranslation.create({
          data: {
            categoryId: category.id,
            locale: 'zh',
            name: zhCatName,
          },
        });

        console.log(`  📁 New category: ${record.category} (${zhCatName})`);
      }

      // ─── Ensure subcategory exists ──────────────────────
      let subcategory = await prisma.category.findUnique({ where: { slug: record.subcategory } });

      if (!subcategory) {
        subcategory = await prisma.category.create({
          data: {
            parentId: category.id,
            slug: record.subcategory,
            status: 'published',
          },
        });
        report.newCategories++;

        // English subcategory translation
        const subEnName = record.subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        await prisma.categoryTranslation.create({
          data: {
            categoryId: subcategory.id,
            locale: 'en',
            name: subEnName,
          },
        });

        // Chinese subcategory translation
        const zhSubName = subcategoryZhNames[record.subcategory] ?? subEnName;
        await prisma.categoryTranslation.create({
          data: {
            categoryId: subcategory.id,
            locale: 'zh',
            name: zhSubName,
          },
        });

        console.log(`  📂 New subcategory: ${record.subcategory}`);
      }

      // ─── Generate slug ──────────────────────────────────
      let slug = generateSlug(record.name, record.unicode);
      // Ensure uniqueness
      if (slugSet.has(slug)) {
        let counter = 2;
        while (slugSet.has(`${slug}-${counter}`)) {
          counter++;
        }
        slug = `${slug}-${counter}`;
      }
      slugSet.add(slug);

      // ─── Upsert emoji ───────────────────────────────────
      const existing = await prisma.emoji.findUnique({ where: { slug } });

      if (existing) {
        await prisma.emoji.update({
          where: { slug },
          data: {
            emojiChar: record.emoji,
            unicodeCodepoint: record.unicode,
            shortcode: record.shortcode,
            emojiVersion: record.emojiVersion,
            unicodeVersion: record.unicodeVersion,
            categoryId: category.id,
            subcategoryId: subcategory.id,
          },
        });
        report.updatedEmojis++;
      } else {
        const newEmoji = await prisma.emoji.create({
          data: {
            emojiChar: record.emoji,
            slug,
            unicodeCodepoint: record.unicode,
            shortcode: record.shortcode,
            emojiVersion: record.emojiVersion,
            unicodeVersion: record.unicodeVersion,
            categoryId: category.id,
            subcategoryId: subcategory.id,
            status: 'published',
          },
        });
        report.newEmojis++;

        // ─── Create English translation ───────────────────
        const enName = record.name.replace(/\b\w/g, c => c.toUpperCase());
        await prisma.emojiTranslation.create({
          data: {
            emojiId: newEmoji.id,
            locale: 'en',
            name: enName,
            shortName: record.shortcode,
            oneLineMeaning: `The ${record.name} emoji`,
            meaning: `The ${record.emoji} ${record.name} emoji represents ${record.name}. Use it to express this concept in digital communication.`,
            usageNotes: `Use when you want to express ${record.name}.`,
            examples: JSON.stringify([
              { text: `I'm feeling great today! ${record.emoji}`, context: 'casual' },
            ]),
            keywords: JSON.stringify(record.name.split(' ')),
            faqJson: JSON.stringify([
              { question: `What does ${record.emoji} mean?`, answer: `It means ${record.name}.` },
            ]),
            seoTitle: `${record.emoji} ${enName} Emoji - Meaning & Usage`,
            seoDescription: `Learn about the ${record.emoji} emoji: meaning, usage, and Unicode details for ${record.name}.`,
            status: 'published',
            reviewStatus: 'approved',
          },
        });

        // ─── Create Chinese translation placeholder ────────
        const zhName = record.name; // placeholder, will be refined later
        await prisma.emojiTranslation.create({
          data: {
            emojiId: newEmoji.id,
            locale: 'zh',
            name: zhName,
            shortName: record.shortcode,
            oneLineMeaning: `${record.emoji} ${record.name} 表情符号`,
            meaning: `${record.emoji} ${record.name} 表情符号，用于表达${record.name}的含义。`,
            usageNotes: `在需要表达${record.name}时使用。`,
            examples: JSON.stringify([
              { text: `今天心情真好！${record.emoji}`, context: '日常' },
            ]),
            keywords: JSON.stringify([record.name, '表情', 'emoji']),
            faqJson: JSON.stringify([
              { question: `${record.emoji} 是什么意思？`, answer: `它代表${record.name}。` },
            ]),
            seoTitle: `${record.emoji} ${record.name} 表情 - 含义与用法`,
            seoDescription: `了解${record.emoji}表情的含义和用法，${record.name}的Unicode信息。`,
            status: 'published',
            reviewStatus: 'approved',
          },
        });
      }
    } catch (err) {
      console.error(`❌ Error processing emoji ${record.emoji} (${record.name}):`, err);
      report.errors++;
    }
  }

  return report;
}

// ─── Entry point ─────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const defaultPath = path.resolve(__dirname, 'sample-emojis.json');
  const filePath = args[0] ? path.resolve(args[0]) : defaultPath;

  console.log('🚀 Emoji Import Script');
  console.log(`   File: ${filePath}\n`);

  const report = await importEmojis(filePath);

  console.log('\n📊 Import Report');
  console.log('─────────────────');
  console.log(`   Total read:       ${report.totalRead}`);
  console.log(`   New emojis:       ${report.newEmojis}`);
  console.log(`   Updated emojis:   ${report.updatedEmojis}`);
  console.log(`   New categories:   ${report.newCategories}`);
  console.log(`   Skipped:          ${report.skipped}`);
  console.log(`   Errors:           ${report.errors}`);
  console.log('─────────────────\n');

  if (report.errors > 0) {
    console.warn('⚠️  Import completed with errors.');
    process.exit(1);
  }

  console.log('✅ Import completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
