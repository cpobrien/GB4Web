var opcodeMap = [
    nop, ld, ld, inc, inc, dec, ld, halt,
    halt, add, ld, dec, inc, dec, ld, halt,
    halt, ld, ld, inc, inc, dec, ld, halt,
    jr, add, ld, dec, inc, dec, ld, halt,
    jr, ld, ld, inc, inc, dec, ld, halt,
    jr, add, ld, dec, inc, dec, ld, halt,
    jr, ld, ld, inc, inc, dec, ld, halt,
    jr, add, ld, dec, inc, dec, ld, halt,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    ld, ld, ld, ld, ld, ld, halt, ld,
    ld, ld, ld, ld, ld, ld, ld, ld,
    add, add, add, add, add, add, add, add,
    halt, halt, halt, halt, halt, halt, halt, halt,
    sub, sub, sub, sub, sub, sub, sub, sub,
    sbc, sbc, sbc, sbc, sbc, sbc, sbc, sbc,
    and, and, and, and, and, and, and, and,
    xor, xor, xor, xor, xor, xor, xor, xor,
    or, or, or, or, or, or, or, or,
    cp, cp, cp, cp, cp, cp, cp, cp,
    ret, halt, jp, jp, halt, halt, add, halt,
    ret, ret, jp, cb, halt, call, halt, halt,
    ret, halt, jp, halt, halt, halt, sub, halt,
    ret, ret, jp, halt, halt, halt, sbc, halt,
    ldh, halt, ld, halt, halt, halt, and, add,
    halt, jp, ld, halt, halt, halt, xor, halt,
    ldh, halt, ld, halt, halt, halt, halt, halt,
    ld, ld, ld, halt, halt, halt, cp, halt
];

var cbOpcodeMap = [
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
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

function push() {
    
}

function pop() {
    
}

function sbc(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var originalValue = cpu.A;
    var val = readReg(cpu, opcode);
    if (opcode === 0xDE) val = cpu.read(cpu.pc++);
    var res = originalValue - val - cpu.F.C;
    cpu.F.Z = res === 0;
    cpu.F.N = true;
    cpu.F.H = ((originalValue & 0xF) - (val & 0xF) - cpu.F.C ) < 0;
    cpu.F.C = res < 0;
    if (res < 0) {
        res += 256;
    }
    cpu.A = res;
}

function sub(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var originalValue = cpu.A;
    var val = readReg(cpu, opcode);
    if (opcode === 0xD6) val = cpu.read(cpu.pc++);
    var res = originalValue - val;
    cpu.F.Z = res === 0;
    cpu.F.N = true;
    cpu.F.C = res < 0;
    cpu.F.H = (originalValue & 0xF) - (val & 0xF) < 0;
    if (res < 0) {
        res += 256;
    }
    cpu.A = res;
}

// TODO: account for overflow
function add(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var highNibble = opcode >> 4;
    var originalValue = cpu.A;
    if (opcode === 0xE8) originalValue = cpu.sp;
    var val = readReg(cpu, opcode);
    if (opcode === 0xC6 || opcode === 0xE8) val = cpu.read(cpu.pc++);
    if (opcode === 0xE8) {
        cpu.sp = originalValue + val;
        var carry = originalValue ^ val ^ (cpu.sp ^ 0xFFFF);
        cpu.F.Z = false;
        cpu.F.N = false;
        cpu.F.H = carry & 0x10 === 0x10;
        cpu.F.C = carry & 0x100 === 0x100;
        return;
    }
    if (highNibble < 4) {
        originalValue = cpu.combineHL();
        val = [cpu.combineBC(),
            cpu.combineDE(),
            cpu.combineHL(),
            cpu.sp][highNibble];
        var res = originalValue + val;

        cpu.F.N = false;
        cpu.F.H = (originalValue & 0xFFF) + (val & 0xFFF) > 0xFFF;
        cpu.F.C = !(res & 0x10000);
        cpu.setHL(res);
        return;
    }
    cpu.A = (originalValue + val) % 256;
    cpu.F.Z = cpu.A === 0;
    cpu.F.N = false;
    cpu.F.H = ((val & 0xF) + (originalValue & 0xF) > 0xF);
    cpu.F.C = cpu.A & 0x100 !== 0;
}

function ret(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if (opcode === 0xD9) cpu.int = true;
    if (cpu.shouldJump(opcode)) {
        cpu.pc = cpu.pop();
    }
}

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
   writeRegInternal(cpu, opcode, fun, op => op % 8)
}

function decideInc(op) { return decideInternal(op, 0xC); }
function decideDec(op) { return decideInternal(op, 0xD); }

function decideInternal(op, lowNibble) {
    var res = (op >> 8) * 2;
    if (op & 0xF === lowNibble) res++;
    return res;
}

