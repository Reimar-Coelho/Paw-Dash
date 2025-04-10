class Nivel4 extends Phaser.Scene {
  constructor() {
    super("Nivel4");
    this.calcularDimensoes(); // Método para calcular dimensões responsivas
    this.fundo; // Variável para o fundo tileable
    this.pata; // Variável para a pata
    this.cont = 0; // Variável para medir a progressão regressiva de tamanho da pata
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial
    this.contadorClique = 0; // Contador de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.pataClicavel = true; // Variável para verificar se a pata está clicável
    this.pataMovendo = true; // Variável para controlar se a pata está em movimento
    this.tim; // Variável para o som de clique
    this.isPaused = false; // Controle de pausa
    this.overlay; // Overlay escuro
    this.textoOrientacao; // Texto de orientação
    this.caixaTexto; // Caixa de texto
    this.orientacaoCorreta = true; // Estado da orientação
    this.botaoSom; // Som do botão
    this.chocalho; // Variável para o barulho da pata se mexendo
    this.contX = 0; // Contador para movimento em zigue-zague X
    this.contY = 0; // Contador para movimento em zigue-zague Y
    this.padraoMovimento = "zigue-zague"; // Padrão de movimento atual

    // Variáveis para BLE
    this.device = null; // Dispositivo BLE
    this.server = null; // Servidor GATT
    this.service = null; // Serviço BLE
    this.characteristic = null; // Característica BLE para escrita
    this.isConnected = false; // Estado da conexão BLE
    this.btStatusText = null; // Texto para status da conexão Bluetooth
  }

  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.tamanhoPata = Math.min(0.0001673 * this.largura + 0.1, 0.25); // Limita o tamanho máximo
    this.vel = Math.min(12, Math.max(7, this.largura / 180)); // Velocidade intermediária
    this.centroX = this.largura / 2; // Centro da tela no eixo X
    this.centroY = this.altura / 2; // Centro da tela no eixo Y
    this.marginX = Math.min(100, this.largura * 0.1); // Margem horizontal para movimento
    this.marginY = Math.min(100, this.altura * 0.1); // Margem vertical para movimento
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
    // Valores para a função de movimento em zigue-zague
    this.amplitudeX = Math.min(this.largura * 0.4, 500); // Amplitude X responsiva
    this.amplitudeY = Math.min(this.altura * 0.3, 300); // Amplitude Y responsiva
    this.velocidadeMovimento = Math.min(0.025, 0.035 * (768 / this.altura)); // Velocidade de padrão
    this.raioCirculo = Math.min(this.largura, this.altura) * 0.3; // Raio para movimento circular
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
    // Carrega o som de clique
    this.load.audio("tim", "../assets/sons/tim.mp3");
    // Carrega o som do botão
    this.load.audio("botaoSom", "../assets/botaosom.mp3");
    // Carrega o som da pata se mechendo
    this.load.audio("chocalho", "../assets/chocalho.mp3");
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
    this.pataMovendo = true;
    this.pataClicavel = true;
    this.contX = 0;
    this.contY = 0;

    // Recupera o estado de mudo do localStorage
    this.mutado = localStorage.getItem('mutado') === 'true';
    
    // Recupera o volume atual do localStorage
    const volumeAtual = localStorage.getItem('volumeAtual') ? 
      parseFloat(localStorage.getItem('volumeAtual')) : 0.5;

    // Adiciona os sons
    this.tim = this.sound.add("tim");
    this.botaoSom = this.sound.add("botaoSom");
    this.chocalho = this.sound.add("chocalho", { rate: 1, loop: true });
    
    // Aplica as configurações de volume
    this.tim.setVolume(volumeAtual);
    this.botaoSom.setVolume(volumeAtual);
    this.chocalho.setVolume(volumeAtual);
    
    // Aplica o estado de mudo
    this.tim.setMute(this.mutado);
    this.botaoSom.setMute(this.mutado);
    this.chocalho.setMute(this.mutado);

    // Recalcula as dimensões responsivas
    this.calcularDimensoes();

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

    // Adiciona a pata com posicionamento no centro
    this.pata = this.add.image(this.centroX, this.centroY, "pata").setScale(this.tamanhoPata);
    this.pata.setInteractive();

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

    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      // Verifica se está mutado antes de tocar o som
      if (!this.mutado) {
        this.botaoSom.play();
      }
      
      if (!this.isPaused) {
        // Verifica se o contador já atingiu 5
        if (this.contadorClique >= 5) {
          // Chama a função para mostrar a tela de vitória
          this.pontuacaoMaxima();
        } else {
          // Se ainda não completou, volta a movimentar a pata
          this.pataMovendo = true;
          this.pataClicavel = true;
          this.pata.setInteractive();
          this.circuloRecompensa.setAlpha(0);
          this.botaoContinuar.setAlpha(0);
          this.botaoContinuar.disableInteractive();
          
          // Toca o som do chocalho apenas se não estiver mutado
          if (!this.mutado && !this.chocalho.isPlaying) {
            this.chocalho.play();
          }

          // Atualiza o texto tutorial
          if (this.textoTutorial) {
            this.textoTutorial.destroy();
          }

          // Exibe o texto tutorial
          this.textoTutorial1();
        }
      }
    });

    // Evento de clique para a pata
    this.pata.on("pointerdown", () => {
      if (!this.isPaused && this.pataClicavel && this.contadorClique < 5) {
        this.contadorClique++;

        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/5");

        // Parar a pata e mostrar recompensa
        this.pataMovendo = false;
        this.pataClicavel = false;
        this.pata.disableInteractive();

        // Parar o som do chocalho
        if (this.chocalho.isPlaying) {
          this.chocalho.stop();
        }

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
        
        // Envia comando para girar o motor do ESP32
        this.enviarComandoRotacao();

        // Atualiza o texto tutorial
        if (this.textoTutorial) {
          this.textoTutorial.destroy();
        }

        // Se completou o nível, mostra mensagem final
        if (this.contadorClique >= 5) {
          this.textoTutorial3();
        } else {
          // Se ainda não completou, mostra instrução para recompensar
          this.textoTutorial2();
        }
      }
    });

    // Adiciona o contador visual com tamanho responsivo
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador = this.add.text(
      Math.max(10, this.largura * 0.02),
      Math.max(10, this.altura * 0.02),
      this.contadorClique + "/5",
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
    
    // Adiciona texto para status do BLE
    const tamanhoFonteBT = Math.max(16, Math.floor(28 * this.escalaTexto));
    this.btStatusText = this.add.text(
      Math.max(10, this.largura * 0.02), 
      this.altura - Math.max(50, this.altura * 0.1), // Posicionado na parte inferior
      "BT: Não conectado", 
      {
        fontFamily: 'Planes_ValMore',
        fontSize: tamanhoFonteBT + 'px',
        fill: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 5, y: 3 }
      }
    );

    // Adiciona botão para conectar ao BLE
    const btnBLEX = Math.max(this.largura * 0.02, 10);
    const btnBLEY = this.altura - Math.max(90, this.altura * 0.15); // Posicionado acima do status
    
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
    
    btnBLE.on('pointerdown', () => {
      this.inicializarBLE();
    });

    // Adiciona o texto tutorial inicial
    this.textoTutorial1();

    // Inicia o som do chocalho se não estiver mutado
    if (!this.mutado) {
      this.chocalho.play();
    }

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

  // Funções para exibir os textos tutoriais com tamanho responsivo
  textoTutorial1() {
    this.textoTutorial = this.add.text(
        this.centroX,
        this.altura * 0.1,
        "Nível 4: Aja rápido para marcar pontos com a pata!",
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
        "Acertou! Agora, coloque a recompensa e clique no botão para continuar.",
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
        "Parabéns! Você completou o nível 4!\nClique no botão para continuar.",
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

    // Ajustar a pata (somente escala, posição é controlada pelo movimento)
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
    
    // Atualizar o status do BT e o botão BT
    const tamanhoFonteBT = Math.max(16, Math.floor(28 * this.escalaTexto));
    this.btStatusText.setPosition(
      Math.max(10, this.largura * 0.02),
      this.altura - Math.max(50, this.altura * 0.1) // Posicionado na parte inferior
    );
    this.btStatusText.setFontSize(tamanhoFonteBT + "px");

    // Também precisamos atualizar a posição do botão BT, se ele existir
    // Encontrando e atualizando o botão BT (busca por todos os elementos de texto)
    this.children.list.forEach(child => {
      if (child.type === "Text" && child.text === "Conectar BT") {
        child.setPosition(
          Math.max(10, this.largura * 0.02),
          this.altura - Math.max(90, this.altura * 0.15) // Posicionado acima do status
        );
        child.setFontSize(tamanhoFonteBT + "px");
      }
    });

    // Recriar o texto tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
      if (this.contadorClique === 5) {
        this.textoTutorial3();
      } else if (this.pataMovendo) {
        this.textoTutorial1();
      } else if (!this.pataMovendo) {
        this.textoTutorial2();
      }
    }
  }

  // Método para movimentar a pata em zigue-zague
  moverZigueZague() {
    // Incrementa contadores
    this.contX += this.velocidadeMovimento;
    this.contY += this.velocidadeMovimento * 1.3; // Velocidade Y um pouco diferente

    // Calcula posição usando funções seno e cosseno
    const xOffset = Math.sin(this.contX) * this.amplitudeX;
    const yOffset = Math.sin(this.contY) * this.amplitudeY;

    // Aplica posição à pata
    this.pata.x = this.centroX + xOffset;
    this.pata.y = this.centroY + yOffset;

    // Limita a posição dentro dos limites da tela
    if (this.pata.x < this.marginX) this.pata.x = this.marginX;
    if (this.pata.x > this.largura - this.marginX) this.pata.x = this.largura - this.marginX;
    if (this.pata.y < this.marginY) this.pata.y = this.marginY;
    if (this.pata.y > this.altura - this.marginY) this.pata.y = this.altura - this.marginY;
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

    // Se a pata não deve se mover, sai da função
    if (!this.pataMovendo) {
      // Se o chocalho estiver tocando, pare-o
      if (this.chocalho && this.chocalho.isPlaying) {
        this.chocalho.stop();
      }
      return;
    }

    // Se a pata estiver em movimento e o som não estiver tocando, inicie-o (apenas se não estiver mutado)
    if (this.pataMovendo && this.chocalho && !this.chocalho.isPlaying && !this.mutado) {
      this.chocalho.play();
    }

    // Aplica o padrão de movimento em zigue-zague
    this.moverZigueZague();
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
        localStorage.setItem("nivel4Completo", true); // Marca o nível como completo no localStorage
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
          this.scene.start("Nivel5"); // Mude para o nome da próxima cena
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
    const novoEstadoMutado = localStorage.getItem('mutado') === 'true';
    
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
    }
  }
  
  // Método para verificar se o navegador suporta BLE
  verificarSuporteBLE() {
    if (!navigator.bluetooth) {
      console.log('Bluetooth não suportado neste navegador.');
      return false;
    }
    return true;
  }

  // Método para inicializar a conexão BLE
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
          { name: 'PhaserMotor' } // Nome correto configurado no ESP32
        ],
        optionalServices: ['beb5483e-36e1-4688-b7f5-ea07361b26a8'] // SERVICE_UUID do ESP32
      });

      this.atualizarStatusBLE('Conectando...');
      
      // Conectar ao dispositivo
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
      this.server = await this.device.gatt.connect();
      
      // Obter serviço - usando o SERVICE_UUID
      this.service = await this.server.getPrimaryService('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      
      // Obter característica - usando o CHARACTERISTIC_UUID
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

  // Método chamado quando o dispositivo desconecta
  onDisconnected(event) {
    console.log('Dispositivo desconectado:', event.target.name);
    this.isConnected = false;
    this.atualizarStatusBLE('Desconectado');
    
    // Tentar reconectar
    this.reconnect();
  }

  // Método para tentar reconectar
  async reconnect() {
    this.atualizarStatusBLE('Reconectando...');
    try {
      // Tentar reconectar
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
      
      // Tentar novamente após um tempo
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  // Método para atualizar o texto de status do BLE
  atualizarStatusBLE(status) {
    if (this.btStatusText) {
      this.btStatusText.setText('BT: ' + status);
    }
  }

  // Função para enviar comando de rotação ao ESP32
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
