import { readFileSync } from 'node:fs';

console.log(
    JSON.stringify(
        solution1(
            `#.##..##.
            ..#.##.#.
            ##......#
            ##......#
            ..#.##.#.
            ..##..##.
            #.#.##.#.

            #...##..#
            #....#..#
            ..##..###
            #####.##.
            #####.##.
            ..##..###
            #....#..#`
        ),
        null,
        4
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const matrixes = parse(input);
    let result = 0;
    for (const matrix of matrixes) {
        result += getSymmValue(matrix, 1);
    }
    return result;
}

function getSymmValue(m: string[][], maxDiff = 0): number {
    const v = getSymmIndex(m, maxDiff);
    if (v !== null) {
        return v * 100;
    } else {
        const n: string[][] = [];
        for (let i = 0; i < m.length; i++) {
            for (let j = 0; j < m[i].length; j++) {
                if (!n[j]) {
                    n[j] = [];
                }
                n[j][i] = m[i][j];
            }
        }
        const h = getSymmIndex(n, maxDiff);
        if (h === null) {
            throw new Error();
        } else {
            return h;
        }
    }
}

function getSymmIndex(m: string[][], maxDiff = 0): number | null {
    for (let i = 1; i < m.length; i++) {
        let totalDiff = lineDiff(m[i], m[i - 1], maxDiff);
        if (totalDiff !== null) {
            let k = 1;
            while (i + k < m.length && i - k > 0) {
                let diff = lineDiff(
                    m[i + k],
                    m[i - k - 1],
                    maxDiff - totalDiff
                );
                if (diff === null || diff + totalDiff > maxDiff) {
                    break;
                } else {
                    totalDiff += diff;
                }
                k++;
            }
            if ((i + k === m.length || i - k === 0) && totalDiff === maxDiff) {
                return i;
            }
        }
    }
    return null;
}

function lineDiff(a: string[], b: string[], maxDiff = 0): number | null {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            diff++;
        }
        if (diff > maxDiff) {
            return null;
        }
    }
    return diff;
}

function parse(input: string): string[][][] {
    const lines = input.split('\n').map((s) => s.toLowerCase().trim());

    let m: string[][] = [];
    let result: string[][][] = [];
    for (const line of lines) {
        if (line === '') {
            result.push(m);
            m = [];
        } else {
            m.push(line.split(''));
        }
    }
    result.push(m);
    return result;
}
