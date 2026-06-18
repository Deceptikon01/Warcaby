import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BOARD_SIZE = 10;
const PLAYER_1 = 1;
const PLAYER_2 = 2;
const KING_1 = 3;
const KING_2 = 4;
const PIECE_VALUE = 10;
const KING_VALUE = 30;
const STORAGE_KEY = 'wesole-warcaby-profile-v2';

const DIRECTIONS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const DIFFICULTY_LEVELS = [
  { id: 1, name: 'Pierwsze kroki', icon: '🌱', depth: 1, randomMoveChance: 0.55, delay: 520 },
  { id: 2, name: 'Sprytna łapka', icon: '🐾', depth: 1, randomMoveChance: 0.42, delay: 540 },
  { id: 3, name: 'Mały strateg', icon: '🧩', depth: 1, randomMoveChance: 0.32, delay: 560 },
  { id: 4, name: 'Odważny gracz', icon: '⭐', depth: 2, randomMoveChance: 0.24, delay: 580 },
  { id: 5, name: 'Mistrz podwórka', icon: '🏡', depth: 2, randomMoveChance: 0.17, delay: 600 },
  { id: 6, name: 'Leśny taktyk', icon: '🌲', depth: 2, randomMoveChance: 0.11, delay: 620 },
  { id: 7, name: 'Zamkowy mistrz', icon: '🏰', depth: 3, randomMoveChance: 0.08, delay: 650 },
  { id: 8, name: 'Kosmiczny strateg', icon: '🚀', depth: 3, randomMoveChance: 0.05, delay: 680 },
  { id: 9, name: 'Wielki czempion', icon: '🏆', depth: 3, randomMoveChance: 0.03, delay: 720 },
  { id: 10, name: 'Król warcabów', icon: '👑', depth: 4, randomMoveChance: 0.01, delay: 760 },
];

