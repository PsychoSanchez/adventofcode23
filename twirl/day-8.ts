import { readFileSync } from 'node:fs';

console.log(
    solution(`LLR

    AAA = (BBB, BBB)
    BBB = (AAA, ZZZ)
    ZZZ = (ZZZ, ZZZ)`)
);

console.log(solution(readFileSync('input.txt').toString('utf-8')));

function solution(input: string): number {
    const lines = input
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => Boolean(s));
    const sequence = lines[0].split('');

    const map = new Map<string, { [key: string]: string }>();
    for (const line of lines.slice(1)) {
        const match = line.match(/(\w+)\s*=\s*\((\w+),\s*(\w+)\)/);
        if (!match) {
            throw new Error(line);
        }
        const [_, pos, l, r] = match;
        if (map.get(pos)) {
            throw new Error(pos);
        }
        map.set(pos, { L: l, R: r });
    }

    let counter = 0;
    let pos = 'AAA';
    while (pos !== 'ZZZ') {
        for (const dir of sequence) {
            pos = map.get(pos)![dir]! as string;
        }
        counter++;
    }

    return counter * sequence.length;
}
