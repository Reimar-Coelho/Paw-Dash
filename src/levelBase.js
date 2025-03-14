class LevelBase extends Phaser.Scene{
    constructor(){
        super('LevelBase');
        this.tamanhoPata = 0.0001673 * largura;     // Tamanho da pata baseado na tela
        console.log(this.tamanhoPata)
        this.cont = 0;   // Variável para medir a progressão regressiva de tamanho da pata
        this.vel = 2;    // Velocidade da pata
        this.largura=largura;
        this.altura=altura;
        this.contadorClique = 0; // Contador de cliques
        this.textoContador;    // Objeto de texto para exibir o contador
    }
     preload() {
        // Carrega a imagem da pata
        this.load.image('pata', '../assets/pata2.png');
        // Carrega a imagem tileable do fundo
        this.load.image('fundo', '../assets/wood2.png');
    }
    
     create() {
        // Cria um tileSprite que cobre toda a tela com a imagem tileable
        this.fundo = this.add.tileSprite(0, 0, largura, altura, 'fundo').setOrigin(0, 0).setScale(4);
    
        // Adiciona a pata e ajusta seu tamanho
        this.pata= this.add.image(100, 300, 'pata').setScale(this.tamanhoPata);
        this.pata.vertical = true;
        this.pata.setInteractive();
    
        // Evento de clique para a pata
        this.pata.on('pointerdown', function () {
            if (this.contadorClique < 10) {
                this.contadorClique++;
            }
            // Atualiza o texto do contador
            this.textoContador.setText(this.contadorClique + '/10');
    
            // Chama a função de evento quando chega a 10 cliques
            if (this.contadorClique === 10) {
                pontuacaoMaxima();
            }
    
            // Diminui o tamanho da pata
            this.tamanhoPata -= 0.02;
            this.pata.setScale(this.tamanhoPata);
            console.log('Clique!', this.tamanhoPata);
        });
    
        // Adiciona o contador visual no canto superior esquerdo
        this.textoContador = this.add.text(10, 10, this.contadorClique + '/10', {
            font: "24px Arial",
            fill: "#ffffff"
        });
    
    }
    
     update() { 
        // Atualiza as dimensões da tela para responsividade
        largura = window.innerWidth;
        altura = window.innerHeight;
    
        // Movimentação da pata no eixo X com if ternário
        this.pata.ida = (this.pata.x <= 100) ? true : (this.pata.x >= (largura - 150)) ? false : this.pata.ida;
        this.pata.x += this.pata.ida ? this.vel : -this.vel;
    
        // Movimentação da pata no eixo Y com if ternário
        this.pata.vertical = (this.pata.y <= 100) ? true : (this.pata.y >= (altura - 140)) ? false : this.pata.vertical;
        this.pata.y += this.pata.vertical ? this.vel : -this.vel;
    
        // Quando a pata atingir determinado tamanho, ela é recriada
        if (this.tamanhoPata < 0.1 && this.cont <= 0.5) {
            this.vel += 0.2;      // Aumenta a velocidade
            this.cont += 0.02;    // Progride a redução do tamanho da pata
            var xis = this.pata.x; // Captura a posição X antes de destruir a pata
            var yps = this.pata.y; // Captura a posição Y antes de destruir a pata
            this.pata.destroy();  // Remove a pata atual da tela
    
            this.tamanhoPata = 0.2 * (1 - this.cont); // Redefine o tamanho da pata
            this.pata = this.add.image(xis, yps, 'pata').setScale(this.tamanhoPata);
            this.pata.setInteractive();
            this.pata.vertical = true;
            this.pata.ida = (xis > 400) ? false : true;
    
            // Reatribui o evento de clique para a nova pata
            this.pata.on('pointerdown', function () {
                if (this.contadorClique < 10) {
                    this.contadorClique++;
                }
                this.textoContador.setText(this.contadorClique + '/10');
                
                if (this.contadorClique === 10) {
                    pontuacaoMaxima();
                }
                
                this.tamanhoPata -= 0.02;
                this.pata.setScale(this.tamanhoPata);
                console.log('Clique!', this.tamanhoPata);
            });
            console.log(this.cont);
        }
    }
    
    // Função de evento acionada ao atingir 10 cliques (vazia para modificação posterior)
     pontuacaoMaxima() {
        // Adicionar aqui o código para quando o contador chegar a 10 cliques.
    }
    
}


