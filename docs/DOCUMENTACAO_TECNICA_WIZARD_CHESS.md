# Wizard Chess — Documentação Técnica do Motor e Inteligência Artificial
**Portabilidade e Arquitetura para C# Puro, Java Puro e Lua Puro**

---

## 1. Introdução e Propósito

Este documento foi elaborado para apoiar a migração e portabilidade do motor de xadrez (**Wizard Chess**) e de seus 4 níveis de inteligência artificial (**Fácil**, **Médio**, **Difícil** e **Hard Master**) para linguagens de propósito geral — com foco principal em **C# puro** (.NET Standard / .NET 6-9 / Unity / Godot), além de diretrizes para **Java puro** e **Lua puro**.

A lógica aqui descrita é completamente descolada de qualquer dependência visual, gráfica (Three.js, WebGL) ou de rede, sendo adequada para bibliotecas puras, aplicações de console, serviços de backend ou lógica interna em motores de jogos.

---

## 2. Sistema de Coordenadas e Representação do Tabuleiro

### 2.1 Coordenadas da Matriz 8x8
O tabuleiro é modelado como uma grade bidimensional de $8 \times 8$:
- **Linhas (`r` ou `row`)**: variam de `0` a `7`.
  - Linha `0`: Primeira fileira das peças **Pretas** (fileira 8 da notação algébrica).
  - Linha `1`: Peões das peças **Pretas** (fileira 7 da notação algébrica).
  - Linha `6`: Peões das peças **Brancas** (fileira 2 da notação algébrica).
  - Linha `7`: Primeira fileira das peças **Brancas** (fileira 1 da notação algébrica).
- **Colunas (`c` ou `col`)**: variam de `0` a `7` correspondendo às colunas de `a` a `h`:
  - `0`: coluna `a`
  - `1`: coluna `b`
  - `2`: coluna `c`
  - `3`: coluna `d`
  - `4`: coluna `e` (posição inicial dos Reis)
  - `5`: coluna `f`
  - `6`: coluna `g`
  - `7`: coluna `h`

```
       Colunas (c): 0(a)  1(b)  2(c)  3(d)  4(e)  5(f)  6(g)  7(h)
 Linha 0 (Rank 8):  r     n     b     q     k     b     n     r    [Pretas]
 Linha 1 (Rank 7):  p     p     p     p     p     p     p     p
 Linha 2 (Rank 6):  .     .     .     .     .     .     .     .
 Linha 3 (Rank 5):  .     .     .     .     .     .     .     .
 Linha 4 (Rank 4):  .     .     .     .     .     .     .     .
 Linha 5 (Rank 3):  .     .     .     .     .     .     .     .
 Linha 6 (Rank 2):  P     P     P     P     P     P     P     P    [Brancas]
 Linha 7 (Rank 1):  R     N     B     Q     K     B     N     R
```

---

## 3. Tipos e Estruturas de Dados

### 3.1 Peças (`Piece`)
Cada peça possui:
- **`Type`**: Tipo da peça (`Pawn`, `Knight`, `Bishop`, `Rook`, `Queen`, `King`).
- **`Color`**: Cor (`White`, `Black`).
- **`HasMoved`**: Flag booleana necessária para validar o Roque e avanço inicial duplo de peões.

### 3.2 Lances (`Move`)
Um lance representa a transição no tabuleiro:
- `FromR`, `FromC`: Coordenadas de origem.
- `ToR`, `ToC`: Coordenadas de destino.
- `IsCapture`: Booleano indicando captura de peça inimiga.
- `IsCastling`: Booleano para roque (`kingside` ou `queenside`).
- `Priority`: Valor numérico computado em tempo de execução para ordenação tática de lances (MVV-LVA).

---

## 4. Motor de Regras e Movimentação

### 4.1 Movimentos Pseudo-Legais
Para cada peça na sua posição `(r, c)`:
1. **Peão (`Pawn`)**:
   - Direção de avanço: `Brancas: -1` (para cima, em direção à linha 0), `Pretas: +1` (para baixo, em direção à linha 7).
   - Avanço simples: `(r + dir, c)` se a casa estiver vazia.
   - Avanço duplo: se estiver na linha inicial (`6` para brancas, `1` para pretas) e as duas casas à frente estiverem vazias.
   - Capturas diagonais: `(r + dir, c - 1)` e `(r + dir, c + 1)` se contiverem peça inimiga.
   - Promoção: Ao atingir a linha oposta (`0` para brancas, `7` para pretas), o peão é automaticamente promovido a Dama (`Queen`).
2. **Cavalo (`Knight`)**:
   - Saltos em "L": `(-2, -1)`, `(-2, +1)`, `(-1, -2)`, `(-1, +2)`, `(+1, -2)`, `(+1, +2)`, `(+2, -1)`, `(+2, +1)`.
   - Válido se estiver dentro do tabuleiro e a casa de destino estiver vazia ou com peça inimiga.
3. **Bispo (`Bishop`)**:
   - Raios diagonais nas 4 direções: `(-1, -1)`, `(-1, +1)`, `(+1, -1)`, `(+1, +1)`. Avança até encontrar o limite do tabuleiro ou uma peça.
4. **Torre (`Rook`)**:
   - Raios ortogonais nas 4 direções: `(-1, 0)`, `(+1, 0)`, `(0, -1)`, `(0, +1)`.
5. **Dama (`Queen`)**:
   - Combina as 8 direções ortogonais e diagonais.
6. **Rei (`King`)**:
   - 1 casa em qualquer uma das 8 direções adjacentes.
   - **Roque Menor (O-O)**: Rei em `(homeRow, 4)` e Torre em `(homeRow, 7)`, nenhum moveu-se, casas `5` e `6` vazias e desimpedidas de xeque.
   - **Roque Maior (O-O-O)**: Rei em `(homeRow, 4)` e Torre em `(homeRow, 0)`, nenhum moveu-se, casas `1`, `2` e `3` vazias, e casas `2` e `3` desimpedidas de xeque.

### 4.2 Filtragem de Xeque (Movimentos Estritamente Legais)
Um lance pseudo-legal só é estritamente legal se, após a sua execução no tabuleiro simulado, o próprio Rei da cor do jogador **não** estiver em xeque:

```csharp
// Algoritmo Make/Unmake
Piece piece = board[fromR, fromC];
Piece target = board[toR, toC];

board[toR, toC] = piece;
board[fromR, fromC] = null;

bool kingInCheck = IsKingInCheck(piece.Color, board);

// Reversão
board[fromR, fromC] = piece;
board[toR, toC] = target;

if (!kingInCheck) {
    legalMoves.Add(move);
}
```

---

## 5. Arquitetura da Inteligência Artificial

A inteligência artificial do motor utiliza uma formulação clássica moderna de **Minimax Negamax** com **Poda Alpha-Beta**, **Busca de Quiescência** e **Tabelas de Valor Posicional (Piece-Square Tables - PST)**.

### 5.1 Valores-Base do Material
| Peça | Valor Numérico |
| :--- | :--- |
| **Peão (`Pawn`)** | 100 |
| **Cavalo (`Knight`)** | 320 |
| **Bispo (`Bishop`)** | 335 |
| **Torre (`Rook`)** | 500 |
| **Dama (`Queen`)** | 900 |
| **Rei (`King`)** | 20000 |

### 5.2 Tabelas Posicionais (Piece-Square Tables - PST)
As tabelas determinam o bônus/penalidade posicional de cada peça de acordo com a casa ocupada.
- Para as **Brancas**: O índice de linha da tabela corresponde diretamente a `r` (0 a 7).
- Para as **Pretas**: O índice de linha é invertido: `7 - r`.

#### Peão: Incentiva o avanço, ocupação do centro e punição para ficar recuado
```csharp
static readonly int[,] PawnPST = {
    {  0,  0,  0,  0,  0,  0,  0,  0 },
    { 50, 50, 50, 50, 50, 50, 50, 50 },
    { 10, 10, 20, 30, 30, 20, 10, 10 },
    {  5,  5, 10, 25, 25, 10,  5,  5 },
    {  0,  0,  0, 20, 20,  0,  0,  0 },
    {  5, -5,-10,  0,  0,-10, -5,  5 },
    {  5, 10, 10,-20,-20, 10, 10,  5 },
    {  0,  0,  0,  0,  0,  0,  0,  0 }
};
```

#### Cavalo: Penaliza os cantos e bordas do tabuleiro, incentiva centralização
```csharp
static readonly int[,] KnightPST = {
    {-50,-40,-30,-30,-30,-30,-40,-50 },
    {-40,-20,  0,  0,  0,  0,-20,-40 },
    {-30,  0, 10, 15, 15, 10,  0,-30 },
    {-30,  5, 15, 20, 20, 15,  5,-30 },
    {-30,  0, 15, 20, 20, 15,  0,-30 },
    {-30,  5, 10, 15, 15, 10,  5,-30 },
    {-40,-20,  0,  5,  5,  0,-20,-40 },
    {-50,-40,-30,-30,-30,-30,-40,-50 }
};
```

#### Bispo: Estimula longas diagonais e controle de flanco
```csharp
static readonly int[,] BishopPST = {
    {-20,-10,-10,-10,-10,-10,-10,-20 },
    {-10,  0,  0,  0,  0,  0,  0,-10 },
    {-10,  0,  5, 10, 10,  5,  0,-10 },
    {-10,  5,  5, 10, 10,  5,  5,-10 },
    {-10,  0, 10, 10, 10, 10,  0,-10 },
    {-10, 10, 10, 10, 10, 10, 10,-10 },
    {-10,  5,  0,  0,  0,  0,  5,-10 },
    {-20,-10,-10,-10,-10,-10,-10,-20 }
};
```

#### Rei (Meio-Jogo): Incentiva roque seguro nas alas e penaliza rei exposto no centro
```csharp
static readonly int[,] KingPST = {
    {-30,-40,-40,-50,-50,-40,-40,-30 },
    {-30,-40,-40,-50,-50,-40,-40,-30 },
    {-30,-40,-40,-50,-50,-40,-40,-30 },
    {-30,-40,-40,-50,-50,-40,-40,-30 },
    {-20,-30,-30,-40,-40,-30,-30,-20 },
    {-10,-20,-20,-20,-20,-20,-20,-10 },
    { 20, 20,  0,  0,  0,  0, 20, 20 },
    { 20, 30, 10,  0,  0, 10, 30, 20 }
};
```

### 5.3 Ordenação de Lances (MVV-LVA)
A eficiência da poda Alpha-Beta depende da ordem de avaliação. Capturas são ordenadas por **Most Valuable Victim - Least Valuable Attacker**:
$$\text{Prioridade} = \text{Valor}(\text{Vítima}) \times 10 - \text{Valor}(\text{Atacante})$$
*Exemplo*: Um peão capturando uma Dama tem prioridade $900 \times 10 - 100 = 8900$, sendo avaliado primeiro e disparando cortes beta imediatos.

### 5.4 Busca de Quiescência (*Quiescence Search*)
Resolve o "Efeito Horizonte". Se a profundidade regular esgota-se durante uma troca pendente (ex.: Dama sob ataque), a busca avalia somente capturas adicionais até estabilizar a posição estática (*stand-pat*).

---

## 6. Especificação dos 4 Níveis de Dificuldade

| Nível | Profundidade Regular | Quiescência | Taxa de Erro (*Blunder*) | Ruído Aleatório | Comportamento e Foco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fácil** | 1 lance (ou lance casual) | Não | 45% de lances casuais | $\pm 85$ pontos | Indicado para iniciantes; permite que o jogador explore táticas sem ser punido duramente. |
| **Médio** | 1 lance tático | Não | 0% | $\pm 12$ pontos | Avaliação de centro, ganho de material e proteção básica de peças penduradas. |
| **Difícil** | 2 lances (plies) | Sim (1 ply extra) | 0% | $\pm 0$ pontos | Minimax com Alpha-Beta completo; antecipa armadilhas de 2 turnos e defende o rei. |
| **Hard Master ⚔️** | 3 lances (plies) | Sim (2 plies extras) | 0% | $\pm 0$ pontos | Minimax profundo, ordenação MVV-LVA, bônus de par de bispos, penalidade para peões dobrados/isolados. Jogo implacável. |

---

## 7. Guia de Portabilidade entre Linguagens

### 7.1 C# Puro (.NET Standard 2.0 / .NET 6-9)
- **Matriz**: `Piece[,] board = new Piece[8, 8];`
- **Tipos de Lances**: `readonly struct Move` (armazenada na stack, sem alocação no heap do Garbage Collector).
- **Enums**: Enumerações nativas fortemente tipadas `enum PieceType`, `enum PieceColor`.
- **Coleções**: `List<Move>` reutilizável ou `Span<Move>` para máxima performance em Unity / .NET.

### 7.2 Java Puro (JDK 11 / 17 / 21)
- **Matriz**: `Piece[][] board = new Piece[8][8];` ou array unidimensional `Piece[64]`.
- **Lances**: `public record Move(int fromR, int fromC, int toR, int toC, boolean isCapture, int priority) {}` (Java 16+) ou classe `final class Move`.
- **Enums**: `public enum PieceType { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING }`.
- **Sem Dependências**: Requer apenas `java.util.List` e `java.util.ArrayList`.

### 7.3 Lua Puro (5.3, 5.4 ou LuaJIT)
- **Indexação 1-based**: Em Lua, arrays começam em `1`. Mapear:
  `linha 1 a 8` e `coluna 1 a 8`, ou utilizar aritmética `(r-1)*8 + c`.
- **Tabelas de Lances**: Reutilizar tabelas (*table pooling*) em LuaJIT para evitar pressão sobre o coletor de lixo em loops Minimax de profundidade 3.
- **Tabelas PST**: Tabelas numéricas multidimensionais `PawnPST[r][c]`.

---

## 8. Estrutura do Código em C# Fornecido

O código fonte em C# puro foi consolidado em `csharp/WizardChessEngine.cs` no namespace `WizardChess.Core`.

### Como compilar e executar:
Em qualquer ambiente com .NET instalado:
```bash
# Criar projeto de console simples
dotnet new console -n WizardChessCli
cp WizardChessEngine.cs WizardChessCli/Program.cs
cd WizardChessCli
dotnet run
```

Ou no Unity / Godot:
1. Copie o arquivo `WizardChessEngine.cs` para a pasta `Scripts/` ou `Core/` do projeto.
2. Acesse a API estática e orientada a objetos:
```csharp
var engine = new WizardChess.Core.ChessEngine();
engine.SetDifficulty(WizardChess.Core.AIDifficulty.HardMaster);
engine.MakeMove("e2", "e4");
WizardChess.Core.Move aiMove = engine.GenerateAIMove();
engine.ApplyMove(aiMove);
```
