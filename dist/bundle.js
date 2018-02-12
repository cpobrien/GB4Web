/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var cpu_1 = __webpack_require__(1);
var rom_1 = __webpack_require__(3);
var video_1 = __webpack_require__(4);
var Gameboy = /** @class */ (function () {
    function Gameboy(cpu, video) {
        this.cpu = cpu;
        this.video = video;
    }
    Gameboy.prototype.tick = function () {
        var _this = this;
        var clear = setInterval(function () {
            try {
                _this.cpu.tick();
                _this.video.tick();
            }
            catch (e) {
                clearInterval(clear);
            }
        }, 1000 / (60));
    };
    return Gameboy;
}());
fetch('zelda.gb')
    .then(function (response) { return response.arrayBuffer(); })
    .then(function (arrayBuffer) {
    var ctx = document.getElementById('gb').getContext('2d');
    if (!ctx)
        return;
    var rom = new rom_1["default"](new Uint8Array(arrayBuffer));
    var cpu = new cpu_1["default"](rom);
    var video = new video_1["default"](rom, ctx);
    new Gameboy(cpu, video).tick();
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var opcodes_1 = __webpack_require__(2);
var CPU = /** @class */ (function () {
    function CPU(rom) {
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
            C: 0
        };
        this.H = 1;
        this.L = 0x4d;
        this.callNum = 0;
    }
    CPU.prototype.tick = function () {
        var curPC = this.pc;
        var address = this.rom.read(curPC);
        var op = opcodes_1.opcodeMap[address];
        if (this.cb) {
            op = opcodes_1.cbOpcodeMap[address];
            this.cb = false;
        }
        op(this);
    };
    CPU.prototype.shouldJump = function (opcode) {
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
    };
    CPU.prototype.popByte = function () {
        var byte = this.rom.read(++this.sp);
        return byte;
    };
    CPU.prototype.pop = function () {
        var lo = this.popByte();
        var hi = this.popByte();
        return hi << 8 | lo;
    };
    CPU.prototype.pushByte = function (val) { this.rom.write(this.sp--, val); };
    CPU.prototype.push = function (val) {
        var lo = val & 0xFF;
        var hi = val >> 8;
        this.pushByte(hi);
        this.pushByte(lo);
    };
    CPU.prototype.write = function (address, val) { this.rom.write(address, val); };
    CPU.prototype.write16 = function (address, val) { this.rom.write16(address, val); };
    CPU.prototype.read = function (address) { return this.rom.read(address); };
    CPU.prototype.read16 = function (address) { return this.rom.read16(address); };
    CPU.prototype.combineAF = function () { return this.A << 8 | this.flagsToByte(); };
    CPU.prototype.combineHL = function () { return this.H << 8 | this.L; };
    CPU.prototype.combineBC = function () { return this.B << 8 | this.C; };
    CPU.prototype.combineDE = function () { return this.D << 8 | this.E; };
    CPU.prototype.setAF = function (word) { this.A = word >> 8; this.F = this.setF(word & 0xFF); };
    CPU.prototype.setHL = function (word) {
        this.H = word >> 8;
        this.L = word & 0xFF;
    };
    CPU.prototype.setBC = function (word) { this.B = word >> 8; this.C = word & 0xFF; };
    CPU.prototype.setDE = function (word) { this.D = word >> 8; this.E = word & 0xFF; };
    CPU.prototype.setSP = function (word) { this.sp = word; };
    CPU.prototype.flagsToByte = function () {
        var res = 0;
        res |= this.F.Z << 7;
        res |= this.F.N << 6;
        res |= this.F.H << 5;
        res |= this.F.C << 4;
        return res;
    };
    CPU.prototype.setF = function (byte) {
        return {
            Z: (byte & 0x80) !== 0,
            N: (byte & 0x20) !== 0,
            H: (byte & 0x20) !== 0,
            C: (byte & 0x10) !== 0
        };
    };
    return CPU;
}());
exports["default"] = CPU;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
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
exports.opcodeMap = opcodeMap;
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
exports.cbOpcodeMap = cbOpcodeMap;
function halt() {
    throw "Halted!";
}
function adc(cpu) {
}
function cpl(cpu) {
    cpu.A = ~cpu.A;
    cpu.F.N = true;
    cpu.F.H = true;
    cpu.pc++;
}
function di(cpu) { cpu.int = false; cpu.pc++; }
function ei(cpu) { cpu.int = true; cpu.pc++; }
function rst(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var rstValues = [0x00, 0x08, 0x10, 0x18, 0x20, 0x28, 0x30, 0x38];
    var row = (opcode >> 4) - 0xC;
    var column = opcode & 0xF;
    cpu.pushByte(rstValues[(2 * row) + (column === 0xF ? 0 : 1)]);
}
function rr(cpu) {
    var opcode = cpu.read(cpu.pc++);
    writeReg(cpu, opcode, function (reg) {
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
        case 0:
            cpu.push(cpu.combineBC());
            return;
        case 1:
            cpu.push(cpu.combineDE());
            return;
        case 2:
            cpu.push(cpu.combineHL());
            return;
        case 3:
            cpu.push(cpu.combineAF());
            return;
    }
}
function pop(cpu) {
    var opcode = cpu.read(cpu.pc++);
    switch ((opcode >> 4) - 0xC) {
        case 0:
            cpu.setBC(cpu.pop());
            return;
        case 1:
            cpu.setDE(cpu.pop());
            return;
        case 2:
            cpu.setHL(cpu.pop());
            return;
        case 3:
            cpu.setAF(cpu.pop());
            return;
    }
}
function sbc(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var originalValue = cpu.A;
    var val = readReg(cpu, opcode);
    if (opcode === 0xDE)
        val = cpu.read(cpu.pc++);
    var res = originalValue - val - cpu.F.C;
    cpu.F.Z = res === 0;
    cpu.F.N = true;
    cpu.F.H = ((originalValue & 0xF) - (val & 0xF) - cpu.F.C) < 0;
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
    if (opcode === 0xD6)
        val = cpu.read(cpu.pc++);
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
    if (opcode === 0xE8)
        originalValue = cpu.sp;
    var val = readReg(cpu, opcode);
    if (opcode === 0xC6 || opcode === 0xE8)
        val = cpu.read(cpu.pc++);
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
    if (opcode === 0xD9)
        cpu.int = true;
    if (cpu.shouldJump(opcode)) {
        var address = cpu.pop();
        cpu.pc = address;
    }
}
function sla(cpu) {
    var opcode = cpu.read(cpu.pc++);
    writeReg(cpu, opcode, function (reg) {
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
    writeReg(cpu, opcode, function (reg) {
        var bit = selectBit(opcode);
        return reg & ~(1 << bit);
    });
}
function set(cpu) {
    var opcode = cpu.read(cpu.pc);
    writeReg(cpu, opcode, function (reg) {
        var bit = selectBit(opcode);
        return reg | (1 << bit);
    });
    cpu.pc++;
}
function selectBit(opcode) { return Math.floor((opcode % 64) / 8); }
function writeReg(cpu, opcode, fun) {
    writeRegInternal(cpu, opcode, fun, function (op) { return op % 8; });
}
function decideInc(op) { return decideInternal(op, 0xC); }
function decideDec(op) { return decideInternal(op, 0xD); }
function decideInternal(op, lowNibble) {
    var res = (op >> 8) * 2;
    if (op & (0xF === lowNibble ? 1 : 0))
        res++;
    return res;
}
function writeRegInternal(cpu, opcode, fun, computeOp) {
    switch (computeOp(opcode)) {
        case 0:
            cpu.B = fun(cpu.B);
            break;
        case 1:
            cpu.C = fun(cpu.C);
            break;
        case 2:
            cpu.D = fun(cpu.D);
            break;
        case 3:
            cpu.E = fun(cpu.E);
            break;
        case 4:
            cpu.H = fun(cpu.H);
            break;
        case 5:
            cpu.L = fun(cpu.L);
            break;
        case 6:
            var address = cpu.combineHL();
            cpu.write(address, cpu.read(address));
            break;
        case 7:
            cpu.A = fun(cpu.A);
            break;
    }
}
function readRegInc(cpu, opcode) {
    return readRegInternal(cpu, opcode, decideInc);
}
function readRegDec(cpu, opcode) {
    return readRegInternal(cpu, opcode, decideDec);
}
function readReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, function (opcode) { return opcode % 8; });
}
function readWriteReg(cpu, opcode) {
    return readRegInternal(cpu, opcode, function (opcode) { return (opcode - 0x40) >> 3; });
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
    var highNibble = opcode >> 4;
    if (opcode === 0x8) {
        var address = cpu.read16(cpu.pc);
        cpu.write16(address, cpu.sp);
        cpu.pc += 2;
    }
    else if (opRem === 1 && highNibble < 4) {
        var word = cpu.read16(cpu.pc);
        switch (highNibble) {
            case 0:
                cpu.setBC(word);
                break;
            case 1:
                cpu.setDE(word);
                break;
            case 2:
                cpu.setHL(word);
                break;
            case 3:
                cpu.setSP(word);
                break;
        }
        cpu.pc += 2;
    }
    else if (opRem === 6 && highNibble < 4) {
        var pos = highNibble + (((opcode & 0xF) === 0xE) ? 4 : 0);
        var byte = cpu.read(cpu.pc++);
        writeReg(cpu, opcode * 8, function (opcode) { return byte; });
    }
    else if (opRem === 2 && highNibble < 4) {
        var hlDec = function () {
            var tmp = cpu.combineHL();
            cpu.setHL(tmp - 1);
            return tmp;
        };
        var hlInc = function () {
            var tmp = cpu.combineHL();
            cpu.setHL(tmp + 1);
            return tmp;
        };
        var value = [
            cpu.combineBC,
            cpu.combineDE,
            hlInc,
            hlDec
        ][highNibble]();
        if ((opcode & 0xF) === 0x2) {
            cpu.A = value;
        }
        else {
            cpu.write(value, cpu.A);
        }
    }
    else if (highNibble > 0xD && opRem === 2) {
        var val = (opcode & 0xF) === 0x2 ? 0xFF00 + cpu.C : cpu.read16(cpu.pc);
        if (highNibble === 0xE) {
            cpu.A = cpu.read(val);
        }
        else {
            cpu.write(val, cpu.A);
        }
        cpu.pc += (opcode & 0xF) === 0x2 ? 1 : 2; // but y tho
    }
    else if (opcode === 0xF8) {
        var byte = cpu.read(cpu.pc++);
        cpu.write16(cpu.combineHL(), cpu.sp + byte);
    }
    else if (opcode === 0xF9) {
        cpu.write16(cpu.combineHL(), cpu.sp);
    }
    else {
        writeReg(cpu, opcode, function (reg) { return readWriteReg(cpu, opcode); });
    }
}
function ldh(cpu) {
    var opcode = cpu.read(cpu.pc);
    var position = 0xFF00 + cpu.read(cpu.pc + 1);
    if (opcode === 0xE0) {
        cpu.A = cpu.read(position);
    }
    else {
        cpu.write(position, cpu.A);
    }
    cpu.pc += 2;
}
function inc(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if ((opcode & 0xF) === 0xB) {
        computeCombinedRegisters(cpu, opcode, function (op) { return op + 1; });
        return;
    }
    writeRegInternal(cpu, opcode, function (val) { return val + 1; }, decideInc);
    var res = readRegInc(cpu, opcode);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.F.H = (res & 0xF) === 0x0;
}
function dec(cpu) {
    var opcode = cpu.read(cpu.pc++);
    if ((opcode & 0xF) === 0xB) {
        computeCombinedRegisters(cpu, opcode, function (op) { return op - 1; });
        return;
    }
    writeRegInternal(cpu, opcode, function (val) { return val - 1; }, decideDec);
    var res = readRegDec(cpu, opcode);
    cpu.F.Z = res === 0;
    cpu.F.N = 0;
    cpu.F.H = (res & 0xF) === 0xF;
}
function computeCombinedRegisters(cpu, opcode, fun) {
    switch (opcode >> 4) {
        case 0:
            cpu.setBC(fun(cpu.combineBC()));
            return;
        case 1:
            cpu.setDE(fun(cpu.combineDE()));
            return;
        case 2:
            cpu.setHL(fun(cpu.combineHL()));
            return;
        case 3:
            cpu.sp = fun(cpu.sp);
            return;
    }
}
function cb(cpu) { cpu.cb = true; cpu.pc++; }
function nop(cpu) { return cpu.pc++; }
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
    bitwise(cpu, function (a, reg) { return a & reg; }, 0xE6);
    cpu.F.H = true;
}
function or(cpu) {
    bitwise(cpu, function (a, reg) { return a | reg; }, 0xF6);
}
function xor(cpu) {
    bitwise(cpu, function (a, reg) { return a ^ reg; }, 0xEE);
}
function bitwise(cpu, fun, other) {
    var opcode = cpu.read(cpu.pc++);
    var reg = readReg(cpu, opcode);
    if (opcode === other)
        reg = cpu.read(cpu.pc++);
    cpu.A = fun(cpu.A, reg);
    cpu.F.Z = cpu.A === 0;
    cpu.F.N = false;
    cpu.F.H = false;
    cpu.F.C = false;
}
function jp(cpu) {
    var opcode = cpu.read(cpu.pc++);
    var newAddress = cpu.read16(cpu.pc);
    if (opcode === 0xE9)
        newAddress = cpu.combineHL();
    if (cpu.shouldJump(opcode)) {
        cpu.pc = newAddress;
    }
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var ROMFile = /** @class */ (function () {
    function ROMFile(buffer) {
        this.rom = buffer;
    }
    ROMFile.prototype.write = function (address, val) { this.rom[address] = val; };
    ROMFile.prototype.write16 = function (address, val) {
        var lo = val >> 8;
        var hi = val & 0xFF;
        this.write(address, lo);
        this.write(address + 1, hi);
    };
    ROMFile.prototype.read = function (address) { return this.rom[address]; };
    ROMFile.prototype.read16 = function (address) {
        var lo = this.rom[address];
        var hi = this.rom[address + 1];
        return hi << 8 | lo;
    };
    return ROMFile;
}());
exports["default"] = ROMFile;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var gameboyColorPalette = [
    '#0f380f',
    '#306230',
    '#8bac0f',
    '#9bbc0f'
];
var WIDTH = 160;
var HEIGHT = 144;
var Video = /** @class */ (function () {
    function Video(rom, context) {
        this.rom = rom;
        this.context = context;
        this.currentLine = 0;
    }
    Video.prototype.renderLine = function (lineNumber) {
        for (var i = 0; i < WIDTH; i++) {
            var random = Math.floor(Math.random() * gameboyColorPalette.length);
            this.renderPixel(i, lineNumber, gameboyColorPalette[random]);
        }
    };
    Video.prototype.tick = function () {
        this.renderLine((this.currentLine++) % (HEIGHT + 1));
    };
    Video.prototype.renderPixel = function (x, y, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x * 4, y * 4, 4, 4);
    };
    return Video;
}());
function bytesToSprite(binaryData) {
    var flags = binaryData >> 24;
    return {
        y: binaryData & 0xF,
        x: (binaryData >> 8) & 0xF,
        tile: binaryData >> 16 & 0xf,
        priority: flags & 0x80,
        yFlip: flags & 0x40,
        xFlip: flags & 0x20,
        palette: flags & 0x10
    };
}
exports["default"] = Video;


/***/ })
/******/ ]);