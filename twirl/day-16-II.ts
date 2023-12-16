import { readFileSync } from 'node:fs';
class Beam {
    public readonly direction: number;

    constructor(public readonly dx: number, public readonly dy: number) {
        // 0, -1 → 0
        // 0, 1 → 1
        // -1, 0 → 2
        // 1, 0 → 3
        if (dx === 0) {
            this.direction = dy < 0 ? 0 : 1;
        } else {
            this.direction = dx < 0 ? 2 : 3;
        }
    }

    // \
    public static RIGHT_REFLECTIONS: { [direction: string]: number } = {
        '0': 2,
        '1': 3,
        '2': 0,
        '3': 1
    };

    // /
    public static LEFT_REFLECTIONS: {
        [direction: string]: number;
    } = {
        '0': 3,
        '1': 2,
        '2': 1,
        '3': 0
    };

    public static fromDirection(direction: number): Beam {
        switch (direction) {
            case 0:
                return new Beam(0, -1);
            case 1:
                return new Beam(0, 1);
            case 2:
                return new Beam(-1, 0);
            case 3:
                return new Beam(1, 0);
            default:
                throw new Error();
        }
    }

    public passBlock(kind: string): Beam[] {
        switch (kind) {
            case '.':
                return [this];
            case '\\':
                return [
                    Beam.fromDirection(
                        Beam.RIGHT_REFLECTIONS[this.direction.toString()]!
                    )
                ];
            case '/':
                return [
                    Beam.fromDirection(
                        Beam.LEFT_REFLECTIONS[this.direction.toString()]!
                    )
                ];
            case '-':
                if (this.dx === 0) {
                    return [this];
                } else {
                    return [new Beam(0, -1), new Beam(0, 1)];
                }
            case '|':
                if (this.dy === 0) {
                    return [this];
                } else {
                    return [new Beam(-1, 0), new Beam(1, 0)];
                }
            default:
                throw new Error();
        }
    }
}

console.log(
    JSON.stringify(
        solution2(`.|...\\....
        |.-.\\.....
        .....|-...
        ........|.
        ..........
        .........\\
        ..../.\\\\..
        .-.-/..|..
        .|....-|.\\
        ..//.|....`),
        null,
        4
    )
);

console.log(solution2(readFileSync('input.txt').toString('utf-8')));

function solution2(input: string): number {
    const matrix = parse(input);
    let max = 0;
    for (let i = 0; i < matrix.length; i++) {
        max = Math.max(max, solution1(matrix, i, 0, new Beam(0, 1)));
        max = Math.max(
            max,
            solution1(matrix, i, matrix[i].length - 1, new Beam(0, -1))
        );
    }
    for (let j = 0; j < matrix[0].length; j++) {
        max = Math.max(max, solution1(matrix, 0, j, new Beam(1, 0)));
        max = Math.max(
            max,
            solution1(matrix, matrix[0].length - 1, j, new Beam(-1, 0))
        );
    }
    return max;
}

export function solution1(
    matrix: string[][],
    startX = 0,
    startY = 0,
    startBeam = new Beam(0, 1)
): number {
    const beams: Array<[number, number, Beam]> = [[startX, startY, startBeam]];
    const visited = new Map<number, Map<number, Set<number>>>();
    function setVisited(x: number, y: number, direction: number) {
        const xVisited = visited.get(x) ?? new Map<number, Set<number>>();
        const yVisited = xVisited.get(y) ?? new Set<number>();
        if (!yVisited.has(direction)) {
            yVisited.add(direction);
            xVisited.set(y, yVisited);
            visited.set(x, xVisited);
            return true;
        }
        return false;
    }

    while (beams.length) {
        const [x, y, beam] = beams.shift()!;
        if (setVisited(x, y, beam.direction)) {
            const newBeams = beam.passBlock(matrix[x][y]);
            // console.log(
            //     x,
            //     y,
            //     matrix[x][y],
            //     `${beam.dx}:${beam.dy} → ${newBeams
            //         .map((b) => `${b.dx}:${b.dy}`)
            //         .join(' ')}`
            // );
            for (const newBeam of newBeams) {
                const newX = x + newBeam.dx;
                const newY = y + newBeam.dy;
                if (
                    newX >= 0 &&
                    newX < matrix.length &&
                    newY >= 0 &&
                    newY < matrix[newX].length
                ) {
                    beams.push([newX, newY, newBeam]);
                }
            }
        }
    }

    return Array.from(visited.values()).reduce((sum, xVisited) => {
        return sum + Array.from(xVisited.keys()).length;
    }, 0);
}

function parse(input: string): string[][] {
    return input
        .trim()
        .split('\n')
        .map((s) => s.trim().split(''));
}
