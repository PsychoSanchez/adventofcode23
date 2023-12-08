const lcm = require('compute-lcm');
import { readFileSync } from 'node:fs';

console.log(
    solution(`LR

    11A = (11B, XXX)
    11B = (XXX, 11Z)
    11Z = (11B, XXX)
    22A = (22B, XXX)
    22B = (22C, 22C)
    22C = (22Z, 22Z)
    22Z = (22B, 22B)
    XXX = (XXX, XXX)`)
);

console.log(solution(readFileSync('input.txt').toString('utf-8')));

function solution(input: string): number {
    const lines = input
        .split('\n')
        .map((s) => s.toLowerCase().trim())
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
        map.set(pos, { l, r });
    }

    const aNodes = new Set<string>(
        Array.from(map.keys()).filter(
            (line) => line.charAt(line.length - 1) === 'a'
        )
    );
    const zNodes = new Set<string>(
        Array.from(map.keys()).filter(
            (line) => line.charAt(line.length - 1) === 'z'
        )
    );
    if (aNodes.size !== zNodes.size) {
        throw new Error('A != Z');
    }

    function loop(startPos: string): Loop {
        let pos = startPos;
        let counter = 0;
        let visited = new Map<string, number>([[startPos, 0]]);
        const zPos: number[] = [];

        while (1) {
            for (const dir of sequence) {
                pos = map.get(pos)![dir]! as string;
            }
            counter++;
            if (zNodes.has(pos)) {
                zPos.push(counter);
            }
            if (visited.has(pos)) {
                const offset = visited.get(pos)!;
                return {
                    offset,
                    zPos: zPos.map((z) => z - offset),
                    cycle: counter - offset
                };
            } else {
                visited.set(pos, counter);
            }
        }
        return {
            offset: 0,
            zPos: [],
            cycle: 0
        };
    }

    const loops = [...aNodes].map((node) => loop(node));

    return lcm(...loops.map((l) => l.cycle)) * sequence.length;
}

interface Loop {
    offset: number;
    zPos: number[];
    cycle: number;
}
