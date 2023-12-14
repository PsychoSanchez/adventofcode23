import { readFileSync } from 'node:fs';

console.log(
    JSON.stringify(
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
        ),
        null,
        4
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const matrix = parse(input);
    let result = 0;
    const barriers = Array(matrix[0].length).fill(-1);

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const char = matrix[i][j];

            if (char === '#') {
                barriers[j] = i;
            } else if (char === 'o') {
                result += matrix.length - barriers[j] - 1;
                barriers[j]++;
            }
        }
    }
    return result;
}

function parse(input: string): string[][] {
    return input.split('\n').map((s) => s.toLowerCase().trim().split(''));
}
