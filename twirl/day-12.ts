import { readFileSync } from 'node:fs';
const results = readFileSync('results.txt').toString('utf-8');
const cache = new Map<string, number>();
for (let i = 0; i < results.length - 1; i += 2) {
    cache.set(results[i].split(' ', 2)[1], Number(results[i + 1]));
}

console.log(
    JSON.stringify(
        solution1(
            `???.### 1,1,3
            .??..??...?##. 1,1,3
            ?#?#?#?#?#?#?#? 1,3,1,6
            ????.#...#... 4,1,1
            ????.######..#####. 1,6,5
            ?###???????? 3,2,1`
        ),
        null,
        4
    )
);

console.log(solution1(readFileSync('input.txt').toString('utf-8')));

export function solution1(input: string): number {
    const rows = parse(input);
    let result = 0;
    let i = 0;
    for (const [symbols, groups] of rows) {
        const s = Array(5).fill(symbols).join('?').split('');
        const g = Array(5)
            .fill(groups)
            .join(',')
            .split(',')
            .map((v) => Number(v));
        console.log(++i, s.join(''), g.join(', '));
        const solutions = possibleCompletions(s, g);
        result += solutions;
        console.log(solutions);
    }
    return result;
}

function possibleCompletionsRe(symbols: string[], groups: number[]): number {
    const s = symbols.join('');
    const whitespace = '[\\.|\\?]';
    const pattern = new RegExp(
        '^' +
            whitespace +
            '*' +
            groups.map((g) => '[\\?|#]{' + g + '}').join(whitespace + '+') +
            whitespace +
            '*',
        'g'
    );

    let i = 0;
    let match = pattern.exec(s);
    while (match) {
        i++;
        match = pattern.exec(s);
    }
    return i;
}

function possibleCompletions(
    symbols: string[],
    groups: number[],
    remainingFr?: Fr
): number {
    const cacheKey = symbols.join('') + ' ' + groups.join(', ');
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
    }
    const fr =
        remainingFr ??
        symbols.reduce(
            (fr: Fr, symbol) => {
                fr[symbol as keyof Fr]++;
                return fr;
            },
            { '.': 0, '#': 0, '?': 0 }
        );
    const group = groups[0]!;
    let result = 0;

    const sharpNumber = groups.reduce((sum, g) => sum + g, 0);
    if (
        sharpNumber > fr['#'] + fr['?'] ||
        groups.length > fr['.'] + fr['?'] + 1 ||
        sharpNumber + groups.length - 1 > symbols.length
    ) {
        return 0;
    }

    for (
        let i = 0;
        i <= symbols.length - (sharpNumber + groups.length - 1);
        i++
    ) {
        if (symbols[i] === '#' || symbols[i] === '?') {
            let match = true;
            let sNumber = 0;
            let qNumber = 0;
            for (let j = 0; j < group; j++) {
                const char = symbols[i + j];
                if (char === '.') {
                    match = false;
                    break;
                } else if (char === '#') {
                    sNumber++;
                } else {
                    qNumber++;
                }
            }

            if (match) {
                if (groups.length === 1) {
                    result += noSharpsInTheRest(symbols.slice(i + group))
                        ? 1
                        : 0;
                } else {
                    if (
                        i + group < symbols.length &&
                        symbols[i + group] !== '#'
                    ) {
                        const newFr = { ...fr };
                        for (let k = 0; k < i + group + 1; k++) {
                            newFr[symbols[k] as keyof Fr]--;
                        }
                        result += possibleCompletions(
                            symbols.slice(i + group + 1),
                            groups.slice(1),
                            newFr
                        );
                    }
                }
            }
        }
        if (symbols[i] === '#') {
            break;
        }
    }
    cache.set(cacheKey, result);
    return result;
}

function noSharpsInTheRest(s: string[]): boolean {
    return s.indexOf('#') === -1;
}

function parse(input: string): string[][] {
    return input
        .split('\n')
        .map((s) => s.toLowerCase().trim())
        .filter((s) => Boolean(s))
        .map((s) => s.split(' ', 2));
}

interface Fr {
    '.': number;
    '#': number;
    '?': number;
}
