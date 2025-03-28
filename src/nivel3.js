class Nivel3 extends Phaser.Scene {
  constructor() {
    super('Nivel3');
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
    this.chocalho; // Variável para o barulho da bata se mechendo


  }

  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.tamanhoPata = Math.min(0.0001673 * this.largura + 0.1, 0.25); // Limita o tamanho máximo
    this.vel = Math.min(10, Math.max(6, this.largura / 300)); // Velocidade aumentada
    this.centroX = this.largura / 2; // Centro da tela no eixo X
    this.centroY = this.altura / 2; // Centro da tela no eixo Y
    this.marginX = Math.min(100, this.largura * 0.1); // Margem horizontal para movimento
    this.marginY = Math.min(100, this.altura * 0.1); // Margem vertical para movimento
    this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
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
    this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
    // Carrega o som de clique 
    this.load.audio('tim', '../assets/sons/tim.mp3'); 
    // Carrega o som do botão 
    this.load.audio('botaoSom', '../assets/botaosom.mp3'); 
     // Carrega o som da pata se mechendo
     this.load.audio('chocalho', '../assets/chocalho.mp3');

  
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

    // Adiciona os sons
    this.tim = this.sound.add("tim");
    this.botaoSom = this.sound.add("botaoSom");
    this.chocalho = this.sound.add("chocalho", {rate:1});


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

    // Adiciona a pata com posicionamento responsivo
    const pataX = this.marginX;
    const pataY = this.centroY;
    this.pata = this.add.image(pataX, pataY, "pata")
      .setScale(this.tamanhoPata);
    this.pata.vertical = true;
    this.pata.ida = true; // Direção inicial no eixo X
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
      this.botaoSom.play();  
      if (!this.isPaused && this.contadorClique < 5) {
        // Volta a movimentar a pata e esconde o círculo/botão
        this.pataMovendo = true;
        this.pataClicavel = true;
        this.pata.setInteractive();
        this.circuloRecompensa.setAlpha(0);
        this.botaoContinuar.setAlpha(0);
        this.botaoContinuar.disableInteractive();
        if (!this.chocalho.isPlaying) {
          this.chocalho.play();
        }
        
        // Atualiza o texto tutorial
        if (this.textoTutorial) {
          this.textoTutorial.destroy();
        }
        
        // Se o contador for menor que 1, exibe o texto tutorial
        if (this.contadorClique < 1) {
          this.textoTutorial1();
        }
      } else if (!this.isPaused && this.contadorClique >= 5) {
        // Remove os event listeners antes de sair da cena
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('orientationchange', () => {});
        this.scene.start('SelecaoDeLevel');
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
        
        // Posiciona e mostra o círculo de recompensa
        this.circuloRecompensa.x = this.pata.x;
        this.circuloRecompensa.y = this.pata.y;
        this.circuloRecompensa.setAlpha(0.5);
        
        // Mostra o botão de continuar e o habilita
        this.botaoContinuar.setAlpha(1);
        this.botaoContinuar.setInteractive();
        
        this.tim.play(); 
    
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
    });
    
    // Adiciona o contador visual com tamanho responsivo
    const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
    this.textoContador = this.add.text(
      Math.max(10, this.largura * 0.02), 
      Math.max(10, this.altura * 0.02), 
      this.contadorClique + "/5", 
      {
        fontFamily: 'Planes_ValMore',
        fontSize: tamanhoFonte + 'px',
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 5, y: 3 }
      }
    );

    // Adiciona o texto tutorial inicial
    this.textoTutorial1();
    
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

  // Funções para exibir os textos tutoriais com tamanho responsivo
  textoTutorial1() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1, // Posicionamento responsivo
      "Nível 3: Tente fazer seu gato clicar na pata em movimento! (5 cliques)",
      {
        fontFamily: 'Planes_ValMore', 
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + 'px', 
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(1);
  }
  
  textoTutorial2() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1, // Posicionamento responsivo
      "Coloque a recompensa no círculo e depois clique no botão para continuar.",
      {
        fontFamily: 'Planes_ValMore', 
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + 'px', 
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(1);
  }
  
  textoTutorial3() {
    this.textoTutorial = this.add.text(
      this.centroX,
      this.altura * 0.1, // Posicionamento responsivo
      "Parabéns! Você completou o nível 3!\nColoque a recompensa no círculo e depois clique no botão para continuar.",
      {
        fontFamily: 'Planes_ValMore', 
        fontSize: Math.max(20, Math.floor(35 * this.escalaTexto)) + 'px', 
        fill: "#ffffff",
        backgroundColor: "#2f996e",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.largura * 0.8 }
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(1);
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
    this.textoContador.setFontSize(tamanhoFonte + 'px');
    
    // Recriar o texto tutorial
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
      if (this.contadorClique === 5) {
        this.textoTutorial3();
      } else if (this.pataMovendo && this.contadorClique < 1) {
        this.textoTutorial1();
      } else if (!this.pataMovendo) {
        this.textoTutorial2();
      }
    }
  }

  update() {
    // Verifica orientação a cada frame
    this.verificarOrientacao();
    
    // Se o jogo estiver pausado, não atualiza a lógica do jogo
    if (this.isPaused) {
      return;
    }
    
    // Se a pata não deve se mover, sai da função
    if (!this.pataMovendo) {
      return;
    }

    // Movimentação da pata no eixo X com if ternário e limites responsivos
    this.pata.ida = this.pata.x <= this.marginX ? true : 
                    this.pata.x >= this.largura - this.marginX ? false : 
                    this.pata.ida;
    this.pata.x += this.pata.ida ? this.vel : -this.vel;

    // Movimentação da pata no eixo Y com if ternário e limites responsivos
    this.pata.vertical = this.pata.y <= this.marginY ? true : 
                         this.pata.y >= this.altura - this.marginY ? false : 
                         this.pata.vertical;
    this.pata.y += this.pata.vertical ? this.vel : -this.vel;
  }

  // Função de evento acionada ao atingir 5 cliques
  pontuacaoMaxima() {
    // Desativa os cliques na pata
    this.pataClicavel = false;
    this.pata.disableInteractive();
    
    // Remove o texto tutorial se existir
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
    }
    
    // Exibe a mensagem de conclusão
    this.textoTutorial3();
    
    // Posiciona o círculo de recompensa na última posição da pata
    this.circuloRecompensa.x = this.pata.x;
    this.circuloRecompensa.y = this.pata.y;
    
    // Mostra o círculo de recompensa e o botão continuar
    this.circuloRecompensa.setAlpha(0.5);
    this.botaoContinuar.setAlpha(1);
    this.botaoContinuar.setInteractive();
  }
}
