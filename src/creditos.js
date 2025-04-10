class Creditos extends Phaser.Scene {
    constructor() {
      super("Creditos");
    }

    preload() {
      // Carregando as imagens necessárias
      this.load.image('logoInteli', 'assets/logointeli.png');
      this.load.image('logoDrPet', 'assets/logoDrPet.png');
      this.load.image('btnSeta', 'assets/btnSeta.png');
    }

    create() {
      // Configuração inicial
      const centerX = this.cameras.main.width / 2;
      const height = this.cameras.main.height;
      
      // Botão voltar
      const btnVoltar = this.add.image(55, 50, 'btnSeta')
        .setScale(0.3)     // Reduzindo de 0.7 para 0.5
        .setFlipX(true)    // Espelhando no eixo X
        .setInteractive()
        .on('pointerdown', () => {
          this.scene.start('Menu');
        });

      // Estilo do texto para os créditos
      const style = {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
      };

      // Lista de nomes para os créditos
      const nomes = [
        'Cauê Meyer Taddeo',
        'Henrique Rodrigues Diniz',
        'Isabela Rosati Peçanha',
        'João de Caprio Agmont',
        'Mariana Pereira de Souza',
        'Paulo Vitor Barros de Almeida',
        'Reimar Coelho Ferreira Filho',
        'Thúlio Sallum Bacco Pinto'
      ];

      // Array com todos os elementos para animar
      const elementosCreditos = [];
      
      // Adicionando os nomes à tela e ao array
      // Os primeiros elementos a serem exibidos serão posicionados mais abaixo
      let posicaoY = height + 100;
      
      // Adicionando "Obrigado por jogar" no topo dos créditos
      const textoObrigado = this.add.text(centerX, posicaoY, 'Obrigado por jogar', {
        ...style,
        fontSize: '36px',
        fontWeight: 'bold'
      }).setOrigin(0.5);
      elementosCreditos.push(textoObrigado);
      posicaoY += 100; // Espaço maior após o título
      
      // Adicionando "equipe:" antes dos nomes
      const textoEquipe = this.add.text(centerX, posicaoY, 'Equipe:', {
        ...style,
        fontSize: '30px'
      }).setOrigin(0.5);
      elementosCreditos.push(textoEquipe);
      posicaoY += 60;
      
      // Adicionando os nomes
      nomes.forEach(nome => {
        const textoNome = this.add.text(centerX, posicaoY, nome, style).setOrigin(0.5);
        elementosCreditos.push(textoNome);
        posicaoY += 60;
      });

      // Agora adicionamos o texto "em parceria com:" depois dos nomes
      posicaoY += 60; // Espaço extra entre os nomes e o texto de parceria
      const textoParceria = this.add.text(centerX, posicaoY, 'Em parceria com:', {
        ...style,
        fontSize: '32px'
      }).setOrigin(0.5);
      elementosCreditos.push(textoParceria);
      
      // E por fim os logos, posicionados após o texto de parceria
      posicaoY += 150;
      
      // Adicionando um background branco semi-transparente para as logos
      const logoBackground = this.add.graphics();
      logoBackground.fillStyle(0xffffff, 0.5); // Branco com 50% de transparência
      logoBackground.fillRoundedRect(centerX - 350, posicaoY - 80, 700, 160, 20); // x, y, largura, altura, raio de arredondamento
      elementosCreditos.push(logoBackground);
      
      const logoInteli = this.add.image(centerX - 150, posicaoY, 'logoInteli')
        .setScale(1.3)
        .setOrigin(0.5);
      const logoDrPet = this.add.image(centerX + 150, posicaoY, 'logoDrPet')
        .setScale(0.3)
        .setOrigin(0.5);
      
      elementosCreditos.push(logoInteli);
      elementosCreditos.push(logoDrPet);

      // Animando os créditos (movendo para cima)
      this.tweens.add({
        targets: elementosCreditos,
        y: "-=" + (height + posicaoY + 300),
        duration: 20000,
        ease: 'Linear',
        onComplete: () => {
          // Reiniciando a cena quando todos os elementos saírem da tela
          this.scene.restart();
        }
      });
    }
}
