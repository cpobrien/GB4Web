var opcodeMap = [
    nop, ld, ld, nop, nop, nop, ld, nop,
    nop, ld, ld, nop, nop, nop, ld, nop,
    nop, ld, ld, nop, nop, nop, ld, nop,
    jr, ld, ld, nop, nop, nop, ld, nop,
    jr, nop, ld, nop, nop, nop, ld, nop,
    jr, nop, ld, nop, nop, nop, ld, nop,
    jr, nop, ld, nop, nop, nop, ld, nop,
    jr, nop, ld, nop, nop, nop, ld, nop,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    cp, cp, cp, cp, cp, cp, cp, cp,
    nop, nop, nop, jp, nop, nop, nop, nop,
    nop, nop, nop, cb, nop, call, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    nop, nop, nop, nop, nop, nop, nop, nop,
    ldh, nop, ld, nop, nop, nop, nop, nop,
    nop, nop, ld, nop, nop, nop, nop, nop,
    ldh, nop, ld, nop, nop, nop, nop, nop,
    ld, ld, ld, nop, nop, nop, cp, nop
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
    writeReg(cpu, opcode, reg => {
        var bit = selectBit(opcode);
        return reg & ~(1 << bit);
    });
    cpu.pc++;
}

function set(cpu) {
    var opcode = cpu.read(cpu.pc);
    writeReg(cpu, opcode, reg => {
        var bit = selectBit(opcode);
        return reg | (1 << bit);
    });
    cpu.pc++;
}

function selectBit(opcode) { return Math.floor((opcode % 64) / 8) }
function writeReg(cpu, opcode, fun) {
   switch (opcode % 8) {
       case 0: cpu.B = fun(cpu.B); break;
       case 1: cpu.C = fun(cpu.C); break;
       case 2: cpu.D = fun(cpu.D); break;
       case 3: cpu.E = fun(cpu.E); break;
       case 4: cpu.H = fun(cpu.H); break;
       case 5: cpu.L = fun(cpu.L); break;
       case 6:
           var address = cpu.combineHL();
           cpu.write(address, cpu.read(address));
           break;
       case 7: cpu.A = fun(cpu.A); break;
   }
}

function readReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, opcode => opcode % 8);
}

function readWriteReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, opcode => opcode >> 3);
}

function readRegInternal(cpu, opcode) {
    switch (opcode % 8) {
        case 0: return cpu.B;
        case 1: return cpu.C;
        case 2: return cpu.D;
        case 3: return cpu.E;
        case 4: return cpu.H;
        case 5: return cpu.L;
        case 6: return cpu.read(cpu.combineHL());
        case 7: return cpu.A;
    }
}

function cp(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var val = readReg(cpu, opcode);
    if (opcode == 0xFE) {
        val = cpu.read(cpu.pc++);
    }
    var diff = cpu.A - val;
    cpu.F.Z = diff === 0;
    cpu.F.N = ((diff & 0xF) > (cpu.A & 0xF));
    cpu.F.H = true;
    cpu.F.C = diff < 0;
}

// TODO: REFACTOR REFACTOR REFACTOR
function ld(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var opRem = opcode % 8;
    var highNibble= opcode >> 4;
    if (opcode === 0x8) {
        var address = cpu.read16(cpu.pc);
        cpu.write16(address, cpu.sp);
        cpu.pc += 2;
    } else if (opRem === 1 && highNibble < 4) {
        var addressChoice = [cpu.setBC, cpu.setDE, cpu.setHL, cpu.setSP];
        var word = cpu.read16(cpu.pc);
        addressChoice[highNibble](word);
        cpu.pc += 2;
    } else if (opRem === 6 && highNibble < 4) {
        var pos = highNibble + (opcode & 0xF === 0xE) ? 4 : 0;
        var byte = cpu.read(cpu.pc++);
        writeReg(cpu, opcode * 8, (opcode) => byte);
    } else if (opRem === 2 && highNibble < 4) {
        var hlDec = () => {
            var tmp = cpu.combineHL();
            cpu.setHL(tmp - 1);
            return tmp;
        };
        var hlInc = () => {
            var tmp = cpu.combineHL();
            cpu.setHL(tmp + 1);
            return tmp;
        };
        var value = [
            cpu.combineBC,
            cpu.combineDE,
            hlInc,
            hlDec][highNibble]();
        if (opcode & 0xF === 0x2) {
            cpu.A = value;
        } else {
            cpu.write(value, cpu.A);
        }
    } else if (highNibble > 0xD && opRem === 2) {
        var val = opcode & 0xF === 0x2 ? 0xFF00 + cpu.C : cpu.read16(cpu.pc);
        if (highNibble === 0xE) {
            cpu.A = cpu.read(val);
        } else {
            cpu.write(val, cpu.A);
        }
        cpu.pc += opcode & 0xF === 0x2 ? 1 : 2; // but y tho
    } else if (opcode === 0xF8) {
        var byte = cpu.read(cpu.pc++);
        cpu.write16(cpu.combineHL(), cpu.sp + byte);
    } else if (opcode === 0xF9) {
        cpu.write16(cpu.combineHL(), cpu.sp);
    } else {
        writeReg(cpu, opcode, reg => readWriteReg(opcode));
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

function jr(cpu) {
    var opcode = cpu.read(cpu.pc);
    var address = cpu.pc + cpu.read(cpu.pc + 1);
    if (!cpu.shouldJump(opcode)) {
        cpu.pc += 2;
        return;
    }
    cpu.pc = address;
}

function jp(cpu) { cpu.pc = cpu.read16(cpu.pc + 1); }

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

    shouldJump(opcode) {
        switch (opcode) {
            // NZ
            case 0x20:
            case 0xC2: return !this.F.Z;
            // NC
            case 0x30:
            case 0xD2: return !this.F.C;
            // Z
            case 0x28:
            case 0xCA: return this.F.Z;
            // C
            case 0x38:
            case 0xDA: return this.F.C;
        }
        return true;
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

    write(address, val) { this.rom.write(address, val); }
    write16(address, val) { this.rom.write16(address, val); }
    read(address) { return this.rom.read(address); }
    read16(address) { return this.rom.read16(address); }
    combineHL() { return this.H << 8 | this.L; }
    combineBC() { return this.B << 8 | this.C; }
    combineDL() { return this.D << 8 | this.L; }
    combineDE() { return this.D << 8 | this.E; }
    setHL(word) { this.H = word >> 8; this.L = this.word & 0xFF; }
    setBC(word) { this.B = word >> 8; this.C = this.word & 0xFF; }
    setDL(word) { this.D = word >> 8; this.L = this.word & 0xFF; }
    setDE(word) { this.D = word >> 8; this.E = this.word & 0xFF; }
    setSP(word) { this.sp  = word; }
}

class ROMFile {
    constructor(buffer) {
        this.rom = buffer;
    }

    write(address, val) { this.rom[address] = val; }
    write16(address, val) {
        var lo = val >> 8;
        var hi = val & 0xFF;
        this.write(address, lo);
        this.write(address + 1, hi);
    }
    read(address) { return this.rom[address]; }
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