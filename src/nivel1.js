class Nivel1 extends Phaser.Scene {
  constructor() {
    super('Nivel1');
    // Variáveis da classe
    this.tamanhoPata = 0.0001673 * largura - 0.04; // Tamanho da pata baseado na tela
    this.vel = 0.2; // Velocidade da pata
    this.centroX = largura / 2; // Centro da tela no eixo X
    this.centroY = altura / 2; // Centro da tela no eixo Y
    this.raio = 15; // Raio da órbita
    this.angulo = 0; // Ângulo inicial
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial
    this.contadorClique = 0; // Contador de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.pataClicavel = true; // Variável para verificar se a pata está clicável
    this.pata; // Variável para a pata
    this.fundo; // Variável para o fundo
  }

  preload() {
    // Carrega a imagem do círculo da recompensa
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    // Carrega a imagem da pata
    this.load.image("pata", "../assets/pata2.png");
    // Carrega a imagem tileable do fundo
    this.load.image("fundo", "../assets/wood2.png");
    // Carrega a imagem do botão de continuar
    this.load.image("continuar", "../assets/Circulo_branco.png");
  }

  iniciarRotacao() {
    this.angulo += this.vel; // Atualiza o ângulo
    this.pata.x = this.centroX + Math.cos(this.angulo) * this.raio;
    this.pata.y = this.centroY + Math.sin(this.angulo) * this.raio;
  }

  // Funções para exibir o texto tutorial
  textoTutorial1() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.centroY - 300,
      "Mostre a tela para seu gato e tente fazer ele clicar na pata",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorial2() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.centroY - 300,
      "Agora coloque um petisco em cima da área vermelha demarcada para seu gato \n                e depois que ele comer clique no botão no canto da tela",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorial3() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.centroY - 300,
      "Agora repita o processo até o contador chegar em 10",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  create() {
    // Atualiza as referências ao centro da tela
    this.centroX = largura / 2;
    this.centroY = altura / 2;
    
    // Cria um tileSprite que cobre toda a tela com a imagem tileable
    this.fundo = this.add
      .tileSprite(0, 0, largura, altura, "fundo")
      .setOrigin(0, 0)
      .setScale(4);

    // Adiciona o círculo da recompensa que seja transparente
    this.circuloRecompensa = this.physics.add
      .staticImage(this.centroX, this.centroY, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0.5);
    this.circuloRecompensa.setDepth(1);

    // Adiciona a pata e ajusta seu tamanho
    this.pata = this.add.image(this.centroX, this.centroY, "pata").setScale(this.tamanhoPata);
    this.pata.vertical = true;
    this.pata.setInteractive();

    // Adiciona o botão de continuar
    this.botaoContinuar = this.physics.add
      .staticImage(largura - 100, altura - 100, "continuar")
      .setScale(0.1)
      .setAlpha(0);
    this.botaoContinuar.setInteractive(); // Torna o botão interativo

    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      if (this.contadorClique < 10) {
        this.contadorClique++;
        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/10");

        // Chama a função de evento quando chega a 10 cliques
        if (this.contadorClique === 10) {
          this.pontuacaoMaxima();
        }
      }
    });

    // Adiciona o contador visual no canto superior esquerdo
    this.textoContador = this.add.text(10, 10, this.contadorClique + "/10", {
      font: "24px Arial",
      fill: "#ffffff",
    });

    // Evento de clique para a pata
    this.pata.on("pointerdown", () => {
      if (this.contadorClique < 10) {
        this.contadorClique++;
      }
      // Atualiza o texto do contador
      this.textoContador.setText(this.contadorClique + "/10");

      // Chama a função de evento quando chega a 10 cliques
      if (this.contadorClique === 10) {
        this.pontuacaoMaxima();
      }

      // Diminui o tamanho da pata
      this.tamanhoPata -= 0.01;
      this.pata.setScale(this.tamanhoPata);
      console.log("Clique!", this.tamanhoPata);
    });
  }

  update() {
    // Atualiza as dimensões da tela para responsividade
    largura = window.innerWidth;
    altura = window.innerHeight;

    // Se o contador for par (incluindo zero), inicia a rotação e habilita a pata
    if (this.contadorClique % 2 == 0) {
      this.iniciarRotacao();
      this.circuloRecompensa.setAlpha(0);
      this.botaoContinuar.setAlpha(0);
      // Habilita a interatividade da pata
      this.pata.setInteractive();
      this.pataClicavel = true;
      // Desabilita o botão continuar
      this.botaoContinuar.disableInteractive();
    }
    // Se o contador for ímpar, mostra o círculo e botão, desabilita a pata
    else {
      this.circuloRecompensa.setAlpha(0.5);
      this.botaoContinuar.setAlpha(1);
      // Desabilita a interatividade da pata
      this.pata.disableInteractive();
      this.pataClicavel = false;
      // Habilita o botão continuar
      this.botaoContinuar.setInteractive();
    }

    // Gerenciamento de textos tutoriais
    if (this.contadorClique == 0 && !this.textoTutorial) {
      this.textoTutorial1();
    } else if (this.contadorClique == 1 && this.textoTutorial) {
      this.textoTutorial.destroy();
      this.textoTutorial2();
    } else if (this.contadorClique == 2 && this.textoTutorial) {
      this.textoTutorial.destroy();
      this.textoTutorial3();
    }
  }

  // Função de evento acionada ao atingir 10 cliques
  pontuacaoMaxima() {
    // Redirecionar para a cena de seleção de níveis
    this.scene.start('SelecaoDeLevel');
  }
}

