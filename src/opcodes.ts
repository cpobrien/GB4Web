var opcodeMap = [
    nop, ld, ld, inc, inc, dec, ld, halt,
    ld, add, ld, dec, inc, dec, ld, halt,
    halt, ld, ld, inc, inc, dec, ld, halt,
    jr, add, ld, dec, inc, dec, ld, rr,
    jr, ld, ld, inc, inc, dec, ld, halt,
    jr, add, ld, dec, inc, dec, ld, cpl,
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
    ret, pop, jp, jp, halt, push, add, rst,
    ret, ret, jp, cb, halt, call, halt, rst,
    ret, pop, jp, halt, halt, push, sub, rst,
    ret, ret, jp, halt, halt, halt, sbc, rst,
    ldh, pop, ld, halt, halt, push, and, rst,
    halt, jp, ld, halt, halt, halt, xor, rst,
    ldh, pop, ld, di, halt, push, or, rst,
    ld, ld, ld, ei, halt, halt, cp, rst
];

var cbOpcodeMap = [
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    halt, halt, halt, halt, halt, halt, halt, halt,
    rr, rr, rr, rr, rr, rr, rr, rr,
    sla, sla, sla, sla, sla, sla, sla, sla,
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

function halt() {
    throw "Halted!"
}

function adc(cpu) {

}

function cpl(cpu) {
    cpu.A = ~cpu.A;
    cpu.F.N = true;
    cpu.F.H = true;
    cpu.pc++;
}

function di(cpu) { cpu.int = false; cpu.pc++ }
function ei(cpu) { cpu.int = true; cpu.pc++ }

function rst(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var rstValues = [0x00, 0x08, 0x10, 0x18, 0x20, 0x28, 0x30, 0x38];
    var row = (opcode >> 4) - 0xC;
    var column = opcode & 0xF;
    cpu.pushByte(rstValues[(2 * row) + (column === 0xF ? 0 : 1)]);
}

function rr(cpu) {
    var opcode = cpu.read(cpu.pc++);
    writeReg(cpu, opcode, reg => {
        var res = reg >> 1 | (reg & 1) << 7;
        cpu.F.C = (reg & 1) === 1;
        cpu.F.Z = res === 0;
        cpu.F.N = false;
        cpu.F.H = false;
        return res;
    });
}

function push(cpu) {
    var opcode = cpu.read(cpu.pc++);
    switch ((opcode >> 4) - 0xC) {
        case 0: cpu.push(cpu.combineBC()); return;
        case 1: cpu.push(cpu.combineDE()); return;
        case 2: cpu.push(cpu.combineHL()); return;
        case 3: cpu.push(cpu.combineAF()); return;
    }
}

function pop(cpu) {
    var opcode = cpu.read(cpu.pc++);
    switch ((opcode >> 4) - 0xC) {
        case 0: cpu.setBC(cpu.pop()); return;
        case 1: cpu.setDE(cpu.pop()); return;
        case 2: cpu.setHL(cpu.pop()); return;
        case 3: cpu.setAF(cpu.pop()); return;
    }
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
        cpu.F.H = (carry & 0x10) === 0x10;
        cpu.F.C = (carry & 0x100) === 0x100;
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
        cpu.setHL(res % 0xFFFF);
        return;
    }
    cpu.A = (originalValue + val) % 256;
    cpu.F.Z = cpu.A === 0;
    cpu.F.N = false;
    cpu.F.H = ((val & 0xF) + (originalValue & 0xF) > 0xF);
    cpu.F.C = (cpu.A & 0x100) !== 0;
}

function call(cpu) {
    var address = cpu.pc + 3;
    var newAddress = cpu.read16(cpu.pc + 1);
    cpu.push(address);
    cpu.pc = newAddress;
}

function ret(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if (opcode === 0xD9) cpu.int = true;
    if (cpu.shouldJump(opcode)) {
        var address = cpu.pop();
        cpu.pc = address;
    }
}

function sla(cpu) {
    var opcode = cpu.read(cpu.pc++);
    writeReg(cpu, opcode, reg => {
        var res = (reg << 1) & 0xFF;
        cpu.F.C = (reg & 1) === 1;
        cpu.F.Z = res === 0;
        cpu.F.H = false;
        cpu.F.N = false;
        return res;
    });
}

function res(cpu) {
    var opcode = cpu.read(cpu.pc++);
    writeReg(cpu, opcode, reg => {
        var bit = selectBit(opcode);
        return reg & ~(1 << bit);
    });
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
    if (op & (0xF === lowNibble ? 1 : 0)) res++;
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

function readRegInc(cpu, opcode) {
    return readRegInternal(cpu, opcode, decideInc);
}

function readRegDec(cpu, opcode) {
    return readRegInternal(cpu, opcode, decideDec);
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
        var pos = highNibble + (((opcode & 0xF) === 0xE) ? 4 : 0);
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
        if ((opcode & 0xF) === 0x2) {
            cpu.A = value;
        } else {
            cpu.write(value, cpu.A);
        }
    } else if (highNibble > 0xD && opRem === 2) {
        var val = (opcode & 0xF) === 0x2 ? 0xFF00 + cpu.C : cpu.read16(cpu.pc);
        if (highNibble === 0xE) {
            cpu.A = cpu.read(val);
        } else {
            cpu.write(val, cpu.A);
        }
        cpu.pc += (opcode & 0xF) === 0x2 ? 1 : 2; // but y tho
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
    if ((opcode & 0xF) === 0xB) {
        computeCombinedRegisters(cpu, opcode, (op) => op + 1);
        return;
    }
    writeRegInternal(cpu, opcode, val => val + 1, decideInc);
    var res = readRegInc(cpu, opcode);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.F.H = (res & 0xF) === 0x0;
}

function dec(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if ((opcode & 0xF) === 0xB) {
        computeCombinedRegisters(cpu, opcode, (op) => op - 1);
        return;
    }
    writeRegInternal(cpu, opcode, val => val - 1, decideDec);
    var res = readRegDec(cpu, opcode);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.F.H = (res & 0xF) === 0xF;
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

export {opcodeMap, cbOpcodeMap};