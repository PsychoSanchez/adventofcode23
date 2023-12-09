import { readFileSync } from 'node:fs';

console.log(solution(`10  13  16  21  30  45`));

console.log(solution(readFileSync('input.txt').toString('utf-8')));

function solution(input: string): number {
    const sequences = parse(input);

    return sequences.reduce((s, sequence) => s + predict(sequence), 0);
}

function parse(input: string): number[][] {
    return input
        .split('\n')
        .map((s) => s.toLowerCase().trim())
        .filter((s) => Boolean(s))
        .map((s) => s.split(/\s+/).map((v) => Number(v)));
}

function predict(sequence: number[]): number {
    const stack: number[] = [sequence[0]];
    let last: number | null = null;
    let next: number[] = [];
    let isEven = false;

    if (sequence.length === 2 && sequence[0] !== sequence[1]) {
        throw new Error('This cannot be!');
    }

    while (!isEven) {
        isEven = true;
        last = null;
        next = [];
        for (let i = 1; i < sequence.length; i++) {
            const diff = sequence[i] - sequence[i - 1];
            if (last !== null && last !== diff) {
                isEven = false;
            }
            if (last === null) {
                last = diff;
            }
            next.push(diff);
        }
        stack.push(last!);
        sequence = next;
    }

    return stack.reverse().reduce((sum, v) => v - sum, 0);
}
