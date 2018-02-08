import {opcodeMap, cbOpcodeMap} from "./opcodes";

class CPU {
    private rom;
    private pc;
    private sp;
    private cb;
    private int;

    private A;
    private B;
    private C;
    private D;
    private E;
    private F;
    private H;
    private L;
    private callNum;

    constructor(rom) {
        this.rom = rom;

        this.pc = 0x100;
        this.sp = 0xFFFE;
        this.cb = false;
        this.int = true;

        this.A = 1;
        this.B = 0;
        this.C = 0x13;
        this.D = 0;
        this.E = 0xd8;
        this.F = {
            Z: 0,
            N: 0,
            H: 0,
            C: 0,
        };
        this.H = 1;
        this.L = 0x4d;

        this.callNum = 0;
    }

    tick() {
        var curPC = this.pc;
        var address = this.rom.read(curPC);
        var op = opcodeMap[address];
        if (this.cb) {
            op = cbOpcodeMap[address];
            this.cb = false;
        }
        op(this);
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

    popByte() {
        var byte = this.rom.read(++this.sp);
        return byte;
    }
    pop() {
        var lo = this.popByte();
        var hi = this.popByte();
        return hi << 8 | lo;
    }

    pushByte(val) { this.rom.write(this.sp--, val); }
    push(val) {
        var lo = val & 0xFF;
        var hi = val >> 8;
        this.pushByte(hi);
        this.pushByte(lo);
    }

    write(address, val) { this.rom.write(address, val); }
    write16(address, val) { this.rom.write16(address, val); }
    read(address) { return this.rom.read(address); }
    read16(address) { return this.rom.read16(address); }
    combineAF() { return this.A << 8 | this.flagsToByte(); }
    combineHL() { return this.H << 8 | this.L; }
    combineBC() { return this.B << 8 | this.C; }
    combineDE() { return this.D << 8 | this.E; }
    setAF(word) { this.A = word >> 8; this.F = this.setF(word & 0xFF); }
    setHL(word) {
        this.H = word >> 8;
        this.L = word & 0xFF;
    }
    setBC(word) { this.B = word >> 8; this.C = word & 0xFF; }
    setDE(word) { this.D = word >> 8; this.E = word & 0xFF; }
    setSP(word) { this.sp  = word; }
    flagsToByte() {
        var res = 0;
        res |= this.F.Z << 7;
        res |= this.F.N << 6;
        res |= this.F.H << 5;
        res |= this.F.C << 4;
        return res;
    }
    setF(byte) {
        return {
            Z : (byte & 0x80) !== 0,
            N : (byte & 0x20) !== 0,
            H : (byte & 0x20) !== 0,
            C : (byte & 0x10) !== 0
        };
    }
}

export default CPU;
