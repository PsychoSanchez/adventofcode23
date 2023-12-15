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
    const boxes: Box[] = [];
    for (const { label, operation, focal_length: fc } of lines) {
        const position = HASH(label);
        const box = boxes[position] ?? ([] as Box);
        const index = box.findIndex((lense) => lense.label === label);

        if (operation === '-') {
            if (index !== -1) {
                box.splice(index, 1);
            }
        } else if (operation === '=') {
            if (index !== -1) {
                box[index].focal_length = fc!;
            } else {
                box.push({ label, focal_length: fc! });
            }
        } else {
            throw new Error();
        }

        boxes[position] = box;
    }
    let result = 0;
    for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i] ?? ([] as Box);
        for (let j = 0; j < box.length; j++) {
            result += (i + 1) * (j + 1) * box[j].focal_length;
        }
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

function parse(input: string): Command[] {
    return input
        .trim()
        .split(',')
        .map((s) => {
            const match = s.match(/^([a-z]+)(=|-)(\d*)$/);
            if (!match) {
                throw new Error();
            }
            return {
                label: match[1],
                operation: match[2],
                focal_length: match[3] !== '' ? Number(match[3]) : undefined
            };
        });
}

type Box = Array<{ label: string; focal_length: number }>;

interface Command {
    label: string;
    operation: string;
    focal_length?: number;
}
