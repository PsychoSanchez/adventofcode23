// --- Day 11: Cosmic Expansion ---
// You continue following signs for "Hot Springs" and eventually come across an observatory. The Elf within turns out to be a researcher studying cosmic expansion using the giant telescope here.

import assert from "assert";
import { isNonNull } from "./shared/type-guards";
import { getPuzzleInput } from "./shared/utils";

// He doesn't know anything about the missing machine parts; he's only visiting for this research project. However, he confirms that the hot springs are the next-closest area likely to have people; he'll even take you straight there once he's done with today's observation analysis.

// Maybe you can help him with the analysis to speed things up?

// The researcher has collected a bunch of data and compiled the data into a single giant image (your puzzle input). The image includes empty space (.) and galaxies (#). For example:

// ...#......
// .......#..
// #.........
// ..........
// ......#...
// .#........
// .........#
// ..........
// .......#..
// #...#.....
// The researcher is trying to figure out the sum of the lengths of the shortest path between every pair of galaxies. However, there's a catch: the universe expanded in the time it took the light from those galaxies to reach the observatory.

// Due to something involving gravitational effects, only some space expands. In fact, the result is that any rows or columns that contain no galaxies should all actually be twice as big.

// In the above example, three columns and two rows contain no galaxies:

//    v  v  v
//  ...#......
//  .......#..
//  #.........
// >..........<
//  ......#...
//  .#........
//  .........#
// >..........<
//  .......#..
//  #...#.....
//    ^  ^  ^
// These rows and columns need to be twice as big; the result of cosmic expansion therefore looks like this:

// ....#........
// .........#...
// #............
// .............
// .............
// ........#....
// .#...........
// ............#
// .............
// .............
// .........#...
// #....#.......
// Equipped with this expanded universe, the shortest path between every pair of galaxies can be found. It can help to assign every galaxy a unique number:

// ....1........
// .........2...
// 3............
// .............
// .............
// ........4....
// .5...........
// ............6
// .............
// .............
// .........7...
// 8....9.......
// In these 9 galaxies, there are 36 pairs. Only count each pair once; order within the pair doesn't matter. For each pair, find any shortest path between the two galaxies using only steps that move up, down, left, or right exactly one . or # at a time. (The shortest path between two galaxies is allowed to pass through another galaxy.)

// For example, here is one of the shortest paths between galaxies 5 and 9:

// ....1........
// .........2...
// 3............
// .............
// .............
// ........4....
// .5...........
// .##.........6
// ..##.........
// ...##........
// ....##...7...
// 8....9.......
// This path has length 9 because it takes a minimum of nine steps to get from galaxy 5 to galaxy 9 (the eight locations marked # plus the step onto galaxy 9 itself). Here are some other example shortest path lengths:

// Between galaxy 1 and galaxy 7: 15
// Between galaxy 3 and galaxy 6: 17
// Between galaxy 8 and galaxy 9: 5
// In this example, after expanding the universe, the sum of the shortest path between all 36 pairs of galaxies is 374.

// Expand the universe, then find the length of the shortest path between every pair of galaxies. What is the sum of these lengths

interface Node {
  x: number;
  y: number;
  isStar?: boolean;
}

function getLength(pos1: Node, pos2: Node) {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

assert(getLength({ x: 0, y: 0 }, { x: 1, y: 1 }) === 2);
assert(getLength({ x: 0, y: 0 }, { x: 0, y: 4 }) === 4);
assert(getLength({ x: 0, y: 0 }, { x: 4, y: 0 }) === 4);
assert(getLength({ x: 1, y: 0 }, { x: 5, y: 5 }) === 9);

function iterateOnColumns<T>(
  matrix: T[][],
  callback: (column: T[], index: number) => void,
) {
  assert(matrix[0]);
  const columnCount = matrix[0].length;

  for (let col = 0; col < columnCount; col++) {
    const column = matrix.map((row) => {
      const element = row[col];
      assert(element);
      return element;
    });

    callback(column, col);
  }
}

function formNodeMatrix(input: string): Array<Array<Node>> {
  const matrix = input.split("\n").map((row) => row.split(""));

  return matrix.map((row, rowIndex) => {
    return row.map((char, colIndex) => {
      return { x: colIndex, y: rowIndex, isStar: char === "#" };
    });
  });
}

function getStarNodes(matrix: Array<Array<Node>>): Array<Node> {
  return matrix.flatMap((row) =>
    row.flatMap((node) => (node.isStar ? [node] : [])),
  );
}

function expandMatrix(matrix: Array<Array<Node>>, expandBy = 2) {
  const rowsToExpand = matrix
    .map((row, index) => (row.every((el) => !el.isStar) ? index : null))
    .filter(isNonNull);

  const columnsToExpand: number[] = [];
  iterateOnColumns(matrix, (column, index) => {
    if (column.every((element) => !element.isStar)) {
      columnsToExpand.push(index);
    }
  });

  const expandedMatrix = matrix.map((row) => {
    return row.map((n) => {
      return { x: 0, y: 0, isStar: n.isStar };
    });
  });

  for (let row = 0; row < expandedMatrix.length; row++) {
    const elementRow = expandedMatrix[row];
    assert(elementRow);

    const prevRow = expandedMatrix[row - 1];

    for (let col = 0; col < elementRow.length; col++) {
      const element = elementRow[col];
      assert(element);

      const prevElement = elementRow[col - 1];

      if (prevRow) {
        const prevElement = prevRow[col];
        assert(prevElement);

        element.y = prevElement.y + 1;
      }

      if (prevElement) {
        element.x = prevElement.x + 1;
      }

      if (columnsToExpand.includes(col)) {
        element.x += expandBy - 1;
      }

      if (rowsToExpand.includes(row)) {
        element.y += expandBy - 1;
      }
    }
  }

  return expandedMatrix;
}

const TEST_INPUT = `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;
const EXPECTED_EXPANDED_UNIVERSE = `....#........
.........#...
#............
.............
.............
........#....
.#...........
............#
.............
.............
.........#...
#....#.......`;

const testedStars = getStarNodes(expandMatrix(formNodeMatrix(TEST_INPUT)));
const expectedStars = getStarNodes(formNodeMatrix(EXPECTED_EXPANDED_UNIVERSE));

assert.deepEqual(
  testedStars,
  expectedStars,
  "Stars expected to be at the same positions",
);

function main1(input: string, expandBy = 2) {
  const matrix = formNodeMatrix(input);
  const expandedMatrix = expandMatrix(matrix, expandBy);
  const starPositions = getStarNodes(expandedMatrix);

  const distances = starPositions.flatMap((star1, i) => {
    return starPositions.slice(i + 1).map((star2) => {
      return getLength(star1, star2);
    });
  });

  return distances.reduce((acc, dist) => acc + dist, 0);
}

const input = await getPuzzleInput();

const result = main1(input);
console.log(`Result 1: ${result}`);
// 10313550

const result2 = main1(input, 1_000_000);
console.log(`Result 2: ${result2}`);
// 611998089572
