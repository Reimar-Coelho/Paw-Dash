class Configuracoes extends Phaser.Scene {
  constructor() {
    super("Configuracoes");
    
    // Variáveis para guardar elementos da interface
    this.textoTitulo = null;       // Texto "Configurações"
    this.btnVoltar = null;         // Botão de voltar
    this.btnMutar = null;          // Botão de mutar/desmutar
    this.sliderFundo = null;       // Fundo do slider (barra cinza)
    this.sliderControle = null;    // Controle do slider (círculo)
    this.sliderAtivo = false;      // Controle se o slider está sendo arrastado
    this.textoVolume = null;       // Texto que mostra o valor do volume
    this.fundoTela = null;         // Imagem de fundo
    
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
  }

  // Método para carregar os assets necessários
  preload() {
    // Carrega as imagens necessárias
    this.load.image("fundoConfig", "../assets/backgroundMenu.png");
    this.load.image("btnVoltar", "../assets/btnSeta.png");
    this.load.image("btnMutarOn", "../assets/btnVolume.png");
    this.load.image("btnMutarOff", "../assets/btnVolume2.png");
    this.load.image("sliderFundo", "../assets/slider_fundo.png");
    this.load.image("sliderControle", "../assets/a.png");
    this.load.audio("musicaConfig", "../assets/musica-plimplim.mp3");
    
    // Carrega a fonte personalizada
    this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
    
    // Carrega o som do botão
    this.load.audio('botaoSom', '../assets/botaosom.mp3');
  }

  // Método que inicializa a cena
  create(data) {
    // Correção: Use this.sound.add em vez de this.audio.add
    this.musicaConfig = this.sound.add("musicaConfig");
    this.musicaConfig.play();
    
    // Salva a música da cena anterior se existir
    if (data && data.musicaAtual) {
      this.musicaAnterior = data.musicaAtual;
      this.volumeAtual = this.musicaAnterior.volume;
      this.mutado = this.musicaAnterior.mute;
    }
    
    // Cria o som do botão
    this.botaoSom = this.sound.add('botaoSom'); 
    
    // Calcula as dimensões responsivas
    this.calcularDimensoes();
    
    // Adiciona o fundo
    this.fundoTela = this.add.image(this.centroX, this.centroY, "fundoConfig").setScale(this.escalaFundo);
    
    // Cria um retângulo semi-transparente para melhorar a visibilidade dos elementos
    this.overlay = this.add.rectangle(this.centroX, this.centroY, this.largura * 0.8, this.altura * 0.7, 0x000000, 0.7);
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
      .setScale(this.escalaBotoes * 0.35) // Reduz o tamanho para 35% da escala original (metade do original)
      .setFlipX(true); // Inverte horizontalmente para apontar para a esquerda
    this.btnVoltar.setInteractive();
    
    // Adiciona o botão de mutar
    const imagemMutar = this.mutado ? "btnMutarOff" : "btnMutarOn";
    this.btnMutar = this.add.image(this.centroX - 150, this.centroY, imagemMutar)
      .setScale(this.escalaBotoes * 0.7); // Reduzindo para 70% da escala original
    this.btnMutar.setInteractive();
    
    // Texto do volume
    this.textoVolume = this.add.text(this.centroX + 150, this.centroY - 50, "VOLUME: " + Math.floor(this.volumeAtual * 100) + "%", {
      fontFamily: "Planes_ValMore",
      fontSize: Math.floor(24 * this.escalaTexto) + "px",
      fill: "#ffffff"
    });
    this.textoVolume.setOrigin(0.5);
    
    // Adiciona o fundo do slider
    this.sliderFundo = this.add.image(this.centroX + 150, this.centroY, "sliderFundo").setScale(this.escalaBotoes, this.escalaBotoes * 0.5);
    this.sliderFundo.setInteractive();
    
    // Comprimento do slider
    const sliderLength = this.sliderFundo.displayWidth;
    
    // Posição inicial do controle do slider baseado no volume atual
    const posicaoInicialX = (this.sliderFundo.x - sliderLength/2) + (sliderLength * this.volumeAtual);
    
    // Adiciona o controle do slider
    this.sliderControle = this.add.image(posicaoInicialX, this.centroY, "sliderControle").setScale(this.escalaBotoes * 0.4);
    this.sliderControle.setInteractive({ draggable: true });
    
    // Configura eventos de interatividade dos botões
    
    // Botão voltar
    this.btnVoltar.on('pointerdown', () => {
      this.botaoSom.play();
      this.musicaConfig.stop();  
      // Retorna à cena do menu, passando a música atual
      this.scene.start('Menu', { musicaInicio: this.musicaAnterior });
    });
    
    // Botão mutar
    this.btnMutar.on('pointerdown', () => {
      this.botaoSom.play();
      this.mutado = !this.mutado;
      
      // Atualiza o ícone do botão
      this.btnMutar.setTexture(this.mutado ? "btnMutarOff" : "btnMutarOn");
      
      // Atualiza o estado de mute na música anterior
      if (this.musicaAnterior) {
        this.musicaAnterior.setMute(this.mutado);
      }
      
      // Salva as configurações no localStorage
      localStorage.setItem('mutado', this.mutado);
    });
    
    // Evento para clicar no fundo do slider e mover o controle
    this.sliderFundo.on('pointerdown', (pointer) => {
      // Calcula a nova posição do controle
      this.atualizarSlider(pointer.x);
    });
    
    // Eventos para arrastar o controle do slider
    this.sliderControle.on('dragstart', () => {
      this.sliderAtivo = true;
    });
    
    this.sliderControle.on('drag', (pointer, dragX) => {
      // Limita o movimento do controle à largura do slider
      const minX = this.sliderFundo.x - this.sliderFundo.displayWidth / 2;
      const maxX = this.sliderFundo.x + this.sliderFundo.displayWidth / 2;
      
      // Atualiza a posição do controle
      if (dragX >= minX && dragX <= maxX) {
        this.sliderControle.x = dragX;
        
        // Calcula o novo volume baseado na posição do controle
        this.volumeAtual = (dragX - minX) / (maxX - minX);
        
        // Atualiza o texto do volume
        this.textoVolume.setText("VOLUME: " + Math.floor(this.volumeAtual * 100) + "%");
        
        // Atualiza o volume da música anterior
        if (this.musicaAnterior && !this.mutado) {
          this.musicaAnterior.setVolume(this.volumeAtual);
        }
      }
    });
    
    this.sliderControle.on('dragend', () => {
      this.sliderAtivo = false;
      this.botaoSom.play();
    });
    
    // Adiciona listener para redimensionamento da tela
    window.addEventListener("resize", this.handleResize.bind(this));
  }
  
  // Método para atualizar o slider quando o usuário clica no fundo
  atualizarSlider(posicaoX) {
    const minX = this.sliderFundo.x - this.sliderFundo.displayWidth / 2;
    const maxX = this.sliderFundo.x + this.sliderFundo.displayWidth / 2;
    
    // Limita a posição dentro dos limites do slider
    let novaPos = Phaser.Math.Clamp(posicaoX, minX, maxX);
    
    // Atualiza a posição do controle
    this.sliderControle.x = novaPos;
    
    // Calcula o novo volume
    this.volumeAtual = (novaPos - minX) / (maxX - minX);
    
    // Atualiza o texto do volume
    this.textoVolume.setText("VOLUME: " + Math.floor(this.volumeAtual * 100) + "%");
    
    // Atualiza o volume da música anterior
    if (this.musicaAnterior && !this.mutado) {
      this.musicaAnterior.setVolume(this.volumeAtual);
    }
    
    // Salva o volume no localStorage
    localStorage.setItem('volumeAtual', this.volumeAtual);
    
    this.botaoSom.play();
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
    
    this.btnVoltar.setScale(this.escalaBotoes * 0.35); // Mantém a escala reduzida (metade da original)
    this.btnMutar.setPosition(this.centroX - 150, this.centroY);
    this.btnMutar.setScale(this.escalaBotoes * 0.7); // Reduzindo para 70% da escala original
    
    this.textoVolume.setPosition(this.centroX + 150, this.centroY - 50);
    this.textoVolume.setFontSize(Math.floor(24 * this.escalaTexto) + "px");
    
    this.sliderFundo.setPosition(this.centroX + 150, this.centroY);
    this.sliderFundo.setScale(this.escalaBotoes, this.escalaBotoes * 0.5);
    
    // Recalcula a posição do controle do slider baseado no volume atual
    const sliderLength = this.sliderFundo.displayWidth;
    const posicaoX = (this.sliderFundo.x - sliderLength/2) + (sliderLength * this.volumeAtual);
    this.sliderControle.setPosition(posicaoX, this.centroY);
    this.sliderControle.setScale(this.escalaBotoes * 0.4);
  }
  
  // Método de atualização contínua
  update() {
    // Nada a ser atualizado constantemente nesta cena
  }
  
  // Método para limpar ao sair da cena
  shutdown() {
    // Remove os event listeners
    window.removeEventListener("resize", this.handleResize.bind(this));
  }
}