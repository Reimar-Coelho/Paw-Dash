class SelecaoDeLevel extends Phaser.Scene {
  constructor() {
    super('SelecaoDeLevel');
    this.calcularDimensoes(); // Inicializa as dimensões
    this.fundo; // Referência ao fundo
    this.niveis = []; // Array para armazenar os botões de níveis
    this.isPaused = false; // Controle de pausa
    this.overlay; // Overlay escuro
    this.textoOrientacao; // Texto de orientação
    this.caixaTexto; // Caixa de texto
    this.orientacaoCorreta = true; // Estado da orientação
    this.botaoSom; // Som do botão 
    this.musicaInicio; // Música de fundo
    this.nivelSom; // Som de prato para os níveis
    this.btnSeta; // Botão de voltar
  }

  init(data) {
    this.musicaInicio = data.musicaInicio;
  }

  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.centroX = this.largura / 2;
    this.centroY = this.altura / 2;
    this.escalaFundo = Math.max(0.4, Math.min(0.6, this.largura / 2000)); // Escala responsiva para o fundo
    this.escalaNiveis = Math.max(0.08, Math.min(0.15, this.largura / 1200)); // Escala responsiva para os ícones
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
    this.escalaBotoes = Math.max(0.5, Math.min(0.7, this.largura / 2000)); // Escala responsiva para botões
    // Calcular espaçamento horizontal entre potes
    this.espacamentoNiveis = Math.min(200, this.largura * 0.15);
  }

  preload() {
    this.load.image('fundoL', '../assets/backgroundTelaNiveis.png'); 
    this.load.image('nivel1', '../assets/PoteCheio1.png');
    this.load.image('nivel2', '../assets/PoteCheio2.png');
    this.load.image('nivel3', '../assets/PoteCheio3.png');
    this.load.image('nivel4', '../assets/PoteCheio4.png');
    this.load.image('nivel5', '../assets/PoteCheio5.png');
    this.load.image('nivel1T', '../assets/PoteCheio1T.png');
    this.load.image('nivel2T', '../assets/PoteCheio2T.png');
    this.load.image('nivel3T', '../assets/PoteCheio3T.png');
    this.load.image('nivel4T', '../assets/PoteCheio4T.png');
    this.load.image('nivel5T', '../assets/PoteCheio5T.png');
    this.load.image('btnSeta', '../assets/btnSeta.png'); // Carrega a imagem da seta
    // Carrega a fonte personalizada
    this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
    // Carrega o som do botão 
    this.load.audio('botaoSom', '../assets/botaosom.mp3'); 
    // Carrega o som do botão de níveis
    this.load.audio('nivelSom', '../assets/sons/prato.mp3');
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
        fontFamily: 'Planes_ValMore',
        fontSize: Math.max(24, Math.floor(40 * this.escalaTexto)) + 'px',
        fill: "#ff0000",
        align: 'center',
        fontWeight: 'bold',
        padding: { x: 20, y: 10 }
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
    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS ||
        this.sys.game.device.os.windowsPhone) {
      
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
    // Recupera o estado de mudo do localStorage
    this.mutado = localStorage.getItem('mutado') === 'true';
    
    // Recupera o volume atual do localStorage
    const volumeAtual = localStorage.getItem('volumeAtual') ? 
      parseFloat(localStorage.getItem('volumeAtual')) : 0.5;

    // cria os sons 
    this.botaoSom = this.sound.add("botaoSom"); 
    this.nivelSom = this.sound.add("nivelSom");
    
    // Aplica as configurações de volume
    this.botaoSom.setVolume(volumeAtual);
    this.nivelSom.setVolume(volumeAtual);
    
    // Aplica o estado de mudo
    this.botaoSom.setMute(this.mutado);
    this.nivelSom.setMute(this.mutado);

    // Recalcula as dimensões responsivas
    this.calcularDimensoes();

    // Adiciona o background responsivo
    this.fundo = this.add.image(this.centroX, this.centroY, 'fundoL')
      .setScale(this.escalaFundo);
      
    // Adiciona o botão de voltar no canto superior esquerdo
    this.btnSeta = this.add.image(
      100 * this.escalaBotoes, // Posição X: afastado da borda esquerda
      80 * this.escalaBotoes,   // Posição Y: afastado da borda superior
      "btnSeta"
    )
    .setScale(this.escalaBotoes * 0.5) // Reduzindo em 50% o tamanho da seta
    .setFlipX(true); // Espelha a imagem horizontalmente para que a seta aponte para a esquerda

    // Configura a interatividade do botão de voltar
    this.btnSeta.setInteractive();

    // Configura o evento de clique na seta
    this.btnSeta.on('pointerdown', () => {
      // Toca o som do botão apenas se não estiver mutado
      if (!this.mutado) {
        this.botaoSom.play();
      }
      
      if (!this.isPaused) {
        console.log('voltar para o menu');
        // Para a música se estiver tocando
        if (this.musicaInicio && this.musicaInicio.isPlaying) {
          this.musicaInicio.stop();
        }
        this.scene.stop('SelecaoDeLevel');
        this.scene.start('Menu');
      }
    });
    
    // Cria os botões dos níveis e os posiciona em uma curva tipo "arco" na base da tela
    const nomeNiveis = ['nivel1', 'nivel2', 'nivel3', 'nivel4', 'nivel5'];
    // Adiciona os níveis na versão "T" (Trancados para o jogador)
    const nomeNiveisT = ['nivel1T', 'nivel2T', 'nivel3T', 'nivel4T', 'nivel5T'];
    const cenaDestino = ['Nivel1', 'Nivel2', 'Nivel3', 'Nivel4', 'Nivel5'];

    // Verificar níveis completados no localStorage
    const niveisCompletados = [
      localStorage.getItem('nivel1Completo') === 'true',
      localStorage.getItem('nivel2Completo') === 'true',
      localStorage.getItem('nivel3Completo') === 'true',
      localStorage.getItem('nivel4Completo') === 'true',
      localStorage.getItem('nivel5Completo') === 'true'
    ];

    // Determinar quais níveis estão desbloqueados
    const niveisDesbloqueados = [
      true, // Nível 1 sempre desbloqueado
      niveisCompletados[0], // Nível 2 desbloqueado se nível 1 completo
      niveisCompletados[1], // Nível 3 desbloqueado se nível 2 completo
      niveisCompletados[2], // Nível 4 desbloqueado se nível 3 completo
      niveisCompletados[3]  // Nível 5 desbloqueado se nível 4 completo
    ];
    
    // Limpa os botões antigos, se existirem
    if (this.niveis.length > 0) {
      this.niveis.forEach(nivel => nivel.destroy());
      this.niveis = [];
    }
    
    // Posição inicial (à esquerda) e final dos níveis
    const offsetX = this.centroX - (this.espacamentoNiveis * 2);
    const basePosY = this.altura * 0.75; // Base Y é 75% da altura da tela
    
    // Ajuste da curvatura dos potes (mais baixo = mais curvo)
    const curvatura = Math.min(this.altura * 0.1, 50);
    
    // Cria e posiciona cada nível
    for (let i = 0; i < 5; i++) {
      // Calcula posições em um arco suave
      const x = offsetX + (this.espacamentoNiveis * i);
      
      // A curva é em formato de parábola para os potes ficarem em alturas diferentes
      const distanciaDoMeio = Math.abs(i - 2);
      const y = basePosY - (distanciaDoMeio * curvatura);
      
      // Decide se usa a imagem normal ou trancada
      const estaBloqueado = !niveisDesbloqueados[i];
      const imagemNivel = estaBloqueado ? nomeNiveisT[i] : nomeNiveis[i];
      
      const nivel = this.add.image(x, y, imagemNivel)
        .setScale(this.escalaNiveis)
        .setInteractive();
      
      // Adiciona evento de clique
      nivel.on('pointerdown', () => {
        if (this.isPaused) return;
        
        if (estaBloqueado) {
          // Nível bloqueado - adicionar apenas console.log e espaço para som futuro
          console.log(`Nível ${i+1} bloqueado`);
          // Espaço reservado para som de nível bloqueado
        } else {
          // Nível desbloqueado - tocar som apenas se não estiver mutado
          if (!this.mutado) {
            this.nivelSom.play();
          }
          
          if (this.musicaInicio && this.musicaInicio.isPlaying) {
            this.musicaInicio.stop(); // ou fadeOut se quiser
          }
          console.log(`nivel ${i+1}`);
          this.scene.start(cenaDestino[i]);
        }
      });
      
      // Adiciona efeito hover apenas para níveis desbloqueados
      nivel.on('pointerover', () => {
        if (!this.isPaused && !estaBloqueado) {
          nivel.setScale(this.escalaNiveis * 1.1);
        }
      });
      
      nivel.on('pointerout', () => {
        if (!this.isPaused) {
          nivel.setScale(this.escalaNiveis);
        }
      });
      
      // Armazena referência ao botão
      this.niveis.push(nivel);
    }
    
    // Criar overlay e aviso de orientação
    this.criarOverlayOrientacao();
    
    // Verificar orientação inicialmente
    this.verificarOrientacao();
    
    // Adiciona listener para redimensionamento da tela
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Adicionar listener específico para mudanças de orientação
    window.addEventListener('orientationchange', () => {
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
      this.textoOrientacao.setFontSize(Math.max(24, Math.floor(40 * this.escalaTexto)) + 'px');
      
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
    
    // Atualizar fundo
    this.fundo.setPosition(this.centroX, this.centroY);
    this.fundo.setScale(this.escalaFundo);
    
    // Atualizar botão seta para o canto superior esquerdo
    if (this.btnSeta) {
      this.btnSeta.setPosition(
        100 * this.escalaBotoes,  // Posição X à esquerda
        80 * this.escalaBotoes    // Posição Y no topo
      );
      this.btnSeta.setScale(this.escalaBotoes * 0.5);
      this.btnSeta.setFlipX(true); // Garantir que a seta continue espelhada após redimensionamento
    }
    
    // Posição inicial (à esquerda) e final dos níveis
    const offsetX = this.centroX - (this.espacamentoNiveis * 2);
    const basePosY = this.altura * 0.75; // Base Y é 75% da altura da tela
    
    // Ajuste da curvatura dos potes (mais baixo = mais curvo)
    const curvatura = Math.min(this.altura * 0.1, 50);
    
    // Atualizar posição dos botões de nível
    for (let i = 0; i < this.niveis.length; i++) {
      // Calcula posições em um arco suave
      const x = offsetX + (this.espacamentoNiveis * i);
      
      // A curva é em formato de parábola para os potes ficarem em alturas diferentes
      const distanciaDoMeio = Math.abs(i - 2);
      const y = basePosY - (distanciaDoMeio * curvatura);
      
      // Atualiza a posição
      this.niveis[i].setPosition(x, y);
      this.niveis[i].setScale(this.escalaNiveis);
    }
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
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', () => {});
  }

  // Adicione o método para verificar e atualizar o estado de áudio
  verificarEstadoAudio() {
    // Atualiza o estado de mudo com base no localStorage
    const novoEstadoMutado = localStorage.getItem('mutado') === 'true';
    
    // Se o estado mudou, atualize todos os sons
    if (novoEstadoMutado !== this.mutado) {
      this.mutado = novoEstadoMutado;
      
      // Atualiza todos os sons
      if (this.botaoSom) {
        this.botaoSom.setMute(this.mutado);
      }
      
      if (this.nivelSom) {
        this.nivelSom.setMute(this.mutado);
      }
      
      // Se a música de fundo ainda estiver disponível
      if (this.musicaInicio) {
        this.musicaInicio.setMute(this.mutado);
        
        // Se estiver mutado e a música estiver tocando, pause-a
        if (this.mutado && this.musicaInicio.isPlaying) {
          this.musicaInicio.pause();
        } 
        // Se não estiver mais mutado, retome a música
        else if (!this.mutado && !this.musicaInicio.isPlaying && this.musicaInicio.seek > 0) {
          this.musicaInicio.resume();
        }
      }
    }
  }
}