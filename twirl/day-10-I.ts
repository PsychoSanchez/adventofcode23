import { readFileSync } from 'node:fs';

console.log(
    solution(`..F7.
.FJ|.
SJ.L7
|F--J
LJ...`)
);

console.log(solution(readFileSync('input.txt').toString('utf-8')));

function solution(input: string): number {
    const [graph, start] = parse(input);

    const startConnections = graph.get(start)!;

    for (const direction of startConnections) {
        if (graph.get(direction)!.has(start)) {
            const size = getLoopSize(graph, start, direction);
            if (size !== null) {
                return size / 2;
            }
        }
    }

    return -1;
}

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
    const N = 1000;
    const getIndex = (x: number, y: number) => x * N + y;
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
function getLoopSize(graph: Graph, start: number, next: number): number | null {
    let size = 1;
    let prev = start;
    while (next !== start) {
        const conn = graph.get(next)!;
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

    return size;
}

type Graph = Map<number, Set<number>>;
