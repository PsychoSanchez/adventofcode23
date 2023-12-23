import { readFileSync } from 'node:fs';

function main() {
    console.log(
        solution1(`1,0,1~1,2,1
    0,0,2~2,0,2
    0,2,3~2,2,3
    0,0,4~0,2,4
    2,0,5~2,2,5
    0,1,6~2,1,6
    1,1,8~1,1,9`)
    );
    console.log(solution1(readFileSync('input-ft.txt').toString('utf-8')));
}

export function solution1(input: string): number {
    const bricks = parse(input);
    function zsort<T extends Top>(arr: T[]): T[] {
        arr.sort((a, b) => (a.z !== b.z ? a.z - b.z : a.index - b.index));
        return arr;
    }

    const zBottoms = zsort(
        bricks.map(
            (brick, index) =>
                ({
                    index,
                    z: brick.min[2],
                    on: brick.min[2] === 1 ? [-1] : []
                } as Bottom)
        )
    );

    const zTops = zsort(
        bricks.map(
            (brick, index) =>
                ({
                    index,
                    z: brick.max[2]
                } as Top)
        )
    );

    function moveDown(index: number, dz: number) {
        const brick = bricks[index];
        const top = zTops.find((top) => top.index === index)!;
        const bottom = zBottoms.find((b) => b.index === index)!;

        if (dz > 0) {
            brick.min[2] -= dz;
            brick.max[2] -= dz;
            top.z -= dz;
            bottom.z -= dz;

            zsort(zTops);
            zsort(zBottoms);
        }

        bottom.on = findSupportingBricks(bricks, zTops, index);
    }

    let lowestStillMoving: number | null = null;
    do {
        lowestStillMoving = zBottoms.findIndex(({ on }) => on.length === 0);
        if (lowestStillMoving !== -1) {
            const dz = findPossibleSupport(
                bricks,
                zTops,
                zBottoms[lowestStillMoving].index
            );
            moveDown(zBottoms[lowestStillMoving].index, dz);
        }
    } while (lowestStillMoving !== -1);

    const irreplaceable = new Set<number>();
    for (const bottom of zBottoms) {
        if (bottom.on.length === 1) {
            irreplaceable.add(bottom.on[0]!);
        }
    }

    return bricks.reduce((count: number, b, index) => {
        return count + (irreplaceable.has(index) ? 0 : 1);
    }, 0);
}

function findPossibleSupport(
    bricks: Brick[],
    tops: Top[],
    falling: number
): number {
    const fallingBrick = bricks[falling];
    let last: number | null = null;
    for (const { z, index } of tops) {
        if (z < fallingBrick.min[2] && intersects(bricks, falling, index)) {
            last = fallingBrick.min[2] - z - 1;
        }
    }
    return last ?? fallingBrick.min[2] - 1;
}

function findSupportingBricks(
    bricks: Brick[],
    tops: Top[],
    index: number
): number[] {
    const brick = bricks[index];
    if (brick.min[2] === 1) {
        return [-1];
    } else {
        return tops.reduce((acc: number[], top) => {
            if (
                top.z === brick.min[2] - 1 &&
                intersects(bricks, index, top.index)
            ) {
                acc.push(top.index);
            }
            return acc;
        }, []);
    }
}

function intersects(bricks: Brick[], i: number, j: number) {
    const a = bricks[i];
    const b = bricks[j];
    return (
        segmentIntersect(a.min[0], a.max[0], b.min[0], b.max[0]) &&
        segmentIntersect(a.min[1], a.max[1], b.min[1], b.max[1])
    );
}

function segmentIntersect(a1: number, a2: number, b1: number, b2: number) {
    return !(a2 < b1 || b2 < a1); // b1 < a2 && a1 < b2
}

function parse(input: string): Brick[] {
    return input
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .map((l) => {
            const parts = l.split('~', 2);
            const coords1 = parts[0].split(',', 3).map((v) => Number(v)) as [
                number,
                number,
                number
            ];
            const coords2 = parts[1].split(',', 3).map((v) => Number(v)) as [
                number,
                number,
                number
            ];
            return {
                min: coords1.map((v, index) => Math.min(v, coords2[index])),
                max: coords2.map((v, index) => Math.max(v, coords2[index]))
            } as Brick;
        });
}

interface Brick {
    min: [number, number, number];
    max: [number, number, number];
}

interface Bottom extends Top {
    on: number[];
}

interface Top {
    z: number;
    index: number;
}

main();