const ANIMALS = [
  { id: 'dog', emoji: '🐶', name: 'Piesek', description: 'Wierny pomocnik pierwszych zwycięstw.', color: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-950' },
  { id: 'cat', emoji: '🐱', name: 'Kotek', description: 'Cichy spryciarz od ruchów po skosie.', color: 'bg-slate-800', border: 'border-slate-950', text: 'text-white' },
  { id: 'panda', emoji: '🐼', name: 'Panda', description: 'Spokojna mistrzyni cierpliwości.', color: 'bg-green-50', border: 'border-green-300', text: 'text-green-950' },
  { id: 'horse', emoji: '🐴', name: 'Konik', description: 'Odblokuj za 3 wygrane na poziomie 1.', color: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-950' },
  { id: 'dino', emoji: '🦖', name: 'Dinozaur', description: 'Odblokuj za 6 wygranych na poziomie 1.', color: 'bg-emerald-700', border: 'border-emerald-900', text: 'text-white' },
  { id: 'dragon', emoji: '🐉', name: 'Smok', description: 'Pokonaj smoka przy 10. wygranej na poziomie 1.', color: 'bg-red-500', border: 'border-red-800', text: 'text-white' },
  { id: 'fox', emoji: '🦊', name: 'Lisek', description: 'Szybki obserwator planszy.', color: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-950' },
  { id: 'rabbit', emoji: '🐰', name: 'Królik', description: 'Skacze po okazje do bicia.', color: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-950' },
  { id: 'frog', emoji: '🐸', name: 'Żabka', description: 'Lubi sprytne przeskoki.', color: 'bg-lime-500', border: 'border-lime-700', text: 'text-white' },
  { id: 'owl', emoji: '🦉', name: 'Sówka', description: 'Pomaga widzieć dwa ruchy naprzód.', color: 'bg-stone-200', border: 'border-stone-500', text: 'text-stone-950' },
  { id: 'penguin', emoji: '🐧', name: 'Pingwinek', description: 'Chłodna głowa w trudnych ruchach.', color: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-950' },
  { id: 'bear', emoji: '🐻', name: 'Miś', description: 'Silny i cierpliwy obrońca.', color: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-950' },
  { id: 'tiger', emoji: '🐯', name: 'Tygrysek', description: 'Odważny łowca dobrych okazji.', color: 'bg-orange-300', border: 'border-orange-700', text: 'text-orange-950' },
  { id: 'unicorn', emoji: '🦄', name: 'Jednorożec', description: 'Magiczny patron pięknych kombinacji.', color: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-950' },
  { id: 'robot', emoji: '🤖', name: 'Robotek', description: 'Liczy pola i ćwiczy planowanie.', color: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-950' },
  { id: 'ghost', emoji: '👻', name: 'Duszek', description: 'Lekki jak myśl i trudny do złapania.', color: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-950' },
  { id: 'pirate', emoji: '🏴‍☠️', name: 'Pirat', description: 'Szuka skarbów na przekątnych.', color: 'bg-zinc-800', border: 'border-zinc-950', text: 'text-white' },
  { id: 'knight', emoji: '🛡️', name: 'Rycerzyk', description: 'Broni pionków i atakuje z honorem.', color: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-950' },
  { id: 'alien', emoji: '👽', name: 'Kosmita', description: 'Przyleciał z galaktyki sprytnych ruchów.', color: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-950' },
  { id: 'wizard', emoji: '🧙', name: 'Czarodziej', description: 'Wyczarowuje najlepszy plan.', color: 'bg-purple-200', border: 'border-purple-600', text: 'text-purple-950' },
];

const VARIANTS = [
  { id: 'gold-dog', animalId: 'dog', name: 'Złoty Piesek', color: 'bg-yellow-200', border: 'border-yellow-500', text: 'text-yellow-950' },
  { id: 'ice-dragon', animalId: 'dragon', name: 'Lodowy Smok', color: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-950' },
  { id: 'rainbow-horse', animalId: 'horse', name: 'Tęczowy Konik', color: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-950' },
  { id: 'forest-fox', animalId: 'fox', name: 'Leśny Lisek', color: 'bg-green-200', border: 'border-green-600', text: 'text-green-950' },
  { id: 'star-panda', animalId: 'panda', name: 'Gwiazdka Panda', color: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-950' },
  { id: 'storm-cat', animalId: 'cat', name: 'Burzowy Kotek', color: 'bg-slate-500', border: 'border-slate-800', text: 'text-white' },
  { id: 'ruby-tiger', animalId: 'tiger', name: 'Rubinowy Tygrysek', color: 'bg-red-200', border: 'border-red-600', text: 'text-red-950' },
  { id: 'moon-owl', animalId: 'owl', name: 'Księżycowa Sówka', color: 'bg-violet-100', border: 'border-violet-500', text: 'text-violet-950' },
  { id: 'space-robot', animalId: 'robot', name: 'Kosmiczny Robotek', color: 'bg-blue-200', border: 'border-blue-600', text: 'text-blue-950' },
  { id: 'candy-unicorn', animalId: 'unicorn', name: 'Cukierkowy Jednorożec', color: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-950' },
];

const BOARD_SKINS = [
  { id: 'classic', name: 'Klasyczna', emoji: '⭐', description: 'Jasna, czytelna plansza startowa.', light: 'bg-amber-50/85', dark: 'bg-indigo-300/90', frame: 'from-indigo-100 via-white to-sky-100', accent: 'text-indigo-700' },
  { id: 'spring', name: 'Wiosna', emoji: '🌸', description: 'Odblokuj za pierwszą większą serię zwycięstw.', light: 'bg-pink-50/85', dark: 'bg-emerald-300/90', frame: 'from-pink-100 via-white to-emerald-100', accent: 'text-emerald-700' },
  { id: 'summer', name: 'Lato', emoji: '☀️', description: 'Ciepła plansza wakacyjna.', light: 'bg-yellow-50/85', dark: 'bg-orange-300/90', frame: 'from-yellow-100 via-white to-sky-100', accent: 'text-orange-700' },
  { id: 'autumn', name: 'Jesień', emoji: '🍁', description: 'Spokojne barwy liści.', light: 'bg-orange-50/85', dark: 'bg-red-300/90', frame: 'from-orange-100 via-white to-red-100', accent: 'text-red-700' },
  { id: 'winter', name: 'Zima', emoji: '❄️', description: 'Chłodna, bardzo czytelna plansza.', light: 'bg-blue-50/85', dark: 'bg-cyan-300/90', frame: 'from-cyan-100 via-white to-blue-100', accent: 'text-cyan-700' },
  { id: 'forest', name: 'Las', emoji: '🌲', description: 'Leśny klimat bez mroku.', light: 'bg-lime-50/85', dark: 'bg-green-500/90', frame: 'from-lime-100 via-white to-green-100', accent: 'text-green-700' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', description: 'Morska przygoda na przekątnych.', light: 'bg-sky-50/85', dark: 'bg-blue-400/90', frame: 'from-sky-100 via-white to-blue-100', accent: 'text-blue-700' },
  { id: 'space', name: 'Kosmos', emoji: '🪐', description: 'Plansza dla kosmicznych strategów.', light: 'bg-violet-50/85', dark: 'bg-indigo-500/90', frame: 'from-violet-100 via-white to-indigo-100', accent: 'text-indigo-700' },
  { id: 'castle', name: 'Zamek', emoji: '🏰', description: 'Rycerska plansza turniejowa.', light: 'bg-stone-50/85', dark: 'bg-purple-300/90', frame: 'from-stone-100 via-white to-purple-100', accent: 'text-purple-700' },
  { id: 'jungle', name: 'Dżungla', emoji: '🌿', description: 'Soczysta i radosna plansza.', light: 'bg-emerald-50/85', dark: 'bg-lime-500/90', frame: 'from-emerald-100 via-white to-lime-100', accent: 'text-lime-800' },
  { id: 'continents', name: 'Kontynenty', emoji: '🌍', description: 'Podróż przez świat warcabów.', light: 'bg-teal-50/85', dark: 'bg-amber-300/90', frame: 'from-teal-100 via-white to-amber-100', accent: 'text-teal-700' },
];

const STARTING_ANIMALS = ['dog', 'cat', 'panda'];

const CHARACTER_REWARDS = [
  { level: 1, wins: 3, animalId: 'horse' },
  { level: 1, wins: 6, animalId: 'dino' },
  { level: 1, wins: 10, animalId: 'dragon' },
  { level: 2, wins: 3, animalId: 'fox' },
  { level: 2, wins: 6, animalId: 'rabbit' },
  { level: 2, wins: 10, animalId: 'frog' },
  { level: 2, wins: 14, animalId: 'owl' },
  { level: 3, wins: 3, animalId: 'penguin' },
  { level: 3, wins: 6, animalId: 'bear' },
  { level: 3, wins: 10, animalId: 'tiger' },
  { level: 3, wins: 14, animalId: 'unicorn' },
  { level: 4, wins: 4, animalId: 'robot' },
  { level: 4, wins: 8, animalId: 'ghost' },
  { level: 4, wins: 12, animalId: 'pirate' },
  { level: 5, wins: 4, animalId: 'knight' },
  { level: 5, wins: 8, animalId: 'alien' },
  { level: 5, wins: 12, animalId: 'wizard' },
];

const VARIANT_REWARDS = [
  { level: 6, wins: 3, variantId: 'gold-dog' },
  { level: 6, wins: 6, variantId: 'ice-dragon' },
  { level: 7, wins: 3, variantId: 'rainbow-horse' },
  { level: 7, wins: 6, variantId: 'forest-fox' },
  { level: 8, wins: 3, variantId: 'star-panda' },
  { level: 8, wins: 6, variantId: 'storm-cat' },
  { level: 9, wins: 3, variantId: 'ruby-tiger' },
  { level: 9, wins: 6, variantId: 'moon-owl' },
  { level: 10, wins: 3, variantId: 'space-robot' },
  { level: 10, wins: 6, variantId: 'candy-unicorn' },
];

const BOARD_REWARDS = [
  { level: 1, wins: 5, boardId: 'spring' },
  { level: 1, wins: 12, boardId: 'summer' },
  { level: 2, wins: 8, boardId: 'autumn' },
  { level: 3, wins: 8, boardId: 'winter' },
  { level: 4, wins: 10, boardId: 'forest' },
  { level: 5, wins: 10, boardId: 'ocean' },
  { level: 6, wins: 8, boardId: 'space' },
  { level: 7, wins: 8, boardId: 'castle' },
  { level: 8, wins: 8, boardId: 'jungle' },
  { level: 9, wins: 8, boardId: 'continents' },
];

const LEARNING_QUESTIONS = [
  { question: 'Masz 4 pionki i zdobywasz 3 kolejne punkty. Ile punktów razem?', answers: ['7', '6', '8'], correct: '7', skill: 'Matematyka' },
  { question: 'Który ruch w warcabach jest obowiązkowy, gdy możesz go wykonać?', answers: ['Bicie', 'Cofnięcie', 'Pominięcie tury'], correct: 'Bicie', skill: 'Logika' },
  { question: 'Co pomaga, gdy przegrasz trudną partię?', answers: ['Spokojny oddech i próba jeszcze raz', 'Złość na siebie', 'Wyłączenie zasad'], correct: 'Spokojny oddech i próba jeszcze raz', skill: 'Emocje' },
  { question: 'Jeśli pionek idzie po skosie, to zmienia...', answers: ['rząd i kolumnę', 'tylko rząd', 'tylko kolor tła'], correct: 'rząd i kolumnę', skill: 'Spostrzegawczość' },
  { question: 'Zapamiętaj: piesek, panda, smok. Kto był drugi?', answers: ['Panda', 'Piesek', 'Smok'], correct: 'Panda', skill: 'Pamięć' },
];

const byId = (items, id) => items.find((item) => item.id === id);
const getAnimal = (id) => byId(ANIMALS, id) || ANIMALS[0];
const getVariant = (id) => byId(VARIANTS, id);
const getBoardSkin = (id) => byId(BOARD_SKINS, id) || BOARD_SKINS[0];
const getDifficulty = (id) => byId(DIFFICULTY_LEVELS, id) || DIFFICULTY_LEVELS[0];

const getSafeOpponentAnimalId = (selectedAnimalId, preferredAnimalId = null, unlockedAnimals = []) => {
  if (preferredAnimalId && preferredAnimalId !== selectedAnimalId) return preferredAnimalId;

  const unlockedCandidates = ANIMALS
    .filter((animal) => unlockedAnimals.includes(animal.id) && animal.id !== selectedAnimalId)
    .map((animal) => animal.id);
  if (unlockedCandidates.length > 0) {
    return unlockedCandidates[Math.floor(Math.random() * unlockedCandidates.length)];
  }

  const allCandidates = ANIMALS.filter((animal) => animal.id !== selectedAnimalId).map((animal) => animal.id);
  return allCandidates[Math.floor(Math.random() * allCandidates.length)] || ANIMALS[0].id;
};

const createInitialBoard = () => {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      if ((r + c) % 2 !== 0) {
        if (r < 4) board[r][c] = PLAYER_2;
        else if (r > 5) board[r][c] = PLAYER_1;
      }
    }
  }
  return board;
};

const createDefaultProfile = () => ({
  playerName: 'Młody Strateg',
  selectedAnimalId: 'dog',
  selectedVariantId: null,
  selectedBoardSkinId: 'classic',
  difficultyLevel: 1,
  unlockedAnimals: [...STARTING_ANIMALS],
  unlockedVariants: [],
  unlockedBoardSkins: ['classic'],
  winsByLevel: {},
  gamesByLevel: {},
  winStreakByLevel: {},
  lastCreatureChoiceDate: '',
  lastLevelSuggestion: '',
  gamesPlayed: 0,
  isMusicOn: false,
});

const normalizeProfile = (profile) => {
  const defaults = createDefaultProfile();
  const winsByLevel = { ...(profile?.winsByLevel || {}) };
  const gamesByLevel = { ...(profile?.gamesByLevel || {}) };
  const winStreakByLevel = { ...(profile?.winStreakByLevel || {}) };
  DIFFICULTY_LEVELS.forEach((level) => {
    winsByLevel[level.id] = Number(winsByLevel[level.id] || 0);
    gamesByLevel[level.id] = Number(gamesByLevel[level.id] || 0);
    winStreakByLevel[level.id] = Number(winStreakByLevel[level.id] || 0);
  });

  const unlockedAnimals = Array.from(new Set([...(profile?.unlockedAnimals || []), ...STARTING_ANIMALS]))
    .filter((id) => ANIMALS.some((animal) => animal.id === id));
  const selectedAnimalId = unlockedAnimals.includes(profile?.selectedAnimalId) ? profile.selectedAnimalId : defaults.selectedAnimalId;
  const unlockedBoardSkins = Array.from(new Set([...(profile?.unlockedBoardSkins || []), 'classic']))
    .filter((id) => BOARD_SKINS.some((skin) => skin.id === id));
  const selectedBoardSkinId = unlockedBoardSkins.includes(profile?.selectedBoardSkinId) ? profile.selectedBoardSkinId : 'classic';
  const unlockedVariants = Array.from(new Set(profile?.unlockedVariants || []))
    .filter((id) => VARIANTS.some((variant) => variant.id === id));
  const selectedVariant = getVariant(profile?.selectedVariantId);

  return {
    ...defaults,
    ...profile,
    selectedAnimalId,
    selectedVariantId: selectedVariant && unlockedVariants.includes(selectedVariant.id) && selectedVariant.animalId === selectedAnimalId
      ? selectedVariant.id
      : null,
    selectedBoardSkinId,
    difficultyLevel: DIFFICULTY_LEVELS.some((level) => level.id === profile?.difficultyLevel) ? profile.difficultyLevel : 1,
    unlockedAnimals,
    unlockedVariants,
    unlockedBoardSkins,
    winsByLevel,
    gamesByLevel,
    winStreakByLevel,
    lastCreatureChoiceDate: typeof profile?.lastCreatureChoiceDate === 'string' ? profile.lastCreatureChoiceDate : '',
    lastLevelSuggestion: typeof profile?.lastLevelSuggestion === 'string' ? profile.lastLevelSuggestion : '',
    gamesPlayed: Number(profile?.gamesPlayed || 0),
    isMusicOn: Boolean(profile?.isMusicOn),
  };
};

const loadProfile = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizeProfile(raw ? JSON.parse(raw) : createDefaultProfile());
  } catch (error) {
    console.warn('Nie udało się odczytać profilu.', error);
    return createDefaultProfile();
  }
};

const saveProfile = (profile) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Nie udało się zapisać profilu.', error);
  }
};

const getPiecePlayer = (val) => {
  if (val === PLAYER_1 || val === KING_1) return PLAYER_1;
  if (val === PLAYER_2 || val === KING_2) return PLAYER_2;
  return 0;
};

const isKing = (val) => val === KING_1 || val === KING_2;

const ANIMAL_SOUND_MOTIFS = {
  dog: [420, 520, 420],
  cat: [760, 920, 860],
  panda: [320, 420, 520],
  horse: [440, 660, 540],
  dino: [150, 220, 170],
  dragon: [130, 260, 390],
  fox: [620, 760, 680],
  rabbit: [700, 860, 700],
  frog: [240, 360, 240],
  owl: [300, 450, 300],
  penguin: [520, 390, 520],
  bear: [140, 190, 160],
  tiger: [220, 330, 220],
  unicorn: [620, 820, 1040],
  robot: [330, 660, 330],
  ghost: [520, 410, 300],
  pirate: [260, 390, 520],
  knight: [330, 500, 660],
  alien: [480, 720, 960],
  wizard: [500, 750, 1000],
};

const playSound = (type, isMuted = false, animalId = null) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const tone = (frequency, start, duration, wave = 'sine', volume = 0.05) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.setValueAtTime(frequency, now + start);
      gain.gain.setValueAtTime(volume, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    };

    const motif = ANIMAL_SOUND_MOTIFS[animalId] || ANIMAL_SOUND_MOTIFS.dog;

    if (type === 'animal') {
      motif.forEach((note, index) => tone(note, index * 0.075, 0.13, index % 2 ? 'triangle' : 'sine', 0.035));
    } else if (type === 'move') {
      motif.slice(0, 2).forEach((note, index) => tone(note, index * 0.055, 0.11, 'sine', 0.035));
    } else if (type === 'capture') {
      tone(motif[0] * 0.7, 0, 0.12, 'triangle', 0.055);
      tone(motif[1] * 0.55, 0.07, 0.16, 'sawtooth', 0.035);
      tone(motif[2] * 0.8, 0.16, 0.11, 'triangle', 0.04);
    } else if (type === 'error') {
      tone(190, 0, 0.18, 'sine', 0.05);
    } else if (type === 'select') {
      tone(650, 0, 0.1);
      tone(820, 0.06, 0.1);
    } else if (type === 'reward') {
      [523, 659, 784, 1046].forEach((note, index) => tone(note, index * 0.1, 0.25, 'square', 0.045));
    } else if (type === 'win') {
      [523, 659, 784, 1046, 1175, 1046].forEach((note, index) => tone(note, index * 0.1, index === 5 ? 0.55 : 0.18, 'square', 0.05));
      motif.forEach((note, index) => tone(note * 1.2, 0.72 + index * 0.07, 0.14, 'triangle', 0.035));
    }
  } catch (error) {
    console.warn('Audio error:', error);
  }
};

const calculateMoves = (board, player, multiJumpPiece = null) => {
  const moves = [];
  let hasCaptures = false;

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
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
                  moves.push({ from: { r, c }, to: { r: nr, c: nc }, captures: [] });
                }
              } else if (getPiecePlayer(target) !== player) {
                enemyFound = true;
                enemyPos = { r: nr, c: nc };
              } else {
                break;
              }
            } else if (target === 0) {
              hasCaptures = true;
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, captures: [enemyPos] });
            } else {
              break;
            }
            step += 1;
          }
        } else {
          if (dr === forwardDir && !hasCaptures && !multiJumpPiece) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 0) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc }, captures: [] });
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
              moves.push({ from: { r, c }, to: { r: nr2, c: nc2 }, captures: [{ r: nr1, c: nc1 }] });
            }
          }
        }
      });
    }
  }

  if (hasCaptures) return moves.filter((move) => move.captures.length > 0);
  return moves;
};

