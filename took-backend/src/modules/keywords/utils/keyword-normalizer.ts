export class KeywordNormalizer {
  normalize(rawKeyword: string): string {
    return rawKeyword
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9가-힣 ]/g, '');
  }
}