function writeRegInternal(cpu, opcode, fun, computeOp) {
   switch (computeOp(opcode)) {
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

function readRegDec(cpu, opcode) {
    readRegInternal(cpu, opcode, decideDec);
}
function readReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, opcode => opcode % 8);
}

function readWriteReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, opcode => (opcode - 0x40) >> 3);
}

function readRegInternal(cpu, opcode, fun) {
    switch (fun(opcode)) {
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
        var word = cpu.read16(cpu.pc);
        switch (highNibble) {
            case 0: cpu.setBC(word); break;
            case 1: cpu.setDE(word); break;
            case 2: cpu.setHL(word); break;
            case 3: cpu.setSP(word); break;
        }
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
        writeReg(cpu, opcode, reg => readWriteReg(cpu, opcode));
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

function inc(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if (opcode & 0xF === 0xB) {
        computeCombinedRegisters(cpu, opcode, (op) => op + 1);
        return;
    }
    writeRegInternal(cpu, opcode, val => val + 1, decideInc);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.H.H = res & 0xF === 0x0;
}

function dec(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if (opcode & 0xF === 0xB) {
        computeCombinedRegisters(cpu, opcode, (op) => op - 1);
        return;
    }
    writeRegInternal(cpu, opcode, val => val - 1, decideDec);
    var res = readRegDec(cpu, opcode);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.H.H = res & 0xF === 0xF;
}
function computeCombinedRegisters(cpu, opcode, fun) {
    switch (opcode >> 4) {
        case 0: cpu.setBC(fun(cpu.combineBC())); return;
        case 1: cpu.setDE(fun(cpu.combineDE())); return;
        case 2: cpu.setHL(fun(cpu.combineHL())); return;
        case 3: cpu.sp = fun(cpu.sp); return;
    }
}

function cb(cpu) { cpu.cb = true; cpu.pc++; }
function nop(cpu) { return cpu.pc++ }
function halt(cpu) { return cpu.pc++ }

function jr(cpu) {
    var opcode = cpu.read(cpu.pc);
    var address = cpu.pc + cpu.read(cpu.pc + 1);
    if (!cpu.shouldJump(opcode)) {
        cpu.pc += 2;
        return;
    }
    cpu.pc = address;
}

function and(cpu) {
    bitwise(cpu, (a, reg) => a & reg, 0xE6);
    cpu.F.H = true;
}

function or(cpu) {
    bitwise(cpu, (a, reg) => a | reg, 0xF6);
}

function xor(cpu) {
    bitwise(cpu, (a, reg) => a ^ reg, 0xEE);
}

function bitwise(cpu, fun, other) {
    var opcode = cpu.read(cpu.pc++);
    var reg = readReg(cpu, opcode);
    if (opcode === other) reg = cpu.read(cpu.pc++);
    cpu.A = fun(cpu.A, reg);
    cpu.F.Z = cpu.A === 0;
    cpu.F.N = false;
    cpu.F.H = false;
    cpu.F.C = false;
}

function jp(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var newAddress = cpu.read16(cpu.pc);
    if (opcode === 0xE9) newAddress = cpu.combineHL();
    if (cpu.shouldJump(opcode)) {
        cpu.pc = newAddress;
    }
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
        this.int = true;

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
        while (true) {
            var curPC = this.pc;
            var address = this.rom.read(curPC);
            var op = opcodeMap[address];
            if (this.cb) {
                op = cbOpcodeMap[address];
                this.cb = false;
            }
            this.printState(op);
            if (op === halt) {
                break;
            }
            if (curPC === 0xa309) {
                console.log("YOU AGAIN");
            }
            op(this);
        }
    }

    shouldJump(opcode) {
        // TODO: there's gotta be some clever way to simplify this
        switch (opcode) {
            // NZ
            case 0x20:
            case 0xC0:
            case 0xC2: return !this.F.Z;
            // NC
            case 0x30:
            case 0xD0:
            case 0xD2: return !this.F.C;
            // Z
            case 0x28:
            case 0xC8:
            case 0xCA: return this.F.Z;
            // C
            case 0x38:
            case 0xD8:
            case 0xDA: return this.F.C;
        }
        return true;
    }

    printState(op) {
        var pos = this.pc;
        console.log(`PC: 0x${pos.toHex()}\t[${this.rom.read(pos).toHex()}] ${op.name}`)
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
    combineAF() { return this.A << 8 | this.F; }
    combineHL() { return this.H << 8 | this.L; }
    combineBC() { return this.B << 8 | this.C; }
    combineDE() { return this.D << 8 | this.E; }
    setAF(word) { this.A = word >> 8; this.F = word & 0xFF; }
    setHL(word) { this.H = word >> 8; this.L = word & 0xFF; }
    setBC(word) { this.B = word >> 8; this.C = word & 0xFF; }
    setDE(word) { this.D = word >> 8; this.E = word & 0xFF; }
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