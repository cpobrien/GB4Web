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
    nop, nop, nop, cb, nop, call, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    ldh, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    ldh, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop
];

var cbOpcodeMap = [
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
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    res, res, res, res, res, res, res, res,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set,
    set, set, set, set, set, set, set, set
];

function res(cpu) {
    var opcode = cpu.read(cpu.pc);
    runCbCommand(cpu, opcode, reg => {
        var bit = selectBit(opcode);
        return reg & ~(1 << bit);
    });
    cpu.pc++;
}

function set(cpu) {
    var opcode = cpu.read(cpu.pc);
    runCbCommand(cpu, opcode, reg => {
        var bit = selectBit(opcode);
        return reg | (1 << bit);
    });
    cpu.pc++;
}

function selectBit(opcode) { return Math.floor((opcode % 64) / 8) }
function runCbCommand(cpu, opcode, fun) {
   switch (opcode % 8) {
       case 0: cpu.B = fun(cpu.B); break;
       case 1: cpu.C = fun(cpu.C); break;
       case 2: cpu.D = fun(cpu.D); break;
       case 3: cpu.E = fun(cpu.E); break;
       case 4: cpu.H = fun(cpu.H); break;
       case 5: cpu.L = fun(cpu.L); break;
       case 6:
           cpu.H = fun(cpu.H);
           cpu.L = fun(cpu.L);
           break;
       case 7: cpu.A = fun(cpu.A); break;
   }
}

function ldh(cpu) {
    var opcode = cpu.read(cpu.pc);
    var position = 0xFF00 + cpu.read(cpu.pc + 1);
    if (opcode === 0xE0) {
       cpu.A = cpu.read(position);
    } else {
        cpu.write(position, cpu.A);
    }
    cpu.pc += 2;
}

function cb(cpu) { cpu.cb = true; cpu.pc++; }

function nop(cpu) { return cpu.pc++ }

function jp(cpu) {
    cpu.pc = cpu.read16(cpu.pc + 1);
}

function call(cpu) {
    cpu.push(cpu.pc);
    cpu.pc = cpu.read16(cpu.pc + 1);
}

class CPU {
    constructor(rom) {
        this.rom = rom;

        this.pc = 0x100;
        this.sp = 0xFFFE;
        this.cb = false;

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
            if (this.cb) {
                op = cbOpcodeMap[address];
                this.cb = false;
            }
            if (op == nop) nopCount++; // ew
            op(this);
        }
    }

    printState() {
        var pos = this.pc;
        console.log(`PC: 0x${pos.toHex()} [${this.rom.read(pos).toHex()}]`)
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

    write(address, val) {
        this.rom.write(address, val);
    }

    read(address) {
        return this.rom.read(address);
    }

    read16(address) {
        return this.rom.read16(address);
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