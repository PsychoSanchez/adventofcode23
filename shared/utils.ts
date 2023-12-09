import assert from "assert";

export function getPuzzleInput() {
  // day-9.ts
  const indexOfDotTs = Bun.main.indexOf(".ts");
  const indexOfDash = Bun.main.lastIndexOf("-", indexOfDotTs);
  const day = Bun.main.slice(indexOfDash + 1, indexOfDotTs);

  const dayNum = parseInt(day);

  assert(!isNaN(dayNum));
  assert(dayNum >= 1 && dayNum <= 25);

  return Bun.file(`./data/day-${day}.data`).text();
}

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
