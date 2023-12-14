import { readFileSync } from 'node:fs';
const cache = new Map<string, number>();

console.log(
    solution1(
        `OOOO.#.O..
            OO..#....#
            OO..O##..O
            O..#.OO...
            ........#.
            ..#....#.#
            ..O..#.O.O
            ..O.......
            #....###..
            #....#....`
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    let matrix = parse(input);
    let result = 0;

    let i = 0;
    cache.set(getKey(matrix), 0);
    const limit = 1000000000;
    let cycleFound = false;
    while (i < limit) {
        i++;
        [matrix, result] = loop(matrix);
        const key = getKey(matrix);
        if (cache.has(key) && !cycleFound) {
            const cycleStart = cache.get(key)!;
            const cycleLength = i - cycleStart;
            console.log('Cycle Found!', cycleLength);
            i =
                cycleStart +
                Math.floor((limit - cycleStart) / cycleLength) * cycleLength;
            cycleFound = true;
        } else {
            cache.set(key, i);
        }
    }

    return result;
}

function parse(input: string): string[][] {
    return input.split('\n').map((s) => s.toLowerCase().trim().split(''));
}

function tilt(matrix: string[][]): string[][] {
    const newMatrix: string[][] = [];
    const barriers = Array(matrix[0].length).fill(-1);

    for (let i = 0; i < matrix.length; i++) {
        newMatrix[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            const char = matrix[i][j];
            let newChar = char;
            if (char === '#') {
                barriers[j] = i;
            } else if (char === 'o') {
                barriers[j]++;
                if (barriers[j] !== i) {
                    newMatrix[barriers[j]][j] = 'o';
                    newChar = '.';
                }
            }
            newMatrix[i][j] = newChar;
        }
    }
    return newMatrix;
}

function rotate(matrix: string[][]): string[][] {
    const newMatrix: string[][] = [];

    // 1 2 3    4 1
    // 4 5 6    5 2
    //          6 3
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (!newMatrix[j]) {
                newMatrix[j] = [];
            }
            newMatrix[j][matrix.length - i - 1] = matrix[i][j];
        }
    }

    return newMatrix;
}

function count(matrix: string[][]): number {
    let count = 0;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] == 'o') {
                count += matrix.length - i;
            }
        }
    }
    return count;
}

// OOOO.#.O..
// OO..#....#
// OO..O##..O
// O..#.OO...
// ........#.
// ..#....#.#
// ..O..#.O.O
// ..O.......
// #....###..
// #....#....

function loop(matrix: string[][]): [string[][], number] {
    let m = tilt(matrix);
    m = rotate(m);
    m = tilt(m);
    m = rotate(m);
    m = tilt(m);
    m = rotate(m);
    m = tilt(m);
    m = rotate(m);
    return [m, count(m)];
}

function getKey(matrix: string[][]): string {
    return matrix.map((r) => r.join('')).join('');
}
