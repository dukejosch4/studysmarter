import { estimateTokens } from "./tokens";

const DEFAULT_MIN_CHUNK_TOKENS = 800;
const DEFAULT_MAX_CHUNK_TOKENS = 1500;
const DEFAULT_TARGET_CHUNK_TOKENS = 1200;
const OVERLAP_TOKENS = 100;

export type ChunkOptions = {
  minTokens?: number;
  maxTokens?: number;
  targetTokens?: number;
  overlapTokens?: number;
};

export type TextChunk = {
  content: string;
  tokenCount: number;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
};

/**
 * Split text into semantically meaningful chunks.
 * Tries to split at paragraph boundaries, then sentence boundaries,
 * to keep related content together.
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const {
    minTokens = DEFAULT_MIN_CHUNK_TOKENS,
    maxTokens = DEFAULT_MAX_CHUNK_TOKENS,
    targetTokens = DEFAULT_TARGET_CHUNK_TOKENS,
    overlapTokens = OVERLAP_TOKENS,
  } = options;

  if (!text || !text.trim()) return [];

  const totalTokens = estimateTokens(text);
  if (totalTokens <= maxTokens) {
    return [
      {
        content: text.trim(),
        tokenCount: totalTokens,
        chunkIndex: 0,
        startOffset: 0,
        endOffset: text.length,
      },
    ];
  }

  // Split into paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const chunks: TextChunk[] = [];
  let currentContent = "";
  let currentStartOffset = 0;
  let textOffset = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const testContent = currentContent
      ? currentContent + "\n\n" + paragraph
      : paragraph;
    const testTokens = estimateTokens(testContent);

    if (testTokens > maxTokens && currentContent) {
      // Current chunk is full, save it
      chunks.push({
        content: currentContent.trim(),
        tokenCount: estimateTokens(currentContent),
        chunkIndex: chunks.length,
        startOffset: currentStartOffset,
        endOffset: textOffset,
      });

      // Start new chunk with overlap
      const overlapText = getOverlapText(currentContent, overlapTokens);
      currentContent = overlapText ? overlapText + "\n\n" + paragraph : paragraph;
      currentStartOffset = textOffset;
    } else if (testTokens > maxTokens && !currentContent) {
      // Single paragraph exceeds max — split by sentences
      const sentenceChunks = splitLargeParagraph(
        paragraph,
        targetTokens,
        maxTokens,
        overlapTokens,
        textOffset,
        chunks.length
      );
      chunks.push(...sentenceChunks);
      currentContent = "";
      currentStartOffset = textOffset + paragraph.length;
    } else {
      currentContent = testContent;
    }

    // Track offset in original text
    textOffset = text.indexOf(paragraph, textOffset) + paragraph.length;
  }

  // Don't forget the last chunk
  if (currentContent.trim()) {
    const tokens = estimateTokens(currentContent);
    if (tokens >= minTokens || chunks.length === 0) {
      chunks.push({
        content: currentContent.trim(),
        tokenCount: tokens,
        chunkIndex: chunks.length,
        startOffset: currentStartOffset,
        endOffset: text.length,
      });
    } else if (chunks.length > 0) {
      // Merge with previous chunk if too small
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.content = lastChunk.content + "\n\n" + currentContent.trim();
      lastChunk.tokenCount = estimateTokens(lastChunk.content);
      lastChunk.endOffset = text.length;
    }
  }

  // Re-index chunks
  return chunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index,
  }));
}

/**
 * Get overlapping text from the end of a chunk.
 */
function getOverlapText(text: string, overlapTokens: number): string {
  if (overlapTokens <= 0) return "";

  const sentences = text.split(/(?<=[.!?])\s+/);
  let overlap = "";

  for (let i = sentences.length - 1; i >= 0; i--) {
    const test = sentences[i] + (overlap ? " " + overlap : "");
    if (estimateTokens(test) > overlapTokens) break;
    overlap = test;
  }

  return overlap;
}

/**
 * Split a large paragraph into sentence-level chunks.
 */
function splitLargeParagraph(
  paragraph: string,
  targetTokens: number,
  maxTokens: number,
  overlapTokens: number,
  baseOffset: number,
  baseIndex: number
): TextChunk[] {
  // Split by sentences (handles ., !, ?, and also LaTeX $ and $$ boundaries)
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  const chunks: TextChunk[] = [];
  let current = "";
  let chunkStart = baseOffset;

  for (const sentence of sentences) {
    const test = current ? current + " " + sentence : sentence;
    const testTokens = estimateTokens(test);

    if (testTokens > maxTokens && current) {
      chunks.push({
        content: current.trim(),
        tokenCount: estimateTokens(current),
        chunkIndex: baseIndex + chunks.length,
        startOffset: chunkStart,
        endOffset: chunkStart + current.length,
      });
      const overlap = getOverlapText(current, overlapTokens);
      current = overlap ? overlap + " " + sentence : sentence;
      chunkStart += current.length;
    } else {
      current = test;
    }
  }

  if (current.trim()) {
    chunks.push({
      content: current.trim(),
      tokenCount: estimateTokens(current),
      chunkIndex: baseIndex + chunks.length,
      startOffset: chunkStart,
      endOffset: baseOffset + paragraph.length,
    });
  }

  return chunks;
}

/**
 * Classify a chunk's content category based on heuristics.
 * This is a basic classifier — Stage 2 uses Gemini Flash for better classification.
 */
export function classifyChunk(
  content: string
): "definition" | "theorem" | "proof" | "example" | "exercise" | "solution" | "narrative" {
  const lower = content.toLowerCase();

  if (/\b(definition|def\.|definiere)\b/i.test(content)) return "definition";
  if (/\b(satz|theorem|lemma|korollar|corollary|proposition)\b/i.test(content))
    return "theorem";
  if (/\b(beweis|proof|q\.e\.d\.|∎|beweisidee)\b/i.test(content)) return "proof";
  if (/\b(beispiel|example|bsp\.)\b/i.test(content)) return "example";
  if (
    /\b(aufgabe|exercise|übung|task|problem)\b/i.test(content) &&
    !/\b(lösung|solution|answer)\b/i.test(lower)
  )
    return "exercise";
  if (/\b(lösung|solution|answer|lösungsvorschlag)\b/i.test(content))
    return "solution";

  return "narrative";
}
