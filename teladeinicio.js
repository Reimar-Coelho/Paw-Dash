var config = {
    type: Phaser.Auto,
    width: 800,
    height: 600,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);


function preload() {
    this.load.image ('b1', 'Paw-Dash/Botão/b4.png');
    this.load.image ('b2', 'Paw-Dash/Botão/b3.png');
    this.load.image ('b3', 'Paw-Dash/Botão/b2.png');
    this.load.image ('b4', 'Paw-Dash/Botão/b1.png');
}

function create() {
    this.add.image(400, 300, 'b1');
    this.add.image (400, 525, 'b2').setScale(0.5);
    this.add.image(650, 400, 'b3');
    this.add.image(400, 300, 'b4');
}

function update() {   
   
}
