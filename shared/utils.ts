import assert from "assert";
import fs from "fs";

export function getPuzzleInput() {
  // day-9.ts
  const day = getDay();

  return Bun.file(`./data/day-${day}.data`).text();
}

function getDay() {
  const indexOfDotTs = Bun.main.indexOf(".ts");
  const indexOfDash = Bun.main.lastIndexOf("-", indexOfDotTs);
  const day = Bun.main.slice(indexOfDash + 1, indexOfDotTs);

  const dayNum = parseInt(day);

  assert(!isNaN(dayNum));
  assert(dayNum >= 1 && dayNum <= 25);
  return day;
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

export async function logMatrix<T>(matrix: T[][], name: string, cons = false) {
  const matrixStr = matrix.map((row) => row.join("")).join("\n");

  if (cons) {
    console.log("MATRIX: ");
    console.log(matrixStr);
  }

  const day = getDay();
  const folderPath = `./temp/day-${day}`;
  createFolderIfNotExist(folderPath);

  await Bun.write(`${folderPath}/${name}.txt`, matrixStr);
}

function createFolderIfNotExist(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
