class Nivel3 extends Phaser.Scene {
  constructor() {
    super("Nivel3");
    this.calcularDimensoes(); // Inicializa as dimensões
    this.fundo; // Variável para o fundo tileable
    this.pata; // Variável para a pata
    this.cont = 0; // Variável para medir a progressão regressiva de tamanho da pata
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial
    this.contadorClique = 0; // Contador de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.pataClicavel = true; // Variável para verificar se a pata está clicável
    this.pataMovendo = true; // Nova variável para controlar se a pata está em movimento
    // Apenas obstáculos clicáveis
    this.obstaculosClicaveis = []; // Array para armazenar os obstáculos que afetam cliques
    this.tim; // Variável para o som de clique
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
    this.vel = Math.min(8, Math.max(6, this.largura / 100)); // Velocidade responsiva
    this.centroX = this.largura / 2; // Centro da tela no eixo X
    this.centroY = this.altura / 2; // Centro da tela no eixo Y
    this.marginX = Math.min(100, this.largura * 0.1); // Margem horizontal para movimento
    this.marginY = Math.min(100, this.altura * 0.1); // Margem vertical para movimento
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
    this.escalaObstaculosCliqueMin = Math.min(0.2, this.largura / 6000); // Escala para obstáculos clicáveis
  }

  preload() {
    // Carrega a imagem da pata
    this.load.image("pata", "../assets/pata2.png");
    // Carrega a imagem tileable do fundo
    this.load.image("fundo", "../assets/backgroundJogo.png");
    // Carrega a imagem do círculo da recompensa
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    // Carrega a imagem do botão de continuar
    this.load.image("continuar", "../assets/btnSeta.png");
    // Carrega a fonte personalizada
    this.load.font("Planes_ValMore", "../fonts/Planes_ValMore.ttf", "truetype");
    // Carrega apenas os obstáculos clicáveis
    this.load.image("obstaculoClicavel", "../assets/arbustosfinal.png");
    // Carrega o som do clique na pata
    this.load.audio("tim", "../assets/sons/tim.mp3");
    // Carrega o som do botão
    this.load.audio("botaoSom", "../assets/botaosom.mp3");
    // Carrega o som do chocalho
    this.load.audio("chocalho", "../assets/chocalho.mp3");
    // carrega som obstáculos clicáveis
    this.load.audio("obstaculoClicavelsom", "../assets/folhas.mp3");
    // Carrega a imagem da tela de vitória
    this.load.image("telaVitoria", "../assets/telaVitoria.png");
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
    // Inicializa variáveis de estado
    this.contadorClique = 0;
    this.alvosParaVencer = 5; // Define o número de alvos necessários para vencer
    this.pataMovendo = true;
    this.pataClicavel = true;

    // Recupera o estado de mudo do localStorage
    this.mutado = localStorage.getItem("mutado") === "true";

    // Recupera o volume atual do localStorage
    const volumeAtual = localStorage.getItem("volumeAtual")
      ? parseFloat(localStorage.getItem("volumeAtual"))
      : 0.5;

    // Recalcula as dimensões responsivas
    this.calcularDimensoes();

    // Adiciona os sons
    this.tim = this.sound.add("tim");
    this.botaoSom = this.sound.add("botaoSom");
    this.chocalho = this.sound.add("chocalho");
    this.obstaculosClicaveissom = this.sound.add("obstaculoClicavelsom");

    // Aplica as configurações de volume
    this.tim.setVolume(volumeAtual);
    this.botaoSom.setVolume(volumeAtual);
    this.chocalho.setVolume(volumeAtual);
    this.obstaculosClicaveissom.setVolume(volumeAtual);

    // Aplica o estado de mudo
    this.tim.setMute(this.mutado);
    this.botaoSom.setMute(this.mutado);
    this.chocalho.setMute(this.mutado);
    this.obstaculosClicaveissom.setMute(this.mutado);

    // Cria um tileSprite que cobre toda a tela com a imagem tileable
    this.fundo = this.add
      .tileSprite(0, 0, this.largura, this.altura, "fundo")
      .setOrigin(0, 0)
      .setScale(2);

    // Adiciona o círculo da recompensa (inicialmente invisível)
    this.circuloRecompensa = this.physics.add
      .staticImage(this.centroX, this.centroY, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0);
    this.circuloRecompensa.setDepth(1);

    // Adiciona a pata com posicionamento responsivo
    const pataX = this.marginX;
    const pataY = this.centroY;
    this.pata = this.add.image(pataX, pataY, "pata").setScale(this.tamanhoPata);
    this.pata.vertical = true;
    this.pata.ida = true; // Direção inicial no eixo X

    // Evento de clique para a pata
    this.pata.on("pointerdown", () => {
      if (!this.isPaused && this.pataClicavel) {
        this.contadorClique++;

        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/" + this.alvosParaVencer);

        // Parar a pata e mostrar recompensa
        this.pataMovendo = false;
        this.pataClicavel = false;
        this.pata.disableInteractive();

        // Posiciona e mostra o círculo de recompensa
        this.circuloRecompensa.x = this.pata.x;
        this.circuloRecompensa.y = this.pata.y;
        this.circuloRecompensa.setAlpha(0.5);

        // Mostra o botão de continuar e o habilita
        this.botaoContinuar.setAlpha(1);
        this.botaoContinuar.setInteractive();

        // Verifica se está mutado antes de tocar o som
        if (!this.mutado) {
          this.tim.play();
        }

        // Atualiza os textos tutoriais baseado no progresso do jogador
        if (this.textoTutorial) {
          this.textoTutorial.destroy();
        }

        // Se completou o nível, mostra mensagem final
        if (this.contadorClique >= this.alvosParaVencer) {
          this.textoTutorialFinal();
        } else {
          // Se ainda não completou, mostra instrução para recompensar
          this.textoTutorialContinuar();
        }
      }
    });

    // Adiciona o botão de continuar com posicionamento responsivo
    const btnX = this.largura - Math.min(100, this.largura * 0.1);
    const btnY = this.altura - Math.min(100, this.altura * 0.1);
    const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);

