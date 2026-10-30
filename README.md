# 🏰 Remix Wizard Chess 3D (Xadrez Bruxo 3D)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Web_Audio-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tests](https://img.shields.io/badge/Tests-Passing_6%2F6-brightgreen)](./test/applet.test.mjs)

> **Uma experiência cinematográfica e imersiva de xadrez tridimensional em uma catedral gótica monumental, com combate corpo a corpo de peças esculpidas em pedra, física de estilhaçamento em tempo real, motor de inteligência artificial com 4 níveis de dificuldade e síntese de áudio procedural.**

---

## 📌 Apresentação do Projeto

**Remix Wizard Chess 3D** reimagina o milenar jogo de xadrez como um duelo medieval épico dentro de um santuário gótico místico. Sob a iluminação oscilante de tochas e a luz filtrada por vitrais ancestrais, peças esculpidas em mármore branco e ardósia negra ganham vida, movimentam-se com imponência e combatem fisicamente até que uma delas seja despedaçada em fragmentos de pedra na captura.

Projetado com arquitetura modular e desacoplada, o sistema une uma camada de renderização gráfica 3D acelerada por hardware (Three.js/WebGL), um motor de inteligência artificial competitivo (Minimax com poda Alfa-Beta e Busca de Quiescência), síntese sonora procedural nativa (Web Audio API sem assets de áudio pesados) e um painel tático com registro de tempo de raciocínio e exportação PGN.

---

## ✨ Principais Funcionalidades

### 🏛️ 1. Ambiente 3D Gótico Imersivo
- **Cenário de Catedral**: Arquitetura monumental com arcos ogivais, pilares de sustentação e vitrais medievais.
- **Iluminação Dinâmica**: Tochas com efeito de fogo cintilante, iluminação volumétrica e projeção suave de sombras.
- **Efeitos de Partículas**: Partículas de poeira suspensa e brumas no ar para criar uma atmosfera viva.
- **Modelos 3D Otimizados**: 7 modelos tridimensionais (catedral, peão, torre, cavalo, bispo, rainha e rei) comprimidos em gzip base64 (`.glb.gz.b64`), carregando em milissegundos sem travamento de rede.

### ⚔️ 2. Combate Cinemático & Física de Destruição
- **Animações de Ataque**: Na captura, a peça atacante avança em direção ao defensor e desferem um golpe físico.
- **Física de Estilhaçamento (*Stone Shatter*)**: A peça capturada é instantaneamente substituída por múltiplos blocos de pedra físicos com rotação, dispersão e gravidade simuladas.

### 🔊 3. Sistema de Áudio Procedural (Web Audio API)
Desenvolvido em `src/audioManager.js`, dispensa o download de dezenas de megabytes de arquivos externos:
- **Ambiência Gótica (*Gothic Ambiance*)**: Vento misterioso e ressonância contínua de caverna/abóbada gerados por osciladores sinusoidais e filtros passa-banda dinâmicos.
- **Efeitos de Feitiço (*Spell Effects*)**:
  - *Impactos*: Ruído rosa com decaimento exponencial simulando colisão pesada de pedra.
  - *Estilhaçamento*: Síntese explosiva com filtro de altas frequências para estilhaços de rocha.
  - *Alertas*: Chime harmônico de seleção, sino de bronze para xeque e fanfarra de vitória para xeque-mate.
- **Controles Independentes**: Botões dedicados no menu superior (`#btn-toggle-ambiance` e `#btn-toggle-sfx`) para ligar/desligar a ambiência e os efeitos sonoros separadamente.

### 🧠 4. Motor de Inteligência Artificial (4 Níveis)
Implementado em `src/wizardChessEngine.js` com algoritmos de alto nível da literatura de xadrez:
- **Fácil**: Profundidade 1 com decisões casuais; ideal para iniciantes e partidas relaxadas.
- **Médio**: Avaliação posicional focada em controle central e segurança do material (profundidade 1-2).
- **Difícil**: Busca Minimax completa com poda Alfa-Beta e avaliação tática (profundidade 2 + quiescência).
- **Hard Master ⚔️**: Busca profunda de 3 a 4 plies com ordenação de lances MVV-LVA (*Most Valuable Victim - Least Valuable Attacker*), avaliação posicional por matrizes PST (*Piece-Square Tables*), bônus de par de bispos e busca de quiescência estendida para trocas táticas.

### 📜 5. Painel Tático & Histórico de Lances com Medição de Tempo
- **Gaveta Flutuante Retrátil**: Menu lateral deslizante em desktop e mobile (`#history-drawer`).
- **Notação Algébrica Padrão (SAN)**: Formatação oficial da FIDE (ex: `1. e4 e5`, `2. Nf3 Nc6`, `3. O-O`).
- **Badge de Duração do Lance**: Pílula dourada discreta (`.move-duration-badge`) que registra com precisão o tempo ativo de pensamento de cada turno (ex: `+<1s`, `+3s`, `+14s`, `+1m 15s`).
- **Exportação PGN em 1 Clique**: Gera e copia o PGN padrão limpo para a área de transferência, pronto para ser colado em plataformas de análise como Lichess ou Chess.com.

### 🎥 6. Câmera e Perspectiva Dinâmica
- **4 Presets de Câmera**:
  - **Jogador**: Câmera clássica sobre o ombro das peças ativas.
  - **Topo**: Câmera tática zenital plana 2D/3D.
  - **Lateral**: Visão dramática de perfil do combate.
  - **Panorâmica**: Visão ampla do santuário gótico.
- **Órbita Livre**: Controle por mouse (botão esquerdo para girar, scroll para zoom, botão direito para pan) ou gestos touch no celular.

---

## 📂 Estrutura de Diretórios

```
├── .aistudio/              # Metadados e artefatos de build do AI Studio
├── csharp/                 # Port do motor de xadrez em C# puro (.NET / Unity / Godot)
│   └── WizardChessEngine.cs
├── docs/                   # Documentação detalhada
│   ├── MANUAL_DO_CLIENTE.md              # Guia executivo e manual de uso para o cliente
│   └── DOCUMENTACAO_TECNICA_WIZARD_CHESS.md # Especificação técnica do motor e PST
├── java/                   # Port de referência do motor em Java puro
├── lua/                    # Port de referência do motor em Lua puro (5.3+ / LuaJIT)
├── public/                 # Assets públicos
│   └── assets/glb/         # Modelos 3D comprimidos (.glb.gz.b64)
├── src/
│   ├── App.tsx             # Interface React, HUD tático, gaveta de histórico e controles
│   ├── audioManager.js     # Motor de áudio procedural via Web Audio API
│   ├── wizardChessEngine.js# Motor de regras de xadrez, IA Minimax, PST, SAN e Three.js
│   ├── styles.css          # Estilização visual medieval/gótica e responsividade
│   ├── main.tsx            # Ponto de entrada React
│   └── vite-env.d.ts       # Declarações de tipos do Vite
├── test/
│   └── applet.test.mjs     # Suíte de testes automatizados (6 testes completos)
├── index.html              # Entry point HTML com metadados SEO e OpenGraph
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações do compilador TypeScript
└── vite.config.ts          # Configurações do bundler Vite
```

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem & Framework**: [TypeScript](https://www.typescriptlang.org/), [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Renderização Gráfica**: [Three.js r170](https://threejs.org/) (WebGL 2.0, materiais PBR, iluminação dinâmica, buffer geometry para estilhaçamento)
- **Design & Layout**: [Tailwind CSS](https://tailwindcss.com/) com paleta gótica personalizada, tipografia serifada medieval e painéis translúcidos
- **Áudio**: [Web Audio API nativa](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (síntese senoidal/ruído, filtros passa-baixa e envelopes de ganho)
- **Validação & Testes**: Suíte de testes nativa do Node.js (`node:test`, `node:assert/strict`)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v18 ou superior instalado
- **npm** ou **bun**

### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/remix-wizard-chess-3d.git
cd remix-wizard-chess-3d

# 2. Instalar as dependências do projeto
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev

# 4. Acessar a aplicação no navegador
# Normalmente disponível em http://localhost:3000
```

### Executar Testes Automatizados

A suíte de testes valida a integridade dos modelos 3D comprimidos, os controles da HUD, os 4 níveis de IA, o histórico de lances e badges de duração, e o sistema de áudio procedural:

```bash
node --test test/applet.test.mjs
```

### Compilar para Produção

```bash
npm run build
```
O build estático otimizado será gerado na pasta `dist/`.

---

## 🌐 Guia de Deploy e Hospedagem

O projeto compila em uma aplicação estática pura, permitindo hospedagem gratuita e ultrarrápida em qualquer provedor moderno:

| Provedor | Método | Configurações de Build |
| :--- | :--- | :--- |
| **Vercel** | Conectar repositório GitHub | Framework: `Vite`, Build: `npm run build`, Output: `dist` |
| **Netlify** | Conectar repositório ou arrastar pasta | Build: `npm run build`, Publish dir: `dist` |
| **Cloudflare Pages** | Conectar repositório | Framework: `Vite`, Build: `npm run build`, Output: `dist` |
| **Nginx / Apache** | Servidor Linux próprio | Copiar o conteúdo da pasta `dist/` para a raiz web do servidor |

---

## 📚 Documentação Adicional

- [📖 Manual do Cliente e Guia de Entrega](./docs/MANUAL_DO_CLIENTE.md): Guia executivo em português com instruções completas para usuários finais e clientes, detalhes de operação e FAQ.
- [⚙️ Documentação Técnica do Motor e IA](./docs/DOCUMENTACAO_TECNICA_WIZARD_CHESS.md): Especificação matemática de matrizes 8x8, tabelas PST, algoritmos de poda Alfa-Beta e guia de portabilidade para C#, Java e Lua.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo de licença para obter mais detalhes.