const applyMove = (board, move) => {
  const newBoard = board.map((row) => [...row]);
  let piece = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = 0;
  move.captures.forEach((capture) => {
    newBoard[capture.r][capture.c] = 0;
  });

  if (piece === PLAYER_1 && move.to.r === 0) piece = KING_1;
  if (piece === PLAYER_2 && move.to.r === BOARD_SIZE - 1) piece = KING_2;
  newBoard[move.to.r][move.to.c] = piece;
  return { newBoard, isPromotion: piece !== board[move.from.r][move.from.c] };
};

const evaluateBoard = (board) => {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const piece = board[r][c];
      if (piece === PLAYER_2) score += PIECE_VALUE;
      else if (piece === KING_2) score += KING_VALUE;
      else if (piece === PLAYER_1) score -= PIECE_VALUE;
      else if (piece === KING_1) score -= KING_VALUE;

      if (getPiecePlayer(piece) === PLAYER_2 && r > 2 && r < 7 && c > 2 && c < 7) score += 2;
      if (getPiecePlayer(piece) === PLAYER_1 && r > 2 && r < 7 && c > 2 && c < 7) score -= 2;
    }
  }
  return score;
};

const getAllPossibleTurns = (board, player, multiJumpPos = null) => {
  const allTurns = [];
  const moves = calculateMoves(board, player, multiJumpPos);
  if (moves.length === 0) return multiJumpPos ? [{ board, firstMove: null }] : [];

  moves.forEach((move) => {
    const { newBoard, isPromotion } = applyMove(board, move);
    if (move.captures.length > 0 && !isPromotion) {
      const furtherMoves = calculateMoves(newBoard, player, move.to);
      if (furtherMoves.length > 0 && furtherMoves[0].captures.length > 0) {
        getAllPossibleTurns(newBoard, player, move.to).forEach((subTurn) => {
          allTurns.push({ board: subTurn.board, firstMove: move });
        });
        return;
      }
    }
    allTurns.push({ board: newBoard, firstMove: move });
  });
  return allTurns;
};

