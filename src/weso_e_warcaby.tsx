import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- STAŁE I KONFIGURACJA ---
const BOARD_SIZE = 10;
const PLAYER_1 = 1; // Gracz
const PLAYER_2 = 2; // Komputer
const KING_1 = 3;   
const KING_2 = 4;   

const DIRECTIONS = [
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

// Opcje Zwierzaków
const ANIMAL_OPTIONS = [
  { id: 'dog', emoji: '🐶', name: 'Pieski', color: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'cat', emoji: '🐱', name: 'Kotki', color: 'bg-slate-800', border: 'border-slate-900', text: 'text-white' },
  { id: 'panda', emoji: '🐼', name: 'Pandy', color: 'bg-green-50', border: 'border-green-200' },
  { id: 'dino', emoji: '🦖', name: 'Dinozaury', color: 'bg-emerald-800', border: 'border-emerald-900', text: 'text-white' },
  { id: 'pig', emoji: '🐷', name: 'Świnki', color: 'bg-pink-100', border: 'border-pink-300' },
  { id: 'frog', emoji: '🐸', name: 'Żabki', color: 'bg-lime-500', border: 'border-lime-700', text: 'text-white' }
];

const PIECE_VALUE = 10;
const KING_VALUE = 30;

// --- GENERATOR DŹWIĘKÓW I FANFAR ---
const playSound = (type, isMuted = false) => {
  if (isMuted && type !== 'win') return; // Wygrana gra zawsze dźwięk, chyba że globalnie zmutowane

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'move') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'win') {
      // Wesoła Fanfara Zwycięstwa (8-bit style)
      const notes = [
        {f: 523.25, t: 0, d: 0.12},    // C5
        {f: 659.25, t: 0.12, d: 0.12}, // E5
        {f: 783.99, t: 0.24, d: 0.12}, // G5
        {f: 1046.50, t: 0.36, d: 0.3}, // C6 długie
        {f: 783.99, t: 0.66, d: 0.12}, // G5 krótkie
        {f: 1046.50, t: 0.78, d: 0.6}  // C6 na koniec
      ];
      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, now + note.t);
        gain.gain.setValueAtTime(0.05, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.1);
      });
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};

// --- LOGIKA GRY ---
const createInitialBoard = () => {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 !== 0) {
        if (r < 4) board[r][c] = PLAYER_2;
        else if (r > 5) board[r][c] = PLAYER_1;
      }
    }
  }
  return board;
};

const getPiecePlayer = (val) => {
  if (val === PLAYER_1 || val === KING_1) return PLAYER_1;
  if (val === PLAYER_2 || val === KING_2) return PLAYER_2;
  return 0;
};

const isKing = (val) => val === KING_1 || val === KING_2;

const calculateMoves = (board, player, multiJumpPiece = null) => {
  const moves = [];
  let hasCaptures = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (getPiecePlayer(piece) !== player) continue;
      if (multiJumpPiece && (multiJumpPiece.r !== r || multiJumpPiece.c !== c)) continue;

      const pieceIsKing = isKing(piece);
      const forwardDir = player === PLAYER_1 ? -1 : 1;

      DIRECTIONS.forEach(([dr, dc]) => {
        if (pieceIsKing) {
          let step = 1;
          let enemyFound = false;
          let enemyPos = null;
          
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
            
            const target = board[nr][nc];
            
            if (!enemyFound) {
              if (target === 0) {
                if (!hasCaptures && !multiJumpPiece) {
                  moves.push({ from: {r, c}, to: {r: nr, c: nc}, captures: [] });
                }
              } else if (getPiecePlayer(target) !== player) {
                enemyFound = true;
                enemyPos = {r: nr, c: nc};
              } else { break; }
            } else {
              if (target === 0) {
                hasCaptures = true;
                moves.push({ from: {r, c}, to: {r: nr, c: nc}, captures: [enemyPos] });
              } else { break; }
            }
            step++;
          }
        } 
        else {
          if (dr === forwardDir && !hasCaptures && !multiJumpPiece) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 0) {
              moves.push({ from: {r, c}, to: {r: nr, c: nc}, captures: [] });
            }
          }
          
          const nr1 = r + dr;
          const nc1 = c + dc;
          const nr2 = r + dr * 2;
          const nc2 = c + dc * 2;
          
          if (nr2 >= 0 && nr2 < BOARD_SIZE && nc2 >= 0 && nc2 < BOARD_SIZE) {
            const target1 = board[nr1][nc1];
            const target2 = board[nr2][nc2];
            
            if (target1 !== 0 && getPiecePlayer(target1) !== player && target2 === 0) {
              hasCaptures = true;
              moves.push({ from: {r, c}, to: {r: nr2, c: nc2}, captures: [{r: nr1, c: nc1}] });
            }
          }
        }
      });
    }
  }

  if (hasCaptures) return moves.filter(m => m.captures.length > 0);
  return moves;
};

const applyMove = (board, move) => {
  const newBoard = board.map(row => [...row]);
  let piece = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = 0;
  
  move.captures.forEach(cap => { newBoard[cap.r][cap.c] = 0; });

  if (piece === PLAYER_1 && move.to.r === 0) piece = KING_1;
  if (piece === PLAYER_2 && move.to.r === BOARD_SIZE - 1) piece = KING_2;
  
  newBoard[move.to.r][move.to.c] = piece;
  return { newBoard, isPromotion: piece !== board[move.from.r][move.from.c] };
};

// --- LOGIKA AI (Minimax z Alfa-Beta cięciami) ---
const evaluateBoard = (board) => {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece === PLAYER_2) score += PIECE_VALUE;
      else if (piece === KING_2) score += KING_VALUE;
      else if (piece === PLAYER_1) score -= PIECE_VALUE;
      else if (piece === KING_1) score -= KING_VALUE;
      
      if (getPiecePlayer(piece) === PLAYER_2) {
          if (r > 2 && r < 7 && c > 2 && c < 7) score += 2;
      }
    }
  }
  return score;
};

const getAllPossibleTurns = (board, player, multiJumpPos = null) => {
  let allTurns = [];
  const moves = calculateMoves(board, player, multiJumpPos);

  if (moves.length === 0) {
      if (multiJumpPos) return [{ board: board, finalMove: null }]; 
      return []; 
  }

  for (let move of moves) {
    const { newBoard, isPromotion } = applyMove(board, move);
    if (move.captures.length > 0 && !isPromotion) {
        const furtherMoves = calculateMoves(newBoard, player, move.to);
        if (furtherMoves.length > 0 && furtherMoves[0].captures.length > 0) {
            const subsequentTurns = getAllPossibleTurns(newBoard, player, move.to);
            for (let subTurn of subsequentTurns) {
                 allTurns.push({ board: subTurn.board, firstMove: move });
            }
            continue;
        }
    }
    allTurns.push({ board: newBoard, firstMove: move });
  }
  return allTurns;
};

const minimax = (board, depth, alpha, beta, isMaximizingPlayer) => {
  if (depth === 0) return evaluateBoard(board);

  const player = isMaximizingPlayer ? PLAYER_2 : PLAYER_1;
  const possibleTurns = getAllPossibleTurns(board, player);

  if (possibleTurns.length === 0) return isMaximizingPlayer ? -10000 : 10000; 

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let turn of possibleTurns) {
      const evaluation = minimax(turn.board, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let turn of possibleTurns) {
      const evaluation = minimax(turn.board, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; 
    }
    return minEval;
  }
};


// --- KOMPONENT SAMOUCZKA ---
const TutorialModal = ({ isOpen, onClose, playerAnimal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 flex items-center justify-center font-bold">✕</button>
        <h2 className="text-3xl font-extrabold text-indigo-600 mb-6 flex items-center gap-3"><span>📖</span> Jak grać?</h2>
        <div className="space-y-5 text-slate-600 text-lg">
          <div className="flex gap-4 items-start bg-indigo-50/50 p-4 rounded-2xl">
            <span className="text-2xl mt-1">🎯</span>
            <div><strong className="text-indigo-900 block mb-1">Cel gry</strong>Zbij wszystkie pionki przeciwnika!</div>
          </div>
          <div className="flex gap-4 items-start bg-sky-50/50 p-4 rounded-2xl">
            <span className="text-2xl mt-1">🐾</span>
            <div><strong className="text-sky-900 block mb-1">Ruchy</strong>Pionki ruszają się na skos, <b>tylko do przodu</b>.</div>
          </div>
          <div className="flex gap-4 items-start bg-orange-50/50 p-4 rounded-2xl">
            <span className="text-2xl mt-1">⚔️</span>
            <div>
              <strong className="text-orange-900 block mb-1">Bicie (Obowiązkowe!)</strong>
              Przeskocz wroga, by go zbić. Możesz bić też <b>do tyłu</b>. <br/>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-md mt-2 inline-block font-medium">Pulsujący pionek = musisz nim bić!</span>
            </div>
          </div>
          <div className="flex gap-4 items-start bg-purple-50/50 p-4 rounded-2xl">
            <span className="text-2xl mt-1">👑</span>
            <div><strong className="text-purple-900 block mb-1">Super Damka</strong>Dojdź na koniec po koronę! Damka lata po skosie.</div>
          </div>
        </div>
        <button onClick={onClose} className="mt-8 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-md transform active:scale-95 transition-all text-xl">Gramy! 🚀</button>
      </div>
    </div>
  );
};

// --- EKRAN WYBORU POSTACI ---
const CharacterSelection = ({ onSelect, currentSelection, isMusicOn }) => {
  return (
    <div className="w-full bg-white/80 p-4 rounded-[2rem] shadow-xl border border-indigo-100 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-center font-bold text-indigo-800 mb-4 text-lg">Wybierz swoją drużynę!</h3>
      <div className="grid grid-cols-3 gap-3">
        {ANIMAL_OPTIONS.map((animal) => (
          <button
            key={animal.id}
            onClick={() => {
              playSound('select', !isMusicOn);
              onSelect(animal);
            }}
            className={`
              flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200
              ${currentSelection?.id === animal.id 
                ? 'bg-indigo-100 border-indigo-400 scale-105 shadow-md' 
                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 hover:scale-105 shadow-sm'}
            `}
          >
            <span className="text-4xl mb-1">{animal.emoji}</span>
            <span className={`text-xs font-bold ${currentSelection?.id === animal.id ? 'text-indigo-700' : 'text-slate-600'}`}>{animal.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- GŁÓWNY KOMPONENT GRY ---
export default function App() {
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState(PLAYER_1);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [multiJumpPiece, setMultiJumpPiece] = useState(null);
  
  const [difficultyLevel, setDifficultyLevel] = useState(3); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({[PLAYER_1]: 0, [PLAYER_2]: 0});
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Audio state & BGM reference
  const [isMusicOn, setIsMusicOn] = useState(false);
  const bgmRef = useRef(null);

  const [playerAnimal, setPlayerAnimal] = useState(ANIMAL_OPTIONS[0]); 
  const [computerAnimal, setComputerAnimal] = useState(ANIMAL_OPTIONS[1]); 

  // Inicjalizacja melodyjki
  useEffect(() => {
    bgmRef.current = {
      ctx: null, timerId: null, step: 0,
      melody: [
        261.6, 329.6, 392.0, 523.3, // C-dur
        349.2, 440.0, 523.3, 698.5, // F-dur
        392.0, 493.9, 587.3, 784.0, // G-dur
        261.6, 329.6, 392.0, 523.3  // C-dur
      ],
      play: function() {
         if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
         }
         if (this.ctx.state === 'suspended') this.ctx.resume();
         if (!this.timerId) this.loop(); // Zapobiega dublowaniu pętli
      },
      stop: function() {
         clearTimeout(this.timerId);
         this.timerId = null;
      },
      loop: function() {
         const freq = this.melody[this.step % this.melody.length];
         this.step++;
         
         if(this.ctx) {
             const osc = this.ctx.createOscillator();
             const gain = this.ctx.createGain();
             osc.connect(gain); gain.connect(this.ctx.destination);
             osc.type = 'triangle';
             osc.frequency.value = freq;
             const now = this.ctx.currentTime;
             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.015, now + 0.05); // Bardzo cicho by nie irytowało
             gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
             osc.start(now); osc.stop(now + 0.4);
         }
         this.timerId = setTimeout(() => this.loop(), 350); // Tempo
      }
    };
    return () => bgmRef.current?.stop();
  }, []);

  // Kontrola włączania/wyłączania muzyki
  useEffect(() => {
      if (isMusicOn && isPlaying && !winner) {
          bgmRef.current?.play();
      } else {
          bgmRef.current?.stop();
      }
  }, [isMusicOn, isPlaying, winner]);

  // Obsługa wygranej (zatrzymuje melodyjkę i puszcza fanfarę)
  const handleWin = useCallback((player) => {
    setWinner(player);
    setIsPlaying(false);
    bgmRef.current?.stop();
    if (isMusicOn) playSound('win', false);
  }, [isMusicOn]);

  useEffect(() => {
    let p1Count = 0; let p2Count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = getPiecePlayer(board[r][c]);
        if (p === PLAYER_1) p1Count++;
        if (p === PLAYER_2) p2Count++;
      }
    }
    setScores({ [PLAYER_1]: 20 - p2Count, [PLAYER_2]: 20 - p1Count });

    if (p1Count === 0 && isPlaying) handleWin(PLAYER_2);
    else if (p2Count === 0 && isPlaying) handleWin(PLAYER_1);
  }, [board, isPlaying, handleWin]);

  const currentLegalMoves = calculateMoves(board, turn, multiJumpPiece);

  useEffect(() => {
    if (isPlaying && currentLegalMoves.length === 0 && !winner) {
      handleWin(turn === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }
  }, [currentLegalMoves, isPlaying, turn, winner, handleWin]);

  useEffect(() => {
    if (turn === PLAYER_2 && isPlaying && !winner) {
      const timeout = setTimeout(() => {
        if (currentLegalMoves.length > 0) {
          if (!multiJumpPiece) {
              let bestEval = -Infinity; let bestMove = currentLegalMoves[0]; 
              if (difficultyLevel === 1 && Math.random() < 0.4) {
                 bestMove = currentLegalMoves[Math.floor(Math.random() * currentLegalMoves.length)];
              } else {
                 const possibleTurns = getAllPossibleTurns(board, PLAYER_2);
                 for (let turnObj of possibleTurns) {
                     const evaluation = minimax(turnObj.board, difficultyLevel - 1, -Infinity, Infinity, false);
                     if (evaluation > bestEval) { bestEval = evaluation; bestMove = turnObj.firstMove; }
                 }
              }
              executeMove(bestMove);
          } else {
             executeMove(currentLegalMoves[0]);
          }
        }
      }, 600); 
      return () => clearTimeout(timeout);
    }
  }, [turn, isPlaying, currentLegalMoves, winner, board, multiJumpPiece, difficultyLevel]);

  const handleSquareClick = (r, c) => {
    if (winner || !isPlaying || turn === PLAYER_2) return; 

    const clickedPlayer = getPiecePlayer(board[r][c]);

    if (clickedPlayer === turn) {
      if (multiJumpPiece && (multiJumpPiece.r !== r || multiJumpPiece.c !== c)) {
        playSound('error', !isMusicOn);
        return;
      }
      
      const pieceMoves = currentLegalMoves.filter(m => m.from.r === r && m.from.c === c);
      if (pieceMoves.length > 0) {
        setSelectedPiece({r, c});
        setValidMoves(pieceMoves);
      } else if (currentLegalMoves.length > 0) {
        playSound('error', !isMusicOn);
      }
      return;
    }

    if (board[r][c] === 0 && selectedPiece) {
      const move = validMoves.find(m => m.to.r === r && m.to.c === c);
      if (move) executeMove(move);
      else { setSelectedPiece(null); setValidMoves([]); }
    }
  };

  const executeMove = (move) => {
    const { newBoard, isPromotion } = applyMove(board, move);
    setBoard(newBoard);
    
    if (move.captures.length > 0) playSound('capture', !isMusicOn);
    else playSound('move', !isMusicOn);

    if (move.captures.length > 0 && !isPromotion) {
      const furtherMoves = calculateMoves(newBoard, turn, move.to);
      if (furtherMoves.length > 0 && furtherMoves[0].captures.length > 0) {
        setMultiJumpPiece(move.to);
        setSelectedPiece(turn === PLAYER_1 ? move.to : null); 
        setValidMoves(turn === PLAYER_1 ? furtherMoves : []);
        return; 
      }
    }
    setTurn(turn === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    setSelectedPiece(null); setValidMoves([]); setMultiJumpPiece(null);
  };

  const handleCharacterSelect = (selectedAnimal) => {
    setPlayerAnimal(selectedAnimal);
    let availableCompOptions = ANIMAL_OPTIONS.filter(a => a.id !== selectedAnimal.id);
    let randomComp = availableCompOptions[Math.floor(Math.random() * availableCompOptions.length)];
    setComputerAnimal(randomComp);
  };

  const startNewGame = () => {
    setBoard(createInitialBoard());
    setTurn(PLAYER_1); setSelectedPiece(null); setValidMoves([]); setMultiJumpPiece(null);
    setScores({[PLAYER_1]: 0, [PLAYER_2]: 0});
    setWinner(null); setIsPlaying(true);
    playSound('select', !isMusicOn);
  };

  const resetToMenu = () => {
    setIsPlaying(false); setWinner(null); setBoard(createInitialBoard());
    playSound('select', !isMusicOn);
  };

  const isSquareHighlighted = (r, c) => validMoves.some(m => m.to.r === r && m.to.c === c);
  const isPieceMustMove = (r, c) => {
    if (selectedPiece) return selectedPiece.r === r && selectedPiece.c === c;
    return currentLegalMoves.some(m => m.from.r === r && m.from.c === c);
  };

  const toggleMusic = () => {
    if (!isMusicOn) playSound('select', false); // Daj sygnał że włączono
    setIsMusicOn(!isMusicOn);
  };

  const DifficultySelector = () => {
    return (
      <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 w-full border border-slate-200">
        {[
          { id: 1, label: 'Łatwy', icon: '🟩' },
          { id: 3, label: 'Średni', icon: '🟨' },
          { id: 4, label: 'Trudny', icon: '🟥' }
        ].map(level => (
          <button key={level.id} onClick={() => { setDifficultyLevel(level.id); playSound('select', !isMusicOn); }} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
              ${difficultyLevel === level.id ? 'bg-white text-indigo-700 shadow-md scale-100 ring-2 ring-indigo-400' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700 scale-95'}
            `}
          >
            <span className="text-lg mb-0.5">{level.icon}</span><span>{level.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex flex-col items-center py-4 font-sans text-slate-800 selection:bg-indigo-100 pb-8 relative">
      
      {/* Przycisk włączania / wyłączania muzyki (Prawy górny róg) */}
      <button 
        onClick={toggleMusic}
        className={`absolute top-4 right-4 z-50 p-3 rounded-full shadow-md border-2 transition-all ${isMusicOn ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
        title="Włącz/Wyłącz Dźwięk"
      >
        <span className="text-2xl leading-none block">{isMusicOn ? '🔊' : '🔇'}</span>
      </button>

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} playerAnimal={playerAnimal} />

      {/* ZWARTE BAJKOWE LOGO */}
      <div className="text-center mb-3 mt-1">
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-indigo-700 drop-shadow-sm flex items-center justify-center gap-2">
          {playerAnimal.emoji} Wesołe Warcaby {computerAnimal.emoji}
        </h1>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-lg px-4 flex-grow relative">
        
        {/* WARSTWA MENU (Gdy gra nie jest aktywna) */}
        {!isPlaying && !winner && (
            <div className="absolute inset-0 z-30 flex flex-col items-center pt-8 gap-6">
                <CharacterSelection onSelect={handleCharacterSelect} currentSelection={playerAnimal} isMusicOn={isMusicOn} />
                
                <button 
                  onClick={startNewGame}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-2xl py-5 px-12 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)] transition-all animate-bounce mt-4 border-4 border-white"
                >
                  Graj {playerAnimal.emoji}!
                </button>
            </div>
        )}

        {/* --- INTERFEJS GRY (Przyciemniony, gdy jesteśmy w menu) --- */}
        <div className={`flex flex-col gap-3 w-full transition-opacity duration-500 ${!isPlaying && !winner ? 'opacity-10 pointer-events-none' : 'opacity-100'}`}>
            
            {/* WSKAŹNIK TURY I WYNIK */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="font-bold text-[15px]">
                {winner ? (
                    <span className="text-indigo-600 animate-pulse">
                        🎉 Wygrywa: {winner === PLAYER_1 ? `${playerAnimal.name} ${playerAnimal.emoji}!` : `${computerAnimal.name} ${computerAnimal.emoji}!`} 🎉
                    </span>
                    ) : (
                    <span className={`${turn === PLAYER_1 ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {turn === PLAYER_1 ? `${playerAnimal.emoji} Twoja kolej` : `${computerAnimal.emoji} Komputer myśli...`}
                    </span>
                )}
            </div>
            
            <div className="flex gap-3 text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-indigo-500">{playerAnimal.emoji} {scores[PLAYER_1]}</span>
                    <span className="font-bold text-slate-400">vs</span>
                    <span className="font-bold text-sky-500">{computerAnimal.emoji} {scores[PLAYER_2]}</span>
                </div>
            </div>

            {/* PLANSZA */}
            <div className="w-full aspect-square bg-white p-2 sm:p-3 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.08)] relative">
                
                <div className="w-full h-full grid grid-cols-10 grid-rows-10 rounded-xl overflow-hidden shadow-inner border border-slate-100 bg-white">
                {board.map((row, r) => 
                    row.map((cell, c) => {
                    const isDark = (r + c) % 2 !== 0;
                    const highlighted = isSquareHighlighted(r, c);
                    const isMustMove = isPieceMustMove(r, c);
                    const isSelected = selectedPiece && selectedPiece.r === r && selectedPiece.c === c;

                    return (
                        <div 
                        key={`${r}-${c}`}
                        onClick={() => handleSquareClick(r, c)}
                        className={`
                            w-full h-full flex items-center justify-center relative transition-colors
                            ${isPlaying && isDark ? 'cursor-pointer hover:bg-indigo-300/90' : ''}
                            ${isDark ? 'bg-indigo-200/90' : 'bg-transparent'}
                            ${highlighted ? 'after:content-[""] after:absolute after:w-3/12 after:h-3/12 after:bg-indigo-500/60 after:rounded-full after:animate-pulse' : ''}
                        `}
                        >
                        {cell !== 0 && (
                            <div 
                            className={`
                                absolute inset-1 sm:inset-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)]
                                flex items-center justify-center text-xl sm:text-2xl md:text-3xl xl:text-4xl select-none transition-all duration-300
                                ${getPiecePlayer(cell) === PLAYER_1 ? `${playerAnimal.color} ${playerAnimal.border} border-2 ${playerAnimal.text || 'text-black'}` : `${computerAnimal.color} ${computerAnimal.border} border-2 ${computerAnimal.text || 'text-black'}`}
                                ${isMustMove && !isSelected && turn === getPiecePlayer(cell) && isPlaying ? 'ring-4 ring-indigo-400/70 ring-offset-2 scale-105 animate-pulse' : ''}
                                ${isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-110 z-10 shadow-xl' : ''}
                                ${isPlaying && getPiecePlayer(cell) === turn ? 'hover:scale-105' : ''}
                            `}
                            >
                            {getPiecePlayer(cell) === PLAYER_1 ? playerAnimal.emoji : computerAnimal.emoji}
                            
                            {isKing(cell) && (
                                <div className="absolute -top-2 -right-1 sm:-right-2 text-lg sm:text-xl drop-shadow-md bg-white/80 rounded-full p-0.5 z-20">👑</div>
                            )}
                            </div>
                        )}
                        </div>
                    )
                    })
                )}
                </div>
            </div>

            {/* PANEL TRUDNOŚCI */}
            <div className="bg-white rounded-2xl p-3 px-4 shadow-sm border border-indigo-100 mt-1 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Trudność:</span>
                <DifficultySelector />
            </div>

            {/* DOLNY PANEL STEROWANIA */}
            <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                    onClick={() => setIsTutorialOpen(true)}
                    className="bg-white text-indigo-600 font-bold py-3 sm:py-4 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                    <span className="text-xl">📖</span> Zasady
                </button>
                <button 
                    onClick={resetToMenu}
                    className="bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 text-white font-bold py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    {winner ? '🔄 Nowa Gra' : '🚪 Wyjdź z gry'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}