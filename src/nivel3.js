class Nivel3 extends Phaser.Scene {
  constructor() {
    super('Nivel3');
    this.fundo; // Variável para o fundo tileable
    this.patas = []; // Array para armazenar todas as patas
    this.tamanhoPata = 0.0001673 * largura; // Tamanho da pata baseado na tela
    this.vel = 5; // Velocidade da pata
    this.circuloRecompensa; // Variável para o círculo da recompensa
    this.botaoContinuar; // Variável para o botão de continuar
    this.textoTutorial; // Define textoTutorial

    this.contadorClique = 0; // Contador geral de cliques
    this.textoContador; // Objeto de texto para exibir o contador
    this.patasAtivas = true; // Variável para verificar se as patas estão clicáveis
  }

  preload() {
    // Carrega a imagem da pata
    this.load.image("pata", "../assets/pata2.png");
    // Carrega a imagem tileable do fundo
    this.load.image("fundo", "../assets/wood2.png");
    // Carrega a imagem do círculo da recompensa
    this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
    // Carrega a imagem do botão de continuar
    this.load.image("continuar", "../assets/Circulo_branco.png");
  }

  create() {
    // Cria um tileSprite que cobre toda a tela com a imagem tileable
    this.fundo = this.add
      .tileSprite(0, 0, largura, altura, "fundo")
      .setOrigin(0, 0)
      .setScale(4);

    // Adiciona o círculo da recompensa (inicialmente invisível)
    this.circuloRecompensa = this.physics.add
      .staticImage(largura / 2, altura / 2, "circuloRecompensa")
      .setScale(this.tamanhoPata + 0.01)
      .setAlpha(0);
    this.circuloRecompensa.setDepth(1);

    // Adiciona a primeira pata
    this.criarPata(100, 300, this.tamanhoPata);

    // Adiciona o botão de continuar (inicialmente invisível)
    this.botaoContinuar = this.physics.add
      .staticImage(largura - 100, altura - 100, "continuar")
      .setScale(0.1)
      .setAlpha(0);
    this.botaoContinuar.setInteractive();
    
    // Evento de clique para o botão continuar
    this.botaoContinuar.on("pointerdown", () => {
      this.scene.start('SelecaoDeLevel');
    });

    // Adiciona o contador visual no canto superior esquerdo
    this.textoContador = this.add.text(10, 10, this.contadorClique + "/3", {
      font: "24px Arial",
      fill: "#ffffff",
    });
    
    // Adiciona o texto tutorial inicial
    this.textoTutorial = this.add.text(
      largura / 2,
      altura / 2 - 300,
      "Nível 3: Agora a pata se multiplica!",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
    this.textoTutorial.setDepth(1);
    
    // Chama a função para configurar a pata principal
    this.completarCreate();
  }

  // Função para criar uma pata
  criarPata(x, y, tamanho, direcaoX, direcaoY) {
    let novaPata = this.add.image(x, y, "pata").setScale(tamanho);
    
    // Define direções iniciais (permite personalizar durante a criação)
    novaPata.vertical = direcaoY !== undefined ? direcaoY : true;
    novaPata.ida = direcaoX !== undefined ? direcaoX : true;
    
    novaPata.contadorIndividual = 0; // Contador individual da pata
    novaPata.tamanhoAtual = tamanho; // Tamanho atual da pata
    novaPata.setInteractive();
    
    // Adiciona evento de clique para a pata
    novaPata.on("pointerdown", () => {
      if (!this.patasAtivas) return;
      
      // Incrementa o contador individual da pata
      novaPata.contadorIndividual++;
      
      if (novaPata.contadorIndividual == 1) {
        // No primeiro clique, diminui o tamanho
        novaPata.tamanhoAtual *= 0.8;
        novaPata.setScale(novaPata.tamanhoAtual);
      } else if (novaPata.contadorIndividual >= 2) {
        // No segundo clique
        // Incrementa o contador geral
        this.contadorClique++;
        
        // Atualiza o texto do contador
        this.textoContador.setText(this.contadorClique + "/3");
        
        // Verificamos se atingiu a pontuação máxima antes de destruir a pata
        if (this.contadorClique >= 3) {
          // Se atingiu a pontuação máxima, mantém a última pata viva
          this.pontuacaoMaxima(novaPata.x, novaPata.y);
          return;
        }
        
        // Remove a pata do array e a destrói
        const index = this.patas.indexOf(novaPata);
        if (index > -1) {
          this.patas.splice(index, 1);
        }
        
        novaPata.destroy();
        
        return;
      }
    });
    
    // Adiciona a pata ao array
    this.patas.push(novaPata);
    
    return novaPata;
  }

  update() {
    // Atualiza as dimensões da tela para responsividade
    largura = window.innerWidth;
    altura = window.innerHeight;
    
    // Se o contador geral atingiu 3, não atualiza mais as patas
    if (this.contadorClique >= 3) {
      return;
    }

    // Atualiza a posição de cada pata
    for (let i = 0; i < this.patas.length; i++) {
      let pata = this.patas[i];
      
      // Movimentação da pata no eixo X com if ternário
      pata.ida = pata.x <= 100 ? true : pata.x >= largura - 150 ? false : pata.ida;
      pata.x += pata.ida ? this.vel : -this.vel;

      // Movimentação da pata no eixo Y com if ternário
      pata.vertical =
        pata.y <= 100 ? true : pata.y >= altura - 140 ? false : pata.vertical;
      pata.y += pata.vertical ? this.vel : -this.vel;
    }
  }

  // Função para lidar com o clique na pata principal
  cliquePataPrincipal(pata) {
    // Remove a pata do array
    const index = this.patas.indexOf(pata);
    if (index > -1) {
      this.patas.splice(index, 1);
    }
    
    // Salva a posição antes de destruir
    const posX = pata.x;
    const posY = pata.y;
    const tamanhoNovo = pata.tamanhoAtual * 0.5; // Metade do tamanho original
    
    // Destrói a pata original
    pata.destroy();
    
    // Cria duas novas patas com metade do tamanho e direções diferentes
    // Primeira pata - direções opostas
    this.criarPata(posX - 30, posY - 30, tamanhoNovo, false, false);
    // Segunda pata - direções diferentes da primeira
    this.criarPata(posX + 30, posY + 30, tamanhoNovo, true, true);
    
    // Incrementa o contador geral quando a pata principal é clicada
    this.contadorClique++;
    
    // Atualiza o texto do contador
    this.textoContador.setText(this.contadorClique + "/3");
    
    // Verifica se atingiu a pontuação máxima
    if (this.contadorClique >= 3) {
      // Neste caso, as patas já foram criadas
      // Usamos a primeira pata disponível para o círculo
      if (this.patas.length > 0) {
        this.pontuacaoMaxima(this.patas[0].x, this.patas[0].y);
      } else {
        this.pontuacaoMaxima(posX, posY);
      }
    }
  }

  // Substitui o evento de clique da primeira pata
  configurarPataPrincipal() {
    if (this.patas.length > 0) {
      const pataPrincipal = this.patas[0];
      pataPrincipal.off('pointerdown'); // Remove o evento anterior
      
      pataPrincipal.on('pointerdown', () => {
        if (!this.patasAtivas) return;
        this.cliquePataPrincipal(pataPrincipal);
      });
    }
  }

  // Função de evento acionada ao atingir 3 cliques
  pontuacaoMaxima(ultimaX, ultimaY) {
    // Desativa os cliques nas patas
    this.patasAtivas = false;
    this.patas.forEach(pata => pata.disableInteractive());
    
    // Remove o texto tutorial se existir
    if (this.textoTutorial) {
      this.textoTutorial.destroy();
    }
    
    // Define a área do texto de vitória
    const areaTextoY = altura / 2 - 300;
    
    // Exibe a mensagem de conclusão
    this.textoTutorial = this.add.text(
      largura / 2, 
      areaTextoY,
      "                                        Parabéns! Você completou o nível 3! \n Lembre-se de colocar a recompensa no círculo e depois clicar no botão para continuar.",
      {
        font: "24px Arial",
        fill: "#ffffff",
      }
    );
    this.textoTutorial.setOrigin(0.5);
    
    // Posiciona o círculo de recompensa na posição fornecida
    this.circuloRecompensa.x = ultimaX;
    this.circuloRecompensa.y = ultimaY;
    
    // Mostra o círculo de recompensa e o botão continuar
    this.circuloRecompensa.setAlpha(0.5);
    this.botaoContinuar.setAlpha(1);
  }

  // Função para ser adicionada no final da função create()
  completarCreate() {
    this.configurarPataPrincipal();
  }
}