const minimax = (board, depth, alpha, beta, isMaximizingPlayer) => {
  if (depth === 0) return evaluateBoard(board);
  const player = isMaximizingPlayer ? PLAYER_2 : PLAYER_1;
  const possibleTurns = getAllPossibleTurns(board, player);
  if (possibleTurns.length === 0) return isMaximizingPlayer ? -10000 : 10000;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const turn of possibleTurns) {
      const evaluation = minimax(turn.board, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const turn of possibleTurns) {
    const evaluation = minimax(turn.board, depth - 1, alpha, beta, true);
    minEval = Math.min(minEval, evaluation);
    beta = Math.min(beta, evaluation);
    if (beta <= alpha) break;
  }
  return minEval;
};

const getNextRewardCandidate = (profile) => {
  const rewards = [
    ...CHARACTER_REWARDS.map((reward) => ({ ...reward, type: 'animal' })),
    ...VARIANT_REWARDS.map((reward) => ({ ...reward, type: 'variant' })),
    ...BOARD_REWARDS.map((reward) => ({ ...reward, type: 'board' })),
  ].sort((a, b) => a.level - b.level || a.wins - b.wins);

  return rewards.find((reward) => {
    const currentWins = Number(profile.winsByLevel[reward.level] || 0);
    if (currentWins + 1 < reward.wins) return false;
    if (reward.type === 'animal') return !profile.unlockedAnimals.includes(reward.animalId);
    if (reward.type === 'variant') return !profile.unlockedVariants.includes(reward.variantId);
    return !profile.unlockedBoardSkins.includes(reward.boardId);
  });
};

const getNearestLockedReward = (profile) => {
  const rewards = [
    ...CHARACTER_REWARDS.map((reward) => ({ ...reward, type: 'animal' })),
    ...VARIANT_REWARDS.map((reward) => ({ ...reward, type: 'variant' })),
    ...BOARD_REWARDS.map((reward) => ({ ...reward, type: 'board' })),
  ].sort((a, b) => {
    const aWins = Number(profile.winsByLevel[a.level] || 0);
    const bWins = Number(profile.winsByLevel[b.level] || 0);
    return Math.max(0, a.wins - aWins) - Math.max(0, b.wins - bWins) || a.level - b.level || a.wins - b.wins;
  });

  return rewards.find((reward) => {
    if (reward.type === 'animal') return !profile.unlockedAnimals.includes(reward.animalId);
    if (reward.type === 'variant') return !profile.unlockedVariants.includes(reward.variantId);
    return !profile.unlockedBoardSkins.includes(reward.boardId);
  });
};

const collectUnlockedRewards = (profile) => {
  const newRewards = [];
  const nextProfile = {
    ...profile,
    unlockedAnimals: [...profile.unlockedAnimals],
    unlockedVariants: [...profile.unlockedVariants],
    unlockedBoardSkins: [...profile.unlockedBoardSkins],
  };

  CHARACTER_REWARDS.forEach((reward) => {
    if ((nextProfile.winsByLevel[reward.level] || 0) >= reward.wins && !nextProfile.unlockedAnimals.includes(reward.animalId)) {
      nextProfile.unlockedAnimals.push(reward.animalId);
      newRewards.push({ type: 'animal', item: getAnimal(reward.animalId) });
    }
  });

  VARIANT_REWARDS.forEach((reward) => {
    const variant = getVariant(reward.variantId);
    const baseUnlocked = variant && nextProfile.unlockedAnimals.includes(variant.animalId);
    if ((nextProfile.winsByLevel[reward.level] || 0) >= reward.wins && baseUnlocked && !nextProfile.unlockedVariants.includes(reward.variantId)) {
      nextProfile.unlockedVariants.push(reward.variantId);
      newRewards.push({ type: 'variant', item: variant, animal: getAnimal(variant.animalId) });
    }
  });

  BOARD_REWARDS.forEach((reward) => {
    if ((nextProfile.winsByLevel[reward.level] || 0) >= reward.wins && !nextProfile.unlockedBoardSkins.includes(reward.boardId)) {
      nextProfile.unlockedBoardSkins.push(reward.boardId);
      newRewards.push({ type: 'board', item: getBoardSkin(reward.boardId) });
    }
  });

  return { nextProfile, newRewards };
};

