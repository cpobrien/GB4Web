class ROMFile {
    constructor(buffer) {
        this.rom = buffer;
    }
}

fetch('zelda.gb')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        var romFile = new ROMFile(new Uint8Array(arrayBuffer));
    });