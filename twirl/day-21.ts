import { readFileSync, writeFileSync } from 'node:fs';

function main() {
    // In exactly 10 steps, he can reach any of 50 garden plots.
    // In exactly 50 steps, he can reach 1594 garden plots.
    // In exactly 100 steps, he can reach 6536 garden plots.
    // In exactly 500 steps, he can reach 167004 garden plots.
    // In exactly 1000 steps, he can reach 668697 garden plots.
    // In exactly 5000 steps, he can reach 16733044 garden plots.
    const TEST_MAP = `...........
    .....###.#.
    .###.##..#.
    ..#.#...#..
    ....#.#....
    .##..S####.
    .##..#...#.
    .......##..
    .##.#.####.
    .##..##.##.
    ...........`;
    // for (const [limit, expected] of [
    //     [6, 16],
    //     [10, 50],
    //     [50, 1594],
    //     [100, 6536],
    //     [500, 167004],
    //     [1000, 668697]
    //     // [5000, 16733044]
    // ]) {
    //     const res = solution1(TEST_MAP, limit);
    //     console.log(res, expected, res - expected);
    // }
    const MAP = readFileSync('input.txt').toString('utf-8');

    // const M = calculateBuckets(MAP, 1);
    const N = calculateBuckets(MAP, 2);
    // const K = calculateBuckets(MAP, 3);

    // console.log(JSON.stringify(M, null, 4));
    // console.log(JSON.stringify(N, null, 4));
    // console.log(JSON.stringify(K, null, 4));

    // for (let i = 65 + 131 * 3; i <= 1e4; i += 131) {
    //     const a = solution1(MAP, i);
    //     const b = wildFuckingGuess2(i, N);
    //     console.log(a, b, a - b);
    // }

    console.log(wildFuckingGuess2(26501365, N));
}

function wildFuckingGuess2(limit: number, base: number[][]): number {
    const cycle = (limit - 65) / 131;
    let result = 7401 * (cycle - 2);
    for (let x = -cycle; x <= cycle; x++) {
        if (x === -cycle) {
            result += base[0][1] + base[0][2] + base[0][3];
        } else if (x === -cycle + 1) {
            result +=
                base[1][0] + base[1][1] + base[1][2] + base[1][3] + base[1][4];
        } else if (x === cycle - 1) {
            result +=
                base[3][0] + base[3][1] + base[3][2] + base[3][3] + base[3][4];
        } else if (x === cycle) {
            result += base[4][1] + base[4][2] + base[4][3];
        } else {
            const m = cycle - Math.abs(x) - 1;
            result +=
                base[2][0] + (m + 1) * base[2][1] + m * base[2][2] + base[2][4];
        }
    }
    return result;
}

export function solution1(input: string, limit: number): number {
    const [map, x0, y0] = parse(input);

    const M = map.length;
    const N = map[0].length;
    function free(rawX: number, rawY: number) {
        const x = rawX % M;
        const y = rawY % N;
        return map[x < 0 ? x + M : x][y < 0 ? y + N : y] !== '#';
    }
    let rim: CoordMap = new Map([[x0, new Set([y0])]]);
    const visited: CoordMap = new Map([[x0, new Set([y0])]]);
    const mod = limit % 2;
    let result = mod === 0 ? 1 : 0;
    const sizes = [1];
    for (let i = 0; i < limit; i++) {
        rim = advance(rim, visited, free);
        const rimSize = Array.from(rim.values()).reduce(
            (sum, xSet) => sum + xSet.size,
            0
        );
        sizes.push(rimSize);
        if (i % 2 !== mod) {
            result += rimSize;
        }
    }

    return result;
}

export function calculateBuckets(input: string, cycles: number): number[][] {
    const [map, x0, y0] = parse(input);

    const M = map.length;
    const N = map[0].length;
    function free(rawX: number, rawY: number) {
        const x = rawX % M;
        const y = rawY % N;
        return map[x < 0 ? x + M : x][y < 0 ? y + N : y] !== '#';
    }
    let rim: CoordMap = new Map([[x0, new Set([y0])]]);
    for (let i = 0; i < 65 + cycles * 131; i++) {
        rim = advance(rim, new Map(), free);
    }

    const W = -cycles * 131;
    const buckets: number[][] = [];
    for (let i = 0; i < 2 * cycles + 1; i++) {
        buckets[i] = [];
        for (let j = 0; j < 2 * cycles + 1; j++) {
            buckets[i][j] = 0;
        }
    }

    let total = 0;
    for (const [x, xValues] of rim.entries()) {
        for (const y of xValues) {
            total++;
            const m = Math.floor((x - W) / 131);
            const n = Math.floor((y - W) / 131);
            buckets[m][n]++;
        }
    }
    const control = solution1(input, 65 + cycles * 131);
    if (control !== total) {
        debugger;
    }

    return buckets;
}

function advance(
    rim: CoordMap,
    visited: CoordMap,
    free: (x: number, y: number) => boolean
): CoordMap {
    const newRim: CoordMap = new Map();

    for (const [x0, ys] of rim.entries()) {
        for (const y0 of ys.values()) {
            const xVisited = visited.get(x0);
            if (xVisited === undefined) {
                visited.set(x0, new Set<number>([y0]));
            } else {
                xVisited.add(y0);
            }

            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ].forEach(([dx, dy]) => {
                const x = x0 + dx;
                const y = y0 + dy;
                if (free(x, y) && visited.get(x)?.has(y) !== true) {
                    if (!newRim.has(x)) {
                        newRim.set(x, new Set([y]));
                    } else {
                        newRim.get(x)!.add(y);
                    }
                }
            });
        }
    }

    return newRim;
}

function parse(input: string): [string[][], number, number] {
    return input
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .reduce(
            ([map, x0, y0], line, i) => {
                map.push(line.split(''));
                for (let j = 0; j < line.length; j++) {
                    if (line[j] === 'S') {
                        return [map, i, j];
                    }
                }
                return [map, x0, y0];
            },
            [[] as string[][], 0, 0]
        );
}

type CoordMap = Map<number, Set<number>>;

main();
