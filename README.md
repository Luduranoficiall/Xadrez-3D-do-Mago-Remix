# Remix Wizard Chess 3D (Xadrez Bruxo 3D)

> **Uma experiência imersiva de xadrez em 3D em uma catedral gótica monumental, com combates cinemáticos, física de destruição de peças de pedra e inteligência artificial desafiadora.**

---

## 📌 Descrições do Projeto

### 1. Resumo Rápido (One-Liner / Slogan)
> *"O clássico jogo de xadrez reimaginado como um duelo medieval épico: peças de pedra esculpida, combates cinemáticos com física de estilhaçamento e IA avançada sob a luz de tochas em uma catedral gótica."*

### 2. Pitch do Projeto (Parágrafo de Apresentação)
> **Remix Wizard Chess 3D** transporta o jogador para um santuário gótico místico onde cada jogada é uma batalha física. Inspirado no lendário conceito do "xadrez de bruxo", o jogo combina o rigor estratégico das regras internacionais de xadrez com uma atmosfera visual rica: iluminação volumétrica por tochas e vitrais, peças de pedra que desferem ataques físicos e se despedaçam em estilhaços ao serem capturadas, além de um motor de IA inteligente com 4 níveis de dificuldade e um painel tático com notação algébrica e medição do tempo de raciocínio.

---

## ✨ Principais Funcionalidades

- 🏛️ **Ambiente 3D Gótico Imersivo**:
  - Cenário de catedral gótica monumental renderizado em tempo real com Three.js.
  - Tochas dinâmicas com cintilação de fogo, partículas de poeira suspensa e luz filtrada por vitrais ancestrais.
- ⚔️ **Combate Cinemático & Física de Destruição**:
  - Animações exclusivas de ataque corpo a corpo durante capturas de peças.
  - Efeito dinâmico de estilhaçamento de pedra (*stone shatter physics*) com detritos físicos e impacto visual.
- 🧠 **Motor de Inteligência Artificial (4 Níveis)**:
  - **Fácil**: Ideal para iniciantes, com profundidade 1 e decisões relaxadas.
  - **Médio**: Avaliação posicional básica de material e mobilidade (profundidade 2).
  - **Difícil**: Busca profunda minimax com poda alfa-beta e ordenação de lances (profundidade 3).
  - **Hard Master**: Análise avançada com matrizes de peças por casa (PST) e profundidade 4 tática.
- 📜 **Histórico de Lances & Painel Tático (HUD)**:
  - Gaveta lateral flutuante e retrátil em desktop e mobile.
  - Notação Algébrica Padrão (SAN) com contagem de jogadas (ex: `1. e4 e5`).
  - **Badge de Duração do Lance**: Indicador em dourado que registra com precisão o tempo ativo de pensamento do jogador ou da IA (ex: `+3s`, `+14s`, `+1m 12s`).
  - Exportação PGN em 1 clique para compartilhar ou analisar em plataformas como Lichess ou Chess.com.
- 🎥 **Controle de Câmera & Perspectiva**:
  - 4 predefinições de câmera: Visão do Jogador, Visão Tática Superior (Top-down), Duelo Lateral e Panorama Geral da Catedral.
  - Alternância instantânea de lado (jogar com as Brancas ou Pretas).

---

## 🛠️ Tecnologias e Arquitetura

- **Frontend & Gráficos**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Three.js](https://threejs.org/), [Tailwind CSS](https://tailwindcss.com/), [Vite](https://vitejs.dev/).
- **Motor Lógico Desacoplado**: Motor de xadrez e IA implementados em JavaScript puro, sem dependências externas, facilitando testes e portabilidade.
- **Portabilidade Multilinguagem**:
  - Código de referência e documentação técnica completa para **C# Puro** (`/csharp`), **Java Puro** (`/java`) e **Lua Puro** (`/lua`).
  - Documentação de migração disponível em [`/docs/DOCUMENTACAO_TECNICA_WIZARD_CHESS.md`](./docs/DOCUMENTACAO_TECNICA_WIZARD_CHESS.md).

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Executar suíte de testes unitários do motor
node --test test/applet.test.mjs

# 4. Compilar para produção
npm run build
```
