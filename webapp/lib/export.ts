import type { Card } from "./types";

/** Turn a Drive view link into a direct-download link (one-click PDF download). */
export function driveDownloadUrl(link: string): string {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : link;
}

export function cardToPrompt(card: Card, repo?: string): string {
  const meta: string[] = [];
  if (card.authors.length) meta.push(`Authors: ${card.authors.join(", ")}`);
  if (card.year) meta.push(`Year: ${card.year}`);
  if (card.citation_key) meta.push(`Citation key: ${card.citation_key}`);
  if (card.tags.length) meta.push(`Tags: ${card.tags.join(", ")}`);
  meta.push(`Status: ${card.status}`);

  const lines = [
    `## [${card.type}] ${card.title}`,
    "",
    meta.join(" · "),
  ];
  if (card.drive.length) {
    const dl = card.drive.map(driveDownloadUrl).join(" , ");
    lines.push(`Download original PDF 下载原文: ${dl}`);
  }
  if (repo) {
    lines.push(`Card source 卡片源文件: https://github.com/${repo}/blob/main/${card.folder}/${card.slug}.md`);
  }
  lines.push("", card.body.trim());
  return lines.join("\n");
}

export function bundlePrompt(cards: Card[], repo?: string): string {
  const header = [
    "# Knowledge cards from our audio research knowledge base",
    "",
    `${cards.length} knowledge card(s) on audio / ANC / signal processing follow.`,
    "Use them as trusted context for my next questions. Each card has a direct PDF download link — when you recommend a paper, give me its download link so I can fetch the original.",
    "",
    "---",
    "",
  ].join("\n");
  return header + cards.map((c) => cardToPrompt(c, repo)).join("\n\n---\n\n") + "\n";
}

/** Rough token estimate: CJK ≈ 0.6 tok/char, other text ≈ 0.25 tok/char. */
export function estimateTokens(text: string): number {
  const cjk = (text.match(/[一-鿿　-〿]/g) ?? []).length;
  return Math.round(cjk * 0.6 + (text.length - cjk) * 0.25);
}