const ProgressPill = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${className}`}>
    {children}
  </span>
);

const RewardModal = ({ rewards, onClose }) => {
  if (!rewards.length) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 text-center shadow-2xl">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-3 text-3xl font-black text-indigo-700">Nowa nagroda!</h2>
        <div className="mt-5 space-y-3">
          {rewards.map((reward, index) => (
            <div key={`${reward.type}-${reward.item.id}-${index}`} className="rounded-2xl bg-indigo-50 p-4">
              <div className="text-5xl">{reward.type === 'board' ? reward.item.emoji : reward.animal?.emoji || reward.item.emoji}</div>
              <p className="mt-2 text-lg font-black text-slate-800">
                {reward.type === 'animal' && `Do kolekcji dołącza ${reward.item.name}!`}
                {reward.type === 'variant' && `Nowy kolor: ${reward.item.name}!`}
                {reward.type === 'board' && `Nowa plansza: ${reward.item.name}!`}
              </p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 text-xl font-black text-white shadow-lg transition hover:bg-indigo-700 active:scale-95">
          Super!
        </button>
      </div>
    </div>
  );
};

const LearningBreak = ({ isOpen, question, onClose }) => {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (isOpen) setSelected(null);
  }, [isOpen, question]);

  if (!isOpen || !question) return null;
  const isCorrect = selected === question.correct;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <ProgressPill className="bg-emerald-100 text-emerald-800">Krótka misja: {question.skill}</ProgressPill>
        <h2 className="mt-4 text-2xl font-black text-slate-800">{question.question}</h2>
        <div className="mt-5 grid gap-3">
          {question.answers.map((answer) => (
            <button
              key={answer}
              onClick={() => setSelected(answer)}
              className={`rounded-2xl border-2 p-4 text-left text-lg font-black transition ${
                selected === answer
                  ? answer === question.correct
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-rose-500 bg-rose-50 text-rose-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {answer}
            </button>
          ))}
        </div>
        {selected && (
          <p className={`mt-4 rounded-2xl p-3 text-center font-bold ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            {isCorrect ? 'Brawo, świetne myślenie!' : `Dobra próba. Poprawna odpowiedź: ${question.correct}.`}
          </p>
        )}
        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 text-lg font-black text-white transition hover:bg-slate-800 active:scale-95">
          Wracam do gry
        </button>
      </div>
    </div>
  );
};

const TutorialModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-500 hover:bg-slate-200">
          ×
        </button>
        <h2 className="pr-10 text-3xl font-black text-indigo-700">Jak grać?</h2>
        <div className="mt-5 space-y-3 text-slate-700">
          {[
            ['🎯', 'Cel gry', 'Zbij wszystkie pionki przeciwnika albo zablokuj jego ruchy.'],
            ['🐾', 'Ruchy', 'Pionki idą po skosie do przodu. Damka porusza się po skosie dalej.'],
            ['⚔️', 'Bicie jest obowiązkowe', 'Gdy możesz zbić pionek, gra pokaże Ci mocne podświetlenie.'],
            ['👑', 'Damka', 'Dojdź pionkiem do końca planszy, żeby zdobyć koronę.'],
          ].map(([icon, title, text]) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-indigo-50 p-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <strong className="block text-indigo-950">{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-2xl bg-indigo-600 py-4 text-xl font-black text-white shadow-lg hover:bg-indigo-700">
          Gramy!
        </button>
      </div>
    </div>
  );
};

const DailyCreatureModal = ({ isOpen, profile, onChoose, onClose }) => {
  if (!isOpen) return null;
  const unlocked = ANIMALS.filter((animal) => profile.unlockedAnimals.includes(animal.id));

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border-4 border-white bg-white p-5 text-center shadow-2xl">
        <div className="text-4xl">🌞</div>
        <h2 className="mt-2 text-3xl font-black text-indigo-700">Kim dziś grasz?</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">Wybierz stworka na start dnia. Później możesz go zmienić w kolekcji.</p>
        <div className="mt-5 grid max-h-[22rem] grid-cols-3 gap-3 overflow-auto pr-1">
          {unlocked.map((animal) => (
            <button
              key={animal.id}
              onClick={() => onChoose(animal.id)}
              className={`rounded-2xl border-2 p-3 text-center transition hover:scale-[1.03] ${
                profile.selectedAnimalId === animal.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 bg-white hover:border-indigo-200'
              }`}
            >
              <div className="text-4xl">{animal.emoji}</div>
              <div className="mt-1 text-xs font-black text-slate-700">{animal.name}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-slate-900 py-4 text-lg font-black text-white transition hover:bg-slate-800 active:scale-95">
          Zostaję przy obecnym
        </button>
      </div>
    </div>
  );
};

const ConfettiBurst = ({ active }) => {
  if (!active) return null;
  const colors = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#14b8a6'];
  const pieces = Array.from({ length: 48 }, (_, index) => ({
    left: `${(index * 19) % 100}%`,
    delay: `${(index % 8) * 0.08}s`,
    duration: `${1.8 + (index % 5) * 0.18}s`,
    color: colors[index % colors.length],
    rotate: `${(index * 47) % 360}deg`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[64] overflow-hidden">
      <style>{`
        @keyframes ww-confetti-fall {
          0% { transform: translateY(-15vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="absolute top-0 h-3 w-2 rounded-sm"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animation: `ww-confetti-fall ${piece.duration} ease-out ${piece.delay} forwards`,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  );
};

const LevelUpSuggestionModal = ({ suggestion, onAccept, onStay }) => {
  if (!suggestion) return null;
  return (
    <div className="fixed inset-0 z-[68] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 text-center shadow-2xl">
        <div className="text-5xl">🏆</div>
        <h2 className="mt-3 text-3xl font-black text-indigo-700">Świetnie Ci idzie!</h2>
        <p className="mt-3 font-bold text-slate-600">
          Masz już dobrą serię na poziomie {suggestion.currentLevel}. Spróbować poziom {suggestion.nextLevel}?
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={onAccept} className="rounded-2xl bg-indigo-600 py-4 font-black text-white shadow hover:bg-indigo-700 active:scale-95">
            Spróbuj wyżej
          </button>
          <button onClick={onStay} className="rounded-2xl bg-white py-4 font-black text-slate-700 shadow ring-2 ring-slate-100 hover:bg-slate-50 active:scale-95">
            Zostaję tutaj
          </button>
        </div>
      </div>
    </div>
  );
};

const CollectionPanel = ({ profile, activeTab, setActiveTab, onSelectAnimal, onSelectVariant, onSelectBoard }) => {
  const unlockedAnimals = new Set(profile.unlockedAnimals);
  const unlockedVariants = new Set(profile.unlockedVariants);
  const unlockedBoards = new Set(profile.unlockedBoardSkins);

  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur">
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button onClick={() => setActiveTab('animals')} className={`rounded-xl py-2 font-black transition ${activeTab === 'animals' ? 'bg-white text-indigo-700 shadow' : 'text-slate-500'}`}>
          Stworki
        </button>
        <button onClick={() => setActiveTab('boards')} className={`rounded-xl py-2 font-black transition ${activeTab === 'boards' ? 'bg-white text-indigo-700 shadow' : 'text-slate-500'}`}>
          Plansze
        </button>
      </div>

      {activeTab === 'animals' ? (
        <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3">
          {ANIMALS.map((animal) => {
            const isUnlocked = unlockedAnimals.has(animal.id);
            const isSelected = profile.selectedAnimalId === animal.id && !profile.selectedVariantId;
            const animalVariants = VARIANTS.filter((variant) => variant.animalId === animal.id && unlockedVariants.has(variant.id));
            return (
              <div key={animal.id} className={`rounded-2xl border-2 p-2 ${isUnlocked ? 'border-indigo-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                <button
                  disabled={!isUnlocked}
                  onClick={() => onSelectAnimal(animal.id)}
                  className={`w-full rounded-xl p-2 text-center transition ${isSelected ? 'bg-indigo-100 ring-2 ring-indigo-400' : isUnlocked ? 'hover:bg-indigo-50' : ''}`}
                >
                  <div className="text-4xl">{isUnlocked ? animal.emoji : '🔒'}</div>
                  <div className="mt-1 text-sm font-black text-slate-800">{animal.name}</div>
                </button>
                {animalVariants.length > 0 && (
                  <div className="mt-2 grid gap-1">
                    {animalVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => onSelectVariant(variant.id)}
                        className={`rounded-lg px-2 py-1 text-xs font-black ${
                          profile.selectedVariantId === variant.id ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-auto pr-1">
          {BOARD_SKINS.map((skin) => {
            const isUnlocked = unlockedBoards.has(skin.id);
            const isSelected = profile.selectedBoardSkinId === skin.id;
            return (
              <button
                key={skin.id}
                disabled={!isUnlocked}
                onClick={() => onSelectBoard(skin.id)}
                className={`rounded-2xl border-2 p-3 text-left transition ${
                  isSelected ? 'border-indigo-400 bg-indigo-50 shadow-md' : isUnlocked ? 'border-slate-100 bg-white hover:border-indigo-200' : 'border-slate-100 bg-slate-50 opacity-70'
                }`}
              >
                <div className="text-3xl">{isUnlocked ? skin.emoji : '🔒'}</div>
                <div className="mt-2 font-black text-slate-800">{skin.name}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">{skin.description}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DifficultyPath = ({ value, onChange, winsByLevel, isMusicOn }) => (
  <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-lg">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="font-black text-slate-800">Ścieżka trudności</h3>
      <ProgressPill className="bg-indigo-100 text-indigo-700">Poziom {value}/10</ProgressPill>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {DIFFICULTY_LEVELS.map((level) => (
        <button
          key={level.id}
          onClick={() => {
            onChange(level.id);
            playSound('select', !isMusicOn);
          }}
          className={`min-h-20 rounded-2xl border-2 p-2 text-center transition ${
            value === level.id ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]' : 'border-slate-100 bg-white hover:border-indigo-200'
          }`}
        >
          <div className="text-2xl">{level.icon}</div>
          <div className="text-xs font-black text-slate-700">{level.id}. {level.name}</div>
          <div className="mt-1 text-[11px] font-bold text-slate-400">wygrane: {winsByLevel[level.id] || 0}</div>
        </button>
      ))}
    </div>
  </div>
);

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState(PLAYER_1);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [multiJumpPiece, setMultiJumpPiece] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ [PLAYER_1]: 0, [PLAYER_2]: 0 });
  const [computerAnimalId, setComputerAnimalId] = useState('cat');
  const [computerVariantId, setComputerVariantId] = useState(null);
  const [bossReward, setBossReward] = useState(null);
  const [rewardQueue, setRewardQueue] = useState([]);
  const [activeCollectionTab, setActiveCollectionTab] = useState('animals');
  const [activeSetupPanel, setActiveSetupPanel] = useState('none');
  const [isDailyCreatureOpen, setIsDailyCreatureOpen] = useState(() => loadProfile().lastCreatureChoiceDate !== todayKey());
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [levelSuggestion, setLevelSuggestion] = useState(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [learningQuestion, setLearningQuestion] = useState(null);
  const [moveHint, setMoveHint] = useState('Wybierz swój pionek.');
  const bgmRef = useRef(null);
  const processedWinnerRef = useRef(null);

  const difficulty = getDifficulty(profile.difficultyLevel);
  const playerAnimal = getAnimal(profile.selectedAnimalId);
  const playerVariant = getVariant(profile.selectedVariantId);
  const computerAnimal = getAnimal(computerAnimalId);
  const computerVariant = getVariant(computerVariantId);
  const boardSkin = getBoardSkin(profile.selectedBoardSkinId);
  const currentLegalMoves = useMemo(() => calculateMoves(board, turn, multiJumpPiece), [board, turn, multiJumpPiece]);
  const hasMandatoryCapture = currentLegalMoves.some((move) => move.captures.length > 0);

  const updateProfile = useCallback((updater) => {
    setProfile((current) => {
      const next = normalizeProfile(typeof updater === 'function' ? updater(current) : updater);
      saveProfile(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveProfile(profile);
  }, []);

  useEffect(() => {
    bgmRef.current = {
      ctx: null,
      timerId: null,
      step: 0,
      melody: [261.6, 329.6, 392.0, 523.3, 349.2, 440.0, 523.3, 659.2, 392.0, 493.9, 587.3, 784.0],
      play() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.ctx) this.ctx = new AudioContext();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (!this.timerId) this.loop();
      },
      stop() {
        clearTimeout(this.timerId);
        this.timerId = null;
      },
      loop() {
        if (this.ctx) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = this.melody[this.step % this.melody.length];
          this.step += 1;
          const now = this.ctx.currentTime;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.014, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.4);
        }
        this.timerId = setTimeout(() => this.loop(), 420);
      },
    };
    return () => bgmRef.current?.stop();
  }, []);

  useEffect(() => {
    if (profile.isMusicOn && isPlaying && !winner) bgmRef.current?.play();
    else bgmRef.current?.stop();
  }, [profile.isMusicOn, isPlaying, winner]);

  useEffect(() => {
    if (computerAnimalId !== profile.selectedAnimalId) return;
    setComputerAnimalId(getSafeOpponentAnimalId(profile.selectedAnimalId, null, profile.unlockedAnimals));
  }, [computerAnimalId, profile.selectedAnimalId, profile.unlockedAnimals]);

  const handleWin = useCallback((player) => {
    setWinner(player);
    setIsPlaying(false);
    bgmRef.current?.stop();
    if (player === PLAYER_1) {
      setIsConfettiActive(true);
      window.setTimeout(() => setIsConfettiActive(false), 2800);
      playSound('win', !profile.isMusicOn, profile.selectedAnimalId);
    } else {
      playSound('error', !profile.isMusicOn, computerAnimalId);
    }
  }, [computerAnimalId, profile.isMusicOn, profile.selectedAnimalId]);

  useEffect(() => {
    let p1Count = 0;
    let p2Count = 0;
    for (let r = 0; r < BOARD_SIZE; r += 1) {
      for (let c = 0; c < BOARD_SIZE; c += 1) {
        const player = getPiecePlayer(board[r][c]);
        if (player === PLAYER_1) p1Count += 1;
        if (player === PLAYER_2) p2Count += 1;
      }
    }
    setScores({ [PLAYER_1]: 20 - p2Count, [PLAYER_2]: 20 - p1Count });
    if (isPlaying && p1Count === 0) handleWin(PLAYER_2);
    if (isPlaying && p2Count === 0) handleWin(PLAYER_1);
  }, [board, isPlaying, handleWin]);

  useEffect(() => {
    if (isPlaying && currentLegalMoves.length === 0 && !winner) {
      handleWin(turn === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }
  }, [currentLegalMoves, isPlaying, turn, winner, handleWin]);

  const executeMove = useCallback((move) => {
    const { newBoard, isPromotion } = applyMove(board, move);
    setBoard(newBoard);
    const soundAnimalId = turn === PLAYER_1 ? profile.selectedAnimalId : computerAnimalId;
    playSound(move.captures.length > 0 ? 'capture' : 'move', !profile.isMusicOn, soundAnimalId);

    if (move.captures.length > 0 && !isPromotion) {
      const furtherMoves = calculateMoves(newBoard, turn, move.to);
      if (furtherMoves.length > 0 && furtherMoves[0].captures.length > 0) {
        setMultiJumpPiece(move.to);
        setSelectedPiece(turn === PLAYER_1 ? move.to : null);
        setValidMoves(turn === PLAYER_1 ? furtherMoves : []);
        setMoveHint('Świetne bicie! Ten sam pionek może bić dalej.');
        return;
      }
    }

    setTurn(turn === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    setSelectedPiece(null);
    setValidMoves([]);
    setMultiJumpPiece(null);
    setMoveHint(turn === PLAYER_1 ? 'Komputer myśli...' : 'Twoja kolej. Wybierz pionek.');
  }, [board, computerAnimalId, profile.isMusicOn, profile.selectedAnimalId, turn]);

  useEffect(() => {
    if (turn === PLAYER_2 && isPlaying && !winner) {
      const timeout = setTimeout(() => {
        if (currentLegalMoves.length === 0) return;
        let bestMove = currentLegalMoves[Math.floor(Math.random() * currentLegalMoves.length)];

        if (!multiJumpPiece && Math.random() > difficulty.randomMoveChance) {
          let bestEval = -Infinity;
          const turns = getAllPossibleTurns(board, PLAYER_2);
          turns.forEach((turnObj) => {
            const evaluation = minimax(turnObj.board, Math.max(0, difficulty.depth - 1), -Infinity, Infinity, false);
            if (evaluation > bestEval) {
              bestEval = evaluation;
              bestMove = turnObj.firstMove;
            }
          });
        }

        if (bestMove) executeMove(bestMove);
      }, difficulty.delay);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [turn, isPlaying, winner, currentLegalMoves, multiJumpPiece, difficulty, board, executeMove]);

  useEffect(() => {
    if (!winner || processedWinnerRef.current === winner) return;
    processedWinnerRef.current = winner;

    updateProfile((current) => {
      const level = current.difficultyLevel;
      const next = {
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        winsByLevel: { ...current.winsByLevel },
        gamesByLevel: { ...current.gamesByLevel },
        winStreakByLevel: { ...current.winStreakByLevel },
      };

      next.gamesByLevel[level] = (next.gamesByLevel[level] || 0) + 1;

      if (winner === PLAYER_1) {
        next.winsByLevel[level] = (next.winsByLevel[level] || 0) + 1;
        next.winStreakByLevel[level] = (next.winStreakByLevel[level] || 0) + 1;
      } else {
        next.winStreakByLevel[level] = 0;
      }

      const { nextProfile, newRewards } = collectUnlockedRewards(next);
      if (newRewards.length > 0) {
        setRewardQueue(newRewards);
        playSound('reward', !current.isMusicOn, current.selectedAnimalId);
      }

      const shouldShowLearning = nextProfile.gamesPlayed > 0 && nextProfile.gamesPlayed % 4 === 0;
      if (shouldShowLearning) {
        const question = LEARNING_QUESTIONS[(nextProfile.gamesPlayed / 4 - 1) % LEARNING_QUESTIONS.length];
        setLearningQuestion(question);
      }

      const suggestionKey = `${level}:${nextProfile.winsByLevel[level] || 0}`;
      const nextLevel = Math.min(10, level + 1);
      const isReadyForLevelUp = winner === PLAYER_1
        && level < 10
        && nextProfile.lastLevelSuggestion !== suggestionKey
        && ((nextProfile.winStreakByLevel[level] || 0) >= 3 || (nextProfile.winsByLevel[level] || 0) >= 5);
      if (isReadyForLevelUp) {
        setLevelSuggestion({ currentLevel: level, nextLevel, key: suggestionKey });
      }

      return nextProfile;
    });
  }, [winner, updateProfile]);

  const startNewGame = (profileOverride = null) => {
    const gameProfile = normalizeProfile(profileOverride || profile);
    const nextReward = getNextRewardCandidate(gameProfile);
    let enemyAnimalId = null;
    let enemyVariantId = null;

    if (nextReward?.type === 'animal' && nextReward.animalId !== gameProfile.selectedAnimalId) {
      enemyAnimalId = nextReward.animalId;
    } else if (nextReward?.type === 'variant') {
      const variant = getVariant(nextReward.variantId);
      if (variant?.animalId && variant.animalId !== gameProfile.selectedAnimalId) {
        enemyAnimalId = variant.animalId;
        enemyVariantId = variant.id;
      }
    }

    enemyAnimalId = getSafeOpponentAnimalId(gameProfile.selectedAnimalId, enemyAnimalId, gameProfile.unlockedAnimals);
    if (enemyVariantId && getVariant(enemyVariantId)?.animalId === gameProfile.selectedAnimalId) enemyVariantId = null;

    setBossReward(nextReward || null);
    setComputerAnimalId(enemyAnimalId);
    setComputerVariantId(enemyVariantId);
    setBoard(createInitialBoard());
    setTurn(PLAYER_1);
    setSelectedPiece(null);
    setValidMoves([]);
    setMultiJumpPiece(null);
    setWinner(null);
    processedWinnerRef.current = null;
    setScores({ [PLAYER_1]: 0, [PLAYER_2]: 0 });
    setMoveHint(nextReward ? `To pojedynek o nagrodę. Przeciwnik: ${getAnimal(enemyAnimalId).name}!` : 'Twoja kolej. Wybierz pionek.');
    setIsPlaying(true);
    playSound('select', !gameProfile.isMusicOn);
  };

  const handleSquareClick = (r, c) => {
    if (winner || !isPlaying || turn === PLAYER_2) return;
    const clickedPlayer = getPiecePlayer(board[r][c]);

    if (clickedPlayer === turn) {
      if (multiJumpPiece && (multiJumpPiece.r !== r || multiJumpPiece.c !== c)) {
        setMoveHint('Po biciu musisz ruszyć tym samym podświetlonym pionkiem.');
        playSound('error', !profile.isMusicOn);
        return;
      }

      const pieceMoves = currentLegalMoves.filter((move) => move.from.r === r && move.from.c === c);
      if (pieceMoves.length > 0) {
        setSelectedPiece({ r, c });
        setValidMoves(pieceMoves);
        setMoveHint(pieceMoves[0].captures.length > 0 ? 'Musisz bić tym pionkiem. Wybierz świecące pole.' : 'Możesz iść na jedno z podświetlonych pól.');
        playSound('select', !profile.isMusicOn);
      } else {
        setMoveHint(hasMandatoryCapture ? 'Ten pionek nie może teraz iść. Poszukaj pionka z mocną poświatą, bo bicie jest obowiązkowe.' : 'Ten pionek nie ma ruchu. Wybierz inny.');
        playSound('error', !profile.isMusicOn);
      }
      return;
    }

    if (board[r][c] === 0 && selectedPiece) {
      const move = validMoves.find((candidate) => candidate.to.r === r && candidate.to.c === c);
      if (move) executeMove(move);
      else {
        setMoveHint('Wybierz jedno z pól z jasną kropką.');
        playSound('error', !profile.isMusicOn);
      }
    }
  };

  const isSquareHighlighted = (r, c) => validMoves.some((move) => move.to.r === r && move.to.c === c);
  const isPieceMustMove = (r, c) => {
    if (selectedPiece) return selectedPiece.r === r && selectedPiece.c === c;
    return currentLegalMoves.some((move) => move.from.r === r && move.from.c === c);
  };

  const getPieceStyle = (player) => {
    const animal = player === PLAYER_1 ? playerAnimal : computerAnimal;
    const variant = player === PLAYER_1 ? playerVariant : computerVariant;
    return variant || animal;
  };

  const nearestReward = getNearestLockedReward(profile);
  const nextRewardLabel = nearestReward?.type === 'animal'
    ? `${getAnimal(nearestReward.animalId).emoji} ${getAnimal(nearestReward.animalId).name} za ${Math.max(1, nearestReward.wins - (profile.winsByLevel[nearestReward.level] || 0))} wygr. na poziomie ${nearestReward.level}`
    : nearestReward?.type === 'variant'
      ? `${getAnimal(getVariant(nearestReward.variantId)?.animalId).emoji} ${getVariant(nearestReward.variantId)?.name} za ${Math.max(1, nearestReward.wins - (profile.winsByLevel[nearestReward.level] || 0))} wygr. na poziomie ${nearestReward.level}`
      : nearestReward?.type === 'board'
        ? `${getBoardSkin(nearestReward.boardId).emoji} plansza ${getBoardSkin(nearestReward.boardId).name} za ${Math.max(1, nearestReward.wins - (profile.winsByLevel[nearestReward.level] || 0))} wygr. na poziomie ${nearestReward.level}`
        : 'Wszystkie obecne nagrody zdobyte';

  const closeDailyCreatureChoice = () => {
    updateProfile((current) => ({ ...current, lastCreatureChoiceDate: todayKey() }));
    setIsDailyCreatureOpen(false);
  };

  const chooseDailyCreature = (animalId) => {
    const nextProfile = normalizeProfile({
      ...profile,
      selectedAnimalId: animalId,
      selectedVariantId: null,
      lastCreatureChoiceDate: todayKey(),
    });
    updateProfile((current) => ({
      ...current,
      selectedAnimalId: animalId,
      selectedVariantId: null,
      lastCreatureChoiceDate: todayKey(),
    }));
    playSound('animal', !profile.isMusicOn, animalId);
    setIsDailyCreatureOpen(false);
    startNewGame(nextProfile);
  };

  const acceptLevelSuggestion = () => {
    if (!levelSuggestion) return;
    updateProfile((current) => ({
      ...current,
      difficultyLevel: levelSuggestion.nextLevel,
      lastLevelSuggestion: levelSuggestion.key,
    }));
    playSound('select', !profile.isMusicOn);
    setLevelSuggestion(null);
  };

  const dismissLevelSuggestion = () => {
    if (!levelSuggestion) return;
    updateProfile((current) => ({ ...current, lastLevelSuggestion: levelSuggestion.key }));
    setLevelSuggestion(null);
  };

  const selectCollectionCreature = (animalId, variantId = null) => {
    updateProfile((current) => ({
      ...current,
      selectedAnimalId: animalId,
      selectedVariantId: variantId,
    }));

    setComputerAnimalId((currentEnemyId) => (
      currentEnemyId === animalId
        ? getSafeOpponentAnimalId(animalId, null, profile.unlockedAnimals)
        : currentEnemyId
    ));
    setComputerVariantId((currentVariantId) => {
      const currentVariant = getVariant(currentVariantId);
      return currentVariant?.animalId === animalId ? null : currentVariantId;
    });

    playSound('animal', !profile.isMusicOn, animalId);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${boardSkin.frame} px-3 py-4 font-sans text-slate-800`}>
      <ConfettiBurst active={isConfettiActive} />
      <DailyCreatureModal isOpen={isDailyCreatureOpen} profile={profile} onChoose={chooseDailyCreature} onClose={closeDailyCreatureChoice} />
      <LevelUpSuggestionModal suggestion={levelSuggestion} onAccept={acceptLevelSuggestion} onStay={dismissLevelSuggestion} />
      <RewardModal rewards={rewardQueue} onClose={() => setRewardQueue([])} />
      <LearningBreak isOpen={Boolean(learningQuestion)} question={learningQuestion} onClose={() => setLearningQuestion(null)} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <header className="relative overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-xl">
          <img src="./wesele-warcaby-hero.png" alt="Wesołe Warcaby" className="h-28 w-full object-cover sm:h-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h1 className="text-3xl font-black text-indigo-700 drop-shadow-sm sm:text-5xl">Wesołe Warcaby</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProgressPill className="bg-white/90 text-slate-700">{playerAnimal.emoji} {playerVariant?.name || playerAnimal.name}</ProgressPill>
              <ProgressPill className="bg-indigo-100/95 text-indigo-700">{difficulty.icon} poziom {profile.difficultyLevel}</ProgressPill>
              <button
                onClick={() => updateProfile((current) => ({ ...current, isMusicOn: !current.isMusicOn }))}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-black shadow-sm transition ${profile.isMusicOn ? 'border-indigo-300 bg-indigo-100 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}
              >
                {profile.isMusicOn ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col gap-3">
          <section className="flex flex-col gap-3">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/95 p-3 shadow-xl sm:p-4">
              <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                {!isPlaying && !winner ? (
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <p className="text-lg font-black text-indigo-800">Gotowi na partię?</p>
                    <p className="mt-1 text-sm font-bold text-indigo-700">Następna nagroda: {nextRewardLabel}</p>
                  </div>
                ) : (
                  <div>
                    <p className={`text-lg font-black ${boardSkin.accent}`}>
                      {winner
                        ? winner === PLAYER_1
                          ? `Wygrywa ${profile.playerName}!`
                          : `Tym razem wygrywa ${computerAnimal.name}.`
                        : turn === PLAYER_1
                          ? `${playerAnimal.emoji} Twoja kolej`
                          : `${computerAnimal.emoji} Komputer myśli...`}
                    </p>
                    <p className="mt-1 min-h-6 text-sm font-bold text-slate-500">{moveHint}</p>
                    {bossReward && isPlaying && (
                      <p className="mt-2 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                        Pojedynek o nagrodę: {computerVariant?.name || computerAnimal.name}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-black">
                  <span className="text-indigo-600">{playerAnimal.emoji} {scores[PLAYER_1]}</span>
                  <span className="text-slate-400">vs</span>
                  <span className="text-rose-600">{computerAnimal.emoji} {scores[PLAYER_2]}</span>
                </div>
              </div>

              <div className="aspect-square w-full rounded-[2rem] bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)] sm:p-3">
                <div className="grid h-full w-full grid-cols-10 grid-rows-10 overflow-hidden rounded-2xl border-2 border-white/85 shadow-[inset_0_0_18px_rgba(15,23,42,0.18),0_8px_18px_rgba(15,23,42,0.18)]">
                  {board.map((row, r) => row.map((cell, c) => {
                    const isDark = (r + c) % 2 !== 0;
                    const highlighted = isSquareHighlighted(r, c);
                    const mustMove = isPieceMustMove(r, c);
                    const isSelected = selectedPiece && selectedPiece.r === r && selectedPiece.c === c;
                    const piecePlayer = getPiecePlayer(cell);
                    const style = piecePlayer ? getPieceStyle(piecePlayer) : null;

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleSquareClick(r, c)}
                        className={`relative flex h-full w-full items-center justify-center transition-colors ${
                          isDark ? boardSkin.dark : boardSkin.light
                        } ${isPlaying && isDark ? 'cursor-pointer hover:brightness-105' : 'cursor-default'}`}
                        aria-label={`Pole ${r + 1}, ${c + 1}`}
                      >
                        {highlighted && (
                          <span className="absolute z-10 h-5 w-5 rounded-full bg-white/95 shadow-[0_0_0_6px_rgba(79,70,229,0.25),0_0_20px_rgba(79,70,229,0.7)] sm:h-7 sm:w-7">
                            <span className="absolute inset-1 rounded-full bg-indigo-500/80 animate-ping" />
                          </span>
                        )}

                        {cell !== 0 && (
                          <span
                            className={`absolute inset-1 flex select-none items-center justify-center overflow-visible rounded-full border-[3px] text-xl shadow-[inset_0_8px_12px_rgba(255,255,255,0.55),inset_0_-8px_14px_rgba(15,23,42,0.18),0_7px_16px_rgba(15,23,42,0.32)] transition-all duration-200 sm:inset-1.5 sm:text-2xl md:text-3xl xl:text-4xl ${
                              style.color
                            } ${style.border} ${style.text || 'text-slate-950'} ${
                              mustMove && turn === piecePlayer && isPlaying
                                ? 'z-20 scale-105 ring-4 ring-yellow-300 ring-offset-2 ring-offset-white'
                                : ''
                            } ${
                              isSelected ? 'z-30 scale-110 ring-4 ring-fuchsia-500 ring-offset-4 ring-offset-white shadow-2xl' : ''
                            }`}
                          >
                            {mustMove && turn === piecePlayer && isPlaying && (
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-yellow-300 px-2 py-0.5 text-xs font-black text-yellow-950 shadow">
                                tu!
                              </span>
                            )}
                            <span className="pointer-events-none absolute left-2 top-1 h-1/3 w-1/3 rounded-full bg-white/55 blur-[1px]" />
                            <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl xl:text-4xl">
                              {piecePlayer === PLAYER_1 ? playerAnimal.emoji : computerAnimal.emoji}
                            </span>
                            {isKing(cell) && <span className="absolute -right-1 -top-2 rounded-full bg-white/90 p-0.5 text-lg shadow sm:text-xl">👑</span>}
                          </span>
                        )}
                      </button>
                    );
                  }))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button onClick={() => startNewGame()} className="rounded-2xl bg-indigo-600 py-3 font-black text-white shadow hover:bg-indigo-700 active:scale-95">
                  {winner || !isPlaying ? `Graj ${playerAnimal.emoji}` : 'Od nowa'}
                </button>
                <button onClick={() => setIsTutorialOpen(true)} className="rounded-2xl bg-white py-3 font-black text-indigo-700 shadow ring-2 ring-indigo-100 hover:bg-indigo-50 active:scale-95">
                  Zasady
                </button>
                <button onClick={() => setLearningQuestion(LEARNING_QUESTIONS[profile.gamesPlayed % LEARNING_QUESTIONS.length])} className="rounded-2xl bg-emerald-600 py-3 font-black text-white shadow hover:bg-emerald-700 active:scale-95">
                  Misja
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['level', 'Poziom', `${difficulty.icon} ${profile.difficultyLevel}/10`],
                ['collection', 'Kolekcja', `${profile.unlockedAnimals.length}/20`],
                ['profile', 'Profil', playerAnimal.emoji],
              ].map(([id, label, meta]) => (
                <button
                  key={id}
                  onClick={() => setActiveSetupPanel(activeSetupPanel === id ? 'none' : id)}
                  className={`rounded-2xl border-2 px-2 py-3 text-center shadow-sm transition ${
                    activeSetupPanel === id ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-white bg-white/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="text-sm font-black">{label}</div>
                  <div className="mt-1 text-xs font-bold opacity-80">{meta}</div>
                </button>
              ))}
            </div>

            {activeSetupPanel === 'level' && (
              <DifficultyPath
                value={profile.difficultyLevel}
                winsByLevel={profile.winsByLevel}
                isMusicOn={profile.isMusicOn}
                onChange={(difficultyLevel) => updateProfile((current) => ({ ...current, difficultyLevel }))}
              />
            )}

            {activeSetupPanel === 'collection' && (
              <CollectionPanel
                profile={profile}
                activeTab={activeCollectionTab}
                setActiveTab={setActiveCollectionTab}
                onSelectAnimal={(animalId) => {
                  selectCollectionCreature(animalId);
                }}
                onSelectVariant={(variantId) => {
                  const variant = getVariant(variantId);
                  selectCollectionCreature(variant.animalId, variant.id);
                }}
                onSelectBoard={(boardId) => {
                  updateProfile((current) => ({ ...current, selectedBoardSkinId: boardId }));
                  playSound('select', !profile.isMusicOn);
                }}
              />
            )}

            {activeSetupPanel === 'profile' && (
              <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Profil lokalny</p>
                    <input
                      value={profile.playerName}
                      onChange={(event) => updateProfile((current) => ({ ...current, playerName: event.target.value.slice(0, 24) }))}
                      className="mt-1 w-full rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-lg font-black text-slate-800 outline-none focus:border-indigo-300"
                      aria-label="Nazwa gracza"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl">{playerAnimal.emoji}</div>
                    <div className="text-xs font-black text-slate-500">{playerVariant?.name || playerAnimal.name}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <ProgressPill className="justify-center bg-indigo-100 text-indigo-700">Stworki {profile.unlockedAnimals.length}/20</ProgressPill>
                  <ProgressPill className="justify-center bg-sky-100 text-sky-700">Plansze {profile.unlockedBoardSkins.length}/{BOARD_SKINS.length}</ProgressPill>
                </div>
                <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
                  Następna nagroda: {nextRewardLabel}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
