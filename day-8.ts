// --- Day 8: Haunted Wasteland ---
// You're still riding a camel across Desert Island when you spot a sandstorm quickly approaching. When you turn to warn the Elf, she disappears before your eyes! To be fair, she had just finished warning you about ghosts a few minutes ago.

import assert from "assert";
import { isNonNull } from "./shared/type-guards";

// One of the camel's pouches is labeled "maps" - sure enough, it's full of documents (your puzzle input) about how to navigate the desert. At least, you're pretty sure that's what they are; one of the documents contains a list of left/right instructions, and the rest of the documents seem to describe some kind of network of labeled nodes.

// It seems like you're meant to use the left/right instructions to navigate the network. Perhaps if you have the camel follow the same instructions, you can escape the haunted wasteland!

// After examining the maps for a bit, two nodes stick out: AAA and ZZZ. You feel like AAA is where you are now, and you have to follow the left/right instructions until you reach ZZZ.

// This format defines each node of the network individually. For example:

// RL

// AAA = (BBB, CCC)
// BBB = (DDD, EEE)
// CCC = (ZZZ, GGG)
// DDD = (DDD, DDD)
// EEE = (EEE, EEE)
// GGG = (GGG, GGG)
// ZZZ = (ZZZ, ZZZ)
// Starting with AAA, you need to look up the next element based on the next left/right instruction in your input. In this example, start with AAA and go right (R) by choosing the right element of AAA, CCC. Then, L means to choose the left element of CCC, ZZZ. By following the left/right instructions, you reach ZZZ in 2 steps.

// Of course, you might not find ZZZ right away. If you run out of left/right instructions, repeat the whole sequence of instructions as necessary: RL really means RLRLRLRLRLRLRLRL... and so on. For example, here is a situation that takes 6 steps to reach ZZZ:

// LLR

// AAA = (BBB, BBB)
// BBB = (AAA, ZZZ)
// ZZZ = (ZZZ, ZZZ)
// Starting at AAA, follow the left/right instructions. How many steps are required to reach ZZZ?

const TEST_INPUT_1 = `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`;
const TEST_INPUT_2 = `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`;

const PUZZLE_INPUT = await Bun.file("./data/day-8.data").text();

