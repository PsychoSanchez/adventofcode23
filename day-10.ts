// --- Day 10: Pipe Maze ---
// You use the hang glider to ride the hot air from Desert Island all the way up to the floating metal island. This island is surprisingly cold and there definitely aren't any thermals to glide on, so you leave your hang glider behind.

import assert from "assert";
import { getPuzzleInput } from "./shared/utils";
import { isNonNull } from "./shared/type-guards";

// You wander around for a while, but you don't find any people or animals. However, you do occasionally find signposts labeled "Hot Springs" pointing in a seemingly consistent direction; maybe you can find someone at the hot springs and ask them where the desert-machine parts are made.

// The landscape here is alien; even the flowers and trees are made of metal. As you stop to admire some metal grass, you notice something metallic scurry away in your peripheral vision and jump into a big pipe! It didn't look like any animal you've ever seen; if you want a better look, you'll need to get ahead of it.

// Scanning the area, you discover that the entire field you're standing on is densely packed with pipes; it was hard to tell at first because they're the same metallic silver color as the "ground". You make a quick sketch of all of the surface pipes you can see (your puzzle input).

// The pipes are arranged in a two-dimensional grid of tiles:

// | is a vertical pipe connecting north and south.
// - is a horizontal pipe connecting east and west.
// L is a 90-degree bend connecting north and east.
// J is a 90-degree bend connecting north and west.
// 7 is a 90-degree bend connecting south and west.
// F is a 90-degree bend connecting south and east.
// . is ground; there is no pipe in this tile.
// S is the starting position of the animal; there is a pipe on this tile, but your sketch doesn't show what shape the pipe has.
// Based on the acoustics of the animal's scurrying, you're confident the pipe that contains the animal is one large, continuous loop.

// For example, here is a square loop of pipe:

// .....
// .F-7.
// .|.|.
// .L-J.
// .....
// If the animal had entered this loop in the northwest corner, the sketch would instead look like this:

// .....
// .S-7.
// .|.|.
// .L-J.
// .....
// In the above diagram, the S tile is still a 90-degree F bend: you can tell because of how the adjacent pipes connect to it.

// Unfortunately, there are also many pipes that aren't connected to the loop! This sketch shows the same loop as above:

// -L|F7
// 7S-7|
// L|7||
// -L-J|
// L|-JF
// In the above diagram, you can still figure out which pipes form the main loop: they're the ones connected to S, pipes those pipes connect to, pipes those pipes connect to, and so on. Every pipe in the main loop connects to its two neighbors (including S, which will have exactly two pipes connecting to it, and which is assumed to connect back to those two pipes).

// Here is a sketch that contains a slightly more complex main loop:

// ..F7.
// .FJ|.
// SJ.L7
// |F--J
// LJ...
// Here's the same example sketch with the extra, non-main-loop pipe tiles also shown:

// 7-F7-
// .FJ|7
// SJLL7
// |F--J
// LJ.LJ
// If you want to get out ahead of the animal, you should find the tile in the loop that is farthest from the starting position. Because the animal is in the pipe, it doesn't make sense to measure this by direct distance. Instead, you need to find the tile that would take the longest number of steps along the loop to reach from the starting point - regardless of which way around the loop the animal went.

// In the first example with the square loop:

// .....
// .S-7.
// .|.|.
// .L-J.
// .....
// You can count the distance each tile in the loop is from the starting point like this:

// .....
// .012.
// .1.3.
// .234.
// .....
// In this example, the farthest point from the start is 4 steps away.

// Here's the more complex loop again:

// ..F7.
// .FJ|.
// SJ.L7
// |F--J
// LJ...
// Here are the distances for each tile on that loop:

// ..45.
// .236.
// 01.78
// 14567
// 23...
// Find the single giant loop starting at S. How many steps along the loop does it take to get from the starting position to the point farthest from the starting position?

enum NodeType {
  VerticalPipe = "|",
  HorizontalPipe = "-",
  BottomLeftPipe = "L",
  BottomRightPipe = "J",
  TopRightPipe = "7",
  TopLeftPipe = "F",
  Start = "S",
  Ground = ".",
  Unknown = "?",
  Flooded = "W",
}

enum Direction {
  Left,
  Right,
  Up,
  Down,
}

interface Node {
  type: NodeType;
  row: number;
  col: number;
}

function processInput(input: string): {
  start: Node;
  matrix: Array<Array<Node>>;
} {
  const lines = input.split("\n");

  let start: Node | null = null;
  const matrix = lines.map((line, rowIndex) =>
    line.split("").map((nodeType, colIndex) => {
      const node: Node = {
        type: nodeType as NodeType,
        row: rowIndex,
        col: colIndex,
      };

      if (nodeType === NodeType.Start) {
        assert(!start, "Multiple start nodes found");
        start = node;
      }

      return node;
    }),
  );

  assert(start, "No start node found");

  return { start, matrix };
}

const getDirection = (node: Node, nextNode: Node): Direction => {
  if (node.row === nextNode.row) {
    if (nextNode.col > node.col) {
      return Direction.Right;
    } else {
      return Direction.Left;
    }
  } else if (node.col === nextNode.col) {
    if (nextNode.row > node.row) {
      return Direction.Down;
    } else {
      return Direction.Up;
    }
  }

  assert(false, "Invalid direction");
};

const isNodeConnected = (node: Node, nextNode: Node) => {
  const direction = getDirection(node, nextNode);
  if (nextNode.type === NodeType.Ground) {
    return false;
  }

  const isHorizontal =
    direction === Direction.Left || direction === Direction.Right;
  const isVertical = direction === Direction.Up || direction === Direction.Down;

  switch (node.type) {
    case NodeType.VerticalPipe:
      return direction === Direction.Up || direction === Direction.Down;
    case NodeType.HorizontalPipe:
      return direction === Direction.Left || direction === Direction.Right;
    case NodeType.BottomLeftPipe:
      return direction === Direction.Up || direction === Direction.Right;
    case NodeType.BottomRightPipe:
      return direction === Direction.Left || direction === Direction.Up;
    case NodeType.TopRightPipe:
      return direction === Direction.Left || direction === Direction.Down;
    case NodeType.TopLeftPipe:
      return direction === Direction.Down || direction === Direction.Right;
    case NodeType.Start:
      return !(
        (nextNode.type === NodeType.VerticalPipe && isHorizontal) ||
        (nextNode.type === NodeType.HorizontalPipe && isVertical) ||
        (nextNode.type === NodeType.BottomLeftPipe &&
          (direction === Direction.Up || direction === Direction.Right)) ||
        (nextNode.type === NodeType.BottomRightPipe &&
          (direction === Direction.Up || direction === Direction.Left)) ||
        (nextNode.type === NodeType.TopRightPipe &&
          (direction === Direction.Down || direction === Direction.Left)) ||
        (nextNode.type === NodeType.TopLeftPipe &&
          (direction === Direction.Down || direction === Direction.Right))
      );
  }

  return false;
};

function walkNodes(
  matrix: Array<Array<Node>>,
  startNode: Node,
): Array<Array<number>> {
  const distances = Array.from({ length: matrix.length }, () =>
    Array.from({ length: matrix[0]!.length }, () => -1),
  );

  const getNextNodesToVisit = (node: Node) => {
    const nextNodes = [
      matrix[node.row]?.[node.col + 1],
      matrix[node.row]?.[node.col - 1],
      matrix[node.row + 1]?.[node.col],
      matrix[node.row - 1]?.[node.col],
    ]
      .filter(isNonNull)
      .filter(
        (nextNode) =>
          distances[nextNode.row]?.[nextNode.col] &&
          distances[nextNode.row]?.[nextNode.col] === -1 &&
          nextNode.type !== NodeType.Ground &&
          isNodeConnected(node, nextNode),
      );

    assert(
      nextNodes.length < 3,
      `More than 2 connected nodes found at ${JSON.stringify(
        node,
      )} (${JSON.stringify(nextNodes)})`,
    );

    return nextNodes;
  };

  const queue = [startNode];
  distances[startNode.row]![startNode.col] = 0;

  while (queue.length) {
    const currentNode = queue.shift();
    assert(currentNode);

    const nextNodes = getNextNodesToVisit(currentNode);

    for (const nextNode of nextNodes) {
      distances[nextNode.row]![nextNode.col] =
        distances[currentNode.row]![currentNode.col]! + 1;
    }

    queue.push(...nextNodes);
  }
  return distances;
}

async function main1(input: string) {
  const { matrix, start } = processInput(input);

  const distances = walkNodes(matrix, start);

  return Math.max(...distances.flat());
}

// --- Part Two ---
// You quickly reach the farthest point of the loop, but the animal never emerges. Maybe its nest is within the area enclosed by the loop?

// To determine whether it's even worth taking the time to search for such a nest, you should calculate how many tiles are contained within the loop. For example:

// ...........
// .S-------7.
// .|F-----7|.
// .||.....||.
// .||.....||.
// .|L-7.F-J|.
// .|..|.|..|.
// .L--J.L--J.
// ...........
// The above loop encloses merely four tiles - the two pairs of . in the southwest and southeast (marked I below). The middle . tiles (marked O below) are not in the loop. Here is the same loop again with those regions marked:

// ...........
// .S-------7.
// .|F-----7|.
// .||OOOOO||.
// .||OOOOO||.
// .|L-7OF-J|.
// .|II|O|II|.
// .L--JOL--J.
// .....O.....
// In fact, there doesn't even need to be a full tile path to the outside for tiles to count as outside the loop - squeezing between pipes is also allowed! Here, I is still within the loop and O is still outside the loop:

// ..........
// .S------7.
// .|F----7|.
// .||OOOO||.
// .||OOOO||.
// .|L-7F-J|.
// .|II||II|.
// .L--JL--J.
// ..........
// In both of the above examples, 4 tiles are enclosed by the loop.

// Here's a larger example:

// .F----7F7F7F7F-7....
// .|F--7||||||||FJ....
// .||.FJ||||||||L7....
// FJL7L7LJLJ||LJ.L-7..
// L--J.L7...LJS7F-7L7.
// ....F-J..F7FJ|L7L7L7
// ....L7.F7||L7|.L7L7|
// .....|FJLJ|FJ|F7|.LJ
// ....FJL-7.||.||||...
// ....L---J.LJ.LJLJ...
// The above sketch has many random bits of ground, some of which are in the loop (I) and some of which are outside it (O):

// OF----7F7F7F7F-7OOOO
// O|F--7||||||||FJOOOO
// O||OFJ||||||||L7OOOO
// FJL7L7LJLJ||LJIL-7OO
// L--JOL7IIILJS7F-7L7O
// OOOOF-JIIF7FJ|L7L7L7
// OOOOL7IF7||L7|IL7L7|
// OOOOO|FJLJ|FJ|F7|OLJ
// OOOOFJL-7O||O||||OOO
// OOOOL---JOLJOLJLJOOO
// In this larger example, 8 tiles are enclosed by the loop.

// Any tile that isn't part of the main loop can count as being enclosed by the loop. Here's another example with many bits of junk pipe lying around that aren't connected to the main loop at all:

// FF7FSF7F7F7F7F7F---7
// L|LJ||||||||||||F--J
// FL-7LJLJ||||||LJL-77
// F--JF--7||LJLJ7F7FJ-
// L---JF-JLJ.||-FJLJJ7
// |F|F-JF---7F7-L7L|7|
// |FFJF7L7F-JF7|JL---7
// 7-L-JL7||F7|L7F-7F7|
// L.L7LFJ|||||FJL7||LJ
// L7JLJL-JLJLJL--JLJ.L
// Here are just the tiles that are enclosed by the loop marked with I:

// FF7FSF7F7F7F7F7F---7
// L|LJ||||||||||||F--J
// FL-7LJLJ||||||LJL-77
// F--JF--7||LJLJIF7FJ-
// L---JF-JLJIIIIFJLJJ7
// |F|F-JF---7IIIL7L|7|
// |FFJF7L7F-JF7IIL---7
// 7-L-JL7||F7|L7F-7F7|
// L.L7LFJ|||||FJL7||LJ
// L7JLJL-JLJLJL--JLJ.L
// In this last example, 10 tiles are enclosed by the loop.

// Figure out whether you have time to search for the nest by calculating the area within the loop. How many tiles are enclosed by the loop?

async function logMatrix(matrix: NodeType[][], name: string) {
  const matrixStr = matrix.map((row) => row.join("")).join("\n");

  // console.log("MATRIX: ");
  // console.log(matrixStr);
  await Bun.write(`./temp/day-10/${name}.txt`, matrixStr);
}

const isVerticallyConnected = (nodeBelow: NodeType, nodeAbove: NodeType) => {
  const isNodeBelowCanConnect =
    nodeBelow === NodeType.VerticalPipe ||
    nodeBelow === NodeType.BottomLeftPipe ||
    nodeBelow === NodeType.BottomRightPipe ||
    nodeBelow === NodeType.Start;
  const isNodeAboveCanConnect =
    nodeAbove === NodeType.VerticalPipe ||
    nodeAbove === NodeType.TopLeftPipe ||
    nodeAbove === NodeType.TopRightPipe ||
    nodeAbove === NodeType.Start;
  return isNodeBelowCanConnect && isNodeAboveCanConnect;
};

const isHorizontallyConnected = (nodeLeft: NodeType, nodeRight: NodeType) => {
  const isNodeLeftCanConnect =
    nodeLeft === NodeType.HorizontalPipe ||
    nodeLeft === NodeType.BottomLeftPipe ||
    nodeLeft === NodeType.TopLeftPipe ||
    nodeLeft === NodeType.Start;
  const isNodeRightCanConnect =
    nodeRight === NodeType.HorizontalPipe ||
    nodeRight === NodeType.BottomRightPipe ||
    nodeRight === NodeType.TopRightPipe ||
    nodeRight === NodeType.Start;
  return isNodeLeftCanConnect && isNodeRightCanConnect;
};

function assertDoubleMatrixConstructedCorrectly(
  doubleMatrix: NodeType[][],
  matrix: Node[][],
) {
  const firstLine = doubleMatrix[0]!;
  const lastLine = doubleMatrix[doubleMatrix.length - 1]!;
  assert(
    [...firstLine, ...lastLine].every((node) => node === NodeType.Unknown),
    "First and last line should be empty",
  );

  const firstMatrixLine = matrix[0]!;
  assert(
    firstMatrixLine.every(
      (node, index) => doubleMatrix[1]![index * 2 + 1] === node.type,
    ),
    "Every second node in first line should be equal to the node in the matrix",
  );
  const lastMatrixLine = matrix[matrix.length - 1]!;

  assert(
    lastMatrixLine.every(
      (node, index) =>
        doubleMatrix[doubleMatrix.length - 2]![index * 2 + 1] === node.type,
    ),
    "Every second node in last line should be equal to the node in the matrix",
  );
}

function main2(input: string) {
  const { matrix, start } = processInput(input);
  const distances = walkNodes(matrix, start);

  // Overwrite everything that is not connected to ground nodes
  distances.forEach((row, rowIndex) => {
    row.forEach((node, colIndex) => {
      if (node < 0) {
        matrix[rowIndex]![colIndex]!.type = NodeType.Ground;
      }
    });
  });

  // Expand matrix by adding empty nodes between every node
  const doubleMatrix = Array.from(
    { length: matrix.length * 2 + 1 },
    (_1, rowIndex) =>
      Array.from({ length: matrix[0]!.length * 2 + 1 }, (_2, colIndex) => {
        if (rowIndex % 2 === 1 && colIndex % 2 === 1) {
          const nodeType =
            matrix[Math.floor(rowIndex / 2)]?.[Math.floor(colIndex / 2)];

          assert(
            nodeType,
            "Node type not found " + JSON.stringify({ rowIndex, colIndex }),
          );

          return nodeType.type;
        }

        return NodeType.Unknown;
      }),
  );

  logMatrix(doubleMatrix, "double-matrix");
  assertDoubleMatrixConstructedCorrectly(doubleMatrix, matrix);

  // Connect nodes in double matrix
  for (let rowIndex = 0; rowIndex < doubleMatrix.length; rowIndex++) {
    const row = doubleMatrix[rowIndex];
    assert(row !== undefined, "Row not found");

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const currentNode = row[colIndex];
      assert(currentNode !== undefined, "Node not found");
      if (currentNode === NodeType.Unknown) {
        continue;
      }

      const leftNode = doubleMatrix[rowIndex]?.[colIndex - 2];
      if (leftNode && isHorizontallyConnected(leftNode, currentNode)) {
        doubleMatrix[rowIndex]![colIndex - 1] = NodeType.HorizontalPipe;
      }
      const topNode = doubleMatrix[rowIndex - 2]?.[colIndex];
      if (topNode && isVerticallyConnected(currentNode, topNode)) {
        doubleMatrix[rowIndex - 1]![colIndex] = NodeType.VerticalPipe;
      }
    }
  }

  logMatrix(doubleMatrix, "connected-double-matrix");

  // Flood maze
  function flood(row: number, col: number) {
    const positionsToFlood: Array<[number, number]> = [[row, col]];
    while (positionsToFlood.length) {
      const [row, col] = positionsToFlood.shift()!;

      const node = doubleMatrix[row]?.[col];
      if (node !== NodeType.Unknown && node !== NodeType.Ground) {
        continue;
      }

      doubleMatrix[row]![col] = NodeType.Flooded;
      positionsToFlood.push(
        [row + 1, col],
        [row - 1, col],
        [row, col + 1],
        [row, col - 1],
      );
    }
  }

  // Flood the matrix from every side
  for (let rowIndex = 0; rowIndex < doubleMatrix.length; rowIndex++) {
    flood(rowIndex, 0);
    flood(rowIndex, doubleMatrix[0]!.length - 1);
  }

  for (let colIndex = 0; colIndex < doubleMatrix[0]!.length; colIndex++) {
    flood(0, colIndex);
    flood(doubleMatrix.length - 1, colIndex);
  }

  logMatrix(
    // @ts-ignore -- remove unknown nodes
    doubleMatrix.map((row) =>
      row.map((type) =>
        type === NodeType.Flooded || type === NodeType.Unknown ? " " : type,
      ),
    ),
    // doubleMatrix,
    "flooded-double-matrix",
  );

  return doubleMatrix.flat().filter((node) => node === NodeType.Ground).length;
}

const TEST_INPUT_1 = `..F7.
.FJ|.
SJ.L7
|F--J
LJ...`;
const TEST_ANSWER_1 = 8;
const TEST_INPUT_2 = `.....
.S-7.
.|.|.
.L-J.
.....`;
const TEST_ANSWER_2 = 4;
const PUZZLE_INPUT = await getPuzzleInput();

const TEST_INPUT_3 = `FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`;
const TEST_INPUT_4 = `.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`;
const TEST_INPUT_5 = `..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........`;

const input = PUZZLE_INPUT;

const r1 = await main1(input);
console.log("Part 1:", r1);
const RESULTS_1 = {
  [TEST_INPUT_1]: TEST_ANSWER_1,
  [TEST_INPUT_2]: TEST_ANSWER_2,
};

if (input in RESULTS_1) {
  // @ts-ignore
  assert.equal(r1, RESULTS_1[input]);
}

const r2 = await main2(input);
console.log("Part 2:", r2);
const RESULTS = {
  [TEST_INPUT_3]: 10,
  [TEST_INPUT_4]: 8,
  [TEST_INPUT_5]: 4,
};

if (input in RESULTS) {
  // @ts-ignore
  assert.equal(r2, RESULTS[input]);
}
