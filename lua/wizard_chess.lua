-- ============================================================================
-- Wizard Chess Core Engine & Multi-Level AI
-- Linguagem: Lua Puro (5.3, 5.4, LuaJIT)
-- Zero dependências externas
-- Adequado para Love2D, Defold, Roblox ou terminal
-- ============================================================================

local WizardChess = {}

-- Constantes
local PIECE_VALUES = {
    pawn = 100, knight = 320, bishop = 335,
    rook = 500, queen = 900, king = 20000
}

local PAWN_PST = {
    {  0,  0,  0,  0,  0,  0,  0,  0 },
    { 50, 50, 50, 50, 50, 50, 50, 50 },
    { 10, 10, 20, 30, 30, 20, 10, 10 },
    {  5,  5, 10, 25, 25, 10,  5,  5 },
    {  0,  0,  0, 20, 20,  0,  0,  0 },
    {  5, -5,-10,  0,  0,-10, -5,  5 },
    {  5, 10, 10,-20,-20, 10, 10,  5 },
    {  0,  0,  0,  0,  0,  0,  0,  0 }
}

function WizardChess.newBoard()
    local b = {}
    for r = 1, 8 do
        b[r] = {}
        for c = 1, 8 do b[r][c] = nil end
    end

    local back = { "rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook" }
    for c = 1, 8 do
        b[1][c] = { type = back[c], color = "b", hasMoved = false }
        b[2][c] = { type = "pawn", color = "b", hasMoved = false }
        b[7][c] = { type = "pawn", color = "w", hasMoved = false }
        b[8][c] = { type = back[c], color = "w", hasMoved = false }
    end
    return b
end

function WizardChess.getPseudoMoves(board, r, c)
    local piece = board[r] and board[r][c]
    if not piece then return {} end

    local moves = {}
    local color = piece.color
    local dir = (color == "w") and -1 or 1

    local function inBounds(nr, nc)
        return nr >= 1 and nr <= 8 and nc >= 1 and nc <= 8
    end

    if piece.type == "pawn" then
        if inBounds(r + dir, c) and not board[r + dir][c] then
            table.insert(moves, { fromR = r, fromC = c, toR = r + dir, toC = c, capture = false })
            local startRow = (color == "w") and 7 or 2
            if r == startRow and not board[r + dir * 2][c] then
                table.insert(moves, { fromR = r, fromC = c, toR = r + dir * 2, toC = c, capture = false })
            end
        end
        for _, dc in ipairs({ -1, 1 }) do
            local nc = c + dc
            if inBounds(r + dir, nc) then
                local target = board[r + dir][nc]
                if target and target.color ~= color then
                    table.insert(moves, { fromR = r, fromC = c, toR = r + dir, toC = nc, capture = true })
                end
            end
        end
    elseif piece.type == "knight" then
        local jumps = { {-2,-1}, {-2,1}, {-1,-2}, {-1,2}, {1,-2}, {1,2}, {2,-1}, {2,1} }
        for _, j in ipairs(jumps) do
            local nr, nc = r + j[1], c + j[2]
            if inBounds(nr, nc) then
                local t = board[nr][nc]
                if not t then
                    table.insert(moves, { fromR = r, fromC = c, toR = nr, toC = nc, capture = false })
                elseif t.color ~= color then
                    table.insert(moves, { fromR = r, fromC = c, toR = nr, toC = nc, capture = true })
                end
            end
        end
    elseif piece.type == "king" then
        for dr = -1, 1 do
            for dc = -1, 1 do
                if dr ~= 0 or dc ~= 0 then
                    local nr, nc = r + dr, c + dc
                    if inBounds(nr, nc) then
                        local t = board[nr][nc]
                        if not t or t.color ~= color then
                            table.insert(moves, { fromR = r, fromC = c, toR = nr, toC = nc, capture = (t ~= nil) })
                        end
                    end
                end
            end
        end
    else
        local dirs = {}
        if piece.type == "rook" or piece.type == "queen" then
            table.insert(dirs, {-1,0}); table.insert(dirs, {1,0})
            table.insert(dirs, {0,-1}); table.insert(dirs, {0,1})
        end
        if piece.type == "bishop" or piece.type == "queen" then
            table.insert(dirs, {-1,-1}); table.insert(dirs, {-1,1})
            table.insert(dirs, {1,-1}); table.insert(dirs, {1,1})
        end
        for _, d in ipairs(dirs) do
            for step = 1, 7 do
                local nr, nc = r + d[1] * step, c + d[2] * step
                if not inBounds(nr, nc) then break end
                local t = board[nr][nc]
                if not t then
                    table.insert(moves, { fromR = r, fromC = c, toR = nr, toC = nc, capture = false })
                else
                    if t.color ~= color then
                        table.insert(moves, { fromR = r, fromC = c, toR = nr, toC = nc, capture = true })
                    end
                    break
                end
            end
        end
    end

    return moves
