class ROMFile {
    private rom;

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

export default ROMFile;