const TEST_INPUT_3 = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`;

const ANSWERS_PART_1 = {
  [TEST_INPUT_1]: 2,
  [TEST_INPUT_2]: 6,
  [PUZZLE_INPUT]: 20777,
};
const ANSWERS_PART_2 = {
  [TEST_INPUT_3]: 6,
};

const INPUT = TEST_INPUT_1;
function processInput(input: string) {
  const [instructions, ...lines] = input.split("\n");
  assert(instructions);
  assert(isLRArray(instructions));

  const nodes = lines.slice(1).map((line) => {
    const [node, children] = line.split(" = ");
    assert(node);

    const [left, right] =
      children
        ?.slice(1)
        .split(", ")
        .map((child) => child.trim().replace("(", "").replace(")", "")) ?? [];

    assert(left);
    assert(right);

    return {
      node,
      left,
      right,
    };
  });

  return { instructions, nodes };
}

function isLRArray(instructions: any): instructions is Array<"L" | "R"> {
  return instructions
    .split("")
    .every((char: string) => char === "L" || char === "R");
}

function main1() {
  const { instructions, nodes } = processInput(INPUT);

  const nodeMap = new Map<string, { left: string; right: string }>(
    nodes.map((node) => [node.node, { left: node.left, right: node.right }]),
  );

  let currentNode = "AAA";
  let currentInstructionIndex = 0;
  let currentInstruction = instructions[currentInstructionIndex];

  while (currentNode !== "ZZZ") {
    if (currentInstruction === "L") {
      currentNode = nodeMap.get(currentNode)!.left;
    } else if (currentInstruction === "R") {
      currentNode = nodeMap.get(currentNode)!.right;
    } else {
      throw new Error("Invalid instruction");
    }

    currentInstructionIndex++;
    currentInstruction =
      instructions[currentInstructionIndex % instructions.length];
  }

  return currentInstructionIndex;
}

const r1 = main1();
console.log("Part 1:", r1);
if (INPUT in ANSWERS_PART_1) {
  assert.equal(r1, ANSWERS_PART_1[INPUT]);
}

// --- Part Two ---
// The sandstorm is upon you and you aren't any closer to escaping the wasteland. You had the camel follow the instructions, but you've barely left your starting position. It's going to take significantly more steps to escape!

// What if the map isn't for people - what if the map is for ghosts? Are ghosts even bound by the laws of spacetime? Only one way to find out.

// After examining the maps a bit longer, your attention is drawn to a curious fact: the number of nodes with names ending in A is equal to the number ending in Z! If you were a ghost, you'd probably just start at every node that ends with A and follow all of the paths at the same time until they all simultaneously end up at nodes that end with Z.

// For example:

// LR

// 11A = (11B, XXX)
// 11B = (XXX, 11Z)
// 11Z = (11B, XXX)
// 22A = (22B, XXX)
// 22B = (22C, 22C)
// 22C = (22Z, 22Z)
// 22Z = (22B, 22B)
// XXX = (XXX, XXX)
// Here, there are two starting nodes, 11A and 22A (because they both end with A). As you follow each left/right instruction, use that instruction to simultaneously navigate away from both nodes you're currently on. Repeat this process until all of the nodes you're currently on end with Z. (If only some of the nodes you're on end with Z, they act like any other node and you continue as normal.) In this example, you would proceed as follows:

// Step 0: You are at 11A and 22A.
// Step 1: You choose all of the left paths, leading you to 11B and 22B.
// Step 2: You choose all of the right paths, leading you to 11Z and 22C.
// Step 3: You choose all of the left paths, leading you to 11B and 22Z.
// Step 4: You choose all of the right paths, leading you to 11Z and 22B.
// Step 5: You choose all of the left paths, leading you to 11B and 22C.
// Step 6: You choose all of the right paths, leading you to 11Z and 22Z.
// So, in this example, you end up entirely on nodes that end in Z after 6 steps.

// Simultaneously start on every node that ends with A. How many steps does it take before you're only on nodes that end with Z?

function main2() {
  const { instructions, nodes } = processInput(PUZZLE_INPUT);

  const nodeMap = new Map<string, { left: string; right: string }>(
    nodes.map((node) => [node.node, { left: node.left, right: node.right }]),
  );

  let startNodes = nodes.filter((node) => node.node.endsWith("A"));
  let endNodes = nodes.filter((node) => node.node.endsWith("Z"));

  function step(
    currentNodes: string[],
    nodesToFind: string[],
    dir: "L" | "R",
    iter = 0,
    nodesFound: Array<number | null> = Array.from(
      {
        length: currentNodes.length,
      },
      () => null,
    ),
  ): number {
    for (let i = 0; i < currentNodes.length; i++) {
      const startNode = currentNodes[i];
      assert(startNode);
      const { left, right } = nodeMap.get(startNode)!;

      if (nodesToFind.includes(startNode)) {
        nodesFound[i] ??= iter;
      }

      assert(dir === "L" || dir === "R", "Invalid direction");
      currentNodes[i] = dir === "L" ? left : right;
    }

    if (nodesFound.every(isNonNull)) {
      // WHAT AM I? A MATHEMATICIAN?
      const lcm = (...arr: number[]) => {
        const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
        const _lcm = (x: number, y: number) => (x * y) / gcd(x, y);
        return [...arr].reduce((a, b) => _lcm(a, b));
      };

      return lcm(...nodesFound);
    }

    const nextIter = iter + 1;

    return step(
      currentNodes,
      nodesToFind,
      instructions[nextIter % instructions.length] as "L" | "R",
      nextIter,
      nodesFound,
    );
  }

  assert(
    startNodes.length === endNodes.length,
    "startNodes.length === endNodes.length",
  );

  return step(
    startNodes.map((node) => node.node),
    endNodes.map((node) => node.node),
    instructions[0] as "L" | "R",
  );
}

const r2 = main2();

console.log("Part 2:", r2);
// assert.equal(r2, 6);
assert.equal(r2, 13289612809129);
