
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config);

function preload() {
    this.load.image ('pata', '../assets/pata.png')
}

function create() {
    this.add.image (10,10, 'pata')
}

function update() {

}