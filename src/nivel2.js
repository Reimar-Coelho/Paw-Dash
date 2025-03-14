class Nivel2 extends Phaser.Scene {
  constructor() {
    super('Nivel2');
    this.fundo; // Variável para o fundo tileable
    this.pata; // Variável para a pata
    this.tamanhoPata = 0.0001673 * largura; // Tamanho da pata baseado na tela
    this.cont = 0; // Variável para medir a progressão regressiva de tamanho da pata
    this.vel = 5; // Velocidade da pata
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial

    this.contadorClique = 0; // Contador de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.pataClicavel = true; // Variável para verificar se a pata está clicável
  }

  preload() {
    // Carrega a imagem da pata
    this.load.image("pata", "../assets/pata2.png");
    // Carrega a imagem tileable do fundo
    this.load.image("fundo", "../assets/backgroundJogo.png");;
    // Carrega a imagem do círculo da recompensa
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    // Carrega a imagem do botão de continuar
    this.load.image("continuar", "../assets/btnSeta.png");
  }

  create() {
    // Cria um tileSprite que cobre toda a tela com a imagem tileable
    this.fundo = this.add
      .tileSprite(0, 0, largura, altura, "fundo")
      .setOrigin(0, 0)
      .setScale(2);

    // Adiciona o círculo da recompensa (inicialmente invisível)
    this.circuloRecompensa = this.physics.add
      .staticImage(largura / 2, altura / 2, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0);
    this.circuloRecompensa.setDepth(1);

    // Adiciona a pata e ajusta seu tamanho
    this.pata = this.add.image(100, 300, "pata").setScale(this.tamanhoPata);
    this.pata.vertical = true;
    this.pata.ida = true; // Direção inicial no eixo X
    this.pata.setInteractive();

    // Adiciona o botão de continuar (inicialmente invisível)
    this.botaoContinuar = this.physics.add
      .staticImage(largura - 100, altura - 100, "continuar")
      .setScale(0.5)
      .setAlpha(0);
    this.botaoContinuar.setInteractive();
    
    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      this.scene.start('SelecaoDeLevel');
    });

    // Evento de clique para a pata
    this.pata.on("pointerdown", () => {
      if (this.pataClicavel && this.contadorClique < 3) {
        this.contadorClique++;
        
        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/3");

        // Chama a função de evento quando chega a 3 cliques
        if (this.contadorClique === 3) {
          this.pontuacaoMaxima();
        }
      }
    });

    // Adiciona o contador visual no canto superior esquerdo
    this.textoContador = this.add.text(10, 10, this.contadorClique + "/3", {
      font: "24px Arial",
      fill: "#ffffff",
    });
    
    // Adiciona o texto tutorial inicial
    this.textoTutorial = this.add.text(
      largura / 2,
      altura / 2 - 300,
      "Nível 2: Tente fazer seu gato clicar na pata em movimento!",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(1);
  }

  update() {
    // Atualiza as dimensões da tela para responsividade
    largura = window.innerWidth;
    altura = window.innerHeight;
    
    // Se o contador atingiu 3, não atualiza mais a posição da pata
    if (this.contadorClique >= 3) {
      return;
    }

    // Movimentação da pata no eixo X com if ternário
    this.pata.ida = this.pata.x <= 100 ? true : this.pata.x >= largura - 150 ? false : this.pata.ida;
    this.pata.x += this.pata.ida ? this.vel : -this.vel;

    // Movimentação da pata no eixo Y com if ternário
    this.pata.vertical =
      this.pata.y <= 100 ? true : this.pata.y >= altura - 140 ? false : this.pata.vertical;
    this.pata.y += this.pata.vertical ? this.vel : -this.vel;
  }

  // Função de evento acionada ao atingir 3 cliques
  pontuacaoMaxima() {
    // Desativa os cliques na pata
    this.pataClicavel = false;
    this.pata.disableInteractive();
    
    // Remove o texto tutorial se existir
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
    }
    
    // Define a área do texto de vitória
    const areaTextoY = altura / 2 - 300;
    const alturaTexto = 75; // Altura estimada da área de texto com duas linhas
    
    // Exibe a mensagem de conclusão
    this.textoTutorial = this.add.text(
      largura / 2, 
      areaTextoY,
      "                                        Parabéns! Você completou o nível 2! \n Lembre-se de colocar a recompensa no círculo e depois clicar no botão para continuar.",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
    
    // Verifica se a pata está próxima da área do texto
    if (Math.abs(this.pata.y - areaTextoY) < alturaTexto) {
      // Move a pata para um lugar seguro abaixo do texto
      if (this.pata.y < altura / 2) {
        // Se estiver na metade superior, move para a metade inferior
        this.pata.y = altura * 0.75;
      } else {
        // Se estiver na metade inferior, move para a metade superior
        this.pata.y = altura * 0.25;
      }
      
      // Ajusta também a posição X para um lugar visível mas não central
      if (this.pata.x > largura / 2) {
        this.pata.x = largura * 0.25;
      } else {
        this.pata.x = largura * 0.75;
      }
    }
    
    // Posiciona o círculo de recompensa na última posição da pata
    this.circuloRecompensa.x = this.pata.x;
    this.circuloRecompensa.y = this.pata.y;
    
    // Mostra o círculo de recompensa e o botão continuar
    this.circuloRecompensa.setAlpha(0.5);
    this.botaoContinuar.setAlpha(1);
  }
}