end

function WizardChess.isKingInCheck(board, kingColor)
    local kingR, kingC = nil, nil
    for r = 1, 8 do
        for c = 1, 8 do
            local p = board[r][c]
            if p and p.color == kingColor and p.type == "king" then
                kingR, kingC = r, c
                break
            end
        end
        if kingR then break end
    end
    if not kingR then return true end

    local oppColor = (kingColor == "w") and "b" or "w"
    for r = 1, 8 do
        for c = 1, 8 do
            local p = board[r][c]
            if p and p.color == oppColor then
                local moves = WizardChess.getPseudoMoves(board, r, c)
                for _, m in ipairs(moves) do
                    if m.toR == kingR and m.toC == kingC then return true end
                end
            end
        end
    end
    return false
end

function WizardChess.getLegalMoves(board, color)
    local legal = {}
    for r = 1, 8 do
        for c = 1, 8 do
            local p = board[r][c]
            if p and p.color == color then
                local pseudo = WizardChess.getPseudoMoves(board, r, c)
                for _, m in ipairs(pseudo) do
                    local target = board[m.toR][m.toC]
                    board[m.toR][m.toC] = p
                    board[r][c] = nil

                    local inCheck = WizardChess.isKingInCheck(board, color)

                    board[r][c] = p
                    board[m.toR][m.toC] = target

                    if not inCheck then
                        local priority = 0
                        if m.capture and target then
                            priority = (PIECE_VALUES[target.type] or 0) * 10 - (PIECE_VALUES[p.type] or 0)
                        end
                        m.priority = priority
                        table.insert(legal, m)
                    end
                end
            end
        end
    end

    table.sort(legal, function(a, b) return a.priority > b.priority end)
    return legal
end

function WizardChess.evaluateStatic(board, color)
    local whiteScore, blackScore = 0, 0
    for r = 1, 8 do
        for c = 1, 8 do
            local p = board[r][c]
            if p then
                local val = PIECE_VALUES[p.type] or 0
                local pst = 0
                if p.type == "pawn" then
                    local pRow = (p.color == "w") and r or (9 - r)
                    pst = PAWN_PST[pRow][c] or 0
                end
                if p.color == "w" then whiteScore = whiteScore + val + pst
                else blackScore = blackScore + val + pst end
            end
        end
    end
    return (color == "w") and (whiteScore - blackScore) or (blackScore - whiteScore)
end

function WizardChess.chooseAIMove(board, color, difficulty)
    local legal = WizardChess.getLegalMoves(board, color)
    if #legal == 0 then return nil end
    if #legal == 1 or difficulty == "facil" then
        return legal[math.random(1, #legal)]
    end

    local bestScore = -math.huge
    local bestMove = legal[1]

    for _, m in ipairs(legal) do
        local p = board[m.fromR][m.fromC]
        local t = board[m.toR][m.toC]
        board[m.toR][m.toC] = p
        board[m.fromR][m.fromC] = nil

        local opp = (color == "w") and "b" or "w"
        local score = -WizardChess.evaluateStatic(board, opp)

        board[m.fromR][m.fromC] = p
        board[m.toR][m.toC] = t

        if score > bestScore then
            bestScore = score
            bestMove = m
        end
    end

    return bestMove
end

return WizardChess
