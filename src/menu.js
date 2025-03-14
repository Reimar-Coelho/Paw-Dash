class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
    // Propriedades da classe se necessário
  }

  preload() {
    //this.load.image('background', '../assets/bg_tileable.png');
    this.load.image('btnJogar', '../assets/jogar.png');
    this.load.image('btnCreditos', '../assets/creditos.png');
  }

  create() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Se tiver um background, descomentar esta linha
    // this.add.image(width/2, height/2, 'background').setScale(0.1);
    
    const btnJogar = this.add.image(width/2, height/2, 'btnJogar').setScale(0.7);
    const btnCreditos = this.add.image(width-250, height-100, 'btnCreditos').setScale(0.7);
    
    btnJogar.setInteractive();
    btnCreditos.setInteractive();
    
    btnJogar.on('pointerdown', () => {
      console.log('Jogar');
      this.scene.start('SelecaoDeLevel');
    });
    
    btnCreditos.on('pointerdown', () => {
      console.log('Créditos');
      // Aqui você pode adicionar a navegação para uma cena de créditos no futuro
      // this.scene.start('Creditos');
    });
  }

  update() {
    // Método update vazio, mas mantido para consistência
  }
}