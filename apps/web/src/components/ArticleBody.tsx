import type { ReactNode } from 'react';
import type { Locale } from '@/lib/types';

interface ArticleBodyProps {
  content: string;
  locale: Locale;
  title: string;
}

function safeUrl(value: string, kind: 'link' | 'image'): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    (kind === 'link' && trimmed.startsWith('#'))
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const allowed = kind === 'image'
      ? ['http:', 'https:']
      : ['http:', 'https:', 'mailto:'];
    return allowed.includes(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function parseInline(value: string, keyPrefix: string): ReactNode[] {
  const tokenPattern = /(!?\[[^\]]*\]\([^\n)]+\)|`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_)/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = tokenPattern.exec(value)) !== null) {
    if (match.index > cursor) output.push(value.slice(cursor, match.index));

    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    const markdownLink = token.match(/^(!?)\[([^\]]*)\]\((\S+?)(?:\s+["'].*?["'])?\)$/);

    if (markdownLink) {
      const [, imageMarker, label, rawUrl] = markdownLink;
      const kind = imageMarker ? 'image' : 'link';
      const url = safeUrl(rawUrl, kind);

      if (!url) {
        output.push(label || rawUrl);
      } else if (kind === 'image') {
        output.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={url}
            alt={label || 'Article image'}
            loading="lazy"
            className="my-8 block h-auto max-w-full rounded-[8px] border border-border-subtle"
          />,
        );
      } else {
        const external = isExternalUrl(url);
        output.push(
          <a
            key={key}
            href={url}
            className="font-medium text-text-link underline decoration-border-strong underline-offset-4 transition-colors duration-fast hover:text-text-link-hover"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {parseInline(label || rawUrl, `${key}-label`)}
          </a>,
        );
      }
    } else if (token.startsWith('`')) {
      output.push(
        <code key={key} className="rounded-[4px] bg-bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-text-primary">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**') || token.startsWith('__')) {
      output.push(<strong key={key} className="font-semibold text-text-primary">{parseInline(token.slice(2, -2), `${key}-strong`)}</strong>);
    } else {
      output.push(<em key={key}>{parseInline(token.slice(1, -1), `${key}-em`)}</em>);
    }

    cursor = tokenPattern.lastIndex;
  }

  if (cursor < value.length) output.push(value.slice(cursor));
  return output;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string | undefined): boolean {
  if (!line || !line.includes('|')) return false;
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] || '';
  return (
    /^```/.test(line) ||
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    /^\s*(---+|___+|\*\*\*+)\s*$/.test(line) ||
    /^!\[[^\]]*\]\([^\n)]+\)\s*$/.test(line) ||
    isTableSeparator(lines[index + 1])
  );
}

function headingClasses(level: number): string {
  if (level <= 2) return 'mb-4 mt-12 text-2xl font-semibold leading-tight text-text-primary';
  if (level === 3) return 'mb-3 mt-10 text-xl font-semibold leading-snug text-text-primary';
  return 'mb-3 mt-8 text-lg font-semibold leading-snug text-text-primary';
}

export function ArticleBody({ content, locale, title }: ArticleBodyProps) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockIndex = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    const key = `article-block-${blockIndex++}`;
    const fence = line.match(/^```([\w-]+)?\s*$/);
    if (fence) {
      const code: string[] = [];
      index++;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push(
        <pre key={key} className="my-8 max-w-full overflow-x-auto rounded-[8px] bg-[#202124] p-4 text-sm leading-6 text-[#f5f5f7]" tabIndex={0}>
          <code className={fence[1] ? `language-${fence[1]}` : undefined}>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      index++;
      const markdownLevel = heading[1].length;
      const headingText = heading[2].trim();
      if (markdownLevel === 1 && blockIndex === 1 && headingText === title.trim()) continue;
      const level = Math.min(6, Math.max(2, markdownLevel));
      const Heading = `h${level}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <Heading key={key} className={headingClasses(level)}>
          {parseInline(headingText, key)}
        </Heading>,
      );
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["'].*?["'])?\)\s*$/);
    if (image) {
      index++;
      const url = safeUrl(image[2], 'image');
      if (url) {
        blocks.push(
          <figure key={key} className="my-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={image[1] || (locale === 'zh' ? '文章配图' : 'Article illustration')}
              loading="lazy"
              className="h-auto w-full rounded-[8px] border border-border-subtle"
            />
          </figure>,
        );
      } else if (image[1]) {
        blocks.push(<p key={key} className="my-6">{image[1]}</p>);
      }
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
      index++;
      blocks.push(<hr key={key} className="my-10 border-border-subtle" />);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''));
        index++;
      }
      blocks.push(
        <blockquote key={key} className="my-8 border-l-2 border-accent bg-accent-subtle px-5 py-4 text-text-secondary">
          <p>{parseInline(quoteLines.join(' '), key)}</p>
        </blockquote>,
      );
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const items: string[] = [];
      const pattern = unordered ? /^\s*[-*+]\s+(.+)$/ : /^\s*\d+[.)]\s+(.+)$/;
      while (index < lines.length) {
        const item = lines[index].match(pattern);
        if (!item) break;
        items.push(item[1]);
        index++;
      }
      const List = unordered ? 'ul' : 'ol';
      blocks.push(
        <List key={key} className={`my-6 space-y-2 pl-6 ${unordered ? 'list-disc' : 'list-decimal'}`}>
          {items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="pl-1 marker:text-text-muted">
              {parseInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </List>,
      );
      continue;
    }

    if (isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index++;
      }
      blocks.push(
        <div key={key} className="my-8 max-w-full overflow-x-auto rounded-[8px] border border-border-subtle" tabIndex={0} role="region" aria-label={locale === 'zh' ? '可横向滚动的文章表格' : 'Scrollable article table'}>
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-bg-subtle text-text-primary">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={`${key}-h-${headerIndex}`} scope="col" className="whitespace-nowrap border-b border-border px-4 py-3 font-semibold">
                    {parseInline(header, `${key}-h-${headerIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${key}-r-${rowIndex}`} className="border-b border-border-subtle last:border-b-0">
                  {headers.map((_, cellIndex) => (
                    <td key={`${key}-r-${rowIndex}-c-${cellIndex}`} className="px-4 py-3 align-top text-text-secondary">
                      {parseInline(row[cellIndex] || '', `${key}-r-${rowIndex}-c-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index++;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push(
      <p key={key} className="my-6 text-pretty">
        {parseInline(paragraph.join(' '), key)}
      </p>,
    );
  }

  return (
    <div className="article-body min-w-0 text-[1.0625rem] leading-8 text-text-primary [overflow-wrap:anywhere]">
      {blocks}
    </div>
  );
}
