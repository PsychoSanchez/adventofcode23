// --- Day 3: Gear Ratios ---
// You and the Elf eventually reach a gondola lift station; he says the gondola lift will take you up to the water source, but this is as far as he can bring you. You go inside.

import { assert } from "./shared/assert";

// It doesn't take long to find the gondolas, but there seems to be a problem: they're not moving.

// "Aaah!"

// You turn around to see a slightly-greasy Elf with a wrench and a look of surprise. "Sorry, I wasn't expecting anyone! The gondola lift isn't working right now; it'll still be a while before I can fix it." You offer to help.

// The engineer explains that an engine part seems to be missing from the engine, but nobody can figure out which one. If you can add up all the part numbers in the engine schematic, it should be easy to work out which part is missing.

// The engine schematic (your puzzle input) consists of a visual representation of the engine. There are lots of numbers and symbols you don't really understand, but apparently any number adjacent to a symbol, even diagonally, is a "part number" and should be included in your sum. (Periods (.) do not count as a symbol.)

// Here is an example engine schematic:

// 467..114..
// ...*......
// ..35..633.
// ......#...
// 617*......
// .....+.58.
// ..592.....
// ......755.
// ...$.*....
// .664.598..
// In this schematic, two numbers are not part numbers because they are not adjacent to a symbol: 114 (top right) and 58 (middle right). Every other number is adjacent to a symbol and so is a part number; their sum is 4361.

// Of course, the actual engine schematic is much larger. What is the sum of all of the part numbers in the engine schematic?

type NumberValue = {
  num: number;
  indexStart: number;
  indexEnd: number;
};
type NumbersMatrix = Array<Array<NumberValue>>;

const isDot = (char: string) => char === ".";
const isStar = (char: string) => char === "*";
const isNumber = (char: string) => !isNaN(parseInt(char));
const isSymbol = (char: string) => !isDot(char) && !isNumber(char);
const range = (start: number, end: number) =>
  // inclusive
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

// 539590
// 80703636

async function processInput() {
  const input = await Bun.file("./data/day-3.data").text();
  //   const input = `467..114..
  // ...*......
  // ..35..633.
  // ......#...
  // 617*......
  // .....+.58.
  // ..592.....
  // ......755.
  // ...$.*....
  // .664.598..`;

  const lines = input.split("\n");
  const stars: Array<Array<number>> = Array.from(
    { length: lines.length },
    () => [],
  );
  const numbers = lines.map((line, lineIndex) => {
    const result: Array<NumberValue> = [];

    let temp = "";
    let indexStart = null;

    for (let i = 0; i < line.length; i++) {
      const char = line[i]!;
      const num = parseInt(char);

      if (!isNaN(num)) {
        indexStart ??= i;
        temp += num;
        continue;
      }

      if (isStar(char)) {
        stars[lineIndex]!.push(i);
      }

      if (temp) {
        result.push({
          num: parseInt(temp),
          indexStart: indexStart!,
          indexEnd: i - 1,
        });

        temp = "";
        indexStart = null;
      }
    }

    if (temp) {
      result.push({
        num: parseInt(temp),
        indexStart: indexStart!,
        indexEnd: line.length - 1,
      });
    }

    return result;
  });

  return {
    lines,
    numbers,
    stars,
  };
}

function filterNumbersWithAdjacentSymbol(
  lines: string[],
  numbersMatrix: NumbersMatrix,
) {
  return numbersMatrix.map((numbers, rowIndex) =>
    numbers.filter((number) => {
      const { indexStart, indexEnd } = number;
      const previousRow = lines[rowIndex - 1];
      const nextRow = lines[rowIndex + 1];

      const previousChar = lines[rowIndex]![indexStart - 1] ?? ".";
      const nextChar = lines[rowIndex]![indexEnd + 1] ?? ".";

      if (isSymbol(previousChar) || isSymbol(nextChar)) {
        return true;
      }

      const lineLength = lines[rowIndex]!.length;
      return range(
        Math.max(0, indexStart - 1),
        Math.min(indexEnd + 1, lineLength),
      ).some((i) => {
        const previousRowChar = previousRow?.[i] ?? ".";
        const nextRowChar = nextRow?.[i] ?? ".";

        return isSymbol(previousRowChar) || isSymbol(nextRowChar);
      });
    }),
  );
}

async function main1() {
  const { numbers, lines } = await processInput();

  const sum = filterNumbersWithAdjacentSymbol(lines, numbers)
    .flat()
    .reduce((acc, { num }) => acc + num, 0);

  return sum;
}

const main1Result = await main1();

console.log(`The sum of all part numbers is ${main1Result}`);
assert(main1Result === 539590, "main1Result === 539590");

// --- Part Two ---
// The engineer finds the missing part and installs it in the engine! As the engine springs to life, you jump in the closest gondola, finally ready to ascend to the water source.

// You don't seem to be going very fast, though. Maybe something is still wrong? Fortunately, the gondola has a phone labeled "help", so you pick it up and the engineer answers.

// Before you can explain the situation, she suggests that you look out the window. There stands the engineer, holding a phone in one hand and waving with the other. You're going so slowly that you haven't even left the station. You exit the gondola.

// The missing part wasn't the only issue - one of the gears in the engine is wrong. A gear is any * symbol that is adjacent to exactly two part numbers. Its gear ratio is the result of multiplying those two numbers together.

// This time, you need to find the gear ratio of every gear and add them all up so that the engineer can figure out which gear needs to be replaced.

// Consider the same engine schematic again:

// 467..114..
// ...*......
// ..35..633.
// ......#...
// 617*......
// .....+.58.
// ..592.....
// ......755.
// ...$.*....
// .664.598..
// In this schematic, there are two gears. The first is in the top left; it has part numbers 467 and 35, so its gear ratio is 16345. The second gear is in the lower right; its gear ratio is 451490. (The * adjacent to 617 is not a gear because it is only adjacent to one part number.) Adding up all of the gear ratios produces 467835.

// What is the sum of all of the gear ratios in your engine schematic?

async function main2() {
  const { numbers, lines, stars } = await processInput();
  const adjacentNumbers = filterNumbersWithAdjacentSymbol(
    lines,
    numbers,
  ).flatMap((numbers, rowIndex) =>
    numbers.map((number) => ({
      rowIndex,
      colIndexStart: number.indexStart,
      colIndexEnd: number.indexEnd,
      value: number.num,
    })),
  );

  const starAdjacentNumberMap = new Map<string, number[]>();

  for (const num of adjacentNumbers) {
    const { rowIndex, colIndexEnd, colIndexStart, value } = num;
    const starsToCompareAgainst = range(rowIndex - 1, rowIndex + 1).flatMap(
      (starRowIndex) =>
        (stars[starRowIndex] ?? []).map((i) => [starRowIndex, i] as const),
    );

    const adjacentStars = starsToCompareAgainst.filter(
      ([_, starColIndex]) =>
        colIndexStart - 1 <= starColIndex && colIndexEnd + 1 >= starColIndex,
    );

    for (const [starRowIndex, starColIndex] of adjacentStars) {
      const key = `${starColIndex}-${starRowIndex}`;
      const cache = starAdjacentNumberMap.get(key) ?? [];
      cache.push(value);
      starAdjacentNumberMap.set(key, cache);
    }
  }

  const sum = Array.from(starAdjacentNumberMap.values())
    .filter((v) => v.length === 2)
    .reduce((acc, [a, b]) => acc + a! * b!, 0);

  return sum;
}

const main2Result = await main2();
// 80703636
console.log(`The sum of all gear ratios is ${main2Result}`);
assert(main2Result === 80703636, "main2Result === 80703636");
