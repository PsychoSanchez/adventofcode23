import { readFileSync } from 'node:fs';

console.log(
    JSON.stringify(
        solution1(`rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`),
        null,
        4
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const lines = parse(input);
    let result = 0;
    for (const line of lines) {
        result += HASH(line);
    }
    return result;
}

// Determine the ASCII code for the current character of the string.
// Increase the current value by the ASCII code you just determined.
// Set the current value to itself multiplied by 17.
// Set the current value to the remainder of dividing itself by 256.
export function HASH(s: string, A = 17, B = 256): number {
    let result = 0;
    for (let i = 0; i < s.length; i++) {
        result = ((result + s.charCodeAt(i)) * A) % B;
    }
    return result;
}

function parse(input: string): string[] {
    return input.trim().split(',');
}
