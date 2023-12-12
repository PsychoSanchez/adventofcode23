// --- Day 12: Hot Springs ---
// You finally reach the hot springs! You can see steam rising from secluded areas attached to the primary, ornate building.

import assert from "assert";
import { getPuzzleInput } from "./shared/utils";

// As you turn to enter, the researcher stops you. "Wait - I thought you were looking for the hot springs, weren't you?" You indicate that this definitely looks like hot springs to you.

// "Oh, sorry, common mistake! This is actually the onsen! The hot springs are next door."

// You look in the direction the researcher is pointing and suddenly notice the massive metal helixes towering overhead. "This way!"

// It only takes you a few more steps to reach the main gate of the massive fenced-off area containing the springs. You go through the gate and into a small administrative building.

// "Hello! What brings you to the hot springs today? Sorry they're not very hot right now; we're having a lava shortage at the moment." You ask about the missing machine parts for Desert Island.

// "Oh, all of Gear Island is currently offline! Nothing is being manufactured at the moment, not until we get more lava to heat our forges. And our springs. The springs aren't very springy unless they're hot!"

// "Say, could you go up and see why the lava stopped flowing? The springs are too cold for normal operation, but we should be able to find one springy enough to launch you up there!"

// There's just one problem - many of the springs have fallen into disrepair, so they're not actually sure which springs would even be safe to use! Worse yet, their condition records of which springs are damaged (your puzzle input) are also damaged! You'll need to help them repair the damaged records.

// In the giant field just outside, the springs are arranged into rows. For each row, the condition records show every spring and whether it is operational (.) or damaged (#). This is the part of the condition records that is itself damaged; for some springs, it is simply unknown (?) whether the spring is operational or damaged.

// However, the engineer that produced the condition records also duplicated some of this information in a different format! After the list of springs for a given row, the size of each contiguous group of damaged springs is listed in the order those groups appear in the row. This list always accounts for every damaged spring, and each number is the entire size of its contiguous group (that is, groups are always separated by at least one operational spring: #### would always be 4, never 2,2).

// So, condition records with no unknown spring conditions might look like this:

// #.#.### 1,1,3
// .#...#....###. 1,1,3
// .#.###.#.###### 1,3,1,6
// ####.#...#... 4,1,1
// #....######..#####. 1,6,5
// .###.##....# 3,2,1
// However, the condition records are partially damaged; some of the springs' conditions are actually unknown (?). For example:

// ???.### 1,1,3
// .??..??...?##. 1,1,3
// ?#?#?#?#?#?#?#? 1,3,1,6
// ????.#...#... 4,1,1
// ????.######..#####. 1,6,5
// ?###???????? 3,2,1
// Equipped with this information, it is your job to figure out how many different arrangements of operational and broken springs fit the given criteria in each row.

// In the first line (???.### 1,1,3), there is exactly one way separate groups of one, one, and three broken springs (in that order) can appear in that row: the first three unknown springs must be broken, then operational, then broken (#.#), making the whole row #.#.###.

// The second line is more interesting: .??..??...?##. 1,1,3 could be a total of four different arrangements. The last ? must always be broken (to satisfy the final contiguous group of three broken springs), and each ?? must hide exactly one of the two broken springs. (Neither ?? could be both broken springs or they would form a single contiguous group of two; if that were true, the numbers afterward would have been 2,3 instead.) Since each ?? can either be #. or .#, there are four possible arrangements of springs.

// The last line is actually consistent with ten different arrangements! Because the first number is 3, the first and second ? must both be . (if either were #, the first number would have to be 4 or higher). However, the remaining run of unknown spring conditions have many different ways they could hold groups of two and one broken springs:

// ?###???????? 3,2,1
// .###.##.#...
// .###.##..#..
// .###.##...#.
// .###.##....#
// .###..##.#..
// .###..##..#.
// .###..##...#
// .###...##.#.
// .###...##..#
// .###....##.#
// In this example, the number of possible arrangements for each row is:

// ???.### 1,1,3 - 1 arrangement
// .??..??...?##. 1,1,3 - 4 arrangements
// ?#?#?#?#?#?#?#? 1,3,1,6 - 1 arrangement
// ????.#...#... 4,1,1 - 1 arrangement
// ????.######..#####. 1,6,5 - 4 arrangements
// ?###???????? 3,2,1 - 10 arrangements
// Adding all of the possible arrangement counts together produces a total of 21 arrangements.

// For each row, count all of the different arrangements of operational and broken springs that meet the given criteria. What is the sum of those counts?

enum SpringValue {
  Unknown = "?",
  Broken = "#",
  Operational = ".",
}

function processInput(input: string, multiplier = 1) {
  const validSprings = Object.values(SpringValue);

  const lines = input.split("\n");
  const rows = lines.map((line) => {
    const [springStr, groupsStr] = line.split(" ");
    assert(springStr, "springs is undefined");
    assert(groupsStr, "groups is undefined");

    const groups = (groupsStr + ",")
      .repeat(multiplier)
      .split(",")
      .filter((group) => group !== "")
      .map((group) => parseInt(group));
    assert(groups.every(isFinite), "groupsArr is not finite");

    const springs = (springStr + "?")
      .repeat(multiplier)
      .split("") as SpringValue[];

    // remove last ?
    springs.pop();

    assert(
      springs.every((s) => validSprings.includes(s)),
      "invalid spring",
    );

    return {
      springs,
      groups: groups,
    };
  });

  return rows;
}

const TEST_INPUT = `???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`;

function countGroups(springs: SpringValue[]) {
  const groups = [];

  let currentGroup = 0;
  for (const spring of springs) {
    if (spring === SpringValue.Broken) {
      currentGroup++;
    } else if (currentGroup > 0) {
      groups.push(currentGroup);
      currentGroup = 0;
    }
  }

  if (currentGroup > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function findArrangements(springs: SpringValue[], groups: number[]) {
  const startPosition = springs.indexOf(SpringValue.Unknown);
  const startFrom = springs.slice(0, startPosition);
  assert(startFrom.every((s) => s !== SpringValue.Unknown));

  const queue: Array<[Array<SpringValue>, Array<number>]> = [
    [startFrom, countGroups(startFrom)],
  ];

  // ?###???????? 3,2,1
  // # break
  // .
  // .#### break
  // .###.## group part complete
  // .###.### break
  // .###.##. continue

  const arrangements: Array<Array<SpringValue>> = [];
  while (queue.length) {
    const [part, partGroup] = queue.shift()!;

    const groupIndex = Math.max(partGroup.length - 1, 0);
    const expectedGroup = groups[groupIndex];
    const prevExpectedGroup = groups[groupIndex - 1] ?? 0;
    const currentCountedGroup = partGroup[groupIndex] ?? 0;
    const prevCountedGroup = partGroup[groupIndex - 1] ?? 0;

    if (
      expectedGroup === undefined ||
      expectedGroup < currentCountedGroup ||
      prevExpectedGroup !== prevCountedGroup
    ) {
      continue;
    }

    if (part.length === springs.length) {
      if (
        expectedGroup === currentCountedGroup &&
        groups.length === partGroup.length
      ) {
        arrangements.push(part);
      }

      continue;
    }

    const nextPart = springs[part.length];
    assert(nextPart !== undefined, "nextPart is undefined");

    if (nextPart !== SpringValue.Unknown) {
      const next = [...part, nextPart];
      queue.push([next, countGroups(next)]);
      continue;
    }

    const nextBroken = [...part, SpringValue.Broken];
    const nextOperational = [...part, SpringValue.Operational];
    queue.push(
      [nextBroken, countGroups(nextBroken)],
      [nextOperational, countGroups(nextOperational)],
    );
  }

  //   console.log(springs, arrangements.length);

  // ?###???????? 3,2,1
  // # break
  // .
  // .#### break
  // .###.## group part complete

  // .###.##.#...
  // .###.##..#..
  // .###.##...#.
  // .###.##....#
  // .###..##.#..
  // .###..##..#.
  // .###..##...#
  // .###...##.#.
  // .###...##..#
  // .###....##.#

  return arrangements;
}

function main1(input: string, multiplier = 1) {
  const rows = processInput(input, multiplier);
  const arrangements = rows.map(({ springs, groups }) =>
    findArrangements(springs, groups),
  );

  const total = arrangements.reduce((acc, curr) => acc + curr.length, 0);

  return total;
}

// --- Part Two ---
// As you look out at the field of springs, you feel like there are way more springs than the condition records list. When you examine the records, you discover that they were actually folded up this whole time!

// To unfold the records, on each row, replace the list of spring conditions with five copies of itself (separated by ?) and replace the list of contiguous groups of damaged springs with five copies of itself (separated by ,).

// So, this row:

// .# 1
// Would become:

// .#?.#?.#?.#?.# 1,1,1,1,1
// The first line of the above example would become:

// ???.###????.###????.###????.###????.### 1,1,3,1,1,3,1,1,3,1,1,3,1,1,3
// In the above example, after unfolding, the number of possible arrangements for some rows is now much larger:

// ???.### 1,1,3 - 1 arrangement
// .??..??...?##. 1,1,3 - 16384 arrangements
// ?#?#?#?#?#?#?#? 1,3,1,6 - 1 arrangement
// ????.#...#... 4,1,1 - 16 arrangements
// ????.######..#####. 1,6,5 - 2500 arrangements
// ?###???????? 3,2,1 - 506250 arrangements
// After unfolding, adding all of the possible arrangement counts together produces 525152.

export const cache = new Map();

export function countArrangementsRec(
  conditions: SpringValue[],
  groups: number[],
): number {
  if (!conditions.length) {
    return groups.length ? 0 : 1;
  }

  if (!groups.length) {
    return conditions.includes(SpringValue.Broken) ? 0 : 1;
  }

  const key = `${conditions.join("")}::${groups.join("")}`;

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  let result = 0;

  const condition = conditions[0];

  if (
    condition === SpringValue.Operational ||
    condition === SpringValue.Unknown
  ) {
    result += countArrangementsRec(conditions.slice(1), groups);
  }

  const group = groups[0];
  assert(group !== undefined, "group is undefined");

  if (condition === SpringValue.Broken || condition === SpringValue.Unknown) {
    if (
      group <= conditions.length &&
      !conditions.slice(0, group).includes(SpringValue.Operational) &&
      (group === conditions.length || conditions[group] !== SpringValue.Broken)
    ) {
      result += countArrangementsRec(
        conditions.slice(group + 1),
        groups.slice(1),
      );
    }
  }

  cache.set(key, result);

  return result;
}

function main2(input: string, multiplier = 5) {
  const rows = processInput(input, multiplier);
  const arrangements = rows.map(({ springs, groups }) =>
    countArrangementsRec(springs, groups),
  );

  const total = arrangements.reduce((acc, curr) => acc + curr, 0);

  return total;
}

const PUZZLE_INPUT = await getPuzzleInput();

const r1 = main1(PUZZLE_INPUT);
console.log(`Part 1: ${r1}`);

const r2 = main2(PUZZLE_INPUT, 5);
console.log(`Part 2: ${r2}`);
