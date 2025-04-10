class Nivel1 extends Phaser.Scene {
  constructor() {
    super("Nivel1");
    this.calcularDimensoes(); // Método para calcular dimensões responsivas
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial
    this.contadorClique = 0; // Contador de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.pataClicavel = true; // Variável para verificar se a pata está clicável
    this.pata; // Variável para a pata
    this.fundo; // Variável para o fundo
    this.tim; // Variável para o som
    this.contX = 0; // Contador para movimento no eixo X
    this.contY = 0; // Contador para movimento no eixo Y
    this.pataMovendo = true; // Estado do movimento da pata
    this.isPaused = false; // Controle de pausa
    this.overlay; // Overlay escuro
    this.textoOrientacao; // Texto de orientação
    this.caixaTexto; // Caixa de texto
    this.orientacaoCorreta = true; // Estado da orientação
    this.botaoSom; // Som do botão
    this.chocalho; // Variável para o barulho da bata se mechendo
  }

  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.tamanhoPata = Math.min(0.0001673 * this.largura + 0.1, 0.25); // Limita o tamanho máximo
    this.vel = Math.min(0.02, 0.04 * (768 / this.altura)); // Aumentado em ~33%
    this.centroX = this.largura / 2; // Centro da tela no eixo X
    this.centroY = this.altura / 2; // Centro da tela no eixo Y
    // Valores para a função de movimento da pata
    this.amplitudeX = Math.min(this.largura * 0.35, 600); // Amplitude X responsiva
    this.amplitudeY = Math.min(this.altura * 0.25, 250); // Amplitude Y responsiva
    this.velocidadeMovimento = Math.min(0.025, 0.038 * (768 / this.altura)); // Velocidade aumentada em ~25%
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
  }

  preload() {
    // Carrega a imagem do círculo da recompensa
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    // Carrega a imagem da pata
    this.load.image("pata", "../assets/pata2.png");
    // Carrega a imagem tileable do fundo
    this.load.image("fundo", "../assets/backgroundJogo.png");
    // Carrega a imagem do botão de continuar
    this.load.image("continuar", "../assets/btnSeta.png");
    // Carrega a fonte personalizada
    this.load.font("Planes_ValMore", "../fonts/Planes_ValMore.ttf", "truetype");
    // Carrega o som de clique
    this.load.audio("tim", "../assets/sons/tim.mp3");
    // Carrega o som do botão
    this.load.audio("botaoSom", "../assets/botaosom.mp3");
    // Carrega o som da pata se mechendo
    this.load.audio("chocalho", "../assets/chocalho.mp3");
    // Carrega a imagem da tela de vitória
    this.load.image("telaVitoria", "../assets/telaVitoria.png");
  }

  iniciarRotacao() {
    // Incrementa contadores usando velocidade responsiva
    this.contX += this.velocidadeMovimento;
    this.contY += this.velocidadeMovimento;

    // Calcula posição X com amplitude responsiva
    this.pata.tempoX = Math.cos(this.contX) * this.amplitudeX;
    this.pata.x = this.centroX + this.pata.tempoX;

    // Calcula posição Y com amplitude responsiva e movimento em 8
    this.pata.tempoY =
      Math.sin(this.contY) * Math.cos(this.contY) * this.amplitudeY;
    this.pata.y = this.centroY + (this.pata.tempoY ^ 2);
  }

  // Funções para exibir o texto tutorial com tamanho responsivo
  textoTutorial1() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1, // Posicionamento responsivo
      "Mostre a tela para seu gato e tente fazer ele clicar na pata",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500", // Cor laranja
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center", // Para centralizar o texto
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorial2() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Agora coloque um petisco em cima da área vermelha demarcada para seu gato e depois que ele comer clique no botão no canto da tela",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(18, Math.floor(32 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500", // Caixa com fundo laranja
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000", // Adiciona contorno preto
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }
  textoTutorial3() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Agora repita o processo até o contador chegar em 7",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500", // Caixa com fundo laranja
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000", // Adiciona contorno preto
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  // Criar o overlay escuro e mensagem de orientação
  criarOverlayOrientacao() {
    // Criando um overlay escuro que cobre toda a tela
    this.overlay = this.add.rectangle(
      0,
      0,
      this.largura,
      this.altura,
      0x000000,
      0.8
    );
    this.overlay.setOrigin(0, 0);
    this.overlay.setDepth(10);

    // Caixa preta por trás do texto
    const boxPadding = 40;
    const textWidth = Math.min(this.largura * 0.8, 500);
    const textHeight = 160;

    this.caixaTexto = this.add.rectangle(
      this.centroX,
      this.centroY,
      textWidth + boxPadding,
      textHeight,
      0x000000,
      1
    );
    this.caixaTexto.setOrigin(0.5);
    this.caixaTexto.setStrokeStyle(4, 0xff0000);
    this.caixaTexto.setDepth(11);

    // Texto de aviso para girar o celular
    this.textoOrientacao = this.add.text(
      this.centroX,
      this.centroY,
      "GIRE O DISPOSITIVO\nPARA JOGAR",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(24, Math.floor(40 * this.escalaTexto)) + "px",
        fill: "#ff0000",
        align: "center",
        fontWeight: "bold",
        padding: { x: 20, y: 10 },
      }
    );
    this.textoOrientacao.setOrigin(0.5);
    this.textoOrientacao.setDepth(12);

    // Ocultando inicialmente
    this.hideOrientationWarning();
  }

  // Exibir aviso de orientação
  showOrientationWarning() {
    if (this.overlay && this.textoOrientacao && this.caixaTexto) {
      this.overlay.setVisible(true);
      this.caixaTexto.setVisible(true);
      this.textoOrientacao.setVisible(true);
      this.pauseGame();
    }
  }

  // Ocultar aviso de orientação
  hideOrientationWarning() {
    if (this.overlay && this.textoOrientacao && this.caixaTexto) {
      this.overlay.setVisible(false);
      this.caixaTexto.setVisible(false);
      this.textoOrientacao.setVisible(false);
      this.resumeGame();
    }
  }

  // Pausar o jogo
  pauseGame() {
    this.isPaused = true;
    this.physics.pause();
  }

  // Retomar o jogo
  resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    // Atualiza a cena quando o jogo for retomado
    this.atualizarCena();
  }

  // Verificar a orientação do dispositivo
  verificarOrientacao() {
    // Recalcular as dimensões atuais da janela
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;

    // Apenas verificar em dispositivos móveis ou forçar verificação em todos
    if (
      this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS ||
      this.sys.game.device.os.windowsPhone
    ) {
      // Se largura < altura, estamos em modo retrato (celular em pé)
      const estaEmRetrato = window.innerWidth < window.innerHeight;

      if (estaEmRetrato && this.orientacaoCorreta) {
        this.orientacaoCorreta = false;
        this.showOrientationWarning();
      } else if (!estaEmRetrato && !this.orientacaoCorreta) {
        this.orientacaoCorreta = true;
        this.hideOrientationWarning();
        // Força uma atualização da cena quando mudar para orientação correta
        this.atualizarCena();
      }
    }
  }

  create() {
    // Recalcula as dimensões responsivas
    this.calcularDimensoes();

    // Recupera o estado de mudo do localStorage
    this.mutado = localStorage.getItem("mutado") === "true";

    // Recupera o volume atual do localStorage
    const volumeAtual = localStorage.getItem("volumeAtual")
      ? parseFloat(localStorage.getItem("volumeAtual"))
      : 0.5;

    // cria os sons
    this.tim = this.sound.add("tim");
    this.botaoSom = this.sound.add("botaoSom");
    this.chocalho = this.sound.add("chocalho", { rate: 1 });

    // Aplica as configurações de volume
    this.tim.setVolume(volumeAtual);
    this.botaoSom.setVolume(volumeAtual);
    this.chocalho.setVolume(volumeAtual);

    // Aplica o estado de mudo
    this.tim.setMute(this.mutado);
    this.botaoSom.setMute(this.mutado);
    this.chocalho.setMute(this.mutado);

    // Inicializa variáveis de estado
    this.pataMovendo = true;
    this.contadorClique = 0;
    this.contX = 0;
    this.contY = 0;

    // Cria um tileSprite que cobre toda a tela com a imagem tileable
    this.fundo = this.add
      .tileSprite(0, 0, this.largura, this.altura, "fundo")
      .setOrigin(0, 0)
      .setScale(2);

    // Adiciona o círculo da recompensa que seja transparente
    this.circuloRecompensa = this.physics.add
      .staticImage(this.centroX, this.centroY, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0.5);
    this.circuloRecompensa.setDepth(1);

    // Adiciona a pata e ajusta seu tamanho
    this.pata = this.add
      .image(this.centroX, this.centroY, "pata")
      .setScale(this.tamanhoPata);
    this.pata.vertical = true;
    this.pata.setInteractive();

    // Adiciona o botão de continuar com posicionamento responsivo
    const btnX = this.largura - Math.min(100, this.largura * 0.1);
    const btnY = this.altura - Math.min(100, this.altura * 0.1);
    const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);

    this.botaoContinuar = this.physics.add
      .staticImage(btnX, btnY, "continuar")
      .setScale(btnEscala)
      .setAlpha(0);
    this.botaoContinuar.setInteractive(); // Torna o botão interativo

    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      // Verifica se está mutado antes de tocar o som
      if (!this.mutado) {
        this.botaoSom.play();
      }

      if (!this.isPaused) {
        this.pataMovendo = true;
        
        // Verifica se o contador já atingiu 7
        if (this.contadorClique === 7) {
          // Chama a função para mostrar a tela de vitória
          this.pontuacaoMaxima();
        } else {
          // Atualiza o texto do contador
          this.textoContador.setText(this.contadorClique + "/7");
        }
      }
    });

    // Adiciona o contador visual com tamanho responsivo
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador = this.add.text(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02),
      this.contadorClique + "/7",
      {
        fontFamily: "Planes_ValMore",
        fontSize: tamanhoFonte + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500", // Fundo laranja para uniformidade
        padding: { x: 8, y: 5 },
        stroke: "#000000", // Adiciona contorno preto
        strokeThickness: 2,
      }
    );

    // Evento de clique para a pata
    this.pata.on("pointerdown", () => {
      if (!this.isPaused) {
        if (this.contadorClique < 7) {
          this.contadorClique++;
          // Importante: primeiro salvar a posição atual, depois alterar o estado
          const posX = this.pata.x;
          const posY = this.pata.y;
          this.pataMovendo = false;
          // Posiciona o círculo exatamente onde a pata está
          this.circuloRecompensa.setPosition(posX, posY);
        }
        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/7");

        // Verifica se está mutado antes de tocar o som
        if (!this.mutado) {
          this.tim.play();
        }
      }
    });

    // Criar overlay e aviso de orientação
    this.criarOverlayOrientacao();

    // Verificar orientação inicialmente
    this.verificarOrientacao();

    // Adiciona listener para redimensionamento da tela
    window.addEventListener("resize", this.handleResize.bind(this));

    // Adicionar listener específico para mudanças de orientação
    window.addEventListener("orientationchange", () => {
      // Pequeno atraso para garantir que as dimensões da janela sejam atualizadas
      setTimeout(() => {
        this.verificarOrientacao();
        // Se a orientação estiver correta, atualize a cena completamente
        if (this.orientacaoCorreta) {
          this.atualizarCena();
        }
      }, 300);
    });
  }

  // Método para lidar com o redimensionamento da tela
  handleResize() {
    // Recalcula as dimensões
    this.calcularDimensoes();

    // Verificar orientação após redimensionamento
    this.verificarOrientacao();

    // Se a orientação estiver correta, atualiza a cena
    if (this.orientacaoCorreta) {
      this.atualizarCena();
    }

    // Atualiza o overlay de orientação
    if (this.overlay) {
      this.overlay.setSize(this.largura, this.altura);
    }

    if (this.textoOrientacao && this.caixaTexto) {
      this.textoOrientacao.setPosition(this.centroX, this.centroY);
      this.textoOrientacao.setFontSize(
        Math.max(24, Math.floor(40 * this.escalaTexto)) + "px"
      );

      // Atualiza a caixa de texto
      const textWidth = Math.min(this.largura * 0.8, 500);
      const textHeight = 160;
      this.caixaTexto.setPosition(this.centroX, this.centroY);
      this.caixaTexto.setSize(textWidth + 40, textHeight);
    }
  }

  update() {
    // Verifica orientação a cada frame
    this.verificarOrientacao();

    // Verifica o estado de áudio a cada frame para pegar mudanças de outras cenas
    this.verificarEstadoAudio();

    // Se o jogo estiver pausado, não atualiza a lógica do jogo
    if (this.isPaused) {
      return;
    }

    // Se a pata estiver em movimento
    if (this.pataMovendo) {
      this.iniciarRotacao();
      // Verifica se está mutado antes de tocar o som
      if (!this.mutado && !this.chocalho.isPlaying) {
        this.chocalho.play();
      }
      this.circuloRecompensa.setAlpha(0);
      this.botaoContinuar.setAlpha(0);
      // Habilita a interatividade da pata
      this.pata.setInteractive();
      this.pataClicavel = true;
      // Desabilita o botão continuar
      this.botaoContinuar.disableInteractive();
    }
    // Se a pata estiver parada
    else {
      if (this.chocalho.isPlaying) {
        this.chocalho.stop();
      }
      // Posiciona o círculo de recompensa exatamente onde a pata está
      this.circuloRecompensa.setPosition(this.pata.x, this.pata.y);
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

  // Método para atualizar a cena completamente quando a orientação mudar
  atualizarCena() {
    // Recalcular dimensões
    this.calcularDimensoes();

    // Atualizar posições de elementos principais
    this.fundo.setSize(this.largura, this.altura);

    // Reposicionar o círculo da recompensa
    const alphaAtual = this.circuloRecompensa.alpha;
    if (this.pataMovendo) {
      // Se a pata estiver em movimento, esconde o círculo
      this.circuloRecompensa.setPosition(this.centroX, this.centroY);
      this.circuloRecompensa.setAlpha(0);
    } else {
      // Se a pata estiver parada, mantém o círculo na posição da pata
      this.circuloRecompensa.setPosition(this.pata.x, this.pata.y);
      this.circuloRecompensa.setAlpha(alphaAtual);
    }
    this.circuloRecompensa.setScale(this.tamanhoPata + 0.01);

    // Reposicionar a pata
    if (this.pataMovendo) {
      // Se estiver em movimento, reiniciar contadores
      this.contX = 0;
      this.contY = 0;
      this.pata.x = this.centroX;
      this.pata.y = this.centroY;
    } else {
      // Se estiver parada, manter na posição atual do círculo
      this.pata.x = this.circuloRecompensa.x;
      this.pata.y = this.circuloRecompensa.y;
    }
    this.pata.setScale(this.tamanhoPata);

    // Atualizar o botão continuar
    const btnX = this.largura - Math.min(100, this.largura * 0.1);
    const btnY = this.altura - Math.min(100, this.altura * 0.1);
    const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);
    this.botaoContinuar.setPosition(btnX, btnY);
    this.botaoContinuar.setScale(btnEscala);

    // Atualizar o contador
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador.setPosition(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02)
    );
    this.textoContador.setFontSize(tamanhoFonte + "px");

    // Recriar o texto tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
      if (this.contadorClique === 0) this.textoTutorial1();
      else if (this.contadorClique === 1) this.textoTutorial2();
      else if (this.contadorClique >= 2) this.textoTutorial3();
    }
  }

  // Dentro do método pontuacaoMaxima:
  pontuacaoMaxima() {
    // Pausar o jogo
    this.pauseGame();

    // Toca o som de vitória
    if (!this.mutado) {
      this.botaoSom.play();
    }

    // Cria um overlay preto que cobre toda a tela
    const overlay = this.add
      .rectangle(0, 0, this.largura, this.altura, 0x000000)
      .setOrigin(0, 0)
      .setAlpha(0);
    overlay.setDepth(20);

    // Tween para escurecer o fundo
    this.tweens.add({
      targets: overlay,
      alpha: 0.8, // valor final do alpha
      duration: 1000, // duração em milissegundos para escurecer
      // Dentro do método pontuacaoMaxima, no onComplete do tween do overlay:
      onComplete: () => {
        localStorage.setItem("nivel1Completo", true); // Marca o nível como completo no localStorage
        // Após o background escurecer, exibe a tela de vitória com fade-in
        // Calcula a escala baseada no tamanho da tela
        const escalaVitoria = Math.min(
          (this.largura * 0.8) / 1024, // Assumindo que a imagem tenha 1024px de largura
          (this.altura * 0.8) / 768,   // Assumindo que a imagem tenha 768px de altura
          0.7 // Limita a escala máxima
        );
        
        const telaVitoria = this.add
          .image(this.centroX, this.centroY, "telaVitoria")
          .setScale(escalaVitoria)
          .setAlpha(0);
        telaVitoria.setDepth(21);
        this.tweens.add({
          targets: telaVitoria,
          alpha: 1,
          duration: 500, // tempo de fade-in da imagem
        });

        // Adiciona um botão para avançar para o próximo nível ou reiniciar (canto inferior direito)
        const margin = 20; // margem do botão em relação à borda
        const btnProximoNivel = this.add.text(
          this.largura - margin,
          this.altura - margin,
          "Próximo Nível",
          {
            fontFamily: "Planes_ValMore",
            fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
            fill: "#ffffff",
            backgroundColor: "#FFA500",
            padding: { x: 10, y: 5 },
            stroke: "#000000",
            strokeThickness: 2,
          }
        );
        btnProximoNivel.setOrigin(1, 1); // alinha o botão para o canto inferior direito
        btnProximoNivel.setInteractive();
        btnProximoNivel.setDepth(21);
        btnProximoNivel.on("pointerdown", () => {
          this.scene.start("Nivel2"); // Mude para o nome da próxima cena
        });

        // Implementa o btnSeta.png na parte superior esquerda da transição
        const btnSeta = this.add
          .image(margin, margin, "continuar")
          .setOrigin(0, 0)
          .setScale(0.5) // ajuste o scale conforme necessário
          .setDepth(21)
          .setFlipX(true); // inverte horizontalmente para apontar para a esquerda
        btnSeta.setInteractive();
        btnSeta.on("pointerdown", () => {
          this.scene.start("SelecaoDeLevel"); // Direciona para a tela de níveis
        });
      },
    });
  }

  // Adicione o método para verificar o estado de áudio
  verificarEstadoAudio() {
    // Atualiza o estado de mudo com base no localStorage
    const novoEstadoMutado = localStorage.getItem("mutado") === "true";

    // Se o estado mudou, atualize todos os sons
    if (novoEstadoMutado !== this.mutado) {
      this.mutado = novoEstadoMutado;

      // Atualiza todos os sons
      if (this.tim) {
        this.tim.setMute(this.mutado);
      }

      if (this.botaoSom) {
        this.botaoSom.setMute(this.mutado);
      }

      if (this.chocalho) {
        this.chocalho.setMute(this.mutado);
      }
    }
  }
}
