# WebGB

The goal right now is to get Link's Awakening running on the browser, no more no less. Will I have something more
ambitious in the future? I hope so, but I _really_ don't want to get ahead of myself, so I'm just going to have (what I
think) is a not-too-ambitious goal.

## Goals
I have a couple goals for this project, arranged by how aspirational I think they are.
* Refactor the project into a proper npm-like package: Right now this is just a plain-old-js file that I have stuck in
my index.html. It works fine enough, but it's not going to look pretty when I have a more complete project.
* Refactor the project to Typescript: types r cool
* Make the emulator opcode-complete: As an execution platform, gameboys are quite simple. They have no mappers, nor
anything super tricky with booting (as far as I can tell).
* Make the emulator render a screen: I currently have no idea how to do this, but it's obviously important.
* Make the emulator produce audio output: Likewise, plus learning the WebAudio API, which I've heard isn't all that nice.
* Support Link's Awakening: That's all I'm going to aim for right now, but I'd like to aim higher later :)

## Thanks to:
* pastraiser.com for [this opcode table](http://www.pastraiser.com/cpu/gameboy/gameboy_opcodes.html)
* Jonathan Gilchrist for [this reference implementation](https://github.com/jgilchrist/emulator)
* Michael Fogleman for a [clean emulator design reference](https://github.com/fogleman/nes)
* Tim Holman for [github-corners](https://github.com/tholman/github-corners)