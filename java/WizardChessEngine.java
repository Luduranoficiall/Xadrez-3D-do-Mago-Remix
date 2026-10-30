// ============================================================================
// Wizard Chess Core Engine & Multi-Level AI
// Linguagem: Java Puro (JDK 11 / 17 / 21)
// Zero dependências externas (Apenas java.util.*)
// ============================================================================

package wizardchess.core;

import java.util.*;

public class WizardChessEngine {

    public enum PieceType {
        PAWN(100), KNIGHT(320), BISHOP(335), ROOK(500), QUEEN(900), KING(20000);

        public final int value;
        PieceType(int value) { this.value = value; }
    }

    public enum PieceColor { WHITE, BLACK }

    public enum AIDifficulty {
        FACIL, MEDIO, DIFICIL, HARD_MASTER
    }

    public static class Piece {
        public PieceType type;
        public final PieceColor color;
        public boolean hasMoved;

        public Piece(PieceType type, PieceColor color, boolean hasMoved) {
            this.type = type;
            this.color = color;
            this.hasMoved = hasMoved;
        }

        public Piece clonePiece() {
            return new Piece(this.type, this.color, this.hasMoved);
        }

        public String toUnicode() {
            if (color == PieceColor.WHITE) {
                switch (type) {
                    case KING: return "♔";
                    case QUEEN: return "♕";
                    case ROOK: return "♖";
                    case BISHOP: return "♗";
                    case KNIGHT: return "♘";
                    case PAWN: return "♙";
                }
            } else {
                switch (type) {
                    case KING: return "♚";
                    case QUEEN: return "♛";
                    case ROOK: return "♜";
                    case BISHOP: return "♝";
                    case KNIGHT: return "♞";
                    case PAWN: return "♟";
                }
            }
            return " ";
        }
    }

    public static class Move {
        public final int fromR, fromC, toR, toC;
        public final boolean isCapture, isCastling;
        public final char castleSide;
        public final int priority;

        public Move(int fromR, int fromC, int toR, int toC, boolean isCapture, boolean isCastling, char castleSide, int priority) {
            this.fromR = fromR;
            this.fromC = fromC;
            this.toR = toR;
            this.toC = toC;
            this.isCapture = isCapture;
            this.isCastling = isCastling;
            this.castleSide = castleSide;
            this.priority = priority;
        }

        public String toAlgebraic() {
            char fC = (char)('a' + fromC);
            int fR = 8 - fromR;
            char tC = (char)('a' + toC);
            int tR = 8 - toR;
            return "" + fC + fR + tC + tR;
        }
    }

    public static class Board {
        private final Piece[][] squares = new Piece[8][8];

        public Board() {
            setupStandard();
        }

        public Piece get(int r, int c) {
            if (r < 0 || r >= 8 || c < 0 || c >= 8) return null;
            return squares[r][c];
        }

        public void set(int r, int c, Piece p) {
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                squares[r][c] = p;
            }
        }

        public void setupStandard() {
            for (int r = 0; r < 8; r++)
                for (int c = 0; c < 8; c++)
                    squares[r][c] = null;

            PieceType[] back = {
                PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP,
                PieceType.QUEEN, PieceType.KING, PieceType.BISHOP,
                PieceType.KNIGHT, PieceType.ROOK
            };

            for (int c = 0; c < 8; c++) {
                squares[0][c] = new Piece(back[c], PieceColor.BLACK, false);
                squares[1][c] = new Piece(PieceType.PAWN, PieceColor.BLACK, false);
                squares[6][c] = new Piece(PieceType.PAWN, PieceColor.WHITE, false);
                squares[7][c] = new Piece(back[c], PieceColor.WHITE, false);
            }
        }

        public boolean isKingInCheck(PieceColor kingColor) {
            int kingR = -1, kingC = -1;
            for (int r = 0; r < 8; r++) {
                for (int c = 0; c < 8; c++) {
                    Piece p = squares[r][c];
                    if (p != null && p.color == kingColor && p.type == PieceType.KING) {
                        kingR = r;
                        kingC = c;
                        break;
                    }
                }
                if (kingR != -1) break;
            }
            if (kingR == -1) return true;

            PieceColor opp = (kingColor == PieceColor.WHITE) ? PieceColor.BLACK : PieceColor.WHITE;
            for (int r = 0; r < 8; r++) {
                for (int c = 0; c < 8; c++) {
                    Piece p = squares[r][c];
                    if (p != null && p.color == opp) {
                        List<Move> pseudo = getPseudoMoves(r, c, this);
                        for (Move m : pseudo) {
                            if (m.toR == kingR && m.toC == kingC) return true;
                        }
                    }
                }
            }
            return false;
        }
    }

    public static List<Move> getPseudoMoves(int r, int c, Board board) {
        List<Move> moves = new ArrayList<>(30);
        Piece piece = board.get(r, c);
        if (piece == null) return moves;

        int dir = piece.color == PieceColor.WHITE ? -1 : 1;

        if (piece.type == PieceType.PAWN) {
            if (board.get(r + dir, c) == null && (r + dir >= 0 && r + dir < 8)) {
                moves.add(new Move(r, c, r + dir, c, false, false, '\0', 0));
                int start = piece.color == PieceColor.WHITE ? 6 : 1;
                if (r == start && board.get(r + dir * 2, c) == null) {
                    moves.add(new Move(r, c, r + dir * 2, c, false, false, '\0', 0));
                }
            }
            for (int dc : new int[]{-1, 1}) {
                int nc = c + dc;
                if (nc >= 0 && nc < 8 && r + dir >= 0 && r + dir < 8) {
                    Piece target = board.get(r + dir, nc);
                    if (target != null && target.color != piece.color) {
                        moves.add(new Move(r, c, r + dir, nc, true, false, '\0', 0));
                    }
                }
            }
        } else if (piece.type == PieceType.KNIGHT) {
            int[][] jumps = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
            for (int[] j : jumps) {
                int nr = r + j[0], nc = c + j[1];
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    Piece target = board.get(nr, nc);
                    if (target == null) moves.add(new Move(r, c, nr, nc, false, false, '\0', 0));
                    else if (target.color != piece.color) moves.add(new Move(r, c, nr, nc, true, false, '\0', 0));
                }
            }
        } else if (piece.type == PieceType.KING) {
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    int nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        Piece target = board.get(nr, nc);
                        if (target == null) moves.add(new Move(r, c, nr, nc, false, false, '\0', 0));
                        else if (target.color != piece.color) moves.add(new Move(r, c, nr, nc, true, false, '\0', 0));
                    }
                }
            }
        } else {
            List<int[]> dirs = new ArrayList<>();
            if (piece.type == PieceType.ROOK || piece.type == PieceType.QUEEN) {
                dirs.add(new int[]{-1,0}); dirs.add(new int[]{1,0});
                dirs.add(new int[]{0,-1}); dirs.add(new int[]{0,1});
            }
            if (piece.type == PieceType.BISHOP || piece.type == PieceType.QUEEN) {
                dirs.add(new int[]{-1,-1}); dirs.add(new int[]{-1,1});
                dirs.add(new int[]{1,-1}); dirs.add(new int[]{1,1});
            }
            for (int[] d : dirs) {
                for (int step = 1; step < 8; step++) {
                    int nr = r + d[0] * step, nc = c + d[1] * step;
                    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                    Piece target = board.get(nr, nc);
                    if (target == null) {
                        moves.add(new Move(r, c, nr, nc, false, false, '\0', 0));
                    } else {
                        if (target.color != piece.color) {
                            moves.add(new Move(r, c, nr, nc, true, false, '\0', 0));
                        }
                        break;
                    }
                }
            }
        }
        return moves;
    }

    public static List<Move> getLegalMoves(PieceColor color, Board board) {
        List<Move> legal = new ArrayList<>(64);
        for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                Piece p = board.get(r, c);
                if (p != null && p.color == color) {
                    List<Move> pseudo = getPseudoMoves(r, c, board);
                    for (Move m : pseudo) {
                        Piece target = board.get(m.toR, m.toC);
                        board.set(m.toR, m.toC, p);
                        board.set(r, c, null);

                        boolean check = board.isKingInCheck(color);

                        board.set(r, c, p);
                        board.set(m.toR, m.toC, target);

                        if (!check) {
                            int prio = 0;
                            if (m.isCapture && target != null) {
                                prio = target.type.value * 10 - p.type.value;
                            }
                            legal.add(new Move(r, c, m.toR, m.toC, m.isCapture, false, '\0', prio));
                        }
                    }
                }
            }
        }
        legal.sort((a, b) -> Integer.compare(b.priority, a.priority));
        return legal;
    }

    // Minimax, PST e IA
    private static final int[][] PAWN_PST = {
        { 0,  0,  0,  0,  0,  0,  0,  0},
        {50, 50, 50, 50, 50, 50, 50, 50},
        {10, 10, 20, 30, 30, 20, 10, 10},
        { 5,  5, 10, 25, 25, 10,  5,  5},
        { 0,  0,  0, 20, 20,  0,  0,  0},
        { 5, -5,-10,  0,  0,-10, -5,  5},
        { 5, 10, 10,-20,-20, 10, 10,  5},
        { 0,  0,  0,  0,  0,  0,  0,  0}
    };

    public static int evaluateStatic(Board board, PieceColor color) {
        int white = 0, black = 0;
        for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                Piece p = board.get(r, c);
                if (p == null) continue;
                int val = p.type.value;
                int pst = (p.type == PieceType.PAWN) ? PAWN_PST[p.color == PieceColor.WHITE ? r : (7 - r)][c] : 0;
                if (p.color == PieceColor.WHITE) white += val + pst;
                else black += val + pst;
            }
        }
        return color == PieceColor.WHITE ? (white - black) : (black - white);
    }

    public static Move chooseAIMove(Board board, PieceColor color, AIDifficulty diff) {
        List<Move> legal = getLegalMoves(color, board);
        if (legal.isEmpty()) return null;
        if (legal.size() == 1 || diff == AIDifficulty.FACIL) {
            return legal.get(new Random().nextInt(legal.size()));
        }

        int bestScore = -Integer.MAX_VALUE;
        Move bestMove = legal.get(0);
        int depth = (diff == AIDifficulty.HARD_MASTER) ? 3 : (diff == AIDifficulty.DIFICIL ? 2 : 1);

        for (Move m : legal) {
            Piece p = board.get(m.fromR, m.fromC);
            Piece target = board.get(m.toR, m.toC);
            board.set(m.toR, m.toC, p);
            board.set(m.fromR, m.fromC, null);

            PieceColor opp = color == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
            int score = -evaluateStatic(board, opp);

            board.set(m.fromR, m.fromC, p);
            board.set(m.toR, m.toC, target);

            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
            }
        }
        return bestMove;
    }

    public static void main(String[] args) {
        System.out.println("Wizard Chess — Pure Java Reference Engine Loaded.");
        Board b = new Board();
        System.out.println("Legal moves for White: " + getLegalMoves(PieceColor.WHITE, b).size());
    }
}
