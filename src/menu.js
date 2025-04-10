class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
    this.calcularDimensoes(); // Inicializa as dimensões
    this.fundo; // Referência ao fundo
    this.logo; // Referência ao logo
    this.btnJogar; // Referência ao botão jogar
    this.btnCreditos; // Referência ao botão créditos
    this.isPaused = false; // Controle de pausa
    this.overlay; // Overlay escuro
    this.textoOrientacao; // Texto de orientação
    this.caixaTexto; // Caixa de texto
    this.orientacaoCorreta = true; // Estado da orientação
    this.botaoSom; // Som do botão
    this.musicaInicio; // Música de fundo 
    this.bigode = null; // Referência ao bigode
    // Referência aos tempos que determinam as equações de deslocamento
    this.tX = 0;
    this.tY = 0;
    // Referência a posição do bigode
    this.bigodeX = 0;
    this.bigodeY = 0;
    // Variáveis para controlar o tempo do movimento
    this.inicioMovimento = null; // Tempo quando o movimento começa
    this.tempoTotal = 0; // Tempo total que o bigode leva para se mover
    
    // Reseta a animação do bigode sempre que a classe é instanciada (página é carregada)
    this.resetarAnimacaoBigode();
  }

  // Método para resetar a animação do bigode
  resetarAnimacaoBigode() {
    localStorage.removeItem('bigodeAnimado');
    console.log("Animação do bigode resetada!");
  }

  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.bigodeX = this.largura - (this.largura + 50);
    this.bigodeY = this.altura / 2;
    this.centroX = this.largura / 2;
    this.centroY = this.altura / 2;
    this.escalaFundo = Math.max(0.5, Math.min(0.7, this.largura / 2000)); // Escala responsiva para o fundo
    this.escalaLogo = Math.max(0.8, Math.min(1.3, this.largura / 1200)); // Escala responsiva para o logo
    this.escalaBotoes = Math.max(0.5, Math.min(0.7, this.largura / 1500)); // Escala responsiva para os botões
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
  }

  preload() {
    this.load.image("fundoM", "../assets/backgroundMenu.png");
    this.load.image("btnJogar", "../assets/jogar.png");
    this.load.image("btnCreditos", "../assets/creditos.png");
    this.load.image("logo", "../assets/logo.png");
    // Carrega a fonte personalizada se ainda não estiver carregada
    this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
    // Carrega o som do botão
    this.load.audio('botaoSom', '../assets/botaosom.mp3');
    // Carrega a música de fundo
    this.load.audio('musicaInicio', '../assets/musicavacationwmycat.mp3');

    // Carrega a imagem do bigode
    this.load.image("bigode", "../assets/bigode.png");

    this.load.audio("botaomenu", "../assets/botaomenu.mp3");
    
    // Carrega as imagens para o botão de mutar
    this.load.image("btnMutarOn", "../assets/btnVolume.png");
    this.load.image("btnMutarOff", "../assets/btnVolume2.png");
    
    // Carrega o novo som para o botão de créditos
    this.load.audio("botaocreditos", "../assets/somBigode.mp3");
    
    // Tratando o carregamento do som com tratamento de erro
    this.load.on('loaderror', (fileObj) => {
        console.error('Erro ao carregar arquivo:', fileObj.key);
        
        // Se o erro for com algum dos sons, usaremos o som padrão como fallback
        if (fileObj.key === 'botaomenu' || fileObj.key === 'botaocreditos') {
            console.log('Usando som alternativo para o botão:', fileObj.key);
        }
    });
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
    this.musicaInicio = this.sound.add('musicaInicio', {volume: 0.5});
    
    // Recupera o estado de mudo do localStorage
    this.mutado = localStorage.getItem('mutado') === 'true';
    
    // Recupera o volume atual do localStorage
    const volumeAtual = localStorage.getItem('volumeAtual') ? 
      parseFloat(localStorage.getItem('volumeAtual')) : 0.5;
    
    // Aplica as configurações de volume
    this.musicaInicio.setVolume(volumeAtual);
    this.musicaInicio.setMute(this.mutado);
    this.botaoSom.setVolume(volumeAtual);
    this.botaoSom.setMute(this.mutado);

    // define as variáveis de controle para saber se o player passou qual fase
    // localStorage.setItem('nivel1Completo', 'false');
    // localStorage.setItem('nivel2Completo', 'false');
    // localStorage.setItem('nivel3Completo', 'false');
    // localStorage.setItem('nivel4Completo', 'false');
    // localStorage.setItem('nivel5Completo', 'false');
    
    // Adiciona o novo som do botão de menu
    try {
      this.botaomenuSom = this.sound.add("botaomenu", {volume: 3});
      this.botaomenuSom.setMute(this.mutado);
      this.botaomenuSom.setVolume(volumeAtual);
    } catch (error) {
      console.error("Erro ao criar o som botaomenu:", error);
      this.botaomenuSom = this.botaoSom; // Usa o som padrão como fallback
    }
    
    // Adiciona o novo som do botão de créditos
    try {
      this.botaocreditosSom = this.sound.add("botaocreditos", {volume: 3});
      this.botaocreditosSom.setMute(this.mutado);
      this.botaocreditosSom.setVolume(volumeAtual);
      console.log("Som de créditos criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar o som botaocreditos:", error);
      this.botaocreditosSom = this.botaoSom; // Usa o som padrão como fallback
    }
    
    // Toca a música de fundo apenas se não estiver mutado
    if (!this.mutado) {
      this.musicaInicio.play(); 
      console.log('Música de fundo iniciada'); 
    } else {
      console.log('Som está mutado, música não será tocada');
    }

    // Recalcula as dimensões responsivas
    this.calcularDimensoes();

    // Adiciona o fundo
    this.fundo = this.add.image(this.centroX, this.centroY, "fundoM").setScale(this.escalaFundo);

    // Adiciona o logo com posicionamento responsivo
    const logoY = Math.min(this.centroY - 150, this.altura * 0.3);
    this.logo = this.add.image(this.centroX, logoY, "logo").setScale(this.escalaLogo);

    // Adiciona o botão de jogar com posicionamento responsivo
    const btnJogarY = Math.min(this.centroY + 150, this.altura * 0.7);
    this.btnJogar = this.add.image(this.centroX, btnJogarY, "btnJogar").setScale(this.escalaBotoes);

    // Adiciona o botão de configurações acima do botão de créditos
    const btnCreditosX = Math.min(this.largura - 150, this.largura - this.largura * 0.15);
    const btnCreditosY = Math.min(this.altura - 80, this.altura - this.altura * 0.1);
    

    

    // Adiciona o botão de créditos com posicionamento responsivo (já existente)
    this.btnCreditos = this.add.image(btnCreditosX, btnCreditosY, "btnCreditos").setScale(this.escalaBotoes);

    // Adiciona o botão de mutar no canto superior direito
    const btnMutarX = this.largura - 50;
    const btnMutarY = 50;
    const imagemMutar = this.mutado ? "btnMutarOff" : "btnMutarOn";
    this.btnMutar = this.add.image(btnMutarX, btnMutarY, imagemMutar)
        .setScale(this.escalaBotoes * 0.5)
        .setInteractive();
    
    // Adiciona o bigode
    this.bigode = this.add.image(this.bigodeX, this.bigodeY, "bigode").setScale(0.1 * this.escalaLogo);

    // Verifica se a animação já foi realizada anteriormente
    const bigodeAnimado = localStorage.getItem('bigodeAnimado') === 'true';
    if (bigodeAnimado) {
      // Posiciona o bigode diretamente na posição final
      this.bigodeXFinal = this.logo.x - 135 * this.escalaLogo;
      this.bigodeYFinal = this.logo.y + 35 * this.escalaLogo;
      this.bigode.setPosition(this.bigodeXFinal, this.bigodeYFinal);
      // Não precisa iniciar a animação
      this.inicioMovimento = null;
      this.tFinal = true; // Marca como já finalizado
    }

    // Configura a interatividade dos botões
    this.btnJogar.setInteractive();
    this.btnCreditos.setInteractive();

    // Adiciona evento de clique para o botão de mutar
    this.btnMutar.on('pointerdown', () => {
      // Inverte o estado de mudo
      this.mutado = !this.mutado;
      
      // Atualiza o ícone do botão
      this.btnMutar.setTexture(this.mutado ? "btnMutarOff" : "btnMutarOn");
      
      // Pausa ou retoma todos os sons dependendo do estado
      if (this.mutado) {
        // Para todos os sons no jogo
        this.sound.pauseAll();
        // Reproduz apenas o som do botão para feedback imediato
        this.botaoSom.play();
      } else {
        // Retoma todos os sons
        this.sound.resumeAll();
      }
      
      // Salva as configurações no localStorage
      localStorage.setItem('mutado', this.mutado);
    });

    // Configura os eventos de clique
    this.btnJogar.on('pointerdown', () => {
      // Toca o som apenas se não estiver mutado
      if (!this.mutado) {
        this.botaoSom.play();
      }
        
      if (!this.isPaused) {
        console.log('Jogar');
        this.scene.start('SelecaoDeLevel', { musicaInicio: this.musicaInicio });
      }
    });
    this.btnCreditos.on('pointerdown', () => {
      if (!this.isPaused) {
        console.log('Creditos - tentando tocar som personalizado');
        try {
          // Toca o som específico para o botão de créditos apenas se não estiver mutado
          if (!this.mutado) {
            this.botaocreditosSom.play();
            console.log('Som de créditos reproduzido');
          }
        } catch (error) {
          console.error("Erro ao tocar som de créditos:", error);
          // Se falhar, toca o som padrão apenas se não estiver mutado
          if (!this.mutado) {
            this.botaoSom.play(); 
            console.log('Usando som padrão como fallback');
          }
        }
        
        // Adiciona um pequeno atraso para permitir que o som seja reproduzido
        this.time.delayedCall(200, () => {
          this.musicaInicio.stop();
          this.scene.start('Creditos', { musicaCreditos: this.musicaCreditos });
        });
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

    // Atualiza posição dos botões
    const centroX = this.cameras.main.width / 2;
    const centroY = this.cameras.main.height / 2;
    
    // Atualizar botão créditos (existente)
    const btnCreditosX = Math.min(this.largura - 150, this.largura - this.largura * 0.15);
    const btnCreditosY = Math.min(this.altura - 80, this.altura - this.altura * 0.1);
    this.btnCreditos.setPosition(btnCreditosX, btnCreditosY);
    this.btnCreditos.setScale(this.escalaBotoes);
    
    // Atualizar botão configurações


    if (this.txtConfig) {
        this.txtConfig.setPosition(btnCreditosX, btnConfigY);
        this.txtConfig.setFontSize(Math.floor(16 * this.escalaTexto) + "px");
    }

    // Atualizar posição do botão de mutar
    if (this.btnMutar) {
      const btnMutarX = this.largura - 50;
      const btnMutarY = 50;
      this.btnMutar.setPosition(btnMutarX, btnMutarY);
      this.btnMutar.setScale(this.escalaBotoes * 0.5);
    }
  }

  // Método para atualizar a cena completamente quando a orientação mudar
  atualizarCena() {
    // Recalcular dimensões
    this.calcularDimensoes();

    // Atualizar fundo
    this.fundo.setPosition(this.centroX, this.centroY);
    this.fundo.setScale(this.escalaFundo);

    // Atualizar logo
    const logoY = Math.min(this.centroY - 150, this.altura * 0.3);
    this.logo.setPosition(this.centroX, logoY);
    this.logo.setScale(this.escalaLogo);

    // Atualizar botão jogar
    const btnJogarY = Math.min(this.centroY + 150, this.altura * 0.7);
    this.btnJogar.setPosition(this.centroX, btnJogarY);
    this.btnJogar.setScale(this.escalaBotoes);

    // Atualizar botão créditos
    const btnCreditosX = Math.min(this.largura - 150, this.largura - this.largura * 0.15);
    const btnCreditosY = Math.min(this.altura - 80, this.altura - this.altura * 0.1);
    this.btnCreditos.setPosition(btnCreditosX, btnCreditosY);
    this.btnCreditos.setScale(this.escalaBotoes);
    
    // Atualizar botão configurações
    if (this.txtConfig) {
        this.txtConfig.setPosition(btnCreditosX, btnConfigY);
    }

    // Atualizar botão de mutar
    if (this.btnMutar) {
      const btnMutarX = this.largura - 50;
      const btnMutarY = 50;
      this.btnMutar.setPosition(btnMutarX, btnMutarY);
      this.btnMutar.setScale(this.escalaBotoes * 0.5);
    }
  }

  // Adicione um método para verificar e atualizar o estado de áudio
  verificarEstadoAudio() {
    // Atualiza o estado de mudo com base no localStorage
    const novoEstadoMutado = localStorage.getItem('mutado') === 'true';
    
    // Se o estado mudou, atualize todos os sons
    if (novoEstadoMutado !== this.mutado) {
      this.mutado = novoEstadoMutado;
      
      // Atualiza todos os sons
      if (this.musicaInicio) {
        this.musicaInicio.setMute(this.mutado);
        
        // Pausa ou reinicia a música dependendo do estado
        if (this.mutado && this.musicaInicio.isPlaying) {
          this.musicaInicio.pause();
        } else if (!this.mutado && !this.musicaInicio.isPlaying) {
          this.musicaInicio.resume();
        }
      }
      
      if (this.botaoSom) {
        this.botaoSom.setMute(this.mutado);
      }
      
      if (this.botaomenuSom) {
        this.botaomenuSom.setMute(this.mutado);
      }
      
      if (this.botaocreditosSom) {
        this.botaocreditosSom.setMute(this.mutado);
      }
    }
  }

  update() {
    // Verifica orientação a cada frame
    this.verificarOrientacao();
    
    // Verifica o estado de áudio a cada frame para pegar mudanças de outras cenas
    this.verificarEstadoAudio();

    // Verifica se a animação já foi executada anteriormente
    const bigodeAnimado = localStorage.getItem('bigodeAnimado') === 'true';

    // Se o bigode já foi animado anteriormente, posicione-o diretamente na posição final
    if (bigodeAnimado) {
      if (this.bigode) {
        // Define a posição final do bigode diretamente
        this.bigodeXFinal = this.logo.x - 135 * this.escalaLogo;
        this.bigodeYFinal = this.logo.y + 35 * this.escalaLogo;
        this.bigode.setPosition(this.bigodeXFinal, this.bigodeYFinal);
      }
      return; // Sai da função update sem executar a animação
    }

    // Inicia a contagem do tempo se ainda não foi iniciado
    if (!this.inicioMovimento) {
      this.inicioMovimento = this.time.now; // Registra o tempo atual
    }

    if (this.inicioMovimento) {
      // Calcula o tempo decorrido em segundos desde o início do movimento
      this.t = (this.time.now - this.inicioMovimento) / 1000
      if (!this.tFinal) {
        console.log('Tempo:', this.t)
      }    
    }
    
    // Define a posição final do bigode, ajustada conforme o tamanho da tela do dispositivo
    this.bigodeXFinal = this.logo.x - 135 * this.escalaLogo;
    this.bigodeYFinal = this.logo.y + 35 * this.escalaLogo;

    // Chama a função de deslocamento acelerado horizontal do bigode até que ele esteja na posição final
    if (this.bigodeX <= this.bigodeXFinal) {
      // Movimento horizontal progressivo: v * t + a * t²
      this.bigodeX += 2 * this.t + 0.5 * this.t * this.t; 
      // Calcula a velocidade a cada frame
      this.velocidadeX = 0.5 + 0.5 * this.t;
      // Mostra no console a acelaração, a velocidade em cada frame e a posição no eixo X do bigode
      console.log("Aceleração: " + 0.5, "| Velocidade: " + this.velocidadeX.toFixed(2), "| Posição: " + this.bigodeX.toFixed(2), "(MUV)");
    }

    // Chama a função de deslocamento uniforme vertical do bigode até que ele esteja na posição final
    if (this.bigodeY >= this.bigodeYFinal) {
      this.bigodeY -= 0.8 * this.t; // Movimento vertical regressivo: -v * t
      // Mostra no console a velocidade e a posição no eixo Y do bigode
      console.log("Velocidade: " + -0.75, "| Posição: " + this.bigodeY.toFixed(2), "(MU)");
    }
    
    if (this.bigodeY >= this.bigodeYFinal || this.bigodeX <= this.bigodeXFinal) {
      // Atualiza a posição do bigode conforme as equações de deslocamento enquanto não está na posição final
      this.bigode.setPosition(this.bigodeX, this.bigodeY);
    } else {
      // Registra e mostra no console o tempo total que durou o movimento
      if (!this.tFinal) {
        this.tFinal = this.time.now;
        this.tTotal = (this.tFinal - this.inicioMovimento) / 1000
        console.log("Tempo total: " + this.tTotal);
        
        // Marca a animação como concluída no localStorage
        localStorage.setItem('bigodeAnimado', 'true');
      } 
    }
  }

  // Método para limpar ao sair da cena
  shutdown() {
    // Remove os event listeners
    window.removeEventListener("resize", this.handleResize.bind(this));
    window.removeEventListener("orientationchange", () => {});
  }
}
