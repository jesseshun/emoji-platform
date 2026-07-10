import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ─── 1. Create Super Admin ──────────────────────────────
  const passwordHash = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash },
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'super_admin',
      status: 'active',
    },
  });
  console.log(`✅ Admin user: ${admin.email} (${admin.role})`);

  // ─── 2. Create Categories ───────────────────────────────
  const categoryData = [
    { slug: 'smileys-emotion', iconEmoji: '😀', zhName: '笑脸与表情', enName: 'Smileys & Emotion' },
    { slug: 'people-body', iconEmoji: '👋', zhName: '人物与身体', enName: 'People & Body' },
    { slug: 'animals-nature', iconEmoji: '🐶', zhName: '动物与自然', enName: 'Animals & Nature' },
    { slug: 'food-drink', iconEmoji: '🍎', zhName: '食物与饮料', enName: 'Food & Drink' },
    { slug: 'travel-places', iconEmoji: '🚗', zhName: '旅行与地点', enName: 'Travel & Places' },
    { slug: 'activities', iconEmoji: '⚽', zhName: '活动', enName: 'Activities' },
    { slug: 'objects', iconEmoji: '💡', zhName: '物品', enName: 'Objects' },
    { slug: 'symbols', iconEmoji: '❤️', zhName: '符号', enName: 'Symbols' },
    { slug: 'flags', iconEmoji: '🚩', zhName: '旗帜', enName: 'Flags' },
    { slug: 'component', iconEmoji: '🧩', zhName: '组件', enName: 'Component' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { iconEmoji: cat.iconEmoji, status: 'published' },
      create: {
        slug: cat.slug,
        iconEmoji: cat.iconEmoji,
        status: 'published',
        sortOrder: categoryData.indexOf(cat),
      },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: 'en' } },
      update: { name: cat.enName },
      create: {
        categoryId: category.id,
        locale: 'en',
        name: cat.enName,
      },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: 'zh' } },
      update: { name: cat.zhName },
      create: {
        categoryId: category.id,
        locale: 'zh',
        name: cat.zhName,
      },
    });

    categories[cat.slug] = category.id;
    console.log(`  📁 ${cat.enName} / ${cat.zhName}`);
  }
  console.log(`✅ Created ${categoryData.length} categories\n`);

  // ─── 3. Create Subcategories ────────────────────────────
  const subcategoryData = [
    { parent: 'smileys-emotion', slug: 'face-smiling', iconEmoji: '😊', zhName: '笑脸', enName: 'Face Smiling' },
    { parent: 'smileys-emotion', slug: 'face-affection', iconEmoji: '😍', zhName: '情感表情', enName: 'Face Affection' },
    { parent: 'people-body', slug: 'hand-fingers', iconEmoji: '👍', zhName: '手势', enName: 'Hand Fingers' },
    { parent: 'animals-nature', slug: 'animal-mammal', iconEmoji: '🐱', zhName: '哺乳动物', enName: 'Animal Mammal' },
    { parent: 'food-drink', slug: 'food-fruit', iconEmoji: '🍓', zhName: '水果', enName: 'Food Fruit' },
    { parent: 'symbols', slug: 'heart', iconEmoji: '💕', zhName: '爱心', enName: 'Heart' },
  ];

  const subcategories: Record<string, string> = {};
  for (const sub of subcategoryData) {
    const parentId = categories[sub.parent];
    const subcategory = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId, iconEmoji: sub.iconEmoji, status: 'published' },
      create: {
        parentId,
        slug: sub.slug,
        iconEmoji: sub.iconEmoji,
        status: 'published',
      },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: subcategory.id, locale: 'en' } },
      update: { name: sub.enName },
      create: { categoryId: subcategory.id, locale: 'en', name: sub.enName },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: subcategory.id, locale: 'zh' } },
      update: { name: sub.zhName },
      create: { categoryId: subcategory.id, locale: 'zh', name: sub.zhName },
    });

    subcategories[sub.slug] = subcategory.id;
    console.log(`  📂 ${sub.enName} / ${sub.zhName} (parent: ${sub.parent})`);
  }
  console.log(`✅ Created ${subcategoryData.length} subcategories\n`);

  // ─── 4. Create Emojis ───────────────────────────────────
  const emojiData = [
    { emoji: '😀', slug: 'grinning-face', unicode: 'U+1F600', hex: '&#x1F600;', dec: '&#128512;', shortcode: ':grinning:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😃', slug: 'grinning-face-with-big-eyes', unicode: 'U+1F603', hex: '&#x1F603;', dec: '&#128515;', shortcode: ':smiley:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😄', slug: 'grinning-face-with-smiling-eyes', unicode: 'U+1F604', hex: '&#x1F604;', dec: '&#128516;', shortcode: ':smile:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😁', slug: 'beaming-face-with-smiling-eyes', unicode: 'U+1F601', hex: '&#x1F601;', dec: '&#128513;', shortcode: ':grin:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😆', slug: 'grinning-squinting-face', unicode: 'U+1F606', hex: '&#x1F606;', dec: '&#128518;', shortcode: ':laughing:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😅', slug: 'grinning-face-with-sweat', unicode: 'U+1F605', hex: '&#x1F605;', dec: '&#128517;', shortcode: ':sweat_smile:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😂', slug: 'face-with-tears-of-joy', unicode: 'U+1F602', hex: '&#x1F602;', dec: '&#128514;', shortcode: ':joy:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '🤣', slug: 'rolling-on-the-floor-laughing', unicode: 'U+1F923', hex: '&#x1F923;', dec: '&#129315;', shortcode: ':rofl:', version: '3.0', uv: '9.0', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😊', slug: 'smiling-face-with-smiling-eyes', unicode: 'U+1F60A', hex: '&#x1F60A;', dec: '&#128522;', shortcode: ':blush:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😍', slug: 'smiling-face-with-heart-eyes', unicode: 'U+1F60D', hex: '&#x1F60D;', dec: '&#128525;', shortcode: ':heart_eyes:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-affection' },
    { emoji: '🥰', slug: 'smiling-face-with-hearts', unicode: 'U+1F970', hex: '&#x1F970;', dec: '&#129392;', shortcode: ':smiling_face_with_3_hearts:', version: '11.0', uv: '11.0', category: 'smileys-emotion', subcategory: 'face-affection' },
    { emoji: '😘', slug: 'face-blowing-a-kiss', unicode: 'U+1F618', hex: '&#x1F618;', dec: '&#128536;', shortcode: ':kissing_heart:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-affection' },
    { emoji: '😗', slug: 'kissing-face', unicode: 'U+1F617', hex: '&#x1F617;', dec: '&#128535;', shortcode: ':kissing:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-affection' },
    { emoji: '😋', slug: 'face-savoring-food', unicode: 'U+1F60B', hex: '&#x1F60B;', dec: '&#128523;', shortcode: ':yum:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😛', slug: 'face-with-tongue', unicode: 'U+1F61B', hex: '&#x1F61B;', dec: '&#128539;', shortcode: ':stuck_out_tongue:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '🤩', slug: 'star-struck', unicode: 'U+1F929', hex: '&#x1F929;', dec: '&#129321;', shortcode: ':star_struck:', version: '5.0', uv: '10.0', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '😎', slug: 'smiling-face-with-sunglasses', unicode: 'U+1F60E', hex: '&#x1F60E;', dec: '&#128526;', shortcode: ':sunglasses:', version: '1.0', uv: '6.1', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '🤗', slug: 'hugging-face', unicode: 'U+1F917', hex: '&#x1F917;', dec: '&#129303;', shortcode: ':hugging:', version: '1.0', uv: '8.0', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '🤔', slug: 'thinking-face', unicode: 'U+1F914', hex: '&#x1F914;', dec: '&#129300;', shortcode: ':thinking:', version: '1.0', uv: '8.0', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '🤐', slug: 'zipper-mouth-face', unicode: 'U+1F910', hex: '&#x1F910;', dec: '&#129296;', shortcode: ':zipper_mouth:', version: '1.0', uv: '8.0', category: 'smileys-emotion', subcategory: 'face-smiling' },
    { emoji: '❤️', slug: 'red-heart', unicode: 'U+2764 U+FE0F', hex: '&#x2764;&#xFE0F;', dec: '&#10084;&#65039;', shortcode: ':heart:', version: '1.0', uv: '1.1', category: 'symbols', subcategory: 'heart' },
    { emoji: '🧡', slug: 'orange-heart', unicode: 'U+1F9E1', hex: '&#x1F9E1;', dec: '&#129505;', shortcode: ':orange_heart:', version: '5.0', uv: '10.0', category: 'symbols', subcategory: 'heart' },
    { emoji: '💛', slug: 'yellow-heart', unicode: 'U+1F49B', hex: '&#x1F49B;', dec: '&#128155;', shortcode: ':yellow_heart:', version: '1.0', uv: '6.1', category: 'symbols', subcategory: 'heart' },
    { emoji: '💚', slug: 'green-heart', unicode: 'U+1F49A', hex: '&#x1F49A;', dec: '&#128154;', shortcode: ':green_heart:', version: '1.0', uv: '6.1', category: 'symbols', subcategory: 'heart' },
    { emoji: '💙', slug: 'blue-heart', unicode: 'U+1F499', hex: '&#x1F499;', dec: '&#128153;', shortcode: ':blue_heart:', version: '1.0', uv: '6.1', category: 'symbols', subcategory: 'heart' },
    { emoji: '💜', slug: 'purple-heart', unicode: 'U+1F49C', hex: '&#x1F49C;', dec: '&#128156;', shortcode: ':purple_heart:', version: '1.0', uv: '6.1', category: 'symbols', subcategory: 'heart' },
    { emoji: '👍', slug: 'thumbs-up', unicode: 'U+1F44D', hex: '&#x1F44D;', dec: '&#128077;', shortcode: ':thumbsup:', version: '1.0', uv: '6.1', category: 'people-body', subcategory: 'hand-fingers' },
    { emoji: '👎', slug: 'thumbs-down', unicode: 'U+1F44E', hex: '&#x1F44E;', dec: '&#128078;', shortcode: ':thumbsdown:', version: '1.0', uv: '6.1', category: 'people-body', subcategory: 'hand-fingers' },
    { emoji: '👏', slug: 'clapping-hands', unicode: 'U+1F44F', hex: '&#x1F44F;', dec: '&#128079;', shortcode: ':clap:', version: '1.0', uv: '6.1', category: 'people-body', subcategory: 'hand-fingers' },
    { emoji: '🍎', slug: 'red-apple', unicode: 'U+1F34E', hex: '&#x1F34E;', dec: '&#127822;', shortcode: ':apple:', version: '1.0', uv: '6.1', category: 'food-drink', subcategory: 'food-fruit' },
  ];

  const emojiRecords: Record<string, string> = {};
  for (const e of emojiData) {
    const catId = categories[e.category] ?? null;
    const subId = subcategories[e.subcategory] ?? null;

    const emoji = await prisma.emoji.upsert({
      where: { slug: e.slug },
      update: {
        emojiChar: e.emoji,
        unicodeCodepoint: e.unicode,
        htmlDecimal: e.dec,
        htmlHex: e.hex,
        shortcode: e.shortcode,
        emojiVersion: e.version,
        unicodeVersion: e.uv,
        categoryId: catId,
        subcategoryId: subId,
        status: 'published',
      },
      create: {
        emojiChar: e.emoji,
        slug: e.slug,
        unicodeCodepoint: e.unicode,
        htmlDecimal: e.dec,
        htmlHex: e.hex,
        shortcode: e.shortcode,
        emojiVersion: e.version,
        unicodeVersion: e.uv,
        categoryId: catId,
        subcategoryId: subId,
        status: 'published',
      },
    });

    emojiRecords[e.slug] = emoji.id;

    // English translation
    await prisma.emojiTranslation.upsert({
      where: { emojiId_locale: { emojiId: emoji.id, locale: 'en' } },
      update: {},
      create: {
        emojiId: emoji.id,
        locale: 'en',
        name: e.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        shortName: e.shortcode,
        oneLineMeaning: `The ${e.slug.replace(/-/g, ' ')} emoji`,
        meaning: `The ${e.slug.replace(/-/g, ' ')} emoji represents ${e.slug.replace(/-/g, ' ')}. It is commonly used in digital communication to express this concept visually and quickly.`,
        usageNotes: `Use the ${e.slug.replace(/-/g, ' ')} emoji when you want to express ${e.slug.replace(/-/g, ' ')} in text messages, social media posts, or emails.`,
        formalUsageNotes: `In formal communication, this emoji should be used sparingly. Consider your audience and context before including it.`,
        informalUsageNotes: `In casual chat, this emoji is perfectly fine to use freely with friends and family.`,
        socialUsageNotes: `On social media platforms, this emoji can help increase engagement and add personality to your posts.`,
        examples: JSON.stringify([
          { text: `I'm feeling so happy today! ${e.emoji}`, context: 'casual chat' },
          { text: `Check out this amazing news ${e.emoji}`, context: 'social media' },
        ]),
        keywords: JSON.stringify([e.slug.replace(/-/g, ' '), 'emoji', 'icon', 'symbol']),
        faqJson: JSON.stringify([
          { question: `What does the ${e.emoji} emoji mean?`, answer: `It represents ${e.slug.replace(/-/g, ' ')} and is commonly used to express related emotions or concepts.` },
          { question: `When was ${e.emoji} added to Unicode?`, answer: `It was added in Unicode version ${e.uv}.` },
        ]),
        seoTitle: `${e.emoji} ${e.slug.replace(/-/g, ' ')} Emoji - Meaning and Usage`,
        seoDescription: `Learn the meaning of the ${e.emoji} emoji. Discover how to use the ${e.slug.replace(/-/g, ' ')} emoji in your messages, its Unicode details, and more.`,
        status: 'published',
        reviewStatus: 'approved',
      },
    });

    // Chinese translation
    const zhNames: Record<string, string> = {
      'grinning-face': '咧嘴笑',
      'grinning-face-with-big-eyes': '大笑',
      'grinning-face-with-smiling-eyes': '开心笑',
      'beaming-face-with-smiling-eyes': '得意笑',
      'grinning-squinting-face': '笑眯眼',
      'grinning-face-with-sweat': '尴尬笑',
      'face-with-tears-of-joy': '笑哭',
      'rolling-on-the-floor-laughing': '笑趴',
      'smiling-face-with-smiling-eyes': '微笑',
      'smiling-face-with-heart-eyes': '花痴',
      'smiling-face-with-hearts': '三心笑脸',
      'face-blowing-a-kiss': '飞吻',
      'kissing-face': '亲亲',
      'face-savoring-food': '好吃',
      'face-with-tongue': '吐舌',
      'star-struck': '星星眼',
      'smiling-face-with-sunglasses': '墨镜笑',
      'hugging-face': '抱抱',
      'thinking-face': '思考',
      'zipper-mouth-face': '拉链嘴',
      'red-heart': '红心',
      'orange-heart': '橙心',
      'yellow-heart': '黄心',
      'green-heart': '绿心',
      'blue-heart': '蓝心',
      'purple-heart': '紫心',
      'thumbs-up': '点赞',
      'thumbs-down': '踩',
      'clapping-hands': '鼓掌',
      'red-apple': '红苹果',
    };

    const zhName = zhNames[e.slug] ?? e.slug;
    await prisma.emojiTranslation.upsert({
      where: { emojiId_locale: { emojiId: emoji.id, locale: 'zh' } },
      update: {},
      create: {
        emojiId: emoji.id,
        locale: 'zh',
        name: zhName,
        shortName: e.shortcode,
        oneLineMeaning: `${e.emoji} ${zhName}表情符号`,
        meaning: `${e.emoji} ${zhName}表情符号用于表达${zhName}的含义。在日常聊天、社交媒体和邮件中广泛使用，是一种快速直观的表达方式。`,
        usageNotes: `当你想要表达${zhName}相关的情绪或概念时，可以使用${e.emoji}表情。`,
        formalUsageNotes: `在正式沟通中建议谨慎使用此表情符号，请根据受众和场景判断是否合适。`,
        informalUsageNotes: `在非正式聊天中可以随意使用此表情，与朋友和家人交流时非常合适。`,
        socialUsageNotes: `在社交媒体上，此表情可以增加帖子的亲和力和互动率。`,
        examples: JSON.stringify([
          { text: `今天心情真好！${e.emoji}`, context: '日常聊天' },
          { text: `快来看这个好消息 ${e.emoji}`, context: '社交媒体' },
        ]),
        keywords: JSON.stringify([zhName, '表情', '符号', 'emoji']),
        faqJson: JSON.stringify([
          { question: `${e.emoji} 表情是什么意思？`, answer: `它代表${zhName}，通常用于表达相关的情绪或概念。` },
          { question: `${e.emoji} 是什么时候加入 Unicode 的？`, answer: `它在 Unicode ${e.uv} 版本中加入。` },
        ]),
        seoTitle: `${e.emoji} ${zhName}表情 - 含义与用法详解`,
        seoDescription: `了解${e.emoji} ${zhName}表情的含义。发现如何在消息中使用${zhName}表情，查看 Unicode 详细信息等。`,
        status: 'published',
        reviewStatus: 'approved',
      },
    });
  }
  console.log(`✅ Created ${emojiData.length} emojis with zh/en translations\n`);

  // ─── 5. Create Topics ───────────────────────────────────
  const topicData = [
    {
      slug: 'popular-2024',
      topicType: 'trending',
      zhTitle: '2024 年度热门表情',
      enTitle: 'Popular Emojis of 2024',
      zhSummary: '探索 2024 年最受欢迎的表情符号，了解它们的含义和使用场景。',
      enSummary: 'Explore the most popular emojis of 2024, their meanings, and usage scenarios.',
      emojis: ['face-with-tears-of-joy', 'red-heart', 'rolling-on-the-floor-laughing', 'thumbs-up', 'smiling-face-with-heart-eyes'],
    },
    {
      slug: 'heart-colors',
      topicType: 'guide',
      zhTitle: '爱心表情颜色指南',
      enTitle: 'Heart Emoji Color Guide',
      zhSummary: '不同颜色爱心表情的含义和用法全解析。',
      enSummary: 'A complete guide to the meanings and usage of different colored heart emojis.',
      emojis: ['red-heart', 'orange-heart', 'yellow-heart', 'green-heart', 'blue-heart', 'purple-heart'],
    },
    {
      slug: 'hand-gestures',
      topicType: 'guide',
      zhTitle: '手势表情使用指南',
      enTitle: 'Hand Gesture Emoji Guide',
      zhSummary: '了解常用手势表情的正确含义，避免使用误区。',
      enSummary: 'Learn the correct meanings of common hand gesture emojis and avoid misuse.',
      emojis: ['thumbs-up', 'thumbs-down', 'clapping-hands'],
    },
    {
      slug: 'food-fun',
      topicType: 'collection',
      zhTitle: '美食表情合集',
      enTitle: 'Food Emoji Collection',
      zhSummary: '用表情传递美食的快乐，收录最常用的美食表情。',
      enSummary: 'Spread the joy of food with emojis — a collection of the most popular food emojis.',
      emojis: ['red-apple', 'face-savoring-food'],
    },
    {
      slug: 'face-expressions',
      topicType: 'guide',
      zhTitle: '表情符号使用完全指南',
      enTitle: 'Complete Guide to Facial Expression Emojis',
      zhSummary: '从微笑到笑哭，一文掌握所有面部表情符号的正确用法。',
      enSummary: 'From smile to tears of joy — master the correct usage of all facial expression emojis in one guide.',
      emojis: ['grinning-face', 'grinning-face-with-big-eyes', 'face-with-tears-of-joy', 'smiling-face-with-smiling-eyes', 'thinking-face'],
    },
  ];

  for (const topic of topicData) {
    const t = await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: { topicType: topic.topicType, status: 'published', publishedAt: new Date() },
      create: {
        slug: topic.slug,
        topicType: topic.topicType,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await prisma.topicTranslation.upsert({
      where: { topicId_locale: { topicId: t.id, locale: 'en' } },
      update: {},
      create: {
        topicId: t.id,
        locale: 'en',
        title: topic.enTitle,
        summary: topic.enSummary,
        content: `# ${topic.enTitle}\n\n${topic.enSummary}\n\nThis topic covers essential information about these emojis.`,
        seoTitle: topic.enTitle,
        seoDescription: topic.enSummary,
      },
    });

    await prisma.topicTranslation.upsert({
      where: { topicId_locale: { topicId: t.id, locale: 'zh' } },
      update: {},
      create: {
        topicId: t.id,
        locale: 'zh',
        title: topic.zhTitle,
        summary: topic.zhSummary,
        content: `# ${topic.zhTitle}\n\n${topic.zhSummary}\n\n本专题涵盖了这些表情符号的核心信息。`,
        seoTitle: topic.zhTitle,
        seoDescription: topic.zhSummary,
      },
    });

    // Bind emojis to topic
    for (let i = 0; i < topic.emojis.length; i++) {
      const emojiId = emojiRecords[topic.emojis[i]];
      if (emojiId) {
        await prisma.topicEmoji.upsert({
          where: { topicId_emojiId: { topicId: t.id, emojiId } },
          update: { sortOrder: i },
          create: {
            topicId: t.id,
            emojiId,
            sortOrder: i,
          },
        });
      }
    }
    console.log(`  📝 ${topic.enTitle} (${topic.emojis.length} emojis)`);
  }
  console.log(`✅ Created ${topicData.length} topics\n`);

  // ─── 5.5 Create Articles ──────────────────────────────
  const articleData = [
    {
      slug: 'how-to-read-emoji-meaning',
      zhTitle: '如何读懂表情符号的含义',
      enTitle: 'How to Read the Meaning of Emojis',
      zhSummary: '从语境、文化和平台差异三个角度，教你准确理解表情符号的含义。',
      enSummary:
        'Understand emoji meanings accurately from context, culture, and cross-platform differences.',
      zhContent:
        '# 如何读懂表情符号的含义\n\n表情符号的含义并非固定不变，它会随语境、文化与平台而不同。\n\n## 看语境\n\n同一个表情在朋友聊天和工作邮件中含义可能完全不同。\n\n## 看平台\n\n不同系统对同一表情的渲染略有差异，理解时请以实际发送平台为准。',
      enContent:
        '# How to Read the Meaning of Emojis\n\nEmoji meaning is not fixed — it shifts with context, culture, and platform.\n\n## Context\n\nThe same emoji can mean different things in a chat with friends vs. a work email.\n\n## Platform\n\nRendering differs slightly across systems; interpret based on the platform used.',
      zhKeywords: ['表情含义', 'emoji', '语境', '解读'],
      enKeywords: ['emoji meaning', 'emoji', 'context', 'interpretation'],
      seoTitle: '如何读懂表情符号的含义 - Emoji 含义解读指南',
      seoDescription: '从语境、文化和平台差异三个角度，教你准确理解表情符号的含义。',
      status: 'published' as const,
    },
    {
      slug: 'emoji-history-and-unicode',
      zhTitle: '表情符号与 Unicode 简史',
      enTitle: 'A Brief History of Emoji and Unicode',
      zhSummary: '了解表情符号是如何被纳入 Unicode 标准，并逐步走向全球化的。',
      enSummary: 'Learn how emojis were adopted into the Unicode standard and went global.',
      zhContent:
        '# 表情符号与 Unicode 简史\n\n表情符号最早由日本运营商推出，后由 Unicode 联盟统一编码，才实现跨平台一致显示。',
      enContent:
        '# A Brief History of Emoji and Unicode\n\nEmojis started with Japanese carriers, then were standardized by the Unicode Consortium for consistent cross-platform display.',
      zhKeywords: ['Unicode', '表情历史', '标准'],
      enKeywords: ['Unicode', 'emoji history', 'standard'],
      seoTitle: '表情符号与 Unicode 简史 - Emoji 标准化历程',
      seoDescription: '了解表情符号是如何被纳入 Unicode 标准，并逐步走向全球化的。',
      status: 'published' as const,
    },
    {
      slug: 'common-emoji-misuses',
      zhTitle: '常见表情符号误用',
      enTitle: 'Common Emoji Misuses',
      zhSummary: '盘点那些经常被误读或滥用的表情符号，避免沟通误会。',
      enSummary: 'A roundup of frequently misread or overused emojis to avoid miscommunication.',
      zhContent:
        '# 常见表情符号误用\n\n有些表情符号的含义与字面相去甚远，使用前最好确认其常见语境。',
      enContent:
        '# Common Emoji Misuses\n\nSome emojis mean something far from their literal look — check the common context before using them.',
      zhKeywords: ['误用', '表情', '沟通'],
      enKeywords: ['misuse', 'emoji', 'communication'],
      seoTitle: '常见表情符号误用 - 避免沟通误会',
      seoDescription: '盘点那些经常被误读或滥用的表情符号，避免沟通误会。',
      status: 'draft' as const,
    },
  ];

  for (const article of articleData) {
    const a = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        status: article.status,
        publishedAt: article.status === 'published' ? new Date() : null,
        authorId: admin.id,
      },
      create: {
        slug: article.slug,
        status: article.status,
        publishedAt: article.status === 'published' ? new Date() : null,
        authorId: admin.id,
      },
    });

    await prisma.articleTranslation.upsert({
      where: { articleId_locale: { articleId: a.id, locale: 'en' } },
      update: {},
      create: {
        articleId: a.id,
        locale: 'en',
        title: article.enTitle,
        summary: article.enSummary,
        content: article.enContent,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        keywords: JSON.stringify(article.enKeywords),
      },
    });

    await prisma.articleTranslation.upsert({
      where: { articleId_locale: { articleId: a.id, locale: 'zh' } },
      update: {},
      create: {
        articleId: a.id,
        locale: 'zh',
        title: article.zhTitle,
        summary: article.zhSummary,
        content: article.zhContent,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        keywords: JSON.stringify(article.zhKeywords),
      },
    });

    console.log(`  📄 ${article.enTitle} (${article.status})`);
  }
  console.log(`✅ Created ${articleData.length} articles\n`);

  // ─── 6. Create Search Logs ──────────────────────────────
  const searchQueries = [
    { query: 'laugh', locale: 'en' as const, resultCount: 12 },
    { query: 'heart', locale: 'en' as const, resultCount: 25 },
    { query: '笑脸', locale: 'zh' as const, resultCount: 8 },
    { query: '爱心', locale: 'zh' as const, resultCount: 15 },
    { query: 'thumb', locale: 'en' as const, resultCount: 3 },
    { query: '笑哭', locale: 'zh' as const, resultCount: 20 },
    { query: 'kiss', locale: 'en' as const, resultCount: 7 },
    { query: '苹果', locale: 'zh' as const, resultCount: 2 },
    { query: 'clap', locale: 'en' as const, resultCount: 5 },
    { query: '思考', locale: 'zh' as const, resultCount: 9 },
  ];

  for (const sl of searchQueries) {
    await prisma.searchLog.create({
      data: {
        query: sl.query,
        locale: sl.locale,
        resultCount: sl.resultCount,
        country: sl.locale === 'zh' ? 'CN' : 'US',
        ipHash: 'seed-ip-hash',
        userAgent: 'seed-script/1.0',
      },
    });
  }
  console.log(`✅ Created ${searchQueries.length} search logs`);

  // ─── 7. Create Copy Events ──────────────────────────────
  const copyEventEmojis = Object.values(emojiRecords).slice(0, 10);
  for (let i = 0; i < 10; i++) {
    const emojiId = copyEventEmojis[i % copyEventEmojis.length];
    await prisma.copyEvent.create({
      data: {
        emojiId,
        locale: i < 5 ? 'zh' : 'en',
        pageUrl: i < 5 ? '/zh/emojis/' : '/en/emojis/',
        country: i < 5 ? 'CN' : 'US',
        ipHash: 'seed-ip-hash',
      },
    });
  }
  console.log(`✅ Created 10 copy events`);

  // ─── 8. Create Emoji Assets ─────────────────────────────
  const assetProviders = ['noto', 'openmoji', 'twemoji'];
  let assetCount = 0;
  const emojiIds = Object.values(emojiRecords);
  for (let i = 0; i < Math.min(6, emojiIds.length); i++) {
    const provider = assetProviders[i % assetProviders.length];
    const fileType = provider === 'twemoji' ? 'svg' : 'png';
    await prisma.emojiAsset.create({
      data: {
        emojiId: emojiIds[i],
        provider,
        fileType,
        fileUrl: `https://example.com/assets/${provider}/${i}.${fileType}`,
        localPath: `/assets/${provider}/${i}.${fileType}`,
        width: 160,
        height: 160,
        licenseName: provider === 'noto' ? 'SIL Open Font License 1.1' : provider === 'openmoji' ? 'CC BY-SA 4.0' : 'CC BY 4.0',
        licenseUrl: provider === 'noto' ? 'https://scripts.sil.org/OFL' : provider === 'openmoji' ? 'https://creativecommons.org/licenses/by-sa/4.0/' : 'https://creativecommons.org/licenses/by/4.0/',
        attribution: provider === 'noto' ? 'Google Noto Emoji' : provider === 'openmoji' ? 'OpenMoji Project' : 'Twitter Twemoji',
        isDownloadable: true,
        status: 'published',
      },
    });
    assetCount++;
  }
  console.log(`✅ Created ${assetCount} emoji assets\n`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
