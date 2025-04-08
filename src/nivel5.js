class Nivel5 extends Phaser.Scene {
  constructor() {
    super("Nivel5");
    this.calcularDimensoes();
    
    // Variáveis de elementos visuais
    this.fundo;
    this.pata;
    this.circuloRecompensa;
    this.botaoContinuar;
    this.textoTutorial;
    this.textoContador;
    
    // Estado do jogo
    this.contadorClique = 0;
    this.pataClicavel = true;
    this.pataMovendo = true;
    this.nivelConcluido = false;
    this.isPaused = false;
    
    // Obstáculos
    this.obstaculosClicaveis = []; // Obstáculos estáticos que bloqueiam cliques
    
    // Controle de visibilidade
    this.pataVisivel = true;
    this.tempoInvisivel = 0;
    this.duracaoVisibilidade = 2000; // 2 segundos visível
    this.duracaoTransparencia = 500; // 0.5 segundo mais transparente
    this.ultimaTrocaVisibilidade = 0;
    
    // Movimento em padrões
    this.contX = 0;
    this.contY = 0;
    this.padraoMovimento = "zigue-zague"; // Padrão inicial
    this.tempoTrocaMovimento = 0;
    this.intervaloTrocaMovimento = 6000; // Trocar a cada 6 segundos
    this.contadorPadrao = 0;
    this.padroes = ["zigue-zague", "circular", "quadrado"]; // Diferentes padrões
    
    // Orientação do dispositivo
    this.overlay;
    this.textoOrientacao;
    this.caixaTexto;
    this.orientacaoCorreta = true;
    
    // Sons
    this.tim; // Som de clique na pata
    this.botaoSom; // Som do botão
    this.chocalho; // Som da pata se movendo
    this.obstaculosClicaveissom; // Som dos obstáculos
    this.sucessoSom; // Som de nível completado
    
    // BLE
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isConnected = false;
    this.btStatusText = null;
  }

  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    // Reduz o tamanho da pata em 30%
    this.tamanhoPata = Math.min(0.0001673 * this.largura + 0.08, 0.15); 
    this.vel = Math.min(6, Math.max(3, this.largura / 300));
    this.centroX = this.largura / 2;
    this.centroY = this.altura / 2;
    this.marginX = Math.min(100, this.largura * 0.1);
    this.marginY = Math.min(100, this.altura * 0.1);
    this.escalaTexto = Math.min(this.largura / 1280, 1);
    // Reduz o tamanho dos obstáculos em 30%
    this.escalaObstaculosCliqueMin = Math.min(0.14, this.largura / 7000);
    
    // Valores para padrões de movimento
    this.amplitudeX = Math.min(this.largura * 0.4, 500);
    this.amplitudeY = Math.min(this.altura * 0.3, 300);
    this.velocidadeMovimento = Math.min(0.025, 0.035 * (768 / this.altura));
    this.raioCirculo = Math.min(this.largura, this.altura) * 0.3;
    this.ladoQuadrado = Math.min(this.largura, this.altura) * 0.4;
  }

  preload() {
    // Carrega imagens
    this.load.image("pata", "../assets/pata2.png");
    this.load.image("fundo", "../assets/backgroundJogo.png");
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    this.load.image("continuar", "../assets/btnSeta.png");
    this.load.image("obstaculoClicavel", "../assets/arbustosfinal.png");
    
    // Carrega fonte
    this.load.font("Planes_ValMore", "../fonts/Planes_ValMore.ttf", "truetype");
    
    // Carrega sons
    this.load.audio("tim", "../assets/sons/tim.mp3");
    this.load.audio("botaoSom", "../assets/botaosom.mp3");
    this.load.audio("chocalho", "../assets/chocalho.mp3");
    this.load.audio("obstaculoClicavelsom", "../assets/folhas.mp3");
    this.load.audio("sucessoSom", "../assets/sons/tim.mp3"); // Substitua por um som de sucesso específico
  }

  create() {
    // Inicializa variáveis de estado
    this.contadorClique = 0;
    this.pataMovendo = true;
    this.pataClicavel = true;
    this.pataVisivel = true;
    this.ultimaTrocaVisibilidade = this.time.now;
    this.tempoTrocaMovimento = this.time.now;
    this.contadorPadrao = 0;
    this.padraoMovimento = this.padroes[0];

    // Recupera estado de áudio
    this.mutado = localStorage.getItem('mutado') === 'true';
    const volumeAtual = localStorage.getItem('volumeAtual') ? 
      parseFloat(localStorage.getItem('volumeAtual')) : 0.5;

    // Configura sons
    this.tim = this.sound.add("tim");
    this.botaoSom = this.sound.add("botaoSom");
    this.chocalho = this.sound.add("chocalho", { loop: true });
    this.obstaculosClicaveissom = this.sound.add("obstaculoClicavelsom");
    this.sucessoSom = this.sound.add("tim"); // Substituir pelo som de sucesso
    
    // Aplica configurações de volume
    [this.tim, this.botaoSom, this.chocalho, this.obstaculosClicaveissom, this.sucessoSom].forEach(som => {
      som.setVolume(volumeAtual);
      som.setMute(this.mutado);
    });

    // Cria fundo
    this.fundo = this.add
      .tileSprite(0, 0, this.largura, this.altura, "fundo")
      .setOrigin(0, 0)
      .setScale(2);

    // Adiciona círculo de recompensa (inicialmente invisível)
    this.circuloRecompensa = this.physics.add
      .staticImage(this.centroX, this.centroY, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0);
    this.circuloRecompensa.setDepth(1);

    // Adiciona pata com posicionamento no centro
    this.pata = this.add.image(this.centroX, this.centroY, "pata")
      .setScale(this.tamanhoPata);
    this.pata.setDepth(2);

    // Adiciona botão continuar
    const btnX = this.largura - Math.min(100, this.largura * 0.1);
    const btnY = this.altura - Math.min(100, this.altura * 0.1);
    const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);
    
    this.botaoContinuar = this.physics.add
      .staticImage(btnX, btnY, "continuar")
      .setScale(btnEscala)
      .setAlpha(0);
    this.botaoContinuar.setInteractive();
    this.botaoContinuar.disableInteractive();
    this.botaoContinuar.setDepth(5);

    // Adiciona texto do contador
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador = this.add.text(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02),
      this.contadorClique + "/7",
      {
        fontFamily: "Planes_ValMore",
        fontSize: tamanhoFonte + "px",
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 5, y: 3 },
      }
    );
    this.textoContador.setDepth(5);

    // Adiciona texto para status do BLE
    const tamanhoFonteBT = Math.max(16, Math.floor(28 * this.escalaTexto));
    this.btStatusText = this.add.text(
      Math.max(10, this.largura * 0.02), 
      this.altura - Math.max(50, this.altura * 0.1),
      "BT: Não conectado", 
      {
        fontFamily: 'Planes_ValMore',
        fontSize: tamanhoFonteBT + 'px',
        fill: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 5, y: 3 }
      }
    );
    this.btStatusText.setDepth(5);

    // Adiciona botão para conectar ao BLE
    const btnBLEX = Math.max(this.largura * 0.02, 10);
    const btnBLEY = this.altura - Math.max(90, this.altura * 0.15);
    
    const btnBLE = this.add.text(
      btnBLEX, 
      btnBLEY,
      "Conectar BT", 
      {
        fontFamily: 'Planes_ValMore',
        fontSize: tamanhoFonteBT + 'px',
        fill: "#ffffff",
        backgroundColor: "#0066cc",
        padding: { x: 10, y: 5 }
      }
    ).setInteractive();
    btnBLE.setDepth(5);
    
    btnBLE.on('pointerdown', () => {
      this.inicializarBLE();
    });

    // Cria obstáculos estáticos
    this.criarObstaculos();
    
    // Configura eventos de clique
    this.configurarEscutaEventos();

    // Inicia som do chocalho se não estiver mutado
    if (!this.mutado) {
      this.chocalho.play();
    }

    // Adiciona texto tutorial inicial
    this.textoTutorial1();

    // Cria overlay de orientação
    this.criarOverlayOrientacao();
    this.verificarOrientacao();

    // Adiciona event listeners para redimensionamento e orientação
    window.addEventListener("resize", this.handleResize.bind(this));
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.verificarOrientacao();
        if (this.orientacaoCorreta) {
          this.atualizarCena();
        }
      }, 300);
    });
  }

  criarObstaculos() {
    // Limpa obstáculos existentes
    if (this.obstaculosClicaveis && this.obstaculosClicaveis.length > 0) {
      this.obstaculosClicaveis.forEach((obstaculo) => obstaculo.destroy());
      this.obstaculosClicaveis = [];
    }

    // Cria apenas 4 obstáculos estáticos em posições estratégicas
    const posicoes = [
      { x: this.largura / 3, y: this.altura / 3 },
      { x: (this.largura * 2) / 3, y: this.altura / 3 },
      { x: this.largura / 3, y: (this.altura * 2) / 3 },
      { x: (this.largura * 2) / 3, y: (this.altura * 2) / 3 }
    ];

    posicoes.forEach((pos) => {
      const obstaculo = this.physics.add
        .staticImage(pos.x, pos.y, "obstaculoClicavel")
        // Reduz a escala dos obstáculos para 5 (anteriormente era 7)
        .setScale(5 * this.escalaObstaculosCliqueMin);

      obstaculo.setDepth(3);
      this.obstaculosClicaveis.push(obstaculo);
    });

    // Torna obstáculos estáticos clicáveis
    this.obstaculosClicaveis.forEach((obstaculo) => {
      obstaculo.setInteractive();
      obstaculo.on("pointerdown", () => {
        if (!this.mutado) {
          this.obstaculosClicaveissom.play();
        }
      });
    });
  }
  
  configurarEscutaEventos() {
    // Event listener para botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      if (!this.mutado) {
        this.botaoSom.play();
      }
      
      if (!this.isPaused && this.contadorClique < 7) {
        // Reinicia movimento e esconde recompensa
        this.pataMovendo = true;
        this.pataClicavel = true;
        this.circuloRecompensa.setAlpha(0);
        this.botaoContinuar.setAlpha(0);
        this.botaoContinuar.disableInteractive();
        
        // Restaura visibilidade
        this.pataVisivel = true;
        this.pata.setAlpha(1);
        
        // Atualiza círculo de recompensa para corresponder ao novo tamanho da pata
        this.circuloRecompensa.setScale(this.tamanhoPata + 0.01);
        
        // Reinicia som
        if (!this.mutado && !this.chocalho.isPlaying) {
          this.chocalho.play();
        }
        
        // Atualiza tutorial
        if (this.textoTutorial) {
          this.textoTutorial.destroy();
        }
        this.textoTutorial1();
        
      } else if (!this.isPaused && this.contadorClique >= 7) {
        // Finaliza o nível
        this.finalizarNivel();
      }
    });
    
    // Remover eventos anteriores para evitar duplicação
    this.input.off("pointerdown");
    
    // Adiciona escuta global de cliques
    this.input.on("pointerdown", (pointer) => {
      // Só processa se a pata estiver em movimento e suficientemente visível
      if (!this.pataMovendo || this.isPaused || this.contadorClique >= 7 || this.pata.alpha < 0.2) {
        return;
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
        // Verifica se o ponto do clique está sob algum obstáculo estático
        let cliqueBloqueioPorObstaculo = false;
        
        // Verifica obstáculos estáticos
        this.obstaculosClicaveis.forEach(obstaculo => {
          const obstaculoRaio = obstaculo.displayWidth / 2;
          const distancia = Phaser.Math.Distance.Between(
            pointer.x, pointer.y, obstaculo.x, obstaculo.y
          );
          
          if (distancia < obstaculoRaio) {
            cliqueBloqueioPorObstaculo = true;
            if (!this.mutado) {
              this.obstaculosClicaveissom.play();
            }
          }
        });
        
        // Se o clique não foi bloqueado por obstáculo
        if (!cliqueBloqueioPorObstaculo) {
          this.processarCliqueNaPata();
        }
      }
    });
  }
  
  processarCliqueNaPata() {
    this.contadorClique++;
    
    // Reproduz som de clique
    if (!this.mutado) {
      this.tim.play();
    }
    
    // Diminui o tamanho da pata com cada clique (similar ao nível 1)
    this.tamanhoPata = Math.max(this.tamanhoPata - 0.01, 0.08); // Reduz tamanho mas não permite ficar menor que 0.08
    this.pata.setScale(this.tamanhoPata);
    
    // Atualiza contador
    this.textoContador.setText(this.contadorClique + "/7");
    
    // Para a pata e mostra recompensa
    this.pataMovendo = false;
    this.pataClicavel = false;
    
    // Para o som do chocalho
    if (this.chocalho.isPlaying) {
      this.chocalho.stop();
    }
    
    // Mostra círculo de recompensa (ajustando tamanho conforme a pata)
    this.circuloRecompensa.x = this.pata.x;
    this.circuloRecompensa.y = this.pata.y;
    this.circuloRecompensa.setScale(this.tamanhoPata + 0.01); // Círculo um pouco maior que a pata
    this.circuloRecompensa.setAlpha(0.5);
    
    // Restaura visibilidade total da pata
    this.pata.setAlpha(1);
    
    // Mostra botão continuar
    this.botaoContinuar.setAlpha(1);
    this.botaoContinuar.setInteractive();
    
    // Envia comando BLE se conectado
    this.enviarComandoRotacao();
    
    // Atualiza tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
    }
    
    if (this.contadorClique >= 7) {
      // Nível completo
      this.pontuacaoMaxima();
    } else {
      // Instrução para recompensa
      this.textoTutorial2();
    }
  }
  
  atualizarVisibilidadePata() {
    // Controla a transparência da pata
    if (this.time.now - this.ultimaTrocaVisibilidade > 
        (this.pataVisivel ? this.duracaoVisibilidade : this.duracaoTransparencia)) {
      
      this.pataVisivel = !this.pataVisivel;
      // Alterna entre visível (1.0) e transparente (0.2)
      this.pata.setAlpha(this.pataVisivel ? 1.0 : 0.2);
      this.ultimaTrocaVisibilidade = this.time.now;
    }
  }
  
  atualizarPadraoMovimento() {
    // Troca o padrão de movimento periodicamente
    if (this.time.now - this.tempoTrocaMovimento > this.intervaloTrocaMovimento) {
      this.contadorPadrao = (this.contadorPadrao + 1) % this.padroes.length;
      this.padraoMovimento = this.padroes[this.contadorPadrao];
      this.tempoTrocaMovimento = this.time.now;
      
      // Reinicia contadores para movimento suave
      if (this.padraoMovimento === "zigue-zague") {
        this.contX = 0;
        this.contY = 0;
      }
    }
  }
  
  moverPata() {
    switch (this.padraoMovimento) {
      case "zigue-zague":
        this.moverZigueZague();
        break;
      case "circular":
        this.moverCircular();
        break;
      case "quadrado":
        this.moverQuadrado();
        break;
      default:
        this.moverZigueZague();
    }
  }
  
  moverZigueZague() {
    // Incrementa contadores
    this.contX += this.velocidadeMovimento;
    this.contY += this.velocidadeMovimento * 1.3;
    
    // Calcula posição
    const xOffset = Math.sin(this.contX) * this.amplitudeX;
    const yOffset = Math.sin(this.contY) * this.amplitudeY;
    
    // Aplica posição
    this.pata.x = this.centroX + xOffset;
    this.pata.y = this.centroY + yOffset;
    
    // Limita posição
    this.limitarPosicaoPata();
  }
  
  moverCircular() {
    // Incrementa contador único para movimento circular
    this.contX += this.velocidadeMovimento * 0.8;
    
    // Calcula posição
    this.pata.x = this.centroX + Math.cos(this.contX) * this.raioCirculo;
    this.pata.y = this.centroY + Math.sin(this.contX) * this.raioCirculo;
    
    // Limita posição
    this.limitarPosicaoPata();
  }
  
  moverQuadrado() {
    // Incrementa contador
    this.contX += this.velocidadeMovimento * 0.5;
    const fase = (this.contX % (Math.PI * 2)) / (Math.PI * 2);
    
    // Determina o lado do quadrado
    const metade = this.ladoQuadrado / 2;
    
    if (fase < 0.25) {
      // Lado superior
      const progresso = fase * 4;
      this.pata.x = this.centroX - metade + (this.ladoQuadrado * progresso);
      this.pata.y = this.centroY - metade;
    } else if (fase < 0.5) {
      // Lado direito
      const progresso = (fase - 0.25) * 4;
      this.pata.x = this.centroX + metade;
      this.pata.y = this.centroY - metade + (this.ladoQuadrado * progresso);
    } else if (fase < 0.75) {
      // Lado inferior
      const progresso = (fase - 0.5) * 4;
      this.pata.x = this.centroX + metade - (this.ladoQuadrado * progresso);
      this.pata.y = this.centroY + metade;
    } else {
      // Lado esquerdo
      const progresso = (fase - 0.75) * 4;
      this.pata.x = this.centroX - metade;
      this.pata.y = this.centroY + metade - (this.ladoQuadrado * progresso);
    }
    
    // Limita posição
    this.limitarPosicaoPata();
  }
  
  limitarPosicaoPata() {
    // Limita a posição da pata dentro das bordas
    if (this.pata.x < this.marginX) this.pata.x = this.marginX;
    if (this.pata.x > this.largura - this.marginX) this.pata.x = this.largura - this.marginX;
    if (this.pata.y < this.marginY) this.pata.y = this.marginY;
    if (this.pata.y > this.altura - this.marginY) this.pata.y = this.altura - this.marginY;
  }

  criarOverlayOrientacao() {
    // Cria overlay escuro
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
    
    // Cria caixa preta para o texto
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
    
    // Texto de aviso para orientação
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
        padding: { x: 20, y: 10 }
      }
    );
    this.textoOrientacao.setOrigin(0.5);
    this.textoOrientacao.setDepth(12);
    
    // Oculta inicialmente
    this.hideOrientationWarning();
  }
  
  showOrientationWarning() {
    if (this.overlay && this.textoOrientacao && this.caixaTexto) {
      this.overlay.setVisible(true);
      this.caixaTexto.setVisible(true);
      this.textoOrientacao.setVisible(true);
      this.pauseGame();
    }
  }
  
  hideOrientationWarning() {
    if (this.overlay && this.textoOrientacao && this.caixaTexto) {
      this.overlay.setVisible(false);
      this.caixaTexto.setVisible(false);
      this.textoOrientacao.setVisible(false);
      this.resumeGame();
    }
  }
  
  pauseGame() {
    this.isPaused = true;
    this.physics.pause();
    
    if (this.chocalho && this.chocalho.isPlaying) {
      this.chocalho.pause();
    }
  }
  
  resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    
    if (!this.mutado && this.pataMovendo && this.chocalho && !this.chocalho.isPlaying) {
      this.chocalho.resume();
    }
    
    // Atualiza a cena quando o jogo for retomado
    this.atualizarCena();
  }
  
  verificarOrientacao() {
    // Recalcula dimensões
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    
    // Verificação apenas em dispositivos móveis
    if (
      this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS ||
      this.sys.game.device.os.windowsPhone
    ) {
      const estaEmRetrato = window.innerWidth < window.innerHeight;
      
      if (estaEmRetrato && this.orientacaoCorreta) {
        this.orientacaoCorreta = false;
        this.showOrientationWarning();
      } else if (!estaEmRetrato && !this.orientacaoCorreta) {
        this.orientacaoCorreta = true;
        this.hideOrientationWarning();
        this.atualizarCena();
      }
    }
  }

  textoTutorial1() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Nível 5 MASTER: Tente fazer seu gato clicar na pata em movimento entre os obstáculos! A pata alterna entre padrões e muda sua visibilidade! (7 cliques)",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(30 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(5);
  }
  
  textoTutorial2() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "Ótimo! Coloque a recompensa no círculo e depois clique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(30 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(5);
  }
  
  textoTutorial3() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1,
      "PARABÉNS! Você completou o nível Master! Seu gato é um verdadeiro especialista! Clique no botão para continuar.",
      {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(20, Math.floor(30 * this.escalaTexto)) + "px",
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(5);
  }

  handleResize() {
    // Recalcula dimensões
    this.calcularDimensoes();
    
    // Verifica orientação
    this.verificarOrientacao();
    
    // Atualiza cena se orientação correta
    if (this.orientacaoCorreta) {
      this.atualizarCena();
    }
    
    // Atualiza overlay
    if (this.overlay) {
      this.overlay.setSize(this.largura, this.altura);
    }
    
    if (this.textoOrientacao && this.caixaTexto) {
      this.textoOrientacao.setPosition(this.centroX, this.centroY);
      this.textoOrientacao.setFontSize(Math.max(24, Math.floor(40 * this.escalaTexto)) + "px");
      
      const textWidth = Math.min(this.largura * 0.8, 500);
      const textHeight = 160;
      this.caixaTexto.setPosition(this.centroX, this.centroY);
      this.caixaTexto.setSize(textWidth + 40, textHeight);
    }
  }
  
  atualizarCena() {
    // Recalcula dimensões
    this.calcularDimensoes();
    
    // Atualiza fundo
    this.fundo.setSize(this.largura, this.altura);
    
    // Atualiza círculo de recompensa
    const alphaAtual = this.circuloRecompensa.alpha;
    if (this.pataMovendo) {
      this.circuloRecompensa.setPosition(this.centroX, this.centroY);
    } else {
      this.circuloRecompensa.setPosition(this.pata.x, this.pata.y);
    }
    this.circuloRecompensa.setScale(this.tamanhoPata + 0.01);
    this.circuloRecompensa.setAlpha(alphaAtual);
    
    // Atualiza pata
    this.pata.setScale(this.tamanhoPata);
    
    // Limita posição da pata
    this.limitarPosicaoPata();
    
    // Atualiza botão continuar
    const btnX = this.largura - Math.min(100, this.largura * 0.1);
    const btnY = this.altura - Math.min(100, this.altura * 0.1);
    const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);
    this.botaoContinuar.setPosition(btnX, btnY);
    this.botaoContinuar.setScale(btnEscala);
    
    // Atualiza contador
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador.setPosition(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02)
    );
    this.textoContador.setFontSize(tamanhoFonte + "px");
    
    // Atualiza status BT
    const tamanhoFonteBT = Math.max(16, Math.floor(28 * this.escalaTexto));
    this.btStatusText.setPosition(
      Math.max(10, this.largura * 0.02),
      this.altura - Math.max(50, this.altura * 0.1)
    );
    this.btStatusText.setFontSize(tamanhoFonteBT + "px");
    
    // Atualiza botão BT
    this.children.list.forEach(child => {
      if (child.type === "Text" && child.text === "Conectar BT") {
        child.setPosition(
          Math.max(10, this.largura * 0.02),
          this.altura - Math.max(90, this.altura * 0.15)
        );
        child.setFontSize(tamanhoFonteBT + "px");
      }
    });
    
    // Recria obstáculos
    this.criarObstaculos();
    
    // Configura eventos
    this.configurarEscutaEventos();
    
    // Atualiza tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
      
      if (this.contadorClique >= 7) {
        this.textoTutorial3();
      } else if (!this.pataMovendo) {
        this.textoTutorial2();
      } else {
        this.textoTutorial1();
      }
    }
  }

  update() {
    // Verifica orientação
    this.verificarOrientacao();
    
    // Verifica audio
    this.verificarEstadoAudio();
    
    // Se o jogo estiver pausado, não atualiza
    if (this.isPaused) {
      return;
    }
    
    // Se a pata não deve se mover, sai da função
    if (!this.pataMovendo) {
      if (this.chocalho && this.chocalho.isPlaying) {
        this.chocalho.stop();
      }
      return;
    }
    
    // Gerencia som da pata
    if (!this.mutado && !this.chocalho.isPlaying) {
      this.chocalho.play();
    }
    
    // Atualiza visibilidade da pata
    this.atualizarVisibilidadePata();
    
    // Verifica se deve trocar o padrão de movimento
    this.atualizarPadraoMovimento();
    
    // Move a pata de acordo com o padrão atual
    this.moverPata();
  }

  pontuacaoMaxima() {
    // Desativa interação com a pata
    this.pataClicavel = false;
    this.nivelConcluido = true;
    
    // Exibe mensagem de conclusão
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
    }
    this.textoTutorial3();
    
    // Mostra recompensa final
    this.circuloRecompensa.x = this.pata.x;
    this.circuloRecompensa.y = this.pata.y;
    this.circuloRecompensa.setAlpha(0.5);
    
    // Ativa o botão continuar
    this.botaoContinuar.setAlpha(1);
    this.botaoContinuar.setInteractive();
    
    // Toca som de sucesso
    if (!this.mutado) {
      this.sucessoSom.play();
    }
  }
  
  finalizarNivel() {
    // Remove event listeners
    window.removeEventListener("resize", this.handleResize.bind(this));
    window.removeEventListener("orientationchange", () => {});
    
    // Desconecta bluetooth se necessário
    if (this.isConnected && this.device) {
      if (this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
    }
    
    // Marca nível como completo
    localStorage.setItem('nivel5Completo', 'true');
    
    // Retorna para seleção de nível
    this.scene.start("SelecaoDeLevel");
  }

  verificarEstadoAudio() {
    // Atualiza estado de mudo com base no localStorage
    const novoEstadoMutado = localStorage.getItem('mutado') === 'true';
    
    // Se o estado mudou, atualiza todos os sons
    if (novoEstadoMutado !== this.mutado) {
      this.mutado = novoEstadoMutado;
      
      // Atualiza todos os sons
      [this.tim, this.botaoSom, this.obstaculosClicaveissom, this.sucessoSom].forEach(som => {
        if (som) som.setMute(this.mutado);
      });
      
      // Gerencia o som do chocalho de forma especial
      if (this.chocalho) {
        this.chocalho.setMute(this.mutado);
        
        if (this.mutado && this.chocalho.isPlaying) {
          this.chocalho.pause();
        } else if (!this.mutado && this.pataMovendo && !this.isPaused && !this.chocalho.isPlaying) {
          this.chocalho.play();
        }
      }
    }
  }
  
  // Métodos para Bluetooth LE
  
  verificarSuporteBLE() {
    if (!navigator.bluetooth) {
      console.log('Bluetooth não suportado neste navegador.');
      return false;
    }
    return true;
  }
  
  async inicializarBLE() {
    if (!this.verificarSuporteBLE()) {
      this.atualizarStatusBLE('Bluetooth não suportado');
      return;
    }
    
    try {
      this.atualizarStatusBLE('Procurando dispositivo...');
      
      // Solicitar dispositivo
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'PhaserMotor' } // Nome configurado no ESP32
        ],
        optionalServices: ['beb5483e-36e1-4688-b7f5-ea07361b26a8'] // SERVICE_UUID
      });
      
      this.atualizarStatusBLE('Conectando...');
      
      // Conectar ao dispositivo
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
      this.server = await this.device.gatt.connect();
      
      // Obter serviço
      this.service = await this.server.getPrimaryService('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      
      // Obter característica
      this.characteristic = await this.service.getCharacteristic('08590f7e-db05-467e-8757-72f6faeb13d4');
      
      this.isConnected = true;
      this.atualizarStatusBLE('Conectado');
      console.log('Conectado com sucesso ao ESP32!');
    } catch (error) {
      console.error('Erro ao conectar:', error);
      this.isConnected = false;
      this.atualizarStatusBLE('Erro ao conectar: ' + error.message);
    }
  }
  
  onDisconnected(event) {
    console.log('Dispositivo desconectado:', event.target.name);
    this.isConnected = false;
    this.atualizarStatusBLE('Desconectado');
    
    // Tentar reconectar
    this.reconnect();
  }
  
  async reconnect() {
    this.atualizarStatusBLE('Reconectando...');
    try {
      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      this.characteristic = await this.service.getCharacteristic('08590f7e-db05-467e-8757-72f6faeb13d4');
      
      this.isConnected = true;
      this.atualizarStatusBLE('Reconectado');
      console.log('Reconectado com sucesso!');
    } catch (error) {
      console.error('Erro ao reconectar:', error);
      this.isConnected = false;
      this.atualizarStatusBLE('Falha ao reconectar');
      
      // Tentar novamente após delay
      setTimeout(() => this.reconnect(), 5000);
    }
  }
  
  atualizarStatusBLE(status) {
    if (this.btStatusText) {
      this.btStatusText.setText('BT: ' + status);
    }
  }
  
  enviarComandoRotacao() {
    if (this.characteristic && this.isConnected) {
      try {
        const encoder = new TextEncoder();
        const commandBuffer = encoder.encode("ROTATE");
        this.characteristic.writeValue(commandBuffer)
          .then(() => console.log('Comando enviado com sucesso!'))
          .catch(error => console.error('Erro ao enviar comando:', error));
      } catch (error) {
        console.error('Erro ao preparar comando:', error);
      }
    } else {
      console.log('Não conectado ao ESP32, comando não enviado.');
    }
  }
}
