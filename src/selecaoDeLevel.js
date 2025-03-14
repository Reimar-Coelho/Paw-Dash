class SelecaoDeLevel extends Phaser.Scene {
  constructor() {
    super('SelecaoDeLevel');
    // Propriedades da classe
  }

  preload() {
    /*this.load.image('background', '../assets/bg_tileable.png'); */
    this.load.image('nivel1', '../assets/PoteCheio1.png');
    this.load.image('nivel2', '../assets/PoteCheio2.png');
    this.load.image('nivel3', '../assets/PoteCheio3.png');
    this.load.image('nivel4', '../assets/PoteCheio4.png');
    this.load.image('nivel5', '../assets/PoteCheio5.png');
  }

  create() {
    // Usar largura e altura globais para responsividade
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // adiciona os botões de seleção de nivel
    const nivel1 = this.add.image((width/2)+80, ((height/2)+200), 'nivel1').setScale(0.15);
    nivel1.setInteractive();
    nivel1.on('pointerdown', () => {
      console.log('nivel 1');
      this.scene.start('Nivel1');
    });

    const nivel2 = this.add.image((width/2)-80, ((height/2)+50), 'nivel2').setScale(0.15);
    nivel2.setInteractive();
    nivel2.on('pointerdown', () => {
      console.log('nivel 2');
      this.scene.start('Nivel2');
    });

    const nivel3 = this.add.image((width/2)+80, ((height/2)-100), 'nivel3').setScale(0.15);
    nivel3.setInteractive();
    nivel3.on('pointerdown', () => {
      console.log('nivel 3');
      this.scene.start('Nivel3');
    });

    const nivel4 = this.add.image((width/2)-80, ((height/2)-250), 'nivel4').setScale(0.15);  
    nivel4.setInteractive();
    nivel4.on('pointerdown', () => {
      console.log('nivel 4');
      this.scene.start('Nivel4');
    }); 

    const nivel5 = this.add.image((width/2)+80, ((height/2)-400), 'nivel5').setScale(0.15);  
    nivel5.setInteractive();
    nivel5.on('pointerdown', () => {
      console.log('nivel 5');
      this.scene.start('Nivel5');
    }); 
  }

  update() {
    // O método update está vazio no código original, mas é necessário defini-lo
  }
}