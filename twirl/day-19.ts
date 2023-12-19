import { readFileSync } from 'node:fs';

console.log(
    solution1(
        `px{a<2006:qkq,m>2090:A,rfg}
        pv{a>1716:R,A}
        lnx{m>1548:A,A}
        rfg{s<537:gd,x>2440:R,A}
        qs{s>3448:A,lnx}
        qkq{x<1416:A,crn}
        crn{x>2662:A,R}
        in{s<1351:px,qqz}
        qqz{s>2770:qs,m<1801:hdj,R}
        gd{a>3333:R,R}
        hdj{m>838:A,pv}
        
        {x=787,m=2655,a=1222,s=2876}
        {x=1679,m=44,a=2067,s=496}
        {x=2036,m=264,a=79,s=2244}
        {x=2461,m=1339,a=466,s=291}
        {x=2127,m=1623,a=2188,s=1013}`
    )
);

console.log(solution1(readFileSync('day-19.txt').toString('utf-8')));

export function solution1(input: string): string {
    const { parts, pipelines } = parse(input);
    const map = new Map(pipelines.map((p) => [p.name, p.rules]));

    // Part I:
    // let result = 0;
    // for (const p of parts) {
    //     if (resolve(p, map)) {
    //         for (const key of ['x', 'm', 'a', 's']) {
    //             result += p[key];
    //         }
    //     }
    // }

    const usedPipelines = new Set<string>(['in']);
    let stack = new Set<string>(['in']);
    while (stack.size) {
        const newStack = new Set<string>();
        for (const name of stack) {
            const rules = map.get(name)!;
            for (const { resolution } of rules) {
                if (
                    resolution !== 'A' &&
                    resolution !== 'R' &&
                    !usedPipelines.has(resolution)
                ) {
                    usedPipelines.add(resolution);
                    newStack.add(resolution);
                }
            }
        }
        stack = newStack;
    }

    const usedMap = new Map<string, Rule[]>(
        Array.from(map.entries()).filter(([name]) => usedPipelines.has(name))
    );
    const divisors: number[][] = [];
    for (const key of ['x', 'm', 'a', 's']) {
        divisors.push(getDivisors(key, usedMap));
    }

    // 116115541402166
    let result = BigInt(0);
    for (let i = 1; i < divisors[0].length; i++) {
        console.log(`Iteration ${i} of ${divisors[0].length}`);
        const iBegin = divisors[0][i - 1];
        const iEnd = divisors[0][i];
        for (let j = 1; j < divisors[1].length; j++) {
            const jBegin = divisors[1][j - 1];
            const jEnd = divisors[1][j];
            for (let k = 1; k < divisors[2].length; k++) {
                const kBegin = divisors[2][k - 1];
                const kEnd = divisors[2][k];
                for (let n = 1; n < divisors[3].length; n++) {
                    const nBegin = divisors[3][n - 1];
                    const nEnd = divisors[3][n];
                    const v = resolve(
                        {
                            x: iBegin,
                            m: jBegin,
                            a: kBegin,
                            s: nBegin
                        },
                        map
                    );
                    if (v) {
                        result += BigInt(
                            (iEnd - iBegin) *
                                (jEnd - jBegin) *
                                (kEnd - kBegin) *
                                (nEnd - nBegin)
                        );
                    }
                }
            }
        }
    }

    return result.toString();
}

function getDivisors(field: string, map: Map<string, Rule[]>): number[] {
    const boundaries = new Map<number, number>([
        [1, 1],
        [4001, 1]
    ]);
    function inc(v: number) {
        boundaries.set(v, (boundaries.get(v) ?? 0) + 1);
    }

    for (const rules of map.values()) {
        for (const rule of rules) {
            if (rule.field === field) {
                const t = rule.threshold!;
                if (rule.operation === '<') {
                    inc(t);
                } else {
                    inc(t + 1);
                }
            }
        }
    }

    // px{a<2006:qkq,m>2090:A,rfg}
    // pv{a>1716:R,A}
    // lnx{m>1548:A,A}
    // rfg{s<537:gd,x>2440:R,A}
    // qs{s>3448:A,lnx}
    // qkq{x<1416:A,crn}
    // crn{x>2662:A,R}
    // in{s<1351:px,qqz}
    // qqz{s>2770:qs,m<1801:hdj,R}
    // gd{a>3333:R,R}
    // hdj{m>838:A,pv}

    return Array.from(boundaries.keys()).sort((a, b) => a - b);
}

function resolve(p: Part, map: Map<string, Rule[]>): boolean {
    let resolution = 'in';
    while (resolution !== 'A' && resolution !== 'R') {
        const rules = map.get(resolution)!;
        for (const rule of rules) {
            const result = applyRule(rule, p);
            if (result !== null) {
                resolution = result;
                break;
            }
        }
    }
    return resolution === 'A';
}

function applyRule(rule: Rule, p: Part): string | null {
    if (rule.field === undefined) {
        return rule.resolution;
    } else {
        let satisfies = false;
        const value = p[rule.field!]!;
        switch (rule.operation) {
            case '<':
                satisfies = value < rule.threshold!;
                break;
            case '>':
                satisfies = value > rule.threshold!;
                break;
        }
        return satisfies ? rule.resolution : null;
    }
}

function parse(input: string): {
    parts: Part[];
    pipelines: Pipeline[];
} {
    const [p1, p2] = input.split(/\n\s*\n/, 2);

    return {
        pipelines: p1.split('\n').map(parsePipeline),
        parts: p2.split('\n').map(parsePart)
    };
}

function parsePipeline(line: string): Pipeline {
    const match = line.match(/(\w+){(.+)}/);
    if (!match) {
        throw new Error();
    }
    const [_, name, rules] = match;

    return {
        name,
        rules: rules.split(',').map((s) => {
            const parts = s.match(/^(\w)(\<|\>)(\d+)\:(\w+)$/);
            if (parts) {
                return {
                    field: parts[1],
                    operation: parts[2],
                    threshold: Number(parts[3]),
                    resolution: parts[4]
                } as Rule;
            } else {
                return {
                    resolution: s
                };
            }
        })
    };
}

function parsePart(line: string) {
    const matches = line.trim().replace('{', '').replace('}', '').split(',');
    let acc: { [key: string]: number } = {};
    for (const match of matches) {
        const parts = match.match(/^(\w)=(\d+)$/);
        if (!parts) {
            throw new Error();
        }
        acc[parts[1]] = Number(parts[2]);
    }
    return acc as any as Part;
}

interface Part {
    x: number;
    m: number;
    a: number;
    s: number;
}

interface Pipeline {
    name: string;
    rules: Rule[];
}

interface Rule {
    field?: string;
    operation?: '<' | '>';
    threshold?: number;
    resolution: string;
}
