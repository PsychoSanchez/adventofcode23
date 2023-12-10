import { readFileSync } from 'node:fs';

const N = 1000;
const getIndex = (x: number, y: number) => `${x}:${y}`;
const decipherIndex = (s: string) =>
    s.split(':', 2).map((v) => Number(v)) as [number, number];
const solution1 = getSolution1();

console.log(
    solution(`
    FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`)
);

console.log(solution(readFileSync('input.txt').toString('utf-8')));

function solution(input: string): number {
    const matrix = parse(input);
    const components = new Map<string, number>();
    const externalComponents = new Set<number>();
    let counter = 0;

    function fillComponent(x0: number, y0: number, counter: number) {
        const stack: Array<[number, number]> = [[x0, y0]];
        while (stack.length) {
            const [startX, startY] = stack.shift()!;
            const index = getIndex(startX, startY);
            if (components.get(index) === undefined) {
                components.set(index, counter);
                if (
                    startX === 0 ||
                    startX === matrix.length - 1 ||
                    startY === 0 ||
                    startY === matrix[startX].length - 1
                ) {
                    externalComponents.add(counter);
                }

                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ].forEach(([dx, dy]) => {
                    const x = startX + dx;
                    const y = startY + dy;
                    if (
                        x >= 0 &&
                        x < matrix.length &&
                        y >= 0 &&
                        y < matrix[x].length &&
                        matrix[x][y] !== 'x'
                    ) {
                        const pos = getIndex(x, y);
                        if (components.get(pos) === undefined) {
                            stack.push([x, y]);
                        }
                    }
                });
            }
        }
    }

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const char = matrix[i][j];
            if (char === '.' || char === 'o') {
                const index = getIndex(i, j);
                if (components.get(index) === undefined) {
                    fillComponent(i, j, counter++);
                }
            }
        }
    }

    let count = 0;
    for (const [index, componentNumber] of components) {
        if (!externalComponents.has(componentNumber)) {
            const [x, y] = decipherIndex(index);
            if (matrix[x][y] === '.') {
                count++;
            }
        }
    }

    return count / 9;
}

function parse(input: string): string[][] {
    const loop = solution1(input);
    const loopTiles = new Set<string>(loop.map(([x, y]) => getIndex(x, y)));

    const lines = input
        .split('\n')
        .map((s) => s.toLowerCase().trim())
        .filter((s) => Boolean(s))
        .map((s) => s.split(''));

    const result: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const l1: string[] = [];
        const l2: string[] = [];
        const l3: string[] = [];

        for (let j = 0; j < line.length; j++) {
            const char = loopTiles.has(getIndex(i, j)) ? line[j] : '.';
            switch (char) {
                case '.':
                    l1.push('.', '.', '.');
                    l2.push('.', '.', '.');
                    l3.push('.', '.', '.');
                    break;
                case 's':
                    l1.push('o', 'x', 'o');
                    l2.push('x', 'x', 'x');
                    l3.push('o', 'x', 'o');
                    break;
                case '-':
                    l1.push('o', 'o', 'o');
                    l2.push('x', 'x', 'x');
                    l3.push('o', 'o', 'o');
                    break;
                case '|':
                    l1.push('o', 'x', 'o');
                    l2.push('o', 'x', 'o');
                    l3.push('o', 'x', 'o');
                    break;
                case '7':
                    l1.push('o', 'o', 'o');
                    l2.push('x', 'x', 'o');
                    l3.push('o', 'x', 'o');
                    break;
                case 'j':
                    l1.push('o', 'x', 'o');
                    l2.push('x', 'x', 'o');
                    l3.push('o', 'o', 'o');
                    break;
                case 'f':
                    l1.push('o', 'o', 'o');
                    l2.push('o', 'x', 'x');
                    l3.push('o', 'x', 'o');
                    break;
                case 'l':
                    l1.push('o', 'x', 'o');
                    l2.push('o', 'x', 'x');
                    l3.push('o', 'o', 'o');
                    break;
            }
        }

        result.push(l1, l2, l3);
    }

    return result;
}

function getSolution1() {
    const N = 1000;
    const getIndex = (x: number, y: number) => x * N + y;

    const res = function solution1(input: string): Array<[number, number]> {
        const [graph, start] = parse(input);

        const startConnections = graph.get(start)!;

        for (const direction of startConnections) {
            if (graph.get(direction)!.has(start)) {
                const loop = getLoop(graph, start, direction);
                if (loop !== null) {
                    return loop;
                }
            }
        }

        return [];
    };

    function parse(input: string): [Graph, number] {
        return makeGraph(
            input
                .split('\n')
                .map((s) => s.toLowerCase().trim())
                .filter((s) => Boolean(s))
                .map((s) => s.split(''))
        );
    }

    function makeGraph(input: string[][]): [Graph, number] {
        const graph: Graph = new Map();
        let start = 0;

        for (let i = 0; i < input.length; i++) {
            for (let j = 0; j < input[i].length; j++) {
                const n = getIndex(i, j);
                const char = input[i][j];
                const conn = new Set<number>();
                const directions = getPossibleDirections(char);
                if (char === 's') {
                    start = n;
                }
                for (const [dx, dy] of directions) {
                    const x = i + dx;
                    const y = j + dy;
                    if (
                        x >= 0 &&
                        x < input.length &&
                        y >= 0 &&
                        y < input[x].length
                    ) {
                        conn.add(getIndex(x, y));
                    }
                }
                graph.set(n, conn);
            }
        }

        return [graph, start];
    }

    function getPossibleDirections(char: string): Array<[number, number]> {
        const result: Array<[number, number]> = [];

        switch (char) {
            case 's':
                result.push([-1, 0], [1, 0], [0, -1], [0, 1]);
                break;
            case '-':
                result.push([0, -1], [0, 1]);
                break;
            case '|':
                result.push([-1, 0], [1, 0]);
                break;
            case 'f':
                result.push([1, 0], [0, 1]);
                break;
            case '7':
                result.push([1, 0], [0, -1]);
                break;
            case 'l':
                result.push([-1, 0], [0, 1]);
                break;
            case 'j':
                result.push([-1, 0], [0, -1]);
                break;
        }

        return result;
    }

    /*
    ..F7.
    .FJ|.
    SJ.L7
    |F--J
    LJ...
*/
    function getLoop(
        graph: Graph,
        start: number,
        next: number
    ): Array<[number, number]> | null {
        let size = 1;
        let prev = start;
        let stack: number[] = [start];
        while (next !== start) {
            const conn = graph.get(next)!;
            stack.push(next);
            const candidate = [...conn].filter((v) => v !== prev)[0]!;
            const candidateConnections = graph.get(candidate)!;
            if (candidateConnections.has(next)) {
                size++;
                prev = next;
                next = candidate;
            } else {
                return null;
            }
        }

        return stack.map((n) => [Math.floor(n / N), n % N]);
    }

    return res;
}
type Graph = Map<number, Set<number>>;
