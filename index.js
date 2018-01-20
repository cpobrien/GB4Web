import CPU from './src/cpu.js'
import ROMFile from './src/rom.js'
import Video from './src/video.js'


class Gameboy {
    constructor(cpu, video) {
        this.cpu = cpu;
        this.video = video;
    }

    tick() {
        while(true) {
            try {
                this.cpu.tick();
                this.video.tick()
            } catch(e) {
                break;
            }
        }
        // var clear = setInterval(() => {
        // }, 1000 / (60);
    }
}

fetch('zelda.gb')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        var ctx = document.getElementById('gb').getContext('2d');
        if (!ctx) return;
        var rom = new ROMFile(new Uint8Array(arrayBuffer));
        var cpu = new CPU(rom);
        var video = new Video(rom, ctx);
        new Gameboy(cpu, video).tick();
    });

