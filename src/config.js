class Configuracoes extends Phaser.Scene {
  constructor() {
    super("Configuracoes");
    
    // Variáveis para guardar elementos da interface
    this.textoTitulo = null;       // Texto "Configurações"
    this.btnVoltar = null;         // Botão de voltar
    this.btnMutar = null;          // Botão de mutar/desmutar
    this.fundoTela = null;         // Imagem de fundo
    this.logoDrPet = null;         // Logo do Dr Pet
    
    // Variáveis para armazenar informações do áudio
    this.volumeAtual = 0.5;        // Volume atual (entre 0 e 1)
    this.mutado = false;           // Estado do áudio (mutado ou não)
    this.musicaAnterior = null;    // Armazena a música da cena anterior
    
    // Dimensões e escalas responsivas
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.centroX = this.largura / 2;
    this.centroY = this.altura / 2;

    this.musicaConfig;
  }
  
  // Método para calcular dimensões responsivas
  calcularDimensoes() {
    this.largura = window.innerWidth;
    this.altura = window.innerHeight;
    this.centroX = this.largura / 2;
    this.centroY = this.altura / 2;
    this.escalaFundo = Math.max(0.5, Math.min(0.7, this.largura / 2000));
    this.escalaTexto = Math.min(this.largura / 1280, 1);
    this.escalaBotoes = Math.max(0.5, Math.min(0.7, this.largura / 1500));
    // Aumentando a escala da logo para ficar maior
    this.escalaLogo = Math.max(0.5, Math.min(0.8, this.largura / 1200));
  }

  // Método para carregar os assets necessários
  preload() {
    // Carrega as imagens necessárias
    this.load.image("fundoConfig", "../assets/backgroundMenu.png");
    this.load.image("btnVoltar", "../assets/btnSeta.png");
    this.load.image("btnMutarOn", "../assets/btnVolume.png");
    this.load.image("btnMutarOff", "../assets/btnVolume2.png");
    this.load.image("logoDrPet", "../assets/logoDrPet.png");
    this.load.audio("musicaConfig", "../assets/musica-plimplim.mp3");
    
    // Carrega a fonte personalizada
    this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
    
    // Carrega o som do botão
    this.load.audio('botaoSom', '../assets/botaosom.mp3');
  }

  // Método que inicializa a cena
  create(data) {
    // Verifica se há configurações salvas no localStorage
    const mutadoSalvo = localStorage.getItem('mutado');
    if (mutadoSalvo !== null) {
      // Converte a string "true" ou "false" para um booleano real
      this.mutado = mutadoSalvo === 'true';
    }

    // Cria e configura a música
    this.musicaConfig = this.sound.add("musicaConfig", {
      loop: true,
      volume: this.volumeAtual
    });

    // Aplica o estado de mudo à música se necessário
    if (this.mutado) {
      this.musicaConfig.setMute(true);
    } else {
      this.musicaConfig.play();
    }
    
    // Salva a música da cena anterior se existir
    if (data && data.musicaAtual) {
      this.musicaAnterior = data.musicaAtual;
      this.volumeAtual = this.musicaAnterior.volume;
      // Prioriza o estado de mudo salvo no localStorage sobre o estado da música anterior
      if (mutadoSalvo === null) {
        this.mutado = this.musicaAnterior.mute;
      }
    }
    
    // Cria o som do botão
    this.botaoSom = this.sound.add('botaoSom'); 
    
    // Calcula as dimensões responsivas
    this.calcularDimensoes();
    
    // Adiciona o fundo
    this.fundoTela = this.add.image(this.centroX, this.centroY, "fundoConfig").setScale(this.escalaFundo);
    
    // Cria um retângulo semi-transparente para melhorar a visibilidade dos elementos
    this.overlay = this.add.rectangle(this.centroX, this.centroY, this.largura * 0.8, this.altura * 0.7, 0x000000, 0.9);
    this.overlay.setOrigin(0.5);
    
    // Adiciona o texto "Configurações"
    this.textoTitulo = this.add.text(this.centroX, this.altura * 0.2, "CONFIGURAÇÕES", {
      fontFamily: "Planes_ValMore",
      fontSize: Math.floor(48 * this.escalaTexto) + "px",
      fill: "#ffffff",
      stroke: "#ff9501",
      strokeThickness: 4
    });
    this.textoTitulo.setOrigin(0.5);
    
    // Adiciona o botão de voltar com tamanho reduzido e invertido horizontalmente
    this.btnVoltar = this.add.image(100, 100, "btnVoltar")
      .setScale(this.escalaBotoes * 0.35)
      .setFlipX(true);
    this.btnVoltar.setInteractive();
    
    // Adiciona o botão de mutar com o sprite correto baseado no estado atual
    const imagemMutar = this.mutado ? "btnMutarOff" : "btnMutarOn";
    this.btnMutar = this.add.image(this.centroX - 150, this.centroY, imagemMutar)
      .setScale(this.escalaBotoes * 0.7);
    this.btnMutar.setInteractive();
    
    // Adiciona a logo do Dr Pet no lugar onde estava o slider, com tamanho aumentado
    this.logoDrPet = this.add.image(this.centroX + 150, this.centroY, "logoDrPet")
      .setScale(this.escalaLogo * 1.2); // Multiplicador adicional para aumentar o tamanho da logo
    
    // Configura eventos de interatividade dos botões
    
    // Botão voltar
    this.btnVoltar.on('pointerdown', () => {
      if (!this.mutado) {
        this.botaoSom.play();
      }
      this.musicaConfig.stop();
      this.scene.start('Menu', { musicaInicio: this.musicaAnterior });
    });
    
    // Botão mutar
    this.btnMutar.on('pointerdown', () => {
      this.botaoSom.play();
      this.mutado = !this.mutado;
      
      // Atualiza o ícone do botão
      this.btnMutar.setTexture(this.mutado ? "btnMutarOff" : "btnMutarOn");
      
      // Pausa ou retoma todos os sons dependendo do estado do mudo
      if (this.mutado) {
        // Para todos os sons no jogo
        this.sound.pauseAll();
        // Reproduz apenas o som do botão para feedback imediato
        this.botaoSom.play();
      } else {
        // Retoma todos os sons
        this.sound.resumeAll();
      }
      
      // Atualiza o estado de mute na música anterior (caso volte para a cena anterior)
      if (this.musicaAnterior) {
        this.musicaAnterior.setMute(this.mutado);
      }
      
      // Salva as configurações no localStorage
      localStorage.setItem('mutado', this.mutado);
    });
    
    // Adiciona listener para redimensionamento da tela
    window.addEventListener("resize", this.handleResize.bind(this));
  }
  
  // Método para lidar com o redimensionamento da tela
  handleResize() {
    // Recalcula as dimensões
    this.calcularDimensoes();
    
    // Atualiza o posicionamento e escala dos elementos
    this.fundoTela.setPosition(this.centroX, this.centroY);
    this.fundoTela.setScale(this.escalaFundo);
    
    this.overlay.setPosition(this.centroX, this.centroY);
    this.overlay.setSize(this.largura * 0.8, this.altura * 0.7);
    
    this.textoTitulo.setPosition(this.centroX, this.altura * 0.2);
    this.textoTitulo.setFontSize(Math.floor(48 * this.escalaTexto) + "px");
    
    this.btnVoltar.setScale(this.escalaBotoes * 0.35);
    this.btnMutar.setPosition(this.centroX - 150, this.centroY);
    this.btnMutar.setScale(this.escalaBotoes * 0.7);
    
    // Atualiza posição e escala da logo com o tamanho aumentado
    this.logoDrPet.setPosition(this.centroX + 150, this.centroY);
    this.logoDrPet.setScale(this.escalaLogo * 1.2); // Mantém o multiplicador no resize
  }
  
  // Método de atualização contínua
  update() {
    // Nada a ser atualizado constantemente nesta cena
  }
  
  // Método para limpar ao sair da cena
  shutdown() {
    // Remove os event listeners
    window.removeEventListener("resize", this.handleResize.bind(this));
    
    // Garante que a música pare ao sair da cena
    if (this.musicaConfig) {
      this.musicaConfig.stop();
    }
  }
}