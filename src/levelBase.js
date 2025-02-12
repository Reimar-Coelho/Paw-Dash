var width = window.innerWidth
var height = window.innerHeight

    var config = {  // Configura as dimensões da tela e o tipo de renderizador, bem como contém "scene"

    
        type: Phaser.AUTO,
        width: width,
        height: height,
        backgroundColor: '#bfe4ec',

        scene: {
            preload: preload, // Carrega os arquivos de imagem e define como serão referenciados
            create: create, // Configura como e onde um elemento será inserida na tela
            update: update // Define como as imagens irão se comportar, executando ações em loop
        }
    };

    var game = new Phaser.Game(config);

    var pata; // Define uma variável para a pata, para que seja possível acessá-la e modificá-la depois
    //var sizePata = 0.25; // Define uma variavél para o tamanho da pata e seu valor inicial
    var sizePata = 0.0001673*width
    var cont = 0; // Define uma variavél para medir a progressão regressiva de tamanho da pata
    var vel = 2; // Define uma variavél que determina a velocidade da pata

    function preload() {
        this.load.image('paw', '../assets/pata2.png'); // Carrega a imagem da pata
        this.load.image('background', '../assets/teste_bg.jpg'); // Carrega a imagem do background
    }

    function create() {
        background = this.add.image(0, 0, 'background').setOrigin(0, 0); // Adiciona o background 
        pata = this.add.image(100, 300, 'paw').setScale(sizePata); // Adiciona a pata e relaciona ela com a variável
        pata.vertical = true; // Define como verdadeiro o deslocamento vertical da pata
        pata.setInteractive(); // Define a pata como objeto interativa
        pata.on('pointerdown', function(){ // Define a função para a pata diminuir ao clique
            sizePata -= 0.02;
            pata.setScale(sizePata);
            console.log('Clique!', sizePata);
        })
        console.log(width, height);
    }

    function update() { 
        width = window.innerWidth
        height = window.innerHeight

        pata.ida = pata.x <= 100 ? true : pata.x >= (width-150) ? false : pata.ida;
        pata.x += pata.ida ? vel : -vel;

        pata.vertical = pata.y <= 100 ? true : pata.y >= (height-140) ? false : pata.vertical;
        pata.y += pata.vertical ? vel : -vel;
        if (sizePata < 0.1 && cont <= 0.5) { // Define o progresso necessário para redefinição das variáveis
                vel += 0.2; // Aumenta a variável de velocidade
                cont += 0.02; // Aumenta a variável que determina a diminuição do tamanho da pata
                xis = pata.x; // Captura a posição no eixo x da para no momento antes dela ser apagada
                yps = pata.y; // Captura a posição no eixo y da para no momento antes dela ser apagada
                pata.destroy(); // Tira a imagem de pata atual da tela
                sizePata = 0.2 * (1 - cont); // Redefine o tamanho da pata
                pata = this.add.image(xis, yps, 'paw').setScale(sizePata); // Adiciona a nova pata
                pata.setInteractive(); // Torna a nova para interativa
                console.log('OMG!');
                pata.vertical = true; // Ativa a movimentação vertical da nova pata
                if (xis > 400) { // Determina para qual lado a nova para deve começar a se movimentar
                    pata.ida = false;
                } 
                else {
                    pata.ida = true;
                }
                pata.on('pointerdown', function(){ // Define a função para a pata diminuir ao clique
                    sizePata -= 0.02;
                    pata.setScale(sizePata);
                    console.log('Clique!', sizePata);
                })
                console.log(cont);
            }
    }