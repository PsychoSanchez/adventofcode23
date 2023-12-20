import { readFileSync } from 'node:fs';
import * as lcm from 'compute-lcm';

function main() {
    // console.log(
    //     solution1(
    //         `broadcaster -> a, b, c
    //     %a -> b
    //     %b -> c
    //     %c -> inv
    //     &inv -> a`
    //     )
    // );

    // console.log(
    //     solution1(
    //         `broadcaster -> a
    //     %a -> inv, con
    //     &inv -> b
    //     %b -> con
    //     &con -> output`
    //     )
    // );

    // console.log(
    //     solution1(readFileSync('input-ft.txt').toString('utf-8'), 'ft')
    // );

    const [a, b, c, d] = [
        solution1(readFileSync('input.txt').toString('utf-8'), 'pt', 'ft'),
        solution1(readFileSync('input.txt').toString('utf-8'), 'tp', 'jz'),
        solution1(readFileSync('input.txt').toString('utf-8'), 'gv', 'ng'),
        solution1(readFileSync('input.txt').toString('utf-8'), 'bv', 'sv')
    ];
    console.log(a, b, c, d);
    console.log(lcm(a, b, c, d));
}

export function solution1(
    input: string,
    firstName: string | undefined = undefined,
    lastName = 'rx'
): number {
    const [dispatcher, map] = parse(input);

    const b = map.get('broadcaster')!;

    // Part I
    // const LIMIT = 1000;

    // for (let i = 0; i < LIMIT; i++) {
    //     dispatcher.runFullCycle({
    //         sender: b,
    //         receiver: b,
    //         high: false
    //     });
    // }

    // return dispatcher.lowCount * dispatcher.highCount;

    // Part II
    // const rxDeps = map.get('xm')!.inbound;
    // console.log(rxDeps.map((d) => d.name).join(', '));
    // ft, jz, sv, ng
    const last = map.get(lastName)!;
    let i = 0;

    while (last.lowPulseCount === 0 && i < 1e10) {
        dispatcher.runFullCycle(
            {
                sender: b,
                receiver: b,
                high: false
            },
            firstName ? [firstName] : undefined
        );
        i++;
    }

    return i;
}

function parse(input: string): [Dispatcher, Map<string, Node>] {
    const dispatcher = new Dispatcher();
    const result = new Map<string, Node>();
    const lines = input
        .trim()
        .split('\n')
        .map((s) => s.trim().split(' -> '));

    for (const [prefix] of lines) {
        const [_, type, name] = prefix.match(/^(\%|\&)?(\w+)$/)!;
        switch (type) {
            case '%':
                result.set(name, new FlipNode(name, dispatcher));
                break;
            case '&':
                result.set(name, new ConNode(name, dispatcher));
                break;
            default:
                result.set(name, new BroadcastNode(name, dispatcher));
                break;
        }
    }

    for (const [prefix, postfix] of lines) {
        const [_, _type, name] = prefix.match(/^(\%|\&)?(\w+)$/)!;
        const outbound = postfix.split(', ');
        const node = result.get(name)!;
        for (const connName of outbound) {
            let conn = result.get(connName);
            if (!conn) {
                conn = new Node(NodeType.REGULAR, connName, dispatcher);
                result.set(connName, conn);
            }
            node.linkTo(conn);
        }
    }

    return [dispatcher, result];
}

enum NodeType {
    FLIP = '%',
    CON = '&',
    BROADCAST = 'broadcast',
    REGULAR = '.'
}

class Dispatcher {
    public highCount = 0;
    public lowCount = 0;
    public pendingPulses: Pulse[] = [];
    private counter = 0;

    public register(pulses: Pulse[]) {
        this.pendingPulses.push(...pulses);
    }

    public process(filter?: string[]) {
        const toSend = this.pendingPulses;
        this.pendingPulses = [];
        let i = 0;
        for (const { sender, receiver, high } of toSend) {
            if (high) {
                this.highCount++;
            } else {
                this.lowCount++;
            }
            receiver.receivePulse(high, sender, filter);
            i++;
        }
    }

    public runFullCycle(pulse: Pulse, filter?: string[]) {
        this.pendingPulses.push(pulse);
        this.counter = 0;
        while (this.pendingPulses.length !== 0) {
            this.process(filter);
            this.counter++;
        }
    }
}

class Node {
    public outbound: Node[] = [];
    public inbound: Node[] = [];
    public lastPulse: boolean | undefined = undefined;
    public highPulseCount = 0;
    public lowPulseCount = 0;
    constructor(
        public readonly type: NodeType,
        public readonly name: string,
        protected readonly dispatcher: Dispatcher
    ) {}
    public linkTo(node: Node) {
        this.outbound.push(node);
        node.registerIncomingLink(this);
    }
    public registerIncomingLink(node: Node) {
        this.inbound.push(node);
    }
    public receivePulse(high: boolean, sender: Node, filter?: string[]) {
        this.lastPulse = high;
        if (high) {
            this.highPulseCount++;
        } else {
            this.lowPulseCount++;
        }
    }
}

class FlipNode extends Node {
    private on = false;
    constructor(name: string, counter: Dispatcher) {
        super(NodeType.FLIP, name, counter);
    }
    public receivePulse(high: boolean, sender: Node) {
        super.receivePulse(high, sender);
        if (!high) {
            this.on = !this.on;
            this.dispatcher.register(
                this.outbound.map((conn) => ({
                    sender: this,
                    receiver: conn,
                    high: this.on
                }))
            );
        }
    }
}

class ConNode extends Node {
    private highInbounds = new Set<Node>();
    private lowInbounds = new Set<Node>();
    constructor(name: string, counter: Dispatcher) {
        super(NodeType.CON, name, counter);
    }
    public registerIncomingLink(node: Node) {
        super.registerIncomingLink(node);
        this.lowInbounds.add(node);
    }
    public receivePulse(high: boolean, sender: Node) {
        super.receivePulse(high, sender);
        if (high) {
            this.lowInbounds.delete(sender);
            this.highInbounds.add(sender);
        } else {
            this.lowInbounds.add(sender);
            this.highInbounds.delete(sender);
        }
        const nextPulse = this.lowInbounds.size === 0 ? false : true;
        this.dispatcher.register(
            this.outbound.map((conn) => ({
                sender: this,
                receiver: conn,
                high: nextPulse
            }))
        );
    }
}

class BroadcastNode extends Node {
    constructor(name: string, dispatcher: Dispatcher) {
        super(NodeType.BROADCAST, name, dispatcher);
    }
    public receivePulse(high: boolean, sender: Node, filter?: string[]) {
        super.receivePulse(high, sender);
        const toSend =
            filter === undefined
                ? this.outbound
                : this.outbound.filter((node) =>
                      filter.some((v) => node.name === v)
                  );
        this.dispatcher.register(
            toSend.map((conn) => ({
                sender: this,
                receiver: conn,
                high
            }))
        );
    }
}

interface Pulse {
    sender: Node;
    receiver: Node;
    high: boolean;
}

main();
