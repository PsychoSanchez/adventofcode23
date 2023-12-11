import { readFileSync } from 'node:fs';

console.log(
    JSON.stringify(
        solution1(`...#......
        .......#..
        #.........
        ..........
        ......#...
        .#........
        .........#
        ..........
        .......#..
        #...#.....`),
        null,
        4
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const matrix = parse(input);
    const freeRows = getFreeRows(matrix);
    const freeColumns = getFreeColumns(matrix);
    const galaxies = matrix.reduce((acc, row, i) => {
        row.forEach((v, j) => {
            if (v === '#') {
                acc.push([i, j]);
            }
        });
        return acc;
    }, [] as Array<[number, number]>);

    console.log(distance(galaxies[0], galaxies[6], freeRows, freeColumns));

    let result = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i + 1; j < galaxies.length; j++) {
            result += distance(
                galaxies[i],
                galaxies[j],
                freeRows,
                freeColumns,
                1000000 // Remove this for the first part of the task
            );
        }
    }
    return result;
}

function getFreeRows(matrix: string[][]) {
    const freeRows = new Set<number>();
    for (let i = 0; i < matrix.length; i++) {
        const isFree = matrix[i].reduce(
            (isFree, v) => isFree && v === '.',
            true
        );
        if (isFree) {
            freeRows.add(i);
        }
    }
    return freeRows;
}

function getFreeColumns(matrix: string[][]) {
    const freeCols = new Set<number>();
    for (let j = 0; j < matrix[0].length; j++) {
        let isFree = true;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][j] !== '.') {
                isFree = false;
                break;
            }
        }
        if (isFree) {
            freeCols.add(j);
        }
    }
    return freeCols;
}

function distance(
    [x1, y1]: [number, number],
    [x2, y2]: [number, number],
    doubleRows: Set<number>,
    doubleColumns: Set<number>,
    factor: number = 2
): number {
    let result = 0;
    for (let x = Math.min(x1, x2); x < Math.max(x1, x2); x++) {
        result += doubleRows.has(x) ? factor : 1;
    }
    for (let y = Math.min(y1, y2); y < Math.max(y1, y2); y++) {
        result += doubleColumns.has(y) ? factor : 1;
    }
    return result;
}

function parse(input: string): string[][] {
    return input
        .split('\n')
        .map((s) => s.toLowerCase().trim())
        .filter((s) => Boolean(s))
        .map((s) => s.split(''));
}
