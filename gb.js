function jp() {

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
}

class ROMFile {
    constructor(buffer) {
        this.rom = buffer;
    }
}

fetch('zelda.gb')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        var rom = new ROMFile(new Uint8Array(arrayBuffer));
        var cpu = new CPU(rom);
    });