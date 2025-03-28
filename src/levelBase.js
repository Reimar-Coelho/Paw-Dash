class LevelBase extends Phaser.Scene{
    constructor(){
        super('LevelBase');
        this.calcularDimensoes(); // Método para calcular dimensões responsivas
        this.circuloRecompensa; // Variável para o círculo da recompensa
        this.botaoContinuar; // Variável para o botão de continuar
        this.textoTutorial; // Define textoTutorial
        this.contadorClique = 0; // Contador de cliques
        this.textoContador; // Objeto de texto para exibir o contador
        this.pataClicavel = true; // Variável para verificar se a pata está clicável
        this.pata; // Variável para a pata
        this.fundo; // Variável para o fundo
        this.beep; // Variável para o som
        this.isPaused = false; // Controle de pausa
        this.overlay; // Overlay escuro
        this.textoOrientacao; // Texto de orientação
        this.orientacaoCorreta = true; // Estado da orientação
        
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
        this.vel = Math.min(0.015, 0.03 * (768 / this.altura)); // Velocidade ajustada para telas menores
        this.centroX = this.largura / 2; // Centro da tela no eixo X
        this.centroY = this.altura / 2; // Centro da tela no eixo Y
        // Raio responsivo baseado na menor dimensão da tela
        this.raio = Math.min(this.largura, this.altura) * 0.25;
        this.angulo = 0; // Ângulo inicial
        this.escalaTexto = Math.min(this.largura / 1280, 1); // Escala para textos
      }
    
      preload() {
        // Carrega a imagem do círculo da recompensa
        this.load.image("circuloRecompensa", "../assets/circuloRecompensa2.png");
        // Carrega a imagem da pata
        this.load.image("pata", "../assets/pata2.png");
        // Carrega a imagem tileable do fundo
        this.load.image("fundo", "../assets/backgroundJogo.png");
        // Carrega a imagem do botão de continuar
        this.load.image("continuar", "../assets/btnSeta.png");
        // Carrega a fonte personalizada
        this.load.font('Planes_ValMore', '../fonts/Planes_ValMore.ttf', 'truetype');
        // Carrega o som de clique
        this.load.audio('beep', '../assets/beep.mp3');
      }
    
      iniciarRotacao() {
        this.angulo += this.vel; // Atualiza o ângulo
        this.pata.x = this.centroX + Math.cos(this.angulo) * this.raio;
        this.pata.y = this.centroY + Math.sin(this.angulo) * this.raio;
      }
    
      // Funções para exibir o texto tutorial com tamanho responsivo
      textoTutorial1() {
        this.textoTutorial = this.add.text(
          this.centroX,
          this.altura * 0.1, // Posicionamento responsivo
          "Mostre a tela para seu gato e tente fazer ele clicar na pata",
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
      }
    
      textoTutorial2() {
        this.textoTutorial = this.add.text(
          this.centroX,
          this.altura * 0.1,
          "Agora coloque um petisco em cima da área vermelha demarcada para seu gato e depois que ele comer clique no botão no canto da tela",
          {
            fontFamily: 'Planes_ValMore', 
            fontSize: Math.max(18, Math.floor(32 * this.escalaTexto)) + 'px', 
            fill: "#ffffff",
            backgroundColor: "#2f996e",
            padding: { x: 10, y: 5 },
            wordWrap: { width: this.largura * 0.8 }
          }
        );
        this.textoTutorial.setOrigin(0.5);
      }
    
      textoTutorial3() {
        this.textoTutorial = this.add.text(
          this.centroX,
          this.altura * 0.1,
          "Agora repita o processo até o contador chegar em 10",
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
        // Pausar outras animações ou timers conforme necessário
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
        // Recalcula as dimensões responsivas
        this.calcularDimensoes();

        // Adiciona o som de clique
        this.beep = this.sound.add("beep");
        
        // Cria um tileSprite que cobre toda a tela com a imagem tileable
        this.fundo = this.add
          .tileSprite(0, 0, this.largura, this.altura, "fundo")
          .setOrigin(0, 0)
          .setScale(2);
    
        // Adiciona o círculo da recompensa que seja transparente
        this.circuloRecompensa = this.physics.add
          .staticImage(this.centroX, this.centroY, "circuloRecompensa")
          .setScale(this.tamanhoPata + 0.01)
          .setAlpha(0.5);
        this.circuloRecompensa.setDepth(1);
    
        // Adiciona a pata e ajusta seu tamanho
        this.pata = this.add.image(this.centroX, this.centroY, "pata").setScale(this.tamanhoPata);
        this.pata.vertical = true;
        this.pata.setInteractive();
    
        // Adiciona o botão de continuar com posicionamento responsivo
        const btnX = this.largura - Math.min(100, this.largura * 0.1);
        const btnY = this.altura - Math.min(100, this.altura * 0.1);
        const btnEscala = Math.min(0.5, (this.largura / 1280) * 0.7);
        
        this.botaoContinuar = this.physics.add
          .staticImage(btnX, btnY, "continuar")
          .setScale(btnEscala)
          .setAlpha(0);
        this.botaoContinuar.setInteractive(); // Torna o botão interativo
    
        // Evento de clique para o botão continuar
        this.botaoContinuar.on("pointerdown", () => {
          if (this.contadorClique < 10) {
            this.contadorClique++;
            // Atualiza o texto do contador
            this.textoContador.setText(this.contadorClique + "/10");
    
            // Chama a função de evento quando chega a 10 cliques
            if (this.contadorClique === 10) {
              this.pontuacaoMaxima();
            }
          }
        });
    
        // Adiciona texto para status do BLE
        const tamanhoFonteBT = Math.max(16, Math.floor(28 * this.escalaTexto));
        this.btStatusText = this.add.text(
          Math.max(10, this.largura * 0.02), 
          Math.max(50, this.altura * 0.08), 
          "BT: Não conectado", 
          {
            fontFamily: 'Planes_ValMore',
            fontSize: tamanhoFonteBT + 'px',
            fill: "#ffffff",
            backgroundColor: "#333333",
            padding: { x: 5, y: 3 }
          }
        );
    
        // Adiciona o contador visual com tamanho responsivo
        const tamanhoFonte = Math.max(20, Math.floor(35 * this.escalaTexto));
        this.textoContador = this.add.text(
          Math.max(10, this.largura * 0.02), 
          Math.max(10, this.altura * 0.02), 
          this.contadorClique + "/10", 
          {
            fontFamily: 'Planes_ValMore',
            fontSize: tamanhoFonte + 'px',
            fill: "#ffffff",
            backgroundColor: "#2f996e",
            padding: { x: 5, y: 3 }
          }
        );
    
        // Adiciona botão para conectar ao BLE
        const btnBLEX = Math.max(this.largura * 0.02, 10);
        const btnBLEY = Math.max(this.altura * 0.15, 90);
        
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
    
        // Evento de clique para a pata
        this.pata.on("pointerdown", () => {
          if (this.contadorClique < 10) {
            this.contadorClique++;
          }
          
          // Atualiza o texto do contador
          this.textoContador.setText(this.contadorClique + "/10");
          
          // Toca o som de clique
          this.beep.play();
          
          // Envia comando para girar o motor do ESP32
          this.enviarComandoRotacao();
    
          // Chama a função de evento quando chega a 10 cliques
          if (this.contadorClique === 10) {
            this.pontuacaoMaxima();
          }
    
          // Posiciona o círculo de recompensa na posição atual da pata
          this.circuloRecompensa.x = this.pata.x;
          this.circuloRecompensa.y = this.pata.y;
    
          // Diminui o tamanho da pata, mas não permite que fique muito pequena
          this.tamanhoPata = Math.max(this.tamanhoPata - 0.01, 0.05);
          this.pata.setScale(this.tamanhoPata);
        });
        
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
          }, 300); // Aumentei o tempo para garantir que os novos valores sejam aplicados
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
    
      update() {
        // Verifica orientação a cada frame
        this.verificarOrientacao();
        
        // Se o jogo estiver pausado, não atualiza a lógica do jogo
        if (this.isPaused) {
          return;
        }
      
        // Se o contador for par (incluindo zero), inicia a rotação e habilita a pata
        if (this.contadorClique % 2 == 0) {
          this.iniciarRotacao();
          this.circuloRecompensa.setAlpha(0);
          this.botaoContinuar.setAlpha(0);
          // Habilita a interatividade da pata
          this.pata.setInteractive();
          this.pataClicavel = true;
          // Desabilita o botão continuar
          this.botaoContinuar.disableInteractive();
        }
        // Se o contador for ímpar, mostra o círculo e botão, desabilita a pata
        else {
          this.circuloRecompensa.setAlpha(0.5);
          this.botaoContinuar.setAlpha(1);
          // Desabilita a interatividade da pata
          this.pata.disableInteractive();
          this.pataClicavel = false;
          // Habilita o botão continuar
          this.botaoContinuar.setInteractive();
        }
    
        // Gerenciamento de textos tutoriais
        if (this.contadorClique == 0 && !this.textoTutorial) {
          this.textoTutorial1();
        } else if (this.contadorClique == 1 && this.textoTutorial) {
          this.textoTutorial.destroy();
          this.textoTutorial2();
        } else if (this.contadorClique == 2 && this.textoTutorial) {
          this.textoTutorial.destroy();
          this.textoTutorial3();
        }
      }
    
      // Função de evento acionada ao atingir 10 cliques
      pontuacaoMaxima() {
        // Remove os event listeners antes de sair da cena
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('orientationchange', this.verificarOrientacao.bind(this));
        // Redirecionar para a cena de seleção de níveis
        this.scene.start('SelecaoDeLevel');
      }

      // Método para atualizar a cena completamente quando a orientação mudar
      atualizarCena() {
        // Recalcular dimensões
        this.calcularDimensoes();
        
        // Atualizar posições de elementos principais
        this.fundo.setSize(this.largura, this.altura);
        
        // Reposicionar o círculo da recompensa (sem alterar a visibilidade atual)
        const alphaAtual = this.circuloRecompensa.alpha;
        this.circuloRecompensa.setPosition(this.centroX, this.centroY);
        this.circuloRecompensa.setScale(this.tamanhoPata + 0.01);
        this.circuloRecompensa.setAlpha(alphaAtual);
        
        // Reposicionar a pata
        if (this.contadorClique % 2 == 0) {
          // Se estiver em movimento, reposicionar no círculo
          this.angulo = 0; // Reiniciar ângulo
          this.pata.x = this.centroX + Math.cos(this.angulo) * this.raio;
          this.pata.y = this.centroY + Math.sin(this.angulo) * this.raio;
        } else {
          // Se estiver parada, manter na posição atual do círculo
          this.pata.x = this.circuloRecompensa.x;
          this.pata.y = this.circuloRecompensa.y;
        }
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
        this.textoContador.setFontSize(tamanhoFonte + 'px');
        
        // Recriar o texto tutorial
        if (this.textoTutorial) {
          this.textoTutorial.destroy();
          if (this.contadorClique === 0) this.textoTutorial1();
          else if (this.contadorClique === 1) this.textoTutorial2();
          else if (this.contadorClique >= 2) this.textoTutorial3();
        }
        
        // Atualizar o raio da órbita
        this.raio = Math.min(this.largura, this.altura) * 0.25;
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

