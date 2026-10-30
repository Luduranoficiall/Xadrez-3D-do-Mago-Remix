# 🏰 Manual do Cliente — Remix Wizard Chess 3D
### Guia Completo de Entrega, Operação e Publicação do Projeto

---

## 📋 Sumário Executivo

O **Remix Wizard Chess 3D (Xadrez Bruxo 3D)** é uma aplicação web de xadrez de alta performance, desenvolvida sob medida para proporcionar uma experiência imersiva inspirada nos duelos medievais e de fantasia mística. O projeto combina:

1. **Cenário Tridimensional em Tempo Real**: Catedral gótica monumental com tochas dinâmicas, partículas no ar, vitrais iluminados e peças de pedra esculpida.
2. **Física e Combate Cinemático**: Peças que se movem fisicamente pelo tabuleiro, desferindo ataques corpo a corpo com estilhaçamento de pedra (*stone shatter physics*) e detritos voando na captura.
3. **Motor de Inteligência Artificial com 4 Dificuldades**: Algoritmo Minimax com poda Alfa-Beta, Busca de Quiescência e Tabelas Posicionais (PST), abrangendo desde o nível iniciante até o modo de alta precisão tática (*Hard Master*).
4. **Sistema de Áudio Procedural**: Síntese sonora em tempo real via Web Audio API (vento gótico, ressonância de caverna, impactos de feitiço e explosão de pedras), sem dependência de arquivos de áudio externos pesados.
5. **Histórico Tático com Medição de Tempo e Exportação PGN**: Registro de jogadas em Notação Algébrica Padrão (SAN) com badges em dourado que medem o tempo real de raciocínio de cada lance e exportação com um clique para análise no Chess.com ou Lichess.
6. **Interface Responsiva**: Suporte total a computadores desktop, notebooks, tablets e smartphones (com painel deslizante adaptado para toque).

---

## 🎮 Como Jogar — Guia do Usuário

### 1. Início da Partida
- Ao carregar a página, a catedral gótica se revela e o tabuleiro é posicionado.
- Por padrão, o jogador comanda as **Peças Brancas** (lado Sul) e a Inteligência Artificial joga com as **Peças Pretas** (lado Norte).

### 2. Seleção e Movimentação de Peças
- **Selecionar uma peça**: Clique com o botão esquerdo do mouse (ou toque no celular) sobre qualquer uma de suas peças.
- **Casas disponíveis**: O tabuleiro exibirá anéis verdes luminosos indicando todas as jogadas legais possíveis para a peça selecionada.
- **Executar o lance**: Clique em uma das casas com o anel verde para mover a peça até o destino.
- **Desmarcar**: Clique em uma casa vazia ou selecione outra peça sua.

### 3. Regras Especiais Implementadas
- **Captura e Combate**: Ao mover para uma casa ocupada por uma peça adversária, a peça atacante avança, golpeia o inimigo e a peça capturada se estilhaça em blocos de pedra físicos que caem fora do tabuleiro.
- **Roque Menor e Roque Maior**: Se o Rei e a Torre ainda não se moveram e o caminho estiver livre e seguro, selecione o Rei e clique na casa de destino do roque (duas casas para a esquerda ou direita). O Rei e a Torre se posicionarão automaticamente.
- **Promoção de Peão**: Ao conduzir um peão até a oitava fileira adversária, ele se promove automaticamente à Dama (*Queen*), transformando-se no modelo de pedra da rainha.
- **Detecção de Xeque e Xeque-Mate**: O jogo detecta automaticamente xeque, xeque-mate e afogamento (*stalemate*), exibindo aviso em tela e disparando os efeitos sonoros correspondentes.

---

## 🎥 Controles de Câmera e Navegação 3D

O jogo oferece flexibilidade total para você escolher a melhor perspectiva de jogo:

### Atalhos Rápidos na Barra Superior (HUD)
- **👤 Jogador (`Jogador`)**: Câmera clássica posicionada atrás das suas peças com leve inclinação tática.
- **📐 Topo (`Topo`)**: Visão aérea zenital (top-down), perfeita para jogadores competitivos que preferem visão plana do tabuleiro 2D tradicional em perspectiva tridimensional.
- **⚔️ Lateral (`Lateral`)**: Ângulo de duelo cinematográfico pela lateral do tabuleiro.
- **🏰 Panorâmica (`Panorâmica`)**: Afasta a câmera para exibir a grandiosidade da catedral, arcos ogivais e vitrais medievais.

### Controles Manuais via Mouse / Touchpad
- **Girar / Orbitar**: Segure o **botão esquerdo do mouse** e arraste em qualquer direção.
- **Aproximar / Afastar (Zoom)**: Use a **roda do mouse (scroll)** ou faça gesto de pinça na tela do celular.
- **Mover / Pan**: Segure o **botão direito do mouse** e arraste para deslocar o foco da cena.

---

## 🔊 Sistema de Áudio e Personalização Sonora

O jogo conta com um motor de áudio sintético procedural exclusivo localizado em `src/audioManager.js`. Ele não trava o carregamento de rede por não depender de arquivos `.mp3` ou `.wav` pesados e oferece controle individual:

### 1. Ambiência Gótica (*Gothic Ambiance*)
- **O que é**: Zumbido eólico misterioso que simula rajadas de vento frio ecoando pelas pedras e abóbadas da catedral gótica.
- **Como controlar**: Clique no botão **`🏰 Ambiência: Ligada/Desligada`** no menu superior de áudio (ou no painel inferior em celulares).

### 2. Efeitos de Feitiço & Impacto (*Spell Effects*)
- **O que é**: Efeitos sonoros para impactos físicos, colisão de rochas, estilhaçamento explosivo na captura de peças, sinos de aviso de xeque e vitória triunfal de xeque-mate.
- **Como controlar**: Clique no botão **`⚡ Feitiços: Ligados/Desligados`** para ativar ou silenciar os efeitos sonoros de ação.

---

## 🧠 Níveis de Inteligência Artificial

O menu suspenso ou botões de dificuldade permitem calibrar a experiência para qualquer perfil de jogador:

| Nível | Nível de Habilidade | Descrição do Comportamento |
| :--- | :--- | :--- |
| **Fácil** | Iniciante / Casual | Respostas rápidas e descontraídas. Permite ao jogador experimentar jogadas e táticas sem punições severas. |
| **Médio** | Intermediário | Prioriza o controle do centro do tabuleiro, proteção do rei e captura de peças desprotegidas. |
| **Difícil** | Avançado / Competitivo | Busca Minimax com poda Alfa-Beta (profundidade 2 + quiescência). Antecipa táticas e armadilhas com antecedência. |
| **Hard Master ⚔️** | Mestre / Implacável | Avaliação posicional completa via matrizes PST (*Piece-Square Tables*), bônus de estrutura de peões e busca profunda de quiescência. Joga de forma impiedosa. |

- **Botão `🤖 Lance da IA`**: Permite solicitar à IA que execute o próximo lance imediatamente (útil para analisar jogadas ou passar o turno).
- **Botão `🔄 Inverter Lado`**: Alterna se o jogador humano joga com as Brancas ou Pretas.
- **Botão `↻ Novo Jogo`**: Reinicia o tabuleiro instantaneamente.

---

## 📜 Histórico de Lances, Tempo e Exportação PGN

Localizado no ícone de pergaminho **`📜 Histórico`** no canto superior direito:

1. **Gaveta Lateral Flutuante**: Abre uma gaveta elegante e translúcida que não bloqueia a visão central do tabuleiro.
2. **Notação Algébrica Internacional (SAN)**: Lista os lances formatados de acordo com os padrões da FIDE (ex: `1. e4 e5`, `2. Nf3 Nc6`, `3. Bb5 a6`).
3. **Indicador de Tempo de Raciocínio (Dourado)**: Ao lado de cada lance, um badge dourado indica quantos segundos ou minutos foram utilizados no pensamento daquela jogada (ex: `+<1s`, `+3s`, `+18s`, `+1m 15s`).
4. **Exportação PGN em 1 Clique**: Clique em **`📋 Copiar PGN`** para copiar a notação limpa e padrão diretamente para a área de transferência do seu computador ou celular, pronta para ser colada no **Lichess Analysis Board** ou **Chess.com**.

---

## 🚀 Como Hospedar e Publicar o Projeto na Web

O projeto foi construído utilizando **Vite + React + Three.js**, gerando uma aplicação web estática ultrarrápida após a compilação.

### Opção 1: Publicação Rápida no Vercel (Recomendada)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Conecte o repositório GitHub do projeto.
3. O Vercel detectará automaticamente o Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Clique em **Deploy**. Em menos de 1 minuto o jogo estará online com link HTTPS próprio e certificado SSL gratuito.

### Opção 2: Publicação no Netlify
1. Crie uma conta em [netlify.com](https://netlify.com).
2. Conecte o repositório ou arraste a pasta `dist` gerada pelo comando `npm run build`.
3. Configurações:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### Opção 3: Servidor Web Tradicional (Apache, Nginx, cPanel ou AWS S3)
1. No seu computador ou servidor, execute no terminal:
   ```bash
   npm install
   npm run build
   ```
2. Uma pasta chamada `dist/` será criada na raiz do projeto.
3. Copie todo o conteúdo da pasta `dist/` para a pasta pública do seu servidor (ex: `/var/www/html` ou `public_html/`).

---

## 💻 Como Rodar o Projeto no seu Computador (Desenvolvimento Local)

### Pré-requisitos
- **Node.js** versão 18 ou superior instalada ([download oficial do Node.js](https://nodejs.org/)).

### Passo a Passo
1. Abra a pasta do projeto no seu terminal (ou VS Code).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de testes:
   ```bash
   npm run dev
   ```
4. Abra seu navegador no endereço indicado (normalmente `http://localhost:3000`).
5. Para rodar a bateria de testes automatizados do jogo:
   ```bash
   node --test test/applet.test.mjs
   ```

---

## 📱 Compatibilidade de Dispositivos e Requisitos

- **Navegadores Homologados**:
  - Google Chrome (versão 90+)
  - Mozilla Firefox (versão 90+)
  - Microsoft Edge (versão 90+)
  - Apple Safari (iOS 15+ e macOS Monterey+)
- **Placas de Vídeo / Aceleração Gráfica**:
  - Funciona com placas integradas (Intel UHD, AMD Vega, Apple Silicon M1/M2/M3) e placas dedicadas (NVIDIA / AMD Radeon).
  - Requer aceleração por hardware ativada no navegador (**WebGL 2.0**).
- **Consumo de Memória e Banda**:
  - Os modelos tridimensionais das peças e da catedral foram otimizados e comprimidos com gzip em base64 (`.glb.gz.b64`), consumindo menos de 5MB no download inicial.
  - Áudio procedural que dispensa o download de centenas de megabytes em arquivos de som.

---

## ❓ Perguntas Frequentes (FAQ)

### 1. O jogo funciona sem internet após carregar?
**Sim.** Uma vez que a página é carregada no navegador, todo o processamento de física 3D, cálculos da IA de xadrez e geração de sons procedurais acontece 100% no navegador do usuário, sem necessidade de servidores externos.

### 2. É possível alterar as cores ou os modelos das peças?
**Sim.** A estrutura em `src/wizardChessEngine.js` utiliza materiais PBR do Three.js (mármore polido para as brancas e ardósia obsidiana para as pretas) e pode ter cores, rugosidade e brilho ajustados facilmente no arquivo de estilo ou no inicializador de materiais.

### 3. As regras seguem o xadrez oficial da FIDE?
**Sim.** Estão implementados roque pequeno (O-O), roque grande (O-O-O), avanço duplo de peão, promoção automática à Dama e validação rigorosa de xeque impedindo qualquer lance que deixe o próprio rei exposto.

### 4. Como posso portar a lógica para um jogo em Unity, Godot ou app nativo?
O projeto inclui códigos-fonte independentes e documentados nas linguagens:
- **C# Puro** (`/csharp/WizardChessEngine.cs`) — pronto para Unity, Godot ou .NET.
- **Java Puro** (`/java`) — pronto para backend ou Android nativo.
- **Lua Puro** (`/lua`) — pronto para Defold, Love2D ou scripts em Roblox.
- Documentação detalhada em [`docs/DOCUMENTACAO_TECNICA_WIZARD_CHESS.md`](./DOCUMENTACAO_TECNICA_WIZARD_CHESS.md).

---

*Manual elaborado para entrega ao cliente final. Desenvolvido com padrões internacionais de engenharia de software e usabilidade.*
