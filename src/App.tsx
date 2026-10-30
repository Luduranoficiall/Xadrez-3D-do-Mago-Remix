import { useEffect, useRef, useState } from 'react';
import { initWizardChess } from './wizardChessEngine.js';

export default function App() {
  const initializedRef = useRef(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWizardChess();
  }, []);

  useEffect(() => {
    (window as unknown as { wizardChessToggleHistory?: (force?: boolean) => void }).wizardChessToggleHistory = (force?: boolean) => {
      setHistoryDrawerOpen((prev) => (typeof force === 'boolean' ? force : !prev));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSheetOpen(false);
        setHistoryDrawerOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRestoreUI = () => {
    const win = window as unknown as { wizardChess?: { toggleUI?: (force?: boolean) => void } };
    if (win.wizardChess?.toggleUI) {
      win.wizardChess.toggleUI(false);
    } else {
      document.body.classList.remove('cinematic-ui-hidden');
      const btnHide = document.getElementById('btn-hide-ui');
      if (btnHide) btnHide.textContent = 'Hide UI [H]';
    }
  };

  return (
    <>
      <div id="loading-overlay">
        <div className="loader-title">Wizard Chess 3D</div>
        <div className="loader-bar-wrap">
          <div className="loader-bar" id="loader-bar"></div>
        </div>
        <div id="loader-text">Carregando Xadrez Bruxo 3D...</div>
      </div>

      <div id="canvas-container"></div>

      <button
        type="button"
        className="hud-btn mobile-only-restore-ui"
        id="btn-mobile-show-ui"
        onClick={handleRestoreUI}
        title="Mostrar Controles"
      >
        Mostrar HUD
      </button>

      <div id="hud-top">
        <div className="hud-group" id="hud-left">
          <div className="brand-pill">
            <span className="brand-title">Wizard Chess</span>
          </div>
          <div className="status-pill" id="status-pill">
            <span className="turn-dot" id="turn-dot"></span>
            <span id="turn-text">White to Move</span>
            <span className="mode-badge" id="mode-badge">Playing as White</span>
            <button
              type="button"
              className="diff-badge dificil"
              id="hud-diff-badge"
              title="Clique para alternar o nível de dificuldade da IA"
            >
              Difícil
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`hud-btn mobile-controls-trigger ${mobileSheetOpen ? 'active' : ''}`}
          id="btn-mobile-controls"
          aria-expanded={mobileSheetOpen}
          aria-controls="hud-right"
          onClick={() => setMobileSheetOpen((prev) => !prev)}
        >
          {mobileSheetOpen ? 'Fechar' : 'Controles'}
        </button>

        <div
          className={`mobile-sheet-backdrop ${mobileSheetOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileSheetOpen(false);
          }}
          aria-hidden="true"
        ></div>

        <div
          className={`hud-group ${mobileSheetOpen ? 'mobile-sheet-open' : ''}`}
          id="hud-right"
        >
          <div
            className="mobile-sheet-handle-wrap"
            onClick={(e) => {
              e.stopPropagation();
              setMobileSheetOpen(false);
            }}
            aria-hidden="true"
          >
            <div className="mobile-sheet-handle"></div>
          </div>

          <div className="mobile-sheet-header">
            <span className="mobile-sheet-title">Controles</span>
            <button
              type="button"
              className="mobile-sheet-close"
              id="btn-mobile-sheet-close"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetOpen(false);
              }}
              aria-label="Fechar Controles"
            >
              Fechar ✕
            </button>
          </div>

          <div className="mobile-sheet-section-label">Ações de Partida</div>

          <button
            className="hud-btn"
            id="btn-side-toggle"
            title="Alternar entre jogar de Brancas e Pretas"
            onClick={() => setMobileSheetOpen(false)}
          >
            Play as Black
          </button>
          <button
            className="hud-btn"
            id="btn-ai-move"
            title="Solicitar lance imediato da IA"
            onClick={() => setMobileSheetOpen(false)}
          >
            AI Move
          </button>
          <button
            className="hud-btn"
            id="btn-reset"
            title="Reiniciar partida no altar do santuário"
            onClick={() => setMobileSheetOpen(false)}
          >
            New Game
          </button>
          <button
            className={`hud-btn ${historyDrawerOpen ? 'active' : ''}`}
            id="btn-history-toggle"
            title="Abrir / Fechar Histórico de Lances"
            onClick={() => {
              setMobileSheetOpen(false);
            }}
          >
            History (0)
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">
            <span>Dificuldade da IA</span>
            <span className="mobile-sheet-section-sub" id="mobile-diff-sub">Nível do Oponente</span>
          </div>

          <div className="diff-group" id="diff-group" role="group" aria-label="Níveis de Dificuldade">
            <button
              type="button"
              className="hud-btn diff-btn"
              id="btn-diff-facil"
              data-diff="facil"
              title="Nível Fácil: Aprendiz da torre, jogadas tolerantes e casuais"
            >
              Fácil
            </button>
            <button
              type="button"
              className="hud-btn diff-btn"
              id="btn-diff-medio"
              data-diff="medio"
              title="Nível Médio: Feiticeiro experiente, boa visão posicional"
            >
              Médio
            </button>
            <button
              type="button"
              className="hud-btn diff-btn active"
              id="btn-diff-dificil"
              data-diff="dificil"
              title="Nível Difícil: Arquimago, cálculo Minimax com Alpha-Beta"
            >
              Difícil
            </button>
            <button
              type="button"
              className="hud-btn diff-btn diff-btn-hardmaster"
              id="btn-diff-hardmaster"
              data-diff="hard_master"
              title="Nível Hard Master: Grão-Mestre Sanctum, cálculo profundo de 3-4 lances e Quiescência"
            >
              Hard Master ⚔️
            </button>
          </div>

          <div className="diff-desc" id="diff-desc">
            Cálculo de 2 lances com Alpha-Beta e Quiescência.
          </div>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">
            <span>Audio Settings</span>
            <span className="mobile-sheet-section-sub">Atmosphere &amp; Magic</span>
          </div>

          <div className="audio-group" id="audio-group" role="group" aria-label="Audio Settings">
            <button
              type="button"
              className="hud-btn audio-btn active"
              id="btn-toggle-ambiance"
              title="Toggle Gothic Ambiance (Wind howling &amp; stone echoing)"
              aria-pressed="true"
            >
              <span className="audio-icon" aria-hidden="true">🌬️</span>
              <span className="audio-label">Ambiance</span>
              <span className="audio-status-pill">ON</span>
            </button>
            <button
              type="button"
              className="hud-btn audio-btn active"
              id="btn-toggle-sfx"
              title="Toggle Spell Effects (Shatter sounds &amp; wood/stone impacts)"
              aria-pressed="true"
            >
              <span className="audio-icon" aria-hidden="true">✨</span>
              <span className="audio-label">Spell SFX</span>
              <span className="audio-status-pill">ON</span>
            </button>
          </div>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">
            <span>Camera Views</span>
            <span className="mobile-sheet-section-sub">Tap active view to flip</span>
          </div>

          <button
            className="hud-btn active"
            id="btn-cam-player"
            title="Player Camera (Click again to flip White / Black view)"
          >
            Player Cam
          </button>
          <button
            className="hud-btn"
            id="btn-cam-top"
            title="Overhead Board View (Click again to flip White / Black orientation)"
          >
            Overhead
          </button>
          <button
            className="hud-btn"
            id="btn-cam-side"
            title="Side Profile View (Click again to switch East / West side)"
          >
            Side
          </button>
          <button
            className="hud-btn"
            id="btn-cam-wide"
            title="Wide Cathedral View (Click again to switch North Rose / South Narthex)"
          >
            Cathedral
          </button>

          <div className="hud-divider" aria-hidden="true"></div>
          <div className="mobile-sheet-section-label">Display &amp; Gestures</div>

          <button
            className="hud-btn"
            id="btn-hide-ui"
            title="Toggle HUD visibility (Shortcut: H)"
            onClick={() => setMobileSheetOpen(false)}
          >
            Hide UI [H]
          </button>

          <div className="mobile-sheet-hint">
            <strong>Touch:</strong> Tap Piece to Move &nbsp;•&nbsp; 1-Finger Drag: Orbit &nbsp;•&nbsp; 2-Finger Drag: Pan &nbsp;•&nbsp; Pinch: Zoom
          </div>
        </div>
      </div>

      <div
        className={`history-drawer ${historyDrawerOpen ? 'open' : ''}`}
        id="history-drawer"
        role="region"
        aria-label="Move History Log"
      >
        <div className="history-header">
          <div className="history-title-wrap">
            <span className="history-icon" aria-hidden="true">📜</span>
            <span className="history-title">Move History</span>
            <span className="history-badge" id="history-move-count">0 moves</span>
          </div>
          <div className="history-header-actions">
            <button
              type="button"
              className="history-action-btn"
              id="btn-copy-history"
              title="Copy standard PGN notation to clipboard"
            >
              Copy PGN
            </button>
            <button
              type="button"
              className="history-close-btn"
              id="btn-history-close"
              aria-label="Close Move History"
              onClick={() => setHistoryDrawerOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="history-moves-list"
          id="history-moves-list"
          tabIndex={0}
          role="log"
          aria-live="polite"
        >
          <div className="history-empty" id="history-empty-placeholder">
            No moves recorded yet. Strike on the board to begin...
          </div>
        </div>

        <div className="history-footer">
          <span className="history-footer-status" id="history-footer-status">Awaiting opening move</span>
        </div>
      </div>

      <div id="hud-bottom">
        <div
          className="hint-pill"
          id="controls-hint"
          onClick={() => {
            document.getElementById('controls-hint')?.classList.add('hint-dismissed');
          }}
          title="Clique para ocultar dica"
        >
          <span className="hint-sparkle">⚔️</span>
          <span>Clique na peça para jogar &nbsp;•&nbsp; Arraste para orbitar a catedral</span>
          <span className="hint-dismiss-btn" aria-label="Ocultar dica">✕</span>
        </div>
        <div className="captured-pill" id="captured-tray"></div>
      </div>

      <div id="checkmate-overlay" role="status" aria-live="polite">
        <div className="checkmate-banner">
          <div className="checkmate-ornament">✦ &nbsp; Sanctum Judgment &nbsp; ✦</div>
          <div className="checkmate-crown" id="checkmate-crown">♔</div>
          <div className="checkmate-title" id="checkmate-title">Checkmate</div>
          <div className="checkmate-rule"></div>
          <div className="checkmate-subtitle" id="checkmate-subtitle">
            White Triumphs • The Black King Has Fallen
          </div>
          <div className="checkmate-actions">
            <button className="checkmate-btn" id="btn-checkmate-replay">
              Replay King Fall
            </button>
            <button className="checkmate-btn" id="btn-checkmate-newgame">
              New Game
            </button>
            <button className="checkmate-btn secondary" id="btn-checkmate-dismiss">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
