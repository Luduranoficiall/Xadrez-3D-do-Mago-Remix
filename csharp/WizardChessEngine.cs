// ============================================================================
// Wizard Chess Core Engine & Multi-Level AI
// Linguagem: C# Puro (.NET Standard 2.0 / .NET Core / .NET 6 / 7 / 8 / 9)
// Zero dependências externas (Apenas BCL: System, Collections.Generic, Text)
// Adequado para Console, Backend, Unity e Godot
// ============================================================================

using System;
using System.Collections.Generic;
using System.Text;

namespace WizardChess.Core
{
    #region Enums

    public enum PieceType
    {
        Pawn,
        Knight,
        Bishop,
        Rook,
        Queen,
        King
    }

    public enum PieceColor
    {
        White,
        Black
    }

    public enum AIDifficulty
    {
        Facil,       // Aprendiz • Casual (blunder amigável e busca com ruído)
        Medio,       // Adepto • Posicional (1-ply com PST, centro e defesa)
        Dificil,     // Arquimago • Minimax (2-ply Minimax + Alpha-Beta + Quiescência)
        HardMaster   // Grão-Mestre • Sanctum (3-ply Minimax + Alpha-Beta + Quiescência + MVV-LVA + Estrutura)
    }

    #endregion

    #region Modelos de Peça e Lance

    public sealed class Piece
    {
        public PieceType Type { get; set; }
        public PieceColor Color { get; }
        public bool HasMoved { get; set; }

        public Piece(PieceType type, PieceColor color, bool hasMoved = false)
        {
            Type = type;
            Color = color;
            HasMoved = hasMoved;
        }

        public Piece Clone()
        {
            return new Piece(Type, Color, HasMoved);
        }

        public char ToChar()
        {
            char c = Type switch
            {
                PieceType.Pawn => 'P',
                PieceType.Knight => 'N',
                PieceType.Bishop => 'B',
                PieceType.Rook => 'R',
                PieceType.Queen => 'Q',
                PieceType.King => 'K',
                _ => '?'
            };
            return Color == PieceColor.White ? char.ToUpper(c) : char.ToLower(c);
        }

        public string ToUnicodeSymbol()
        {
            return (Color, Type) switch
            {
                (PieceColor.White, PieceType.King) => "♔",
                (PieceColor.White, PieceType.Queen) => "♕",
                (PieceColor.White, PieceType.Rook) => "♖",
                (PieceColor.White, PieceType.Bishop) => "♗",
                (PieceColor.White, PieceType.Knight) => "♘",
                (PieceColor.White, PieceType.Pawn) => "♙",
                (PieceColor.Black, PieceType.King) => "♚",
                (PieceColor.Black, PieceType.Queen) => "♛",
                (PieceColor.Black, PieceType.Rook) => "♜",
                (PieceColor.Black, PieceType.Bishop) => "♝",
                (PieceColor.Black, PieceType.Knight) => "♞",
                (PieceColor.Black, PieceType.Pawn) => "♟",
                _ => " "
            };
        }
    }

    public readonly struct Move
    {
        public int FromR { get; }
        public int FromC { get; }
        public int ToR { get; }
        public int ToC { get; }
        public bool IsCapture { get; }
        public bool IsCastling { get; }
        public char CastleSide { get; } // 'k' (kingside) ou 'q' (queenside)
        public int Priority { get; }

        public Move(int fromR, int fromC, int toR, int toC, bool isCapture, bool isCastling = false, char castleSide = '\0', int priority = 0)
        {
            FromR = fromR;
            FromC = fromC;
            ToR = toR;
            ToC = toC;
            IsCapture = isCapture;
            IsCastling = isCastling;
            CastleSide = castleSide;
            Priority = priority;
        }

        public string ToAlgebraic()
        {
            char fromCol = (char)('a' + FromC);
            int fromRow = 8 - FromR;
            char toCol = (char)('a' + ToC);
            int toRow = 8 - ToR;
            return $"{fromCol}{fromRow}{toCol}{toRow}";
        }

        public override string ToString()
        {
            return ToAlgebraic();
        }
    }

    #endregion

    #region Tabuleiro e Validação de Regras

    public sealed class ChessBoard
    {
        private readonly Piece[,] _squares = new Piece[8, 8];

        public ChessBoard()
        {
            SetupStandardBoard();
        }

        public Piece this[int r, int c]
        {
            get => (r >= 0 && r < 8 && c >= 0 && c < 8) ? _squares[r, c] : null;
            set
            {
                if (r >= 0 && r < 8 && c >= 0 && c < 8)
                {
                    _squares[r, c] = value;
                }
            }
        }

        public void SetupStandardBoard()
        {
            for (int r = 0; r < 8; r++)
                for (int c = 0; c < 8; c++)
                    _squares[r, c] = null;

            PieceType[] backRow = {
                PieceType.Rook, PieceType.Knight, PieceType.Bishop,
                PieceType.Queen, PieceType.King, PieceType.Bishop,
                PieceType.Knight, PieceType.Rook
            };

            // Pretas (Linhas 0 e 1)
            for (int c = 0; c < 8; c++)
            {
                _squares[0, c] = new Piece(backRow[c], PieceColor.Black);
                _squares[1, c] = new Piece(PieceType.Pawn, PieceColor.Black);
            }

            // Brancas (Linhas 6 e 7)
            for (int c = 0; c < 8; c++)
            {
                _squares[6, c] = new Piece(PieceType.Pawn, PieceColor.White);
                _squares[7, c] = new Piece(backRow[c], PieceColor.White);
            }
        }

        public ChessBoard Clone()
        {
            var copy = new ChessBoard();
            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    copy._squares[r, c] = _squares[r, c]?.Clone();
                }
            }
            return copy;
        }

        public bool IsKingInCheck(PieceColor kingColor)
        {
            int kingR = -1;
            int kingC = -1;

            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    var p = _squares[r, c];
                    if (p != null && p.Color == kingColor && p.Type == PieceType.King)
                    {
                        kingR = r;
                        kingC = c;
                        break;
                    }
                }
                if (kingR != -1) break;
            }

            if (kingR == -1) return true; // Rei capturado ou ausente

            PieceColor opponentColor = kingColor == PieceColor.White ? PieceColor.Black : PieceColor.White;

            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    var opp = _squares[r, c];
                    if (opp != null && opp.Color == opponentColor)
                    {
                        var pseudoMoves = MoveGenerator.GetPseudoMovesForPiece(r, c, this);
                        foreach (var m in pseudoMoves)
                        {
                            if (m.ToR == kingR && m.ToC == kingC)
                            {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }
    }

    #endregion

    #region Gerador de Lances

    public static class MoveGenerator
    {
        private static readonly int[][] KnightJumps = {
            new[] { -2, -1 }, new[] { -2, 1 },
            new[] { -1, -2 }, new[] { -1, 2 },
            new[] { 1, -2 }, new[] { 1, 2 },
            new[] { 2, -1 }, new[] { 2, 1 }
        };

        private static readonly int[][] OrthogonalDirs = {
            new[] { -1, 0 }, new[] { 1, 0 }, new[] { 0, -1 }, new[] { 0, 1 }
        };

        private static readonly int[][] DiagonalDirs = {
            new[] { -1, -1 }, new[] { -1, 1 }, new[] { 1, -1 }, new[] { 1, 1 }
        };

        public static List<Move> GetPseudoMovesForPiece(int r, int c, ChessBoard board)
        {
            var moves = new List<Move>(28);
            Piece piece = board[r, c];
            if (piece == null) return moves;

            int dir = piece.Color == PieceColor.White ? -1 : 1;

            bool InBounds(int nr, int nc) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

            bool TryAddMove(int nr, int nc)
            {
                if (!InBounds(nr, nc)) return false;
                Piece target = board[nr, nc];
                if (target == null)
                {
                    moves.Add(new Move(r, c, nr, nc, isCapture: false));
                    return true;
                }
                if (target.Color != piece.Color)
                {
                    moves.Add(new Move(r, c, nr, nc, isCapture: true));
                    return false; // Bloqueado após captura
                }
                return false; // Bloqueado por peça amiga
            }

            switch (piece.Type)
            {
                case PieceType.Pawn:
                    // Avanço simples
                    if (InBounds(r + dir, c) && board[r + dir, c] == null)
                    {
                        moves.Add(new Move(r, c, r + dir, c, isCapture: false));
                        int startRow = piece.Color == PieceColor.White ? 6 : 1;
                        // Avanço duplo
                        if (r == startRow && board[r + dir * 2, c] == null)
                        {
                            moves.Add(new Move(r, c, r + dir * 2, c, isCapture: false));
                        }
                    }
                    // Capturas diagonais
                    foreach (int dc in new[] { -1, 1 })
                    {
                        int targetC = c + dc;
                        if (InBounds(r + dir, targetC))
                        {
                            Piece target = board[r + dir, targetC];
                            if (target != null && target.Color != piece.Color)
                            {
                                moves.Add(new Move(r, c, r + dir, targetC, isCapture: true));
                            }
                        }
                    }
                    break;

                case PieceType.Knight:
                    foreach (var jump in KnightJumps)
                    {
                        TryAddMove(r + jump[0], c + jump[1]);
                    }
                    break;

                case PieceType.King:
                    for (int dr = -1; dr <= 1; dr++)
                    {
                        for (int dc = -1; dc <= 1; dc++)
                        {
                            if (dr != 0 || dc != 0)
                            {
                                TryAddMove(r + dr, c + dc);
                            }
                        }
                    }
                    break;

                case PieceType.Bishop:
                    foreach (var d in DiagonalDirs)
                    {
                        for (int step = 1; step < 8; step++)
                        {
                            if (!TryAddMove(r + d[0] * step, c + d[1] * step)) break;
                        }
                    }
                    break;

                case PieceType.Rook:
                    foreach (var d in OrthogonalDirs)
                    {
                        for (int step = 1; step < 8; step++)
                        {
                            if (!TryAddMove(r + d[0] * step, c + d[1] * step)) break;
                        }
                    }
                    break;

                case PieceType.Queen:
                    foreach (var d in OrthogonalDirs)
                    {
                        for (int step = 1; step < 8; step++)
                        {
                            if (!TryAddMove(r + d[0] * step, c + d[1] * step)) break;
                        }
                    }
                    foreach (var d in DiagonalDirs)
                    {
                        for (int step = 1; step < 8; step++)
                        {
                            if (!TryAddMove(r + d[0] * step, c + d[1] * step)) break;
                        }
                    }
                    break;
            }

            return moves;
        }

        public static List<Move> GetLegalMovesForPiece(int r, int c, ChessBoard board)
        {
            var piece = board[r, c];
            if (piece == null) return new List<Move>();

            var pseudo = GetPseudoMovesForPiece(r, c, board);
            var legal = new List<Move>(pseudo.Count);

            foreach (var m in pseudo)
            {
                var target = board[m.ToR, m.ToC];
                board[m.ToR, m.ToC] = piece;
                board[r, c] = null;

                bool inCheck = board.IsKingInCheck(piece.Color);

                board[r, c] = piece;
                board[m.ToR, m.ToC] = target;

                if (!inCheck)
                {
                    legal.Add(m);
                }
            }

            // Validação de Roque (Castling)
            int homeRow = piece.Color == PieceColor.White ? 7 : 0;
            if (piece.Type == PieceType.King && !piece.HasMoved && r == homeRow && c == 4 && !board.IsKingInCheck(piece.Color))
            {
                // Roque Menor (O-O: c=4 para c=6 com torre em c=7)
                var kRook = board[homeRow, 7];
                if (kRook != null && kRook.Type == PieceType.Rook && kRook.Color == piece.Color && !kRook.HasMoved &&
                    board[homeRow, 5] == null && board[homeRow, 6] == null)
                {
                    board[homeRow, 5] = piece; board[homeRow, 4] = null;
                    bool checkF = board.IsKingInCheck(piece.Color);
                    board[homeRow, 6] = piece; board[homeRow, 5] = null;
                    bool checkG = board.IsKingInCheck(piece.Color);
                    board[homeRow, 4] = piece; board[homeRow, 6] = null;

                    if (!checkF && !checkG)
                    {
                        legal.Add(new Move(homeRow, 4, homeRow, 6, isCapture: false, isCastling: true, castleSide: 'k'));
                    }
                }

                // Roque Maior (O-O-O: c=4 para c=2 com torre em c=0)
                var qRook = board[homeRow, 0];
                if (qRook != null && qRook.Type == PieceType.Rook && qRook.Color == piece.Color && !qRook.HasMoved &&
                    board[homeRow, 1] == null && board[homeRow, 2] == null && board[homeRow, 3] == null)
                {
                    board[homeRow, 3] = piece; board[homeRow, 4] = null;
                    bool checkD = board.IsKingInCheck(piece.Color);
                    board[homeRow, 2] = piece; board[homeRow, 3] = null;
                    bool checkC = board.IsKingInCheck(piece.Color);
                    board[homeRow, 4] = piece; board[homeRow, 2] = null;

                    if (!checkD && !checkC)
                    {
                        legal.Add(new Move(homeRow, 4, homeRow, 2, isCapture: false, isCastling: true, castleSide: 'q'));
                    }
                }
            }

            return legal;
        }

        public static List<Move> GetAllLegalMoves(PieceColor color, ChessBoard board)
        {
            var all = new List<Move>(64);
            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    var p = board[r, c];
                    if (p != null && p.Color == color)
                    {
                        all.AddRange(GetLegalMovesForPiece(r, c, board));
                    }
                }
            }
            return all;
        }
    }

    #endregion

    #region Motor de Inteligência Artificial (Minimax, Quiescência e PST)

    public static class AIEngine
    {
        private static readonly Random Rnd = new Random();

        public static readonly Dictionary<PieceType, int> PieceValues = new Dictionary<PieceType, int>
        {
            { PieceType.Pawn, 100 },
            { PieceType.Knight, 320 },
            { PieceType.Bishop, 335 },
            { PieceType.Rook, 500 },
            { PieceType.Queen, 900 },
            { PieceType.King, 20000 }
        };

        private static readonly int[,] PawnPST = {
            {  0,  0,  0,  0,  0,  0,  0,  0 },
            { 50, 50, 50, 50, 50, 50, 50, 50 },
            { 10, 10, 20, 30, 30, 20, 10, 10 },
            {  5,  5, 10, 25, 25, 10,  5,  5 },
            {  0,  0,  0, 20, 20,  0,  0,  0 },
            {  5, -5,-10,  0,  0,-10, -5,  5 },
            {  5, 10, 10,-20,-20, 10, 10,  5 },
            {  0,  0,  0,  0,  0,  0,  0,  0 }
        };

        private static readonly int[,] KnightPST = {
            {-50,-40,-30,-30,-30,-30,-40,-50 },
            {-40,-20,  0,  0,  0,  0,-20,-40 },
            {-30,  0, 10, 15, 15, 10,  0,-30 },
            {-30,  5, 15, 20, 20, 15,  5,-30 },
            {-30,  0, 15, 20, 20, 15,  0,-30 },
            {-30,  5, 10, 15, 15, 10,  5,-30 },
            {-40,-20,  0,  5,  5,  0,-20,-40 },
            {-50,-40,-30,-30,-30,-30,-40,-50 }
        };

        private static readonly int[,] BishopPST = {
            {-20,-10,-10,-10,-10,-10,-10,-20 },
            {-10,  0,  0,  0,  0,  0,  0,-10 },
            {-10,  0,  5, 10, 10,  5,  0,-10 },
            {-10,  5,  5, 10, 10,  5,  5,-10 },
            {-10,  0, 10, 10, 10, 10,  0,-10 },
            {-10, 10, 10, 10, 10, 10, 10,-10 },
            {-10,  5,  0,  0,  0,  0,  5,-10 },
            {-20,-10,-10,-10,-10,-10,-10,-20 }
        };

        private static readonly int[,] RookPST = {
            {  0,  0,  0,  0,  0,  0,  0,  0 },
            {  5, 10, 10, 10, 10, 10, 10,  5 },
            { -5,  0,  0,  0,  0,  0,  0, -5 },
            { -5,  0,  0,  0,  0,  0,  0, -5 },
            { -5,  0,  0,  0,  0,  0,  0, -5 },
            { -5,  0,  0,  0,  0,  0,  0, -5 },
            { -5,  0,  0,  0,  0,  0,  0, -5 },
            {  0,  0,  0,  5,  5,  0,  0,  0 }
        };

        private static readonly int[,] QueenPST = {
            {-20,-10,-10, -5, -5,-10,-10,-20 },
            {-10,  0,  0,  0,  0,  0,  0,-10 },
            {-10,  0,  5,  5,  5,  5,  0,-10 },
            { -5,  0,  5,  5,  5,  5,  0, -5 },
            {  0,  0,  5,  5,  5,  5,  0, -5 },
            {-10,  5,  5,  5,  5,  5,  0,-10 },
            {-10,  0,  5,  0,  0,  0,  0,-10 },
            {-20,-10,-10, -5, -5,-10,-10,-20 }
        };

        private static readonly int[,] KingPST = {
            {-30,-40,-40,-50,-50,-40,-40,-30 },
            {-30,-40,-40,-50,-50,-40,-40,-30 },
            {-30,-40,-40,-50,-50,-40,-40,-30 },
            {-30,-40,-40,-50,-50,-40,-40,-30 },
            {-20,-30,-30,-40,-40,-30,-30,-20 },
            {-10,-20,-20,-20,-20,-20,-20,-10 },
            { 20, 20,  0,  0,  0,  0, 20, 20 },
            { 20, 30, 10,  0,  0, 10, 30, 20 }
        };

        public static List<Move> GetMovesForMinimax(PieceColor color, ChessBoard board, bool capturesOnly = false)
        {
            var moves = new List<Move>(40);
            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    var piece = board[r, c];
                    if (piece != null && piece.Color == color)
                    {
                        var pseudo = MoveGenerator.GetPseudoMovesForPiece(r, c, board);
                        foreach (var m in pseudo)
                        {
                            if (capturesOnly && !m.IsCapture) continue;

                            var target = board[m.ToR, m.ToC];
                            board[m.ToR, m.ToC] = piece;
                            board[r, c] = null;

                            bool inCheck = board.IsKingInCheck(color);

                            board[r, c] = piece;
                            board[m.ToR, m.ToC] = target;

                            if (!inCheck)
                            {
                                int priority = 0;
                                if (m.IsCapture && target != null)
                                {
                                    // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
                                    priority = PieceValues[target.Type] * 10 - PieceValues[piece.Type];
                                }
                                moves.Add(new Move(r, c, m.ToR, m.ToC, m.IsCapture, m.IsCastling, m.CastleSide, priority));
                            }
                        }
                    }
                }
            }

            // Ordenação: lances com maior prioridade tática primeiro
            moves.Sort((a, b) => b.Priority.CompareTo(a.Priority));
            return moves;
        }

        public static int EvaluateBoardStatic(ChessBoard board, PieceColor perspectiveColor, bool isHardMaster = false)
        {
            int whiteScore = 0;
            int blackScore = 0;
            int whiteBishops = 0;
            int blackBishops = 0;
            int[] whitePawnsByCol = new int[8];
            int[] blackPawnsByCol = new int[8];

            for (int r = 0; r < 8; r++)
            {
                for (int c = 0; c < 8; c++)
                {
                    var p = board[r, c];
                    if (p == null) continue;

                    int val = PieceValues[p.Type];
                    int pRow = p.Color == PieceColor.White ? r : (7 - r);
                    int pstBonus = p.Type switch
                    {
                        PieceType.Pawn => PawnPST[pRow, c],
                        PieceType.Knight => KnightPST[pRow, c],
                        PieceType.Bishop => BishopPST[pRow, c],
                        PieceType.Rook => RookPST[pRow, c],
                        PieceType.Queen => QueenPST[pRow, c],
                        PieceType.King => KingPST[pRow, c],
                        _ => 0
                    };

                    if (p.Type == PieceType.Bishop)
                    {
                        if (p.Color == PieceColor.White) whiteBishops++;
                        else blackBishops++;
                    }
                    else if (p.Type == PieceType.Pawn)
                    {
                        if (p.Color == PieceColor.White) whitePawnsByCol[c]++;
                        else blackPawnsByCol[c]++;
                    }

                    if (p.Color == PieceColor.White) whiteScore += val + pstBonus;
                    else blackScore += val + pstBonus;
                }
            }

            // Bônus de par de bispos
            if (whiteBishops >= 2) whiteScore += 35;
            if (blackBishops >= 2) blackScore += 35;

            // Análise avançada de peões no nível Hard Master
            if (isHardMaster)
            {
                for (int c = 0; c < 8; c++)
                {
                    // Peões dobrados
                    if (whitePawnsByCol[c] > 1) whiteScore -= (whitePawnsByCol[c] - 1) * 20;
                    if (blackPawnsByCol[c] > 1) blackScore -= (blackPawnsByCol[c] - 1) * 20;

                    // Peões isolados
                    bool hasWhiteNeighbor = (c > 0 && whitePawnsByCol[c - 1] > 0) || (c < 7 && whitePawnsByCol[c + 1] > 0);
                    if (whitePawnsByCol[c] > 0 && !hasWhiteNeighbor) whiteScore -= 18;

                    bool hasBlackNeighbor = (c > 0 && blackPawnsByCol[c - 1] > 0) || (c < 7 && blackPawnsByCol[c + 1] > 0);
                    if (blackPawnsByCol[c] > 0 && !hasBlackNeighbor) blackScore -= 18;
                }
            }

            return perspectiveColor == PieceColor.White ? (whiteScore - blackScore) : (blackScore - whiteScore);
        }

        private static int Quiescence(ChessBoard board, PieceColor color, int alpha, int beta, bool isHardMaster, int qDepth = 0)
        {
            int standPat = EvaluateBoardStatic(board, color, isHardMaster);
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;

            int maxQDepth = isHardMaster ? 2 : 1;
            if (qDepth >= maxQDepth) return alpha;

            var captures = GetMovesForMinimax(color, board, capturesOnly: true);
            foreach (var m in captures)
            {
                var piece = board[m.FromR, m.FromC];
                var target = board[m.ToR, m.ToC];
                var origType = piece.Type;
                bool isPromo = origType == PieceType.Pawn && (m.ToR == 0 || m.ToR == 7);
                if (isPromo) piece.Type = PieceType.Queen;

                board[m.ToR, m.ToC] = piece;
                board[m.FromR, m.FromC] = null;

                PieceColor oppColor = color == PieceColor.White ? PieceColor.Black : PieceColor.White;
                int score = -Quiescence(board, oppColor, -beta, -alpha, isHardMaster, qDepth + 1);

                board[m.FromR, m.FromC] = piece;
                board[m.ToR, m.ToC] = target;
                if (isPromo) piece.Type = origType;

                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            }

            return alpha;
        }

        public static (Move? BestMove, int Score) MinimaxAlphaBeta(
            ChessBoard board, PieceColor color, int depth, int alpha, int beta, bool isHardMaster, bool isRoot = false)
        {
            if (depth == 0)
            {
                return (null, Quiescence(board, color, alpha, beta, isHardMaster));
            }

            var legalMoves = GetMovesForMinimax(color, board, capturesOnly: false);
            if (legalMoves.Count == 0)
            {
                if (board.IsKingInCheck(color))
                {
                    return (null, -20000 - depth); // Xeque-mate sofrido
                }
                return (null, 0); // Empate por afogamento (stalemate)
            }

            int bestScore = -int.MaxValue;
            Move bestMove = legalMoves[0];

            foreach (var m in legalMoves)
            {
                var piece = board[m.FromR, m.FromC];
                var target = board[m.ToR, m.ToC];
                var origType = piece.Type;
                bool isPromo = origType == PieceType.Pawn && (m.ToR == 0 || m.ToR == 7);
                if (isPromo) piece.Type = PieceType.Queen;

                board[m.ToR, m.ToC] = piece;
                board[m.FromR, m.FromC] = null;

                PieceColor oppColor = color == PieceColor.White ? PieceColor.Black : PieceColor.White;
                var (_, childScore) = MinimaxAlphaBeta(board, oppColor, depth - 1, -beta, -alpha, isHardMaster, false);
                int score = -childScore;

                board[m.FromR, m.FromC] = piece;
                board[m.ToR, m.ToC] = target;
                if (isPromo) piece.Type = origType;

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMove = m;
                }
                if (score > alpha)
                {
                    alpha = score;
                }
                if (alpha >= beta)
                {
                    break; // Poda Alpha-Beta
                }
            }

            return (bestMove, bestScore);
        }

        public static Move? ChooseAIMove(ChessBoard board, PieceColor color, AIDifficulty difficulty)
        {
            var legalMoves = MoveGenerator.GetAllLegalMoves(color, board);
            if (legalMoves.Count == 0) return null;
            if (legalMoves.Count == 1) return legalMoves[0];

            switch (difficulty)
            {
                // =============================================================
                // 1. FÁCIL: Aprendiz • Casual (45% de erro tático amigável)
                // =============================================================
                case AIDifficulty.Facil:
                    if (Rnd.NextDouble() < 0.45)
                    {
                        var safeMoves = legalMoves.FindAll(m =>
                        {
                            var p = board[m.FromR, m.FromC];
                            return p != null && p.Type != PieceType.Queen && p.Type != PieceType.King;
                        });
                        var pool = safeMoves.Count > 0 ? safeMoves : legalMoves;
                        return pool[Rnd.Next(pool.Count)];
                    }

                    int bestEasyScore = -int.MaxValue;
                    var easyCandidates = new List<Move>();
                    foreach (var m in legalMoves)
                    {
                        var piece = board[m.FromR, m.FromC];
                        var target = board[m.ToR, m.ToC];
                        int score = 0;
                        if (target != null) score += (int)(PieceValues[target.Type] * 0.85);

                        int centerDist = Math.Abs(3 - m.ToR) + Math.Abs(3 - m.ToC);
                        score += (7 - centerDist) * 4;
                        score += (int)((Rnd.NextDouble() - 0.5) * 85);

                        if (score > bestEasyScore + 1)
                        {
                            bestEasyScore = score;
                            easyCandidates = new List<Move> { m };
                        }
                        else if (Math.Abs(score - bestEasyScore) <= 1)
                        {
                            easyCandidates.Add(m);
                        }
                    }
                    return easyCandidates[Rnd.Next(easyCandidates.Count)];

                // =============================================================
                // 2. MÉDIO: Adepto • Posicional (1-ply com centro, PST e defesa)
                // =============================================================
                case AIDifficulty.Medio:
                    int bestMedScore = -int.MaxValue;
                    var medCandidates = new List<Move>();
                    PieceColor oppColor = color == PieceColor.White ? PieceColor.Black : PieceColor.White;

                    foreach (var m in legalMoves)
                    {
                        var piece = board[m.FromR, m.FromC];
                        var target = board[m.ToR, m.ToC];
                        int score = 0;

                        if (target != null)
                        {
                            score += (int)(PieceValues[target.Type] * 1.15 - PieceValues[piece.Type] * 0.1);
                        }

                        int centerDist = Math.Abs(3 - m.ToR) + Math.Abs(3 - m.ToC);
                        score += (7 - centerDist) * 8;

                        if (piece.Type == PieceType.Pawn)
                        {
                            int advance = color == PieceColor.White ? (6 - m.ToR) : (m.ToR - 1);
                            score += advance * 12;
                        }

                        // Simulação para verificar ameaça de xeque e recaptura
                        board[m.ToR, m.ToC] = piece;
                        board[m.FromR, m.FromC] = null;

                        if (board.IsKingInCheck(oppColor))
                        {
                            score += 35;
                        }

                        // Penalizar se a casa for atacada imediatamente por peça inimiga
                        for (int rr = 0; rr < 8; rr++)
                        {
                            for (int cc = 0; cc < 8; cc++)
                            {
                                var opp = board[rr, cc];
                                if (opp != null && opp.Color == oppColor)
                                {
                                    var oppMoves = MoveGenerator.GetPseudoMovesForPiece(rr, cc, board);
                                    if (oppMoves.Exists(om => om.ToR == m.ToR && om.ToC == m.ToC))
                                    {
                                        score -= (int)(PieceValues[piece.Type] * 0.75);
                                        break;
                                    }
                                }
                            }
                        }

                        board[m.FromR, m.FromC] = piece;
                        board[m.ToR, m.ToC] = target;

                        score += (int)((Rnd.NextDouble() - 0.5) * 12);

                        if (score > bestMedScore + 1)
                        {
                            bestMedScore = score;
                            medCandidates = new List<Move> { m };
                        }
                        else if (Math.Abs(score - bestMedScore) <= 1)
                        {
                            medCandidates.Add(m);
                        }
                    }
                    return medCandidates[Rnd.Next(medCandidates.Count)];

                // =============================================================
                // 3. DIFÍCIL: Arquimago (Minimax 2-ply + Quiescência)
                // =============================================================
                case AIDifficulty.Dificil:
                    var (diffMove, _) = MinimaxAlphaBeta(board, color, depth: 2, -int.MaxValue, int.MaxValue, isHardMaster: false, isRoot: true);
                    return diffMove ?? legalMoves[0];

                // =============================================================
                // 4. HARD MASTER ⚔️: Grão-Mestre (Minimax 3-ply + Quiescência estendida)
                // =============================================================
                case AIDifficulty.HardMaster:
                default:
                    var (masterMove, _) = MinimaxAlphaBeta(board, color, depth: 3, -int.MaxValue, int.MaxValue, isHardMaster: true, isRoot: true);
                    return masterMove ?? legalMoves[0];
            }
        }
    }

    #endregion

    #region Controlador de Jogo (Loop de Estado & CLI)

    public sealed class ChessGame
    {
        public ChessBoard Board { get; }
        public PieceColor CurrentTurn { get; private set; }
        public AIDifficulty Difficulty { get; set; }
        public PieceColor PlayerColor { get; set; }
        public bool GameOver { get; private set; }
        public string GameResult { get; private set; }
        public List<Move> MoveHistory { get; }

        public ChessGame(AIDifficulty difficulty = AIDifficulty.Dificil, PieceColor playerColor = PieceColor.White)
        {
            Board = new ChessBoard();
            CurrentTurn = PieceColor.White;
            Difficulty = difficulty;
            PlayerColor = playerColor;
            GameOver = false;
            GameResult = string.Empty;
            MoveHistory = new List<Move>();
        }

        public bool ApplyMove(Move move)
        {
            if (GameOver) return false;

            var piece = Board[move.FromR, move.FromC];
            if (piece == null || piece.Color != CurrentTurn) return false;

            // Executar movimento
            Board[move.ToR, move.ToC] = piece;
            Board[move.FromR, move.FromC] = null;
            piece.HasMoved = true;

            // Executar Torre em caso de Roque
            if (move.IsCastling)
            {
                if (move.CastleSide == 'k') // Menor: Torre vai de c=7 para c=5
                {
                    var rook = Board[move.ToR, 7];
                    Board[move.ToR, 5] = rook;
                    Board[move.ToR, 7] = null;
                    if (rook != null) rook.HasMoved = true;
                }
                else if (move.CastleSide == 'q') // Maior: Torre vai de c=0 para c=3
                {
                    var rook = Board[move.ToR, 0];
                    Board[move.ToR, 3] = rook;
                    Board[move.ToR, 0] = null;
                    if (rook != null) rook.HasMoved = true;
                }
            }

            // Promoção de Peão para Dama automática
            if (piece.Type == PieceType.Pawn && (move.ToR == 0 || move.ToR == 7))
            {
                piece.Type = PieceType.Queen;
            }

            MoveHistory.Add(move);
            CurrentTurn = CurrentTurn == PieceColor.White ? PieceColor.Black : PieceColor.White;

            CheckGameStatus();
            return true;
        }

        public bool MakeAIMove()
        {
            if (GameOver) return false;
            var chosen = AIEngine.ChooseAIMove(Board, CurrentTurn, Difficulty);
            if (chosen.HasValue)
            {
                return ApplyMove(chosen.Value);
            }
            return false;
        }

        private void CheckGameStatus()
        {
            var legalMoves = MoveGenerator.GetAllLegalMoves(CurrentTurn, Board);
            if (legalMoves.Count == 0)
            {
                GameOver = true;
                if (Board.IsKingInCheck(CurrentTurn))
                {
                    string winner = CurrentTurn == PieceColor.White ? "Pretas" : "Brancas";
                    GameResult = $"Xeque-mate! Vitória das {winner}.";
                }
                else
                {
                    GameResult = "Empate por Afogamento (Stalemate).";
                }
            }
        }

        public void RenderToConsole()
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.WriteLine();
            Console.WriteLine("    a   b   c   d   e   f   g   h");
            Console.WriteLine("  ┌───┬───┬───┬───┬───┬───┬───┬───┐");

            for (int r = 0; r < 8; r++)
            {
                Console.Write($"{8 - r} │");
                for (int c = 0; c < 8; c++)
                {
                    var p = Board[r, c];
                    string symbol = p != null ? p.ToUnicodeSymbol() : " ";
                    Console.Write($" {symbol} │");
                }
                Console.WriteLine($" {8 - r}");

                if (r < 7)
                    Console.WriteLine("  ├───┼───┼───┼───┼───┼───┼───┼───┤");
                else
                    Console.WriteLine("  └───┴───┴───┴───┴───┴───┴───┴───┘");
            }
            Console.WriteLine("    a   b   c   d   e   f   g   h");
            Console.WriteLine();
            Console.WriteLine($"Turno: {(CurrentTurn == PieceColor.White ? "Brancas" : "Pretas")} | Dificuldade: {Difficulty}");
            if (Board.IsKingInCheck(CurrentTurn) && !GameOver)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(">>> XEQUE! <<<");
                Console.ResetColor();
            }
            if (GameOver)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($">>> FIM DE JOGO: {GameResult} <<<");
                Console.ResetColor();
            }
        }
    }

    #endregion

    #region Console Entry Point (CLI Executável)

    public static class Program
    {
        public static void Main(string[] args)
        {
            Console.Title = "Wizard Chess 3D — Motor C# Puro";
            Console.WriteLine("==========================================================");
            Console.WriteLine("   Wizard Chess — Motor de Xadrez e IA em C# Puro");
            Console.WriteLine("   Níveis: Facil | Medio | Dificil | HardMaster");
            Console.WriteLine("==========================================================");

            var game = new ChessGame(AIDifficulty.Dificil, PieceColor.White);
            game.RenderToConsole();

            Console.WriteLine("\nComandos:");
            Console.WriteLine("  - Lance em coordenadas (ex: e2 e4 ou e2e4)");
            Console.WriteLine("  - 'ai' para forçar lance da IA");
            Console.WriteLine("  - 'diff [facil|medio|dificil|master]' para trocar nível");
            Console.WriteLine("  - 'reset' para novo jogo | 'sair' para encerrar");

            while (!game.GameOver)
            {
                if (game.CurrentTurn != game.PlayerColor)
                {
                    Console.WriteLine($"\nIA ({game.Difficulty}) pensando...");
                    game.MakeAIMove();
                    game.RenderToConsole();
                    continue;
                }

                Console.Write("\nSeu lance: ");
                string input = Console.ReadLine()?.Trim().ToLowerInvariant();
                if (string.IsNullOrEmpty(input)) continue;

                if (input == "sair" || input == "exit" || input == "quit")
                {
                    Console.WriteLine("Partida encerrada.");
                    break;
                }
                if (input == "ai")
                {
                    game.MakeAIMove();
                    game.RenderToConsole();
                    continue;
                }
                if (input == "reset")
                {
                    game = new ChessGame(game.Difficulty, game.PlayerColor);
                    game.RenderToConsole();
                    continue;
                }
                if (input.StartsWith("diff"))
                {
                    string[] parts = input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length > 1)
                    {
                        game.Difficulty = parts[1] switch
                        {
                            "facil" or "easy" => AIDifficulty.Facil,
                            "medio" or "medium" => AIDifficulty.Medio,
                            "dificil" or "hard" => AIDifficulty.Dificil,
                            "master" or "hardmaster" => AIDifficulty.HardMaster,
                            _ => game.Difficulty
                        };
                        Console.WriteLine($"Dificuldade alterada para: {game.Difficulty}");
                    }
                    continue;
                }

                // Parser de coordenadas: e2e4 ou e2 e4
                string clean = input.Replace(" ", "").Replace("-", "");
                if (clean.Length >= 4)
                {
                    int fromC = clean[0] - 'a';
                    int fromR = 8 - (clean[1] - '0');
                    int toC = clean[2] - 'a';
                    int toR = 8 - (clean[3] - '0');

                    var legalMoves = MoveGenerator.GetLegalMovesForPiece(fromR, fromC, game.Board);
                    var matchedMove = legalMoves.Find(m => m.ToR == toR && m.ToC == toC);

                    if (matchedMove.FromR == fromR && matchedMove.ToR == toR && matchedMove.ToC == toC)
                    {
                        game.ApplyMove(matchedMove);
                        game.RenderToConsole();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("Lance ilegal para essa peça. Tente novamente.");
                        Console.ResetColor();
                    }
                }
                else
                {
                    Console.WriteLine("Formato inválido. Use coordenadas como 'e2 e4'.");
                }
            }
        }
    }

    #endregion
}
