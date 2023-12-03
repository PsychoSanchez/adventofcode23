export function unsafeParseInt(str: string): number {
  const num = parseInt(str);

  if (isNaN(num)) {
    throw new Error(`Invalid number ${str}`);
  }

  return num;
}

export function safeParseInt(str: string): number | null {
  const num = parseInt(str);

  if (isNaN(num)) {
    return null;
  }

  return num;
}

export const range = (start: number, end: number) =>
  // inclusive
  Array.from({ length: end - start + 1 }, (_, i) => i + start);
