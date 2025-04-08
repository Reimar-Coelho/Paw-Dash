class Creditos extends Phaser.Scene {
    constructor() {
      super("Creditos");
      this.calcularDimensoes(); // Inicializa as dimensões
      this.fundo; // Referência ao fundo
      this.btnSeta; // Referência ao botão jogar
      this.isPaused = false; // Controle de pausa
      this.overlay; // Overlay escuro
      this.caixaTexto; // Caixa de texto
      this.orientacaoCorreta = true; // Estado da orientação
      this.botaoSom; // Som do botão
      this.musicaCreditos; // Música de fundo 
      // Referência aos tempos que determinam as equações de deslocamento
      this.tX = 0;
      this.tY = 0;
      // Referência a posição do bigode
      // Variáveis para controlar o tempo do movimento
      this.inicioMovimento = null; // Tempo quando o movimento começa
      this.tempoTotal = 0; // Tempo total que o bigode leva para se mover
      this.tFinal = null; // Tempo final do movimento
    }
  
    // Método para calcular dimensões responsivas
    calcularDimensoes() {
      this.largura = window.innerWidth;
      this.altura = window.innerHeight;
      this.centroX = this.largura / 2;
      this.centroY = this.altura / 2;
      this.escalaFundo = Math.max(0.5, Math.min(0.7, this.largura / 2000)); // Escala responsiva para o fundo
      this.escalaBotoes = Math.max(0.5, Math.min(0.7, this.largura / 2000)); // Escala responsiva para os botões
      this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
    }
  
    preload() {
      // Verifique se os caminhos dos arquivos estão corretos
      this.load.image("fundoC", "./assets/fundoCreditos.jpg");
      this.load.image("btnSeta", "./assets/btnSeta.png");
      // Carrega a fonte personalizada se ainda não estiver carregada
      this.load.font('Planes_ValMore', './fonts/Planes_ValMore.ttf', 'truetype');
      // Carrega o som do botão
      this.load.audio('botaoSom', './assets/botaosom.mp3');
      // Carrega a música de fundo
      this.load.audio('musicaCreditos', './assets/musicatututu.mp3');

    }
  
    // Criar o overlay escuro e mensagem de orientação
    criarOverlayOrientacao() {
      // Criando um overlay escuro que cobre toda a tela
      this.overlay = this.add.rectangle(0, 0, this.largura, this.altura, 0x000000, 0.8);
      this.overlay.setOrigin(0, 0);
      this.overlay.setDepth(10);
  
      // Caixa preta por trás do texto
      const boxPadding = 40;
      const textWidth = Math.min(this.largura * 0.8, 500);
      const textHeight = 160;
  
      this.caixaTexto = this.add.rectangle(this.centroX, this.centroY, textWidth + boxPadding, textHeight, 0x000000, 1);
      this.caixaTexto.setOrigin(0.5);
      this.caixaTexto.setStrokeStyle(4, 0xff0000);
      this.caixaTexto.setDepth(11);
  
      // Texto de aviso para girar o celular
      this.textoOrientacao = this.add.text(this.centroX, this.centroY, "GIRE O DISPOSITIVO\nPARA JOGAR", {
        fontFamily: "Planes_ValMore",
        fontSize: Math.max(24, Math.floor(40 * this.escalaTexto)) + "px",
        fill: "#ff0000",
        align: "center",
        fontWeight: "bold",
        padding: { x: 20, y: 10 },
      });
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
    }
  
    // Retomar o jogo
    resumeGame() {
      this.isPaused = false;
      // Atualiza a cena quando o jogo for retomado
      this.atualizarCena();
    }
  
    // Verificar a orientação do dispositivo
    verificarOrientacao() {
      // Recalcular as dimensões atuais da janela
      this.largura = window.innerWidth;
      this.altura = window.innerHeight;
  
      // Apenas verificar em dispositivos móveis ou forçar verificação em todos
      if (this.sys.game.device.os.android || this.sys.game.device.os.iOS || this.sys.game.device.os.windowsPhone) {
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
      // cria os sons
      this.botaoSom = this.sound.add("botaoSom", {volume: 3}); 
      this.musicaCreditos = this.sound.add('musicaCreditos', {volume: 0.5}); 
      
      // Recupera as configurações de volume do armazenamento local
      const volumeAtual = localStorage.getItem('volumeAtual') ? parseFloat(localStorage.getItem('volumeAtual')) : 0.5;
      this.mutado = localStorage.getItem('mutado') === 'true';
      
      // Aplica as configurações de volume
      this.musicaCreditos.setVolume(volumeAtual);
      this.musicaCreditos.setMute(this.mutado);
      this.botaoSom.setVolume(volumeAtual);
      this.botaoSom.setMute(this.mutado);
      
      // Só toca a música se não estiver mutado
      if (!this.mutado) {
        this.musicaCreditos.play();
        console.log('Música de fundo iniciada, volume:', volumeAtual, 'mutado:', this.mutado);
      } else {
        console.log('Som está mutado, música não será tocada');
      }
  
      // Recalcula as dimensões responsivas
      this.calcularDimensoes();
  
      // Adiciona o fundo
      this.fundo = this.add.image(this.centroX, this.centroY, "fundoC").setScale(this.escalaFundo);
      
      // Adiciona o botão de voltar no canto superior esquerdo
      this.btnSeta = this.add.image(
        100 * this.escalaBotoes, // Posição X: afastado da borda esquerda
        80 * this.escalaBotoes,   // Posição Y: afastado da borda superior
        "btnSeta"
      )
      .setScale(this.escalaBotoes * 0.5) // Reduzindo em 50% o tamanho da seta
      .setFlipX(true); // Espelha a imagem horizontalmente para que a seta aponte para a esquerda
  
      // Configura a interatividade dos botões
      this.btnSeta.setInteractive();
  
      // Configura os eventos de clique
      this.btnSeta.on('pointerdown', () => {
        // Toca o som do botão apenas se não estiver mutado
        if (!this.mutado) {
          this.botaoSom.play();
        }
        
        this.musicaCreditos.stop();
        if (!this.isPaused) {
          console.log('voltar');
          this.scene.stop('Creditos');
          this.scene.start('Menu');
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
        this.textoOrientacao.setFontSize(Math.max(24, Math.floor(40 * this.escalaTexto)) + "px");
  
        // Atualiza a caixa de texto
        const textWidth = Math.min(this.largura * 0.8, 500);
        const textHeight = 160;
        this.caixaTexto.setPosition(this.centroX, this.centroY);
        this.caixaTexto.setSize(textWidth + 40, textHeight);
      }
    }
  
    // Método para atualizar a cena completamente quando a orientação mudar
    atualizarCena() {
      if (!this.fundo || !this.btnSeta) return;
      
      // Recalcular dimensões
      this.calcularDimensoes();
  
      // Atualizar fundo
      this.fundo.setPosition(this.centroX, this.centroY);
      this.fundo.setScale(this.escalaFundo);

      // Atualizar botão seta para o canto superior esquerdo
      this.btnSeta.setPosition(
        100 * this.escalaBotoes,  // Posição X à esquerda
        80 * this.escalaBotoes    // Posição Y no topo
      );
      this.btnSeta.setScale(this.escalaBotoes * 0.5);
      this.btnSeta.setFlipX(true); // Garantir que a seta continue espelhada após redimensionamento
    }
  
    update() {
      // Verifica orientação a cada frame
      this.verificarOrientacao();
      
      // Verifica o estado de áudio a cada frame para pegar mudanças de outras cenas
      this.verificarEstadoAudio();
    }
   
    // Método para limpar ao sair da cena
    shutdown() {
      // Remove os event listeners
      window.removeEventListener("resize", this.handleResize.bind(this));
      window.removeEventListener("orientationchange", () => {});
      
      // Para a música se estiver tocando
      if (this.musicaCreditos) {
        this.musicaCreditos.stop();
      }
    }

    // Método para verificar e atualizar o estado de áudio
    verificarEstadoAudio() {
      // Atualiza o estado de mudo com base no localStorage
      this.mutado = localStorage.getItem('mutado') === 'true';
      
      if (this.musicaCreditos) {
        this.musicaCreditos.setMute(this.mutado);
        
        // Pausa ou reinicia a música dependendo do estado
        if (this.mutado && this.musicaCreditos.isPlaying) {
          this.musicaCreditos.pause();
        } else if (!this.mutado && !this.musicaCreditos.isPlaying) {
          this.musicaCreditos.resume();
        }
      }
      
      if (this.botaoSom) {
        this.botaoSom.setMute(this.mutado);
      }
    }
  }
