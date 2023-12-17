import { readFileSync } from 'node:fs';

// change to [1, 3] for the first part
const MIN_STRAIGHT = 4;
const MAX_STRAIGHT = 10;
enum Direction {
    NONE = 'n',
    TOP = 't',
    RIGHT = 'r',
    BOTTOM = 'b',
    LEFT = 'l'
}
const DIRECTIONS = new Map<Direction, [number, number]>([
    [Direction.TOP, [-1, 0]],
    [Direction.RIGHT, [0, 1]],
    [Direction.BOTTOM, [1, 0]],
    [Direction.LEFT, [0, -1]]
]);
const DISALLOWED_TURNS = new Map<Direction, Direction>([
    [Direction.BOTTOM, Direction.TOP],
    [Direction.TOP, Direction.BOTTOM],
    [Direction.LEFT, Direction.RIGHT],
    [Direction.RIGHT, Direction.LEFT]
]);

// console.log(
//     solution1(
//         `11111
//         91191`
//     )
// );

console.log(
    solution1(
        `2413432311323
        3215453535623
        3255245654254
        3446585845452
        4546657867536
        1438598798454
        4457876987766
        3637877979653
        4654967986887
        4564679986453
        1224686865563
        2546548887735
        4322674655533`
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const matrix = parse(input);
    const visited = new Map<string, number>();
    const stack: Map<string, [number, number, Direction, number]> = new Map([
        ['0:0:o', [0, 0, Direction.NONE, 0]]
    ]);
    let nextInfo = 1000;
    const grandTotal = matrix.length * matrix[0].length * 4;
    while (stack.size) {
        for (const [key, [x, y, currentDir, total]] of stack.entries()) {
            stack.delete(key);
            [
                Direction.TOP,
                Direction.RIGHT,
                Direction.BOTTOM,
                Direction.LEFT
            ].forEach((dir) => {
                if (
                    dir !== currentDir &&
                    DISALLOWED_TURNS.get(dir) !== currentDir
                ) {
                    for (
                        let straight = MIN_STRAIGHT;
                        straight <= MAX_STRAIGHT;
                        straight++
                    ) {
                        const nextMove = tryMove(
                            matrix,
                            x,
                            y,
                            dir,
                            straight,
                            total,
                            visited
                        );
                        if (nextMove !== null) {
                            const nextKey = `${nextMove[0]}:${nextMove[1]}:${nextMove[2]}`;
                            if (
                                !stack.has(nextKey) ||
                                stack.get(nextKey)![3] > nextMove[3]
                            ) {
                                stack.set(nextKey, nextMove);
                            }
                        }
                    }
                }
            });
            if (visited.size >= nextInfo) {
                console.log(
                    `${visited.size} of ${grandTotal}, ${stack.size} items in stack`
                );
                nextInfo += 1000;
            }
            break;
        }
    }

    const prefix = `${matrix.length - 1}:${matrix[0].length - 1}`;
    return Array.from(visited.entries()).reduce((min, [k, v]) => {
        if (k.startsWith(prefix)) {
            return Math.min(min, v);
        } else {
            return min;
        }
    }, Number.POSITIVE_INFINITY);
}

function parse(input: string): number[][] {
    return input
        .trim()
        .split('\n')
        .map((s) =>
            s
                .trim()
                .split('')
                .map((v) => Number(v))
        );
}

function tryMove(
    matrix: number[][],
    x0: number,
    y0: number,
    dir: Direction,
    straight: number,
    total: number,
    visited: Map<string, number>
): [number, number, Direction, number] | null {
    if (straight > MAX_STRAIGHT) {
        return null;
    }
    const [dx, dy] = DIRECTIONS.get(dir)!;
    let dTotal = 0;
    let x = x0;
    let y = y0;
    for (let i = 0; i < straight; i++) {
        x += dx;
        y += dy;
        if (x < 0 || x >= matrix.length || y < 0 || y >= matrix[x].length) {
            return null;
        }
        if (x === 0 && y === 0) {
            return null;
        }
        dTotal += matrix[x][y];
    }
    const newTotal = total + dTotal;
    const key = `${x}:${y}:${dir}`;
    if (!visited.has(key) || visited.get(key)! > newTotal) {
        visited.set(key, newTotal);
        return [x, y, dir, newTotal];
    }
    return null;
}
