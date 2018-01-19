const gameboyColorPalette = [
    '#0f380f',
    '#306230',
    '#8bac0f',
    '#9bbc0f'
];
const WIDTH = 160;
const HEIGHT = 144;
class Video {
    constructor(rom, context) {
        this.rom = rom;
        this.context = context;
    }
    renderLine(lineNumber) {
        for (var i = 0; i < HEIGHT; i++) {
            var random = Math.floor(Math.random() * gameboyColorPalette.length);
            this.renderPixel(lineNumber, i, gameboyColorPalette[random]);
        }
    }

    tick() {
        for (var i = 0; i < WIDTH; i++) {
            this.renderLine(i);
        }
    }
    renderPixel(x, y, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x * 4, y * 4, 4, 4);
    }
}

function bytesToSprite(binaryData) {
    const flags = binaryData >> 24;
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

export default Video;
