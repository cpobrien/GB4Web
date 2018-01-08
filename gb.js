var opcodeMap = [
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, jp, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, call, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
];

function nop(cpu) { return cpu.pc++ }

function jp(cpu) {
    cpu.pc = cpu.rom.read16(cpu.pc + 1);
}

function call(cpu) {
    cpu.push(cpu.pc);
    cpu.pc = cpu.rom.read16(cpu.pc + 1);
}

class CPU {
    constructor(rom) {
        this.rom = rom;

        this.pc = 0x100;
        this.sp = 0xFFFE;

        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.D = 0;
        this.E = 0;
        this.F = {
            Z: 0,
            N: 0,
            H: 0,
            C: 0,
        };
        this.H = 0;
        this.L = 0;
    }

    run() {
        var nopCount = 0;
        while (nopCount <= 1) {
            this.printState();
            var address = this.rom.read(this.pc);
            var op = opcodeMap[address];
            if (op == nop) nopCount++; // ew
            op(this);
        }
    }

    printState() {
        console.log(`PC: 0x${this.pc.toHex()}`)
    }

    pop() {
        var lo = this.rom.read(this.sp++);
        var hi = this.rom.read(this.sp++);
        return hi << 8 | lo;
    }
    push(val) {
        var lo = val & 0xFF;
        var hi = val >> 8;
        this.rom.write(this.sp--, hi);
        this.rom.write(this.sp--, lo);
    }
}

class ROMFile {
    constructor(buffer) {
        this.rom = buffer;
    }

    write(address, val) {
        this.rom[address] = val;
    }

    read(address) {
        return this.rom[address];
    }

    read16(address) {
        var lo = this.rom[address];
        var hi = this.rom[address + 1];
        return hi << 8 | lo;
    }
}

fetch('zelda.gb')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        var rom = new ROMFile(new Uint8Array(arrayBuffer));
        new CPU(rom).run();
    });

Number.prototype.toHex = function() {
    return this.toString(16);
};