    this.botaoContinuar = this.physics.add
      .staticImage(btnX, btnY, "continuar")
      .setScale(btnEscala)
      .setAlpha(0);
    this.botaoContinuar.setInteractive();
    this.botaoContinuar.disableInteractive(); // Desativa inicialmente

    // Adiciona obstáculos que afetam cliques
    this.criarObstaculosClicaveis();

    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      // Verifica se está mutado antes de tocar o som
      if (!this.mutado) {
        this.botaoSom.play();
      }

      if (!this.isPaused) {
        // Verifica se o contador já atingiu o máximo
        if (this.contadorClique >= this.alvosParaVencer) {
          // Chama a função para mostrar a tela de vitória
          this.pontuacaoMaxima();
        } else {
          // Se não completou, volta a movimentar a pata e esconde o círculo/botão
          this.pataMovendo = true;
          this.pataClicavel = true;
          this.pata.setInteractive();
          this.circuloRecompensa.setAlpha(0);
          this.botaoContinuar.setAlpha(0);
          this.botaoContinuar.disableInteractive();

          if (!this.mutado && !this.chocalho.isPlaying) {
            this.chocalho.play();
          }
        }
      }
    });

    // Adiciona o contador visual com tamanho responsivo
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador = this.add.text(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02),
      this.contadorClique + "/" + this.alvosParaVencer,
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 8, y: 5 },
        stroke: "#000000",
        strokeThickness: 2,
      }
    );

    // Adiciona o texto tutorial inicial
    this.textoTutorial1();

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

  // Método para criar os obstáculos que afetam cliques
  criarObstaculosClicaveis() {
    // Limpar array anterior se existir
    if (this.obstaculosClicaveis && this.obstaculosClicaveis.length > 0) {
      this.obstaculosClicaveis.forEach((obstaculo) => obstaculo.destroy());
      this.obstaculosClicaveis = [];
    }

    // Posições dos obstáculos clicáveis com base na tela
    const posicoes = [
      { x: this.largura / 3, y: this.altura / 2 },
      { x: (this.largura * 2) / 3, y: this.altura / 2 },
    ];

    posicoes.forEach((pos) => {
      const obstaculo = this.physics.add
        .staticImage(pos.x, pos.y, "obstaculoClicavel")
        .setScale(8 * this.escalaObstaculosCliqueMin); // Escala responsiva

      obstaculo.setDepth(3); // Acima da pata
      this.obstaculosClicaveis.push(obstaculo);
    });

    // Tornar os obstáculos clicáveis para capturar eventos neles
    this.obstaculosClicaveis.forEach((obstaculo) => {
      obstaculo.setInteractive();
      // Interceptar cliques no obstáculo (impedir que passem para a pata)
      obstaculo.on("pointerdown", () => {
        // Não faz nada - apenas captura o clique para não chegar à pata
      });
    });

    // Remover eventos anteriores para evitar duplicação
    this.input.off("pointerdown");

    this.input.on("pointerdown", (pointer) => {
      // Só processa se a pata estiver em movimento, o jogo não estiver pausado e ainda não completou o nível
      if (!this.pataMovendo || this.isPaused || this.contadorClique >= 5) {
        return; // Sai se a pata não estiver em movimento ou se já completou o nível
      }

      // Verifica se o clique foi na pata
      const distanciaAoPonto = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.pata.x,
        this.pata.y
      );

      const pataRaio = this.pata.displayWidth / 2;

      // Se o clique foi dentro da pata
      if (distanciaAoPonto <= pataRaio) {
        // Verifica se o ponto do clique está sob algum obstáculo
        let cliqueBloqueioPorObstaculo = false;

        // Verifica todos os obstáculos para ver se o ponto clicado está sob algum deles
        this.obstaculosClicaveis.forEach((obstaculo) => {
          const obstaculoRaio = obstaculo.displayWidth;
          const distanciaAoObstaculo = Phaser.Math.Distance.Between(
            pointer.x,
            pointer.y,
            obstaculo.x,
            obstaculo.y
          );

          // Se o ponto clicado está sob o obstáculo
          if (distanciaAoObstaculo < obstaculoRaio / 2) {
            cliqueBloqueioPorObstaculo = true;
            console.log("Clique bloqueado pelo obstáculo");
            this.obstaculosClicaveissom.play();
          }
        });

        // Se o clique não foi bloqueado por nenhum obstáculo
        if (!cliqueBloqueioPorObstaculo) {
          this.contadorClique++;

          // Verifica se está mutado antes de tocar o som
          if (!this.mutado) {
            this.tim.play();
          }

          // Atualiza o texto do contador
          this.textoContador.setText(this.contadorClique + "/5");

          // Parar a pata e mostrar recompensa
          this.pataMovendo = false;
          this.pataClicavel = false;

          // Posiciona e mostra o círculo de recompensa
          this.circuloRecompensa.x = this.pata.x;
          this.circuloRecompensa.y = this.pata.y;
          this.circuloRecompensa.setAlpha(0.5);

          // Mostra o botão de continuar e o habilita
          this.botaoContinuar.setAlpha(1);
          this.botaoContinuar.setInteractive();

          // Atualiza o texto tutorial
          if (this.textoTutorial) {
            this.textoTutorial.destroy();
          }

          if (this.contadorClique === 5) {
            // Se completou o nível, mostra mensagem final
            this.pontuacaoMaxima();
          } else {
            // Se ainda não completou, mostra instrução para recompensar
            this.textoTutorial2();
          }
        }
      }
    });
  }

  // Funções para exibir os textos tutoriais com tamanho responsivo
  // Exemplo de funções para o Nivel3

  textoTutorial1() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Nível 3: Tente fazer seu gato clicar na pata em movimento!",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
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
      "Coloque a recompensa no círculo e depois clique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorial3() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Parabéns! Você completou o nível 3!\nClique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorialContinuar() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Coloque a recompensa no círculo e depois clique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
  }

  textoTutorialFinal() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Parabéns! Você completou o nível 3!\nClique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#FFA500",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 },
        align: "center",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.textoTutorial.setOrigin(0.5);
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

  // Método para atualizar a cena completamente quando a orientação mudar
  atualizarCena() {
    // Recalcular dimensões
    this.calcularDimensoes();

    // Atualizar tamanho do fundo
    this.fundo.setSize(this.largura, this.altura);

    // Reposicionar o círculo da recompensa (sem alterar a visibilidade atual)
    const alphaAtual = this.circuloRecompensa.alpha;
    if (this.pataMovendo) {
      // Se a pata estiver em movimento, o círculo fica no centro
      this.circuloRecompensa.setPosition(this.centroX, this.centroY);
    } else {
      // Se a pata estiver parada, o círculo fica na mesma posição da pata
      this.circuloRecompensa.setPosition(this.pata.x, this.pata.y);
    }
    this.circuloRecompensa.setScale(this.tamanhoPata + 0.01);
    this.circuloRecompensa.setAlpha(alphaAtual);

    // Ajustar a pata
    this.pata.setScale(this.tamanhoPata);

    // Se a pata estiver fora dos limites da tela após redimensionamento, ajustar posição
    if (this.pata.x < this.marginX) {
      this.pata.x = this.marginX;
    } else if (this.pata.x > this.largura - this.marginX) {
      this.pata.x = this.largura - this.marginX;
    }

    if (this.pata.y < this.marginY) {
      this.pata.y = this.marginY;
    } else if (this.pata.y > this.altura - this.marginY) {
      this.pata.y = this.altura - this.marginY;
    }

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

    // Recriar obstáculos clicáveis
    this.criarObstaculosClicaveis();

    // Recriar o texto tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
      if (this.contadorClique === 5) {
        this.textoTutorial3();
      } else if (this.pataMovendo) {
        this.textoTutorial1();
      } else {
        this.textoTutorial2();
      }
    }
  }

  update() {
    // Verifica orientação a cada frame
    this.verificarOrientacao();

    // Verifica o estado de áudio a cada frame para pegar mudanças de outras cenas
    this.verificarEstadoAudio();

    if (this.pataMovendo) {
      // Verifica se está mutado antes de tocar o som do chocalho
      if (!this.mutado && !this.chocalho.isPlaying) {
        this.chocalho.play();
      }
    }
    // Se a pata estiver parada
    else {
      if (this.chocalho.isPlaying) {
        this.chocalho.stop();
      }
    }

    // Se o jogo estiver pausado, não atualiza a lógica do jogo
    if (this.isPaused) {
      return;
    }

    // Se a pata não deve se mover, sai da função
    if (!this.pataMovendo) {
      return;
    }

    // Movimentação da pata no eixo X com if ternário e limites responsivos
    this.pata.ida =
      this.pata.x <= this.marginX
        ? true
        : this.pata.x >= this.largura - this.marginX
        ? false
        : this.pata.ida;
    this.pata.x += this.pata.ida ? this.vel : -this.vel;

    // Movimentação da pata no eixo Y com if ternário e limites responsivos
    this.pata.vertical =
      this.pata.y <= this.marginY
        ? true
        : this.pata.y >= this.altura - this.marginY
        ? false
        : this.pata.vertical;
    this.pata.y += this.pata.vertical ? this.vel : -this.vel;
  }

  // Função de evento acionada ao atingir 5 cliques
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
        localStorage.setItem("nivel3Completo", true); // Marca o nível como completo no localStorage
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
          this.scene.start("Nivel4"); // Mude para o nome da próxima cena
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
  // Adicione o método para verificar e atualizar o estado de áudio
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

        // Se estiver mutado e o chocalho estiver tocando, pause-o
        if (this.mutado && this.chocalho.isPlaying) {
          this.chocalho.pause();
        }
        // Se não estiver mais mutado, retome o som se a pata estiver em movimento
        else if (!this.mutado && this.pataMovendo && !this.chocalho.isPlaying) {
          this.chocalho.play();
        }
      }

      if (this.obstaculosClicaveissom) {
        this.obstaculosClicaveissom.setMute(this.mutado);
      }
    }
  }
}
