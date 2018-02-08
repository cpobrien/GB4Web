import CPU from './src/cpu'
import ROMFile from './src/rom'
import Video from './src/video'


class Gameboy {
    private cpu;
    private video;
    constructor(cpu, video) {
        this.cpu = cpu;
        this.video = video;
    }

    tick() {
        var clear = setInterval(() => {
                try {
                    this.cpu.tick();
                    this.video.tick()
                } catch(e) {
                    clearInterval(clear);
                }
        }, 1000 / (60));
    }
}

fetch('zelda.gb')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        var ctx = (<HTMLCanvasElement> document.getElementById('gb')).getContext('2d');
        if (!ctx) return;
        var rom = new ROMFile(new Uint8Array(arrayBuffer));
        var cpu = new CPU(rom);
        var video = new Video(rom, ctx);
        new Gameboy(cpu, video).tick();
    });

