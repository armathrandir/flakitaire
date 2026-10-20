/**
 * Classic Klondike Solitaire - Schnaps Edition
 * 
 * Features:
 * - 🥃 Custom Shot Glass Suits with Solitaire Alternating Rules:
 *     Color Team (Blue & Green):
 *       ♥ Hearts: Blue Ice Schnaps (Electric Blue with crystal sparkle)
 *       ♦ Diamonds: Green Peppermint Schnaps (Glowing Mint Green)
 *     Black Team (Two Distinct Black Shots):
 *       ♣ Clubs: Black Lakritz Schnaps (Silver-trimmed glass & jet black liquid)
 *       ♠ Spades: Black Herbal Schnaps (Gold-trimmed glass & dark amber-black liquid)
 *     Rule: Alternate between Black shots and Colored (Blue/Green) shots!
 * - 🖱️ Right-Click Quick Sweep: Automatically moves all possible visible cards up to Foundations!
 * - 🌟 Guaranteed Solvable Mode (Rigged so every deal is 100% winnable!)
 * - Player Name Entry on Victory Modal with LocalStorage memory
 * - Two Distinct Leaderboards: Draw 1 (Top 100) & Draw 3 (Top 100)
 * - Smart Candidate Generator + Fast Forward Heuristic Solver
 * - Curated Solvable Bank with Dynamic Suit & Color Permutations
 * - ⚡ Auto-Finish feature when all hidden cards are revealed
 * - ↺ Replay Deal button to restart the current layout
 * - Draw 1 and Draw 3 Modes (with authentic horizontal waste fanning)
 * - Custom Felt Themes (Emerald, Royal Navy, Burgundy, Slate, Deep Violet)
 * - Custom Artillery Card Back Theme (darkened & framed)
 * - Drag & Drop, Click to Select, Double-Click Auto-Move
 * - Unlimited Undo & Smart Hints
 * - Web Audio Sound Effects & Confetti Win Celebration
 */

// --- Constants & Config ---
const SUITS = [
  { name: 'clubs', title: 'Schwarzbier-Glas', color: 'dark', symbol: 'mug-dark' },
  { name: 'spades', title: 'Dunkelgrünes Shotglas', color: 'dark', symbol: 'shot-darkgreen' },
  { name: 'hearts', title: 'Pilsbier-Glas', color: 'light', symbol: 'mug-pils' },
  { name: 'diamonds', title: 'Holunderschnaps-Shotglas', color: 'light', symbol: 'shot-holunder' }
];

const RANKS = [
  { value: 1, label: 'A' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: 'J', face: '⚔️' },
  { value: 12, label: 'Q', face: '👑' },
  { value: 13, label: 'K', face: '⚜️' }
];

const STORAGE_KEYS = {
  HIGH_SCORES_DRAW1: 'solitaire_high_scores_draw1_v2',
  HIGH_SCORES_DRAW3: 'solitaire_high_scores_draw3_v2',
  PLAYER_NAME: 'solitaire_player_name',
  FELT_THEME: 'solitaire_felt_theme',
  DRAW_MODE: 'solitaire_draw_mode',
  DEAL_TYPE: 'solitaire_deal_type',
  LANGUAGE: 'solitaire_lang_v2',
  MUSIC_ENABLED: 'solitaire_music_v2',
  MUSIC_VOLUME: 'solitaire_music_volume',
  SOUND_CARDS_ENABLED: 'solitaire_sound_cards_enabled',
  SOUND_CARDS_VOLUME: 'solitaire_sound_cards_volume',
  SOUND_DRINKS_ENABLED: 'solitaire_sound_drinks_enabled',
  SOUND_DRINKS_VOLUME: 'solitaire_sound_drinks_volume',
  SOUND_VICTORY_ENABLED: 'solitaire_sound_victory_enabled',
  SOUND_VICTORY_VOLUME: 'solitaire_sound_victory_volume'
};

// --- Firebase Realtime Database for Global High Scores ---
const FIREBASE_DATABASE_URL = 'https://flakitaire-4556d-default-rtdb.europe-west1.firebasedatabase.app';

function getDeviceType() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return (isMobileUA || (isTouch && isSmallScreen)) ? 'mobile' : 'desktop';
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// --- Comprehensive Multilingual Localization Dictionary ---
const TRANSLATIONS = {
  de: {
    pageTitle: 'Klassisches Klondike Solitär - Schnaps Edition',
    mainTitle: 'Solitär',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Lösbar',
    dealRandom: '🎲 Zufällig',
    dealSolvableTitle: 'Dieses Spiel ist mathematisch garantiert zu 100% lösbar!',
    dealRandomTitle: 'Klassische, unmodifizierte Kartenzufallsmischung',
    labelDeal: 'Spiel:',
    optSolvable: '🌟 Lösbar',
    optRandom: '🎲 Zufällig',
    labelDraw: 'Karten:',
    optDraw1: '1 Karte',
    optDraw3: '3 Karten',
    labelFelt: 'Tisch:',
    optOak: '🪵 Eiche',
    optEmerald: '🟢 Smaragd',
    optNavy: '🔵 Marine',
    optBurgundy: '🔴 Bordeaux',
    optSlate: '⚫ Schiefer',
    optViolet: '🟣 Violett',
    labelLang: 'Sprache:',
    statScore: 'PUNKTE',
    statMoves: 'ZÜGE',
    statTime: 'ZEIT',
    btnAutoFinish: '⚡ Auto-Fertig',
    btnAutoFinishTitle: 'Alle verdeckten Karten aufgedeckt! Karten automatisch ablegen',
    btnSweep: '⚡ Abräumen',
    btnSweepTitle: 'Alle möglichen Karten auf die Ablagestapel legen (oder Rechtsklick / Spielfeld doppeltippen)',
    btnHint: '💡 Tipp',
    btnHintTitle: 'Verfügbaren Zug hervorheben',
    btnUndo: '↩ Zurück',
    btnUndoTitle: 'Letzten Zug rückgängig machen',
    btnReplay: '↺ Neustart',
    btnReplayTitle: 'Diesen Spielstand von Anfang an neu starten',
    btnScores: '🏆 Rekorde',
    btnScoresTitle: 'Bestenliste anzeigen',
    btnSettings: '⚙️ Einstellungen',
    btnSettingsTitle: 'Einstellungen öffnen',
    btnSoundOn: '🔊 Ton',
    btnSoundOff: '🔇 Stumm',
    btnSoundTitle: 'Soundeffekte ein-/ausschalten',
    btnMusicOn: '🎵 Musik',
    btnMusicOff: '🔇 Musik',
    btnMusicTitle: 'Hintergrundmusik ein-/ausschalten (Irischer Folk)',
    btnNew: 'Neues Spiel',
    btnNewTitle: 'Ein neues Spiel beginnen',
    stockTitle: 'Klicken zum Ziehen',
    wasteTitle: 'Gezogene Karten',
    foundations: {
      clubs: 'Schwarzbier-Glas Ablage',
      spades: 'Dunkelgrüner Shot Ablage',
      hearts: 'Pilsbier-Glas Ablage',
      diamonds: 'Holunderschnaps Ablage'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Regeln: Wechselnde Farben (Dunkel ⇄ Hell):</strong>',
      blackGlass: 'Schwarzbier-Glas (♣)',
      blackDrop: 'Dunkelgrüner Shot (♠)',
      greenDrop: 'Pilsbier-Glas (♥)',
      greenGlass: 'Holunderschnaps (♦)',
      sweepHint: '🖱️ <em>Rechtsklick</em>, <strong>⚡ Abräumen</strong> tippen oder Spielfeld doppeltippen zum Ablegen!'
    },
    courtTitles: {
      11: 'BUBE',
      12: 'DAME',
      13: 'KÖNIG'
    },
    suitTitles: {
      clubs: 'Schwarzbier-Glas',
      spades: 'Dunkelgrüner Shot',
      hearts: 'Pilsbier-Glas',
      diamonds: 'Holunderschnaps'
    },
    winModal: {
      badge: '🏆 PROST! GEWONNEN!',
      title: 'Herzlichen Glückwunsch!',
      desc: 'Du hast die Schnaps Solitaire Edition gemeistert!',
      labelDeal: 'Spieltyp:',
      labelMode: 'Modus:',
      labelTime: 'Zeit:',
      labelMoves: 'Züge:',
      labelScore: 'Endstand:',
      labelName: 'Gib deinen Namen für die Bestenliste ein:',
      namePlaceholder: 'Spielername',
      btnSaveScore: 'Speichern',
      saveSuccess: '✅ Rekord weltweit eingetragen!',
      saveSuccessLocal: '✅ Rekord lokal gespeichert!',
      btnScores: 'Bestenliste',
      btnReplay: 'Nochmal spielen',
      solvableNotice: 'ℹ️ Im lösbaren Spielstil werden keine Einträge für die Bestenliste gewertet. Wähle den klassischen Zufallsmodus für offizielle Rekorde!',
      dealSolvable: 'Lösbar',
      dealRandom: 'Zufällig',
      modeDraw1: '1 Karte',
      modeDraw3: '3 Karten'
    },
    scoresModal: {
      badge: 'RUHMESHALLE',
      title: '🏆 Bestenliste',
      tabDraw1: '🃏 1 Karte (Top 100)',
      tabDraw3: '🃏 3 Karten (Top 100)',
      filterAll: 'Alle',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Handy',
      loading: 'Bestenliste wird geladen...',
      refreshTitle: 'Aktualisieren',
      offlineNotice: 'Offline - Lokale Rekorde werden angezeigt.',
      thPlayer: 'Spieler',
      thScore: 'Punkte',
      thTime: 'Zeit',
      thMoves: 'Züge',
      thDate: 'Datum',
      empty: 'Noch keine Rekorde erfasst. Gewinne ein Spiel, um Geschichte zu schreiben!',
      btnClose: 'Schließen'
    },
    settingsModal: {
      badge: 'KONFIGURATION',
      title: '⚙️ Einstellungen',
      sectionGame: 'Spiel & Tisch',
      labelDeal: 'Spielstil:',
      optDealSolvable: '🌟 Lösbar (Präpariert)',
      optDealRandom: '🎲 Zufällig (Klassisch)',
      labelDraw: 'Karten ziehen:',
      optDraw1: '1 Karte (Einfach)',
      optDraw3: '3 Karten (Klassisch)',
      labelFelt: 'Tisch-Oberfläche:',
      optOak: '🪵 Eichenholz (Taverne)',
      optEmerald: '🟢 Smaragdgrün',
      optNavy: '🔵 Marineblau',
      optBurgundy: '🔴 Bordeauxrot',
      optSlate: '⚫ Schiefergrau',
      optViolet: '🟣 Violett',
      labelLang: 'Sprache:',
      sectionAudio: 'Sound & Lautstärke',
      musicLabel: '🎵 Musik (Irischer Folk)',
      trackSkipTitle: 'Nächster Musiktitel (Titel wechseln)',
      cardsLabel: '🃏 Karten-Sounds',
      drinksLabel: '🥃 Trink-Sounds (Ablage)',
      victoryLabel: '🎺 Sieges-Fanfare',
      btnClose: 'Schließen'
    },
    toasts: {
      dealSolvable: '🌟 Lösbarer Modus: Mathematisch garantiert gewinnbar!',
      dealRandom: '🎲 Zufälliger Modus: Klassisch ungemischter Zufalls-Deal.',
      switchDrawConfirm: 'Beim Wechseln des Zieh-Modus wird ein neues Spiel gestartet. Fortfahren?',
      sweptSuccess: (count) => `⚡ ${count} Karte(n) auf Ablagen abgelegt!`,
      noSweep: 'Aktuell kann keine Karte abgelegt werden.',
      dealRestarted: '↺ Spiel von Zug 1 neu gestartet! Viel Erfolg.',
      deckCycled: 'Stapel durchblättert',
      autoFinishReady: '⚡ Alle Karten aufgedeckt! Du kannst jetzt "Auto-Fertig" nutzen.',
      autoFinishing: 'Lege verbleibende Karten automatisch ab...',
      cannotUndo: 'Kein weiterer Zug zum Rückgängigmachen vorhanden.',
      moveUndone: 'Zug rückgängig gemacht.',
      hintFoundFoundation: (label, suit) => `Lege ${label} (${suit}) auf die Ablage`,
      hintFoundReveal: (col) => `Verschiebe Karten, um verdeckte Karte in Spalte ${col} aufzudecken`,
      hintFoundTableau: (label, suit, col) => `Lege ${label} (${suit}) auf Spalte ${col}`,
      hintStock: '💡 Tipp: Ziehe eine neue Karte vom Nachziehstapel!'
    }
  },
  en: {
    pageTitle: 'Classic Klondike Solitaire - Schnaps Edition',
    mainTitle: 'Solitaire',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Solvable',
    dealRandom: '🎲 Random',
    dealSolvableTitle: 'This deal is mathematically verified to be 100% winnable!',
    dealRandomTitle: 'Classic unmodified card deal',
    labelDeal: 'Deal:',
    optSolvable: '🌟 Solvable',
    optRandom: '🎲 Random',
    labelDraw: 'Draw:',
    optDraw1: 'Draw 1',
    optDraw3: 'Draw 3',
    labelFelt: 'Felt:',
    optOak: '🪵 Oak',
    optEmerald: '🟢 Emerald',
    optNavy: '🔵 Navy',
    optBurgundy: '🔴 Burgundy',
    optSlate: '⚫ Slate',
    optViolet: '🟣 Violet',
    labelLang: 'Language:',
    statScore: 'SCORE',
    statMoves: 'MOVES',
    statTime: 'TIME',
    btnAutoFinish: '⚡ Auto-Finish',
    btnAutoFinishTitle: 'All hidden cards revealed! Automatically send cards to foundations',
    btnSweep: '⚡ Sweep',
    btnSweepTitle: 'Sweep all possible cards to Foundations (or right-click / double-tap the table felt)',
    btnHint: '💡 Hint',
    btnHintTitle: 'Highlight an available move',
    btnUndo: '↩ Undo',
    btnUndoTitle: 'Undo previous move',
    btnReplay: '↺ Replay Deal',
    btnReplayTitle: 'Restart this exact deal from the beginning',
    btnScores: '🏆 Scores',
    btnScoresTitle: 'View High Scores leaderboards',
    btnSettings: '⚙️ Settings',
    btnSettingsTitle: 'Open Settings',
    btnSoundOn: '🔊 Sound',
    btnSoundOff: '🔇 Muted',
    btnSoundTitle: 'Toggle sound effects',
    btnMusicOn: '🎵 Music',
    btnMusicOff: '🔇 Music',
    btnMusicTitle: 'Toggle background music (Irish Folk)',
    btnNew: 'New Game',
    btnNewTitle: 'Start a fresh game',
    stockTitle: 'Click to draw cards',
    wasteTitle: 'Drawn cards',
    foundations: {
      clubs: 'Dark Beer Mug Foundation',
      spades: 'Dark Green Shot Foundation',
      hearts: 'Pilsner Beer Mug Foundation',
      diamonds: 'Elderberry Shot Foundation'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Alternating Rules (Dark ⇄ Light):</strong>',
      blackGlass: 'Dark Beer Mug (♣)',
      blackDrop: 'Dark Green Shot (♠)',
      greenDrop: 'Pilsner Beer Mug (♥)',
      greenGlass: 'Elderberry Shot (♦)',
      sweepHint: '🖱️ <em>Right-click</em>, tap <strong>⚡ Sweep</strong>, or double-tap felt to auto-sweep cards to Foundations!'
    },
    courtTitles: {
      11: 'JACK',
      12: 'QUEEN',
      13: 'KING'
    },
    suitTitles: {
      clubs: 'Dark Beer Mug',
      spades: 'Dark Green Shot',
      hearts: 'Pilsner Beer Mug',
      diamonds: 'Elderberry Shot'
    },
    winModal: {
      badge: '🏆 PROST! VICTORY!',
      title: 'Congratulations!',
      desc: 'You conquered the Schnaps Solitaire Edition!',
      labelDeal: 'Deal Type:',
      labelMode: 'Game Mode:',
      labelTime: 'Time:',
      labelMoves: 'Moves:',
      labelScore: 'Final Score:',
      labelName: 'Enter your name for the Highscores:',
      namePlaceholder: 'Player Name',
      btnSaveScore: 'Save Score',
      saveSuccess: '✅ Score saved to global leaderboard!',
      saveSuccessLocal: '✅ Score saved locally!',
      btnScores: 'Leaderboard',
      btnReplay: 'Play Again',
      solvableNotice: 'ℹ️ Solvable mode games are not eligible for the leaderboard. Play in standard Random mode for official high scores!',
      dealSolvable: 'Solvable',
      dealRandom: 'Random',
      modeDraw1: 'Draw 1',
      modeDraw3: 'Draw 3'
    },
    scoresModal: {
      badge: 'HALL OF FAME',
      title: '🏆 High Scores',
      tabDraw1: '🃏 Draw 1 (Top 100)',
      tabDraw3: '🃏 Draw 3 (Top 100)',
      filterAll: 'All',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Mobile',
      loading: 'Loading high scores...',
      refreshTitle: 'Refresh',
      offlineNotice: 'Offline - Showing local scores.',
      thPlayer: 'Player',
      thScore: 'Score',
      thTime: 'Time',
      thMoves: 'Moves',
      thDate: 'Date',
      empty: 'No high scores recorded yet. Win a game to make history!',
      btnClose: 'Close'
    },
    settingsModal: {
      badge: 'CONFIGURATION',
      title: '⚙️ Settings',
      sectionGame: 'Game & Tabletop',
      labelDeal: 'Game Style:',
      optDealSolvable: '🌟 Rigged (Solvable)',
      optDealRandom: '🎲 Random (Classic)',
      labelDraw: 'Drawing Mode:',
      optDraw1: '1 Card (Casual)',
      optDraw3: '3 Cards (Classic)',
      labelFelt: 'Tabletop Style:',
      optOak: '🪵 Oak Tavern',
      optEmerald: '🟢 Emerald Green',
      optNavy: '🔵 Royal Navy',
      optBurgundy: '🔴 Velvet Burgundy',
      optSlate: '⚫ Dark Slate',
      optViolet: '🟣 Deep Violet',
      labelLang: 'Language:',
      sectionAudio: 'Sound & Volume',
      musicLabel: '🎵 Background Music (Irish Folk)',
      trackSkipTitle: 'Next Music Track',
      cardsLabel: '🃏 Card Sounds',
      drinksLabel: '🥃 Drinking Sounds (Foundation)',
      victoryLabel: '🎺 Victory Fanfare',
      btnClose: 'Close'
    },
    toasts: {
      dealSolvable: '🌟 Solvable Mode: Guaranteed winnable deal!',
      dealRandom: '🎲 Random Mode: Unmodified shuffle.',
      switchDrawConfirm: 'Switching draw mode will start a fresh game. Proceed?',
      sweptSuccess: (count) => `⚡ Swept ${count} card(s) to Foundations!`,
      noSweep: 'No cards can be moved to Foundations right now.',
      dealRestarted: '↺ Deal restarted from move 1! Try a fresh approach.',
      deckCycled: 'Deck cycled',
      autoFinishReady: '⚡ All hidden cards revealed! You can now Auto-Finish.',
      autoFinishing: 'Auto-finishing remaining cards...',
      cannotUndo: 'Cannot undo further.',
      moveUndone: 'Move undone.',
      hintFoundFoundation: (label, suit) => `Move ${label} of ${suit} to Foundation`,
      hintFoundReveal: (col) => `Move stack to reveal hidden card in column ${col}`,
      hintFoundTableau: (label, suit, col) => `Move ${label} of ${suit} to column ${col}`,
      hintStock: '💡 Hint: Draw from the Stock pile to find new cards!'
    }
  },
  es: {
    pageTitle: 'Solitario Klondike Clásico - Edición Schnaps',
    mainTitle: 'Solitario',
    badgeEdition: '🥃 Edición Schnaps',
    dealSolvable: '✨ Con solución',
    dealRandom: '🎲 Aleatorio',
    dealSolvableTitle: '¡Esta partida está matemáticamente verificada como 100% ganable!',
    dealRandomTitle: 'Reparto aleatorio sin modificaciones',
    labelDeal: 'Reparto:',
    optSolvable: '🌟 Con solución',
    optRandom: '🎲 Aleatorio',
    labelDraw: 'Robo:',
    optDraw1: '1 Carta',
    optDraw3: '3 Cartas',
    labelFelt: 'Tapete:',
    optOak: '🪵 Roble',
    optEmerald: '🟢 Esmeralda',
    optNavy: '🔵 Marino',
    optBurgundy: '🔴 Burdeos',
    optSlate: '⚫ Pizarra',
    optViolet: '🟣 Violeta',
    labelLang: 'Idioma:',
    statScore: 'PUNTOS',
    statMoves: 'MOVIM.',
    statTime: 'TIEMPO',
    btnAutoFinish: '⚡ Auto-Completar',
    btnAutoFinishTitle: '¡Todas las cartas descubiertas! Enviar cartas a las bases automáticamente',
    btnSweep: '⚡ Recoger',
    btnSweepTitle: 'Enviar todas las cartas posibles a las bases (o clic derecho / doble toque al tapete)',
    btnHint: '💡 Pista',
    btnHintTitle: 'Mostrar un movimiento disponible',
    btnUndo: '↩ Deshacer',
    btnUndoTitle: 'Deshacer el último movimiento',
    btnReplay: '↺ Repetir',
    btnReplayTitle: 'Reiniciar este mismo reparto desde el principio',
    btnScores: '🏆 Récords',
    btnScoresTitle: 'Ver tabla de récords',
    btnSettings: '⚙️ Ajustes',
    btnSettingsTitle: 'Abrir ajustes',
    btnSoundOn: '🔊 Sonido',
    btnSoundOff: '🔇 Silencio',
    btnSoundTitle: 'Activar o desactivar efectos de sonido',
    btnMusicOn: '🎵 Música',
    btnMusicOff: '🔇 Música',
    btnMusicTitle: 'Activar o desactivar música de fondo (Irish Folk)',
    btnNew: 'Nueva partida',
    btnNewTitle: 'Iniciar una nueva partida',
    stockTitle: 'Clic para robar cartas',
    wasteTitle: 'Cartas robadas',
    foundations: {
      clubs: 'Base de jarra de cerveza negra',
      spades: 'Base de chupito verde oscuro',
      hearts: 'Base de jarra de cerveza rubia',
      diamonds: 'Base de chupito de saúco'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Reglas de alternancia (Oscuro ⇄ Claro):</strong>',
      blackGlass: 'Cerveza negra (♣)',
      blackDrop: 'Chupito verde oscuro (♠)',
      greenDrop: 'Cerveza rubia (♥)',
      greenGlass: 'Chupito de saúco (♦)',
      sweepHint: '🖱️ <em>Clic derecho</em>, pulsa <strong>⚡ Recoger</strong> o doble toque al tapete para enviar a las bases!'
    },
    courtTitles: {
      11: 'SOTA',
      12: 'REINA',
      13: 'REY'
    },
    suitTitles: {
      clubs: 'Jarra de cerveza negra',
      spades: 'Chupito verde oscuro',
      hearts: 'Jarra de cerveza rubia',
      diamonds: 'Chupito de saúco'
    },
    winModal: {
      badge: '🏆 ¡SALUD! ¡VICTORIA!',
      title: '¡Felicidades!',
      desc: '¡Has completado la edición Schnaps del Solitario!',
      labelDeal: 'Tipo de reparto:',
      labelMode: 'Modo de juego:',
      labelTime: 'Tiempo:',
      labelMoves: 'Movimientos:',
      labelScore: 'Puntuación:',
      labelName: 'Introduce tu nombre para la clasificación:',
      namePlaceholder: 'Nombre de jugador',
      btnSaveScore: 'Guardar',
      saveSuccess: '✅ ¡Puntuación guardada globalmente!',
      saveSuccessLocal: '✅ ¡Puntuación guardada localmente!',
      btnScores: 'Clasificación',
      btnReplay: 'Jugar de nuevo',
      solvableNotice: 'ℹ️ Las partidas en modo solucionable no se registran en la clasificación. ¡Juega en modo aleatorio para récords oficiales!',
      dealSolvable: 'Con solución',
      dealRandom: 'Aleatorio',
      modeDraw1: '1 Carta',
      modeDraw3: '3 Cartas'
    },
    scoresModal: {
      badge: 'SALÓN DE LA FAMA',
      title: '🏆 Récords',
      tabDraw1: '🃏 1 Carta (Top 100)',
      tabDraw3: '🃏 3 Cartas (Top 100)',
      filterAll: 'Todos',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Móvil',
      loading: 'Cargando mejores puntuaciones...',
      refreshTitle: 'Actualizar',
      offlineNotice: 'Sin conexión - Mostrando récords locales.',
      thPlayer: 'Jugador',
      thScore: 'Puntos',
      thTime: 'Tiempo',
      thMoves: 'Movim.',
      thDate: 'Fecha',
      empty: '¡Aún no hay récords registrados! Gana una partida para entrar en la historia.',
      btnClose: 'Cerrar'
    },
    settingsModal: {
      badge: 'OPCIONES',
      title: '⚙️ Ajustes',
      sectionGame: 'Partida y Tapete',
      labelDeal: 'Estilo de juego:',
      optDealSolvable: '🌟 Preparada (Garantizada)',
      optDealRandom: '🎲 Aleatoria (Clásica)',
      labelDraw: 'Modo de robo:',
      optDraw1: '1 Carta (Fácil)',
      optDraw3: '3 Cartas (Clásico)',
      labelFelt: 'Estilo del tapete:',
      optOak: '🪵 Roble Taberna',
      optEmerald: '🟢 Esmeralda',
      optNavy: '🔵 Azul Marino',
      optBurgundy: '🔴 Burdeos',
      optSlate: '⚫ Pizarra',
      optViolet: '🟣 Violeta',
      labelLang: 'Idioma:',
      sectionAudio: 'Audio y Volumen',
      musicLabel: '🎵 Música de fondo (Irish Folk)',
      trackSkipTitle: 'Siguiente pista de música',
      cardsLabel: '🃏 Sonidos de cartas',
      drinksLabel: '🥃 Sonidos de chupitos (Ablación)',
      victoryLabel: '🎺 Sonido de victoria',
      btnClose: 'Cerrar'
    },
    toasts: {
      dealSolvable: '🌟 Modo con solución: ¡Partida ganable garantizada!',
      dealRandom: '🎲 Modo aleatorio: Barajado clásico sin filtros.',
      switchDrawConfirm: 'Cambiar el modo de robo iniciará una nueva partida. ¿Continuar?',
      sweptSuccess: (count) => `⚡ ¡${count} carta(s) enviada(s) a las bases!`,
      noSweep: 'No hay cartas que se puedan mover a las bases en este momento.',
      dealRestarted: '↺ ¡Partida reiniciada desde el primer movimiento!',
      deckCycled: 'Mazo recorrido',
      autoFinishReady: '⚡ ¡Todas las cartas descubiertas! Puedes usar Auto-Completar.',
      autoFinishing: 'Completando cartas restantes automáticamente...',
      cannotUndo: 'No se puede deshacer más.',
      moveUndone: 'Movimiento deshecho.',
      hintFoundFoundation: (label, suit) => `Mueve ${label} (${suit}) a la base`,
      hintFoundReveal: (col) => `Mueve cartas para descubrir la oculta en columna ${col}`,
      hintFoundTableau: (label, suit, col) => `Mueve ${label} (${suit}) a la columna ${col}`,
      hintStock: '💡 Pista: ¡Roba una carta del mazo para encontrar jugadas!'
    }
  },
  ru: {
    pageTitle: 'Классический пасьянс Косынка - Schnaps Edition',
    mainTitle: 'Пасьянс',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Решаемая',
    dealRandom: '🎲 Случайная',
    dealSolvableTitle: 'Этот расклад гарантированно решается на 100%!',
    dealRandomTitle: 'Классическая случайная тасовка колоды',
    labelDeal: 'Расклад:',
    optSolvable: '🌟 Решаемый',
    optRandom: '🎲 Случайный',
    labelDraw: 'Раздача:',
    optDraw1: 'По 1 карте',
    optDraw3: 'По 3 карты',
    labelFelt: 'Сукно:',
    optOak: '🪵 Дуб',
    optEmerald: '🟢 Изумруд',
    optNavy: '🔵 Синий',
    optBurgundy: '🔴 Бордо',
    optSlate: '⚫ Сланец',
    optViolet: '🟣 Фиолетовый',
    labelLang: 'Язык:',
    statScore: 'СЧЁТ',
    statMoves: 'ХОДЫ',
    statTime: 'ВРЕМЯ',
    btnAutoFinish: '⚡ Автозавершение',
    btnAutoFinishTitle: 'Все карты открыты! Автоматически собрать карты в дом',
    btnSweep: '⚡ Собрать',
    btnSweepTitle: 'Перенести все возможные карты в дом (или правый клик / двойной тап по столу)',
    btnHint: '💡 Подсказка',
    btnHintTitle: 'Показать доступный ход',
    btnUndo: '↩ Отмена',
    btnUndoTitle: 'Отменить предыдущий ход',
    btnReplay: '↺ Заново',
    btnReplayTitle: 'Переиграть этот расклад с начала',
    btnScores: '🏆 Рекорды',
    btnScoresTitle: 'Посмотреть таблицу рекордов',
    btnSettings: '⚙️ Настройки',
    btnSettingsTitle: 'Открыть настройки',
    btnSoundOn: '🔊 Звук',
    btnSoundOff: '🔇 Без звука',
    btnSoundTitle: 'Включить / выключить звуковые эффекты',
    btnMusicOn: '🎵 Музыка',
    btnMusicOff: '🔇 Музыка',
    btnMusicTitle: 'Включить / выключить музыку (Irish Folk)',
    btnNew: 'Новая игра',
    btnNewTitle: 'Начать новую партию',
    stockTitle: 'Нажмите, чтобы взять карту',
    wasteTitle: 'Сброс',
    foundations: {
      clubs: 'Дом тёмного пива',
      spades: 'Дом тёмно-зелёного шота',
      hearts: 'Дом светлого пива',
      diamonds: 'Дом бузинного шота'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Правило чередования (Тёмное ⇄ Светлое):</strong>',
      blackGlass: 'Кружка тёмного пива (♣)',
      blackDrop: 'Тёмно-зелёный шот (♠)',
      greenDrop: 'Кружка светлого пива (♥)',
      greenGlass: 'Бузинный шот (♦)',
      sweepHint: '🖱️ <em>Правый клик</em>, кнопка <strong>⚡ Собрать</strong> или двойной тап по столу для автосбора в дом!'
    },
    courtTitles: {
      11: 'ВАЛЕТ',
      12: 'ДАМА',
      13: 'КОРОЛЬ'
    },
    suitTitles: {
      clubs: 'Кружка тёмного пива',
      spades: 'Тёмно-зелёный шот',
      hearts: 'Кружка светлого пива',
      diamonds: 'Бузинный шот'
    },
    winModal: {
      badge: '🏆 НА ЗДОРОВЬЕ! ПОБЕДА!',
      title: 'Поздравляем!',
      desc: 'Вы успешно покорили пасьянс Schnaps Edition!',
      labelDeal: 'Тип расклада:',
      labelMode: 'Режим игры:',
      labelTime: 'Время:',
      labelMoves: 'Ходы:',
      labelScore: 'Итоговый счёт:',
      labelName: 'Введите имя для таблицы рекордов:',
      namePlaceholder: 'Имя игрока',
      btnSaveScore: 'Сохранить',
      saveSuccess: '✅ Результат сохранён в мировой таблице!',
      saveSuccessLocal: '✅ Результат сохранён локально!',
      btnScores: 'Рекорды',
      btnReplay: 'Сыграть ещё',
      solvableNotice: 'ℹ️ Игры в решаемом режиме не учитываются в таблице рекордов. Выберите случайный режим для официальных рекордов!',
      dealSolvable: 'Решаемый',
      dealRandom: 'Случайный',
      modeDraw1: 'По 1 карте',
      modeDraw3: 'По 3 карты'
    },
    scoresModal: {
      badge: 'ЗАЛ СЛАВЫ',
      title: '🏆 Рекорды',
      tabDraw1: '🃏 По 1 (Топ 100)',
      tabDraw3: '🃏 По 3 (Топ 100)',
      filterAll: 'Все',
      filterDesktop: '💻 ПК',
      filterMobile: '📱 Мобильный',
      loading: 'Загрузка рекордов...',
      refreshTitle: 'Обновить',
      offlineNotice: 'Офлайн — показаны локальные рекорды.',
      thPlayer: 'Игрок',
      thScore: 'Счёт',
      thTime: 'Время',
      thMoves: 'Ходы',
      thDate: 'Дата',
      empty: 'Пока нет рекордов. Выиграйте партию, чтобы войти в историю!',
      btnClose: 'Закрыть'
    },
    settingsModal: {
      badge: 'ПАРАМЕТРЫ',
      title: '⚙️ Настройки',
      sectionGame: 'Игра и стол',
      labelDeal: 'Стиль игры:',
      optDealSolvable: '🌟 Решаемая (Гарантия)',
      optDealRandom: '🎲 Случайная (Классика)',
      labelDraw: 'Раздача карт:',
      optDraw1: 'По 1 карте (Легко)',
      optDraw3: 'По 3 карты (Классика)',
      labelFelt: 'Сукно стола:',
      optOak: '🪵 Таверна (Дуб)',
      optEmerald: '🟢 Изумруд',
      optNavy: '🔵 Морской синий',
      optBurgundy: '🔴 Бордо',
      optSlate: '⚫ Графит / сланец',
      optViolet: '🟣 Фиолетовый',
      labelLang: 'Язык:',
      sectionAudio: 'Звук и громкость',
      musicLabel: '🎵 Фоновая музыка (Irish Folk)',
      trackSkipTitle: 'Следующий трек',
      cardsLabel: '🃏 Звуки карт',
      drinksLabel: '🥃 Звуки рюмки (Сбор в дом)',
      victoryLabel: '🎺 Победный сигнал (Фанфары)',
      btnClose: 'Закрыть'
    },
    toasts: {
      dealSolvable: '🌟 Решаемый режим: расклад со 100% гарантией победы!',
      dealRandom: '🎲 Случайный режим: классическая случайная тасовка.',
      switchDrawConfirm: 'Переключение режима раздачи начнет новую игру. Продолжить?',
      sweptSuccess: (count) => `⚡ Собрано карт в дом: ${count}!`,
      noSweep: 'Сейчас нет карт для перемещения в дом.',
      dealRestarted: '↺ Расклад начат заново с 1 хода! Попробуйте другой подход.',
      deckCycled: 'Колода пролистана',
      autoFinishReady: '⚡ Все карты открыты! Теперь можно использовать автозавершение.',
      autoFinishing: 'Автоматический сбор оставшихся карт...',
      cannotUndo: 'Больше ходов для отмены нет.',
      moveUndone: 'Ход отменён.',
      hintFoundFoundation: (label, suit) => `Положите ${label} (${suit}) в дом`,
      hintFoundReveal: (col) => `Переместите стопку, чтобы открыть карту в колонке ${col}`,
      hintFoundTableau: (label, suit, col) => `Положите ${label} (${suit}) на колонку ${col}`,
      hintStock: '💡 Подсказка: возьмите карту из колоды!'
    }
  },
  sv: {
    pageTitle: 'Klassisk Klondike Patiens - Schnaps Edition',
    mainTitle: 'Patiens',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Lösbar giv',
    dealRandom: '🎲 Slumpad',
    dealSolvableTitle: 'Denna giv är matematiskt garanterad att kunna lösas till 100%!',
    dealRandomTitle: 'Klassisk slumpmässigt blandad kortlek',
    labelDeal: 'Giv:',
    optSolvable: '🌟 Lösbar',
    optRandom: '🎲 Slumpad',
    labelDraw: 'Dra:',
    optDraw1: '1 kort',
    optDraw3: '3 kort',
    labelFelt: 'Filt:',
    optOak: '🪵 Ek',
    optEmerald: '🟢 Smaragd',
    optNavy: '🔵 Marin',
    optBurgundy: '🔴 Vinröd',
    optSlate: '⚫ Skiffer',
    optViolet: '🟣 Violett',
    labelLang: 'Språk:',
    statScore: 'POÄNG',
    statMoves: 'DRAG',
    statTime: 'TID',
    btnAutoFinish: '⚡ Slutför aut.',
    btnAutoFinishTitle: 'Alla dolda kort har visats! Skicka automatiskt kort till baserna',
    btnSweep: '⚡ Samla in',
    btnSweepTitle: 'Samla alla möjliga kort till baserna (eller högerklicka / dubbeltryck på filten)',
    btnHint: '💡 Tips',
    btnHintTitle: 'Visa ett tillgängligt drag',
    btnUndo: '↩ Ångra',
    btnUndoTitle: 'Ångra senaste draget',
    btnReplay: '↺ Spela om',
    btnReplayTitle: 'Starta om denna giv från början',
    btnScores: '🏆 Topplista',
    btnScoresTitle: 'Visa poängtopplista',
    btnSettings: '⚙️ Inställningar',
    btnSettingsTitle: 'Öppna inställningar',
    btnSoundOn: '🔊 Ljud',
    btnSoundOff: '🔇 Ljud av',
    btnSoundTitle: 'Slå på/av ljudeffekter',
    btnMusicOn: '🎵 Musik',
    btnMusicOff: '🔇 Musik',
    btnMusicTitle: 'Slå på/av bakgrundsmusik (Irländsk folk)',
    btnNew: 'Nytt spel',
    btnNewTitle: 'Starta en ny omgång',
    stockTitle: 'Klicka för att dra kort',
    wasteTitle: 'Draget kort',
    foundations: {
      clubs: 'Bas för mörk ölsejdel',
      spades: 'Bas för mörkgrön shot',
      hearts: 'Bas för ljus ölsejdel',
      diamonds: 'Bas för flädershot'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Regler: Växlande färger (Mörk ⇄ Ljus):</strong>',
      blackGlass: 'Mörk ölsejdel (♣)',
      blackDrop: 'Mörkgrön shot (♠)',
      greenDrop: 'Ljus ölsejdel (♥)',
      greenGlass: 'Flädershot (♦)',
      sweepHint: '🖱️ <em>Högerklicka</em>, tryck <strong>⚡ Samla in</strong> eller dubbeltryck på filten för automatisk insamling!'
    },
    courtTitles: {
      11: 'KNEKT',
      12: 'DAM',
      13: 'KUNG'
    },
    suitTitles: {
      clubs: 'Mörk ölsejdel',
      spades: 'Mörkgrön shot',
      hearts: 'Ljus ölsejdel',
      diamonds: 'Flädershot'
    },
    winModal: {
      badge: '🏆 SKÅL! SEGER!',
      title: 'Grattis!',
      desc: 'Du klarade Schnaps Solitaire Edition!',
      labelDeal: 'Givtyp:',
      labelMode: 'Spelläge:',
      labelTime: 'Tid:',
      labelMoves: 'Drag:',
      labelScore: 'Slutpoäng:',
      labelName: 'Ange ditt namn för topplistan:',
      namePlaceholder: 'Spelarnamn',
      btnSaveScore: 'Spara resultat',
      saveSuccess: '✅ Sparat på global topplista!',
      saveSuccessLocal: '✅ Sparat lokalt!',
      btnScores: 'Topplista',
      btnReplay: 'Spela igen',
      solvableNotice: 'ℹ️ Spel i lösbart läge kvalificerar inte till topplistan. Spela i klassiskt slumpat läge för officiella rekord!',
      dealSolvable: 'Lösbar',
      dealRandom: 'Slumpad',
      modeDraw1: '1 kort',
      modeDraw3: '3 kort'
    },
    scoresModal: {
      badge: 'HALL OF FAME',
      title: '🏆 Topplista',
      tabDraw1: '🃏 1 Kort (Topp 100)',
      tabDraw3: '🃏 3 Kort (Topp 100)',
      filterAll: 'Alla',
      filterDesktop: '💻 Dator',
      filterMobile: '📱 Mobil',
      loading: 'Laddar topplista...',
      refreshTitle: 'Uppdatera',
      offlineNotice: 'Offline - Visar lokala resultat.',
      thPlayer: 'Spelare',
      thScore: 'Poäng',
      thTime: 'Tid',
      thMoves: 'Drag',
      thDate: 'Datum',
      empty: 'Inga sparade poäng än. Vinn ett spel för att skriva historia!',
      btnClose: 'Stäng'
    },
    settingsModal: {
      badge: 'INSTÄLLNINGAR',
      title: '⚙️ Inställningar',
      sectionGame: 'Spel & Bord',
      labelDeal: 'Spelstil:',
      optDealSolvable: '🌟 Lösbar (Garanterad)',
      optDealRandom: '🎲 Slumpmässig',
      labelDraw: 'Dragläge:',
      optDraw1: '1 kort (Lätt)',
      optDraw3: '3 kort (Klassisk)',
      labelFelt: 'Bordsstil:',
      optOak: '🪵 Ek Taverna',
      optEmerald: '🟢 Smaragd',
      optNavy: '🔵 Marinblå',
      optBurgundy: '🔴 Vinröd',
      optSlate: '⚫ Skiffer',
      optViolet: '🟣 Violett',
      labelLang: 'Språk:',
      sectionAudio: 'Ljud & Volym',
      musicLabel: '🎵 Bakgrundsmusik (Irländsk folk)',
      trackSkipTitle: 'Nästa musikspår',
      cardsLabel: '🃏 Kortljud',
      drinksLabel: '🥃 Dryckesljud (Ablation)',
      victoryLabel: '🎺 Segerljud (Fanfar)',
      btnClose: 'Stäng'
    },
    toasts: {
      dealSolvable: '🌟 Lösbart läge: Garanterat vinnbar giv!',
      dealRandom: '🎲 Slumpmässigt läge: Helt slumpad giv.',
      switchDrawConfirm: 'Att byta dragläge startar ett nytt spel. Fortsätta?',
      sweptSuccess: (count) => `⚡ Samlade ${count} kort till baserna!`,
      noSweep: 'Inga kort kan flyttas till baserna just nu.',
      dealRestarted: '↺ Givan startades om från drag 1! Försök igen.',
      deckCycled: 'Leken vänd',
      autoFinishReady: '⚡ Alla dolda kort framme! Du kan nu slutföra automatiskt.',
      autoFinishing: 'Slutför resterande kort automatiskt...',
      cannotUndo: 'Det finns inga fler drag att ångra.',
      moveUndone: 'Draget ångrades.',
      hintFoundFoundation: (label, suit) => `Flytta ${label} (${suit}) till basen`,
      hintFoundReveal: (col) => `Flytta kort för att visa dolt kort i kolumn ${col}`,
      hintFoundTableau: (label, suit, col) => `Flytta ${label} (${suit}) till kolumn ${col}`,
      hintStock: '💡 Tips: Dra ett kort från leken för att hitta nya drag!'
    }
  },
  it: {
    pageTitle: 'Solitario Klondike Classico - Schnaps Edition',
    mainTitle: 'Solitario',
    badgeEdition: '🥃 Schnaps Edition',
    dealSolvable: '✨ Risolvibile',
    dealRandom: '🎲 Casuale',
    dealSolvableTitle: 'Questa partita è matematicamente verificata come risolvibile al 100%!',
    dealRandomTitle: 'Mescolamento classico delle carte',
    labelDeal: 'Distrib.:',
    optSolvable: '🌟 Risolvibile',
    optRandom: '🎲 Casuale',
    labelDraw: 'Pesca:',
    optDraw1: '1 Carta',
    optDraw3: '3 Carte',
    labelFelt: 'Tavolo:',
    optOak: '🪵 Quercia',
    optEmerald: '🟢 Smeraldo',
    optNavy: '🔵 Blu Navy',
    optBurgundy: '🔴 Borgogna',
    optSlate: '⚫ Ardesia',
    optViolet: '🟣 Viola',
    labelLang: 'Lingua:',
    statScore: 'PUNTI',
    statMoves: 'MOSSE',
    statTime: 'TEMPO',
    btnAutoFinish: '⚡ Auto-Completa',
    btnAutoFinishTitle: 'Tutte le carte coperte sono scoperte! Invia automaticamente alle basi',
    btnSweep: '⚡ Raccogli',
    btnSweepTitle: 'Invia tutte le carte possibili alle basi (o clic destro / doppio tocco sul tavolo)',
    btnHint: '💡 Aiuto',
    btnHintTitle: 'Mostra una mossa disponibile',
    btnUndo: '↩ Annulla',
    btnUndoTitle: 'Annulla l\'ultima mossa',
    btnReplay: '↺ Rigioca',
    btnReplayTitle: 'Rigioca questa stessa partita dall\'inizio',
    btnScores: '🏆 Record',
    btnScoresTitle: 'Visualizza la classifica dei record',
    btnSettings: '⚙️ Impostazioni',
    btnSettingsTitle: 'Apri impostazioni',
    btnSoundOn: '🔊 Audio',
    btnSoundOff: '🔇 Muto',
    btnSoundTitle: 'Attiva/disattiva effetti audio',
    btnMusicOn: '🎵 Musica',
    btnMusicOff: '🔇 Musica',
    btnMusicTitle: 'Attiva/disattiva musica di sottofondo (Folk irlandese)',
    btnNew: 'Nuova partita',
    btnNewTitle: 'Inizia una nuova partita',
    stockTitle: 'Clicca per pescare carte',
    wasteTitle: 'Carte pescate',
    foundations: {
      clubs: 'Base boccale birra scura',
      spades: 'Base cicchetto verde scuro',
      hearts: 'Base boccale birra bionda',
      diamonds: 'Base cicchetto sambuco'
    },
    legend: {
      rulesTitle: '🍺🥃 <strong>Regole: Colori alternati (Scuro ⇄ Chiaro):</strong>',
      blackGlass: 'Birra scura (♣)',
      blackDrop: 'Cicchetto verde scuro (♠)',
      greenDrop: 'Birra bionda (♥)',
      greenGlass: 'Cicchetto sambuco (♦)',
      sweepHint: '🖱️ <em>Clic destro</em>, tocca <strong>⚡ Raccogli</strong> o doppio tocco sul tavolo per inviare alle basi!'
    },
    courtTitles: {
      11: 'FANTE',
      12: 'REGINA',
      13: 'RE'
    },
    suitTitles: {
      clubs: 'Boccale birra scura',
      spades: 'Cicchetto verde scuro',
      hearts: 'Boccale birra bionda',
      diamonds: 'Cicchetto sambuco'
    },
    winModal: {
      badge: '🏆 PROSIT! VITTORIA!',
      title: 'Congratulazioni!',
      desc: 'Hai conquistato la Schnaps Solitaire Edition!',
      labelDeal: 'Tipo partita:',
      labelMode: 'Modalità:',
      labelTime: 'Tempo:',
      labelMoves: 'Mosse:',
      labelScore: 'Punteggio:',
      labelName: 'Inserisci il tuo nome per la classifica:',
      namePlaceholder: 'Nome giocatore',
      btnSaveScore: 'Salva record',
      saveSuccess: '✅ Salvato nella classifica globale!',
      saveSuccessLocal: '✅ Salvato localmente!',
      btnScores: 'Classifica',
      btnReplay: 'Gioca ancora',
      solvableNotice: 'ℹ️ Le partite in modalità risolvibile non sono valide per la classifica. Gioca in modalità casuale per i record ufficiali!',
      dealSolvable: 'Risolvibile',
      dealRandom: 'Casuale',
      modeDraw1: '1 Carta',
      modeDraw3: '3 Carte'
    },
    scoresModal: {
      badge: 'SALA DELLA GLORIA',
      title: '🏆 Classifica',
      tabDraw1: '🃏 1 Carta (Top 100)',
      tabDraw3: '🃏 3 Carte (Top 100)',
      filterAll: 'Tutti',
      filterDesktop: '💻 PC',
      filterMobile: '📱 Cellulare',
      loading: 'Caricamento classifica...',
      refreshTitle: 'Aggiorna',
      offlineNotice: 'Offline - Mostra record locali.',
      thPlayer: 'Giocatore',
      thScore: 'Punti',
      thTime: 'Tempo',
      thMoves: 'Mosse',
      thDate: 'Data',
      empty: 'Nessun record salvato. Vinci una partita per entrare nella storia!',
      btnClose: 'Chiudi'
    },
    settingsModal: {
      badge: 'OPZIONI',
      title: '⚙️ Impostazioni',
      sectionGame: 'Gioco & Tavolo',
      labelDeal: 'Stile di gioco:',
      optDealSolvable: '🌟 Risolvibile (Garantito)',
      optDealRandom: '🎲 Casuale (Classico)',
      labelDraw: 'Pesca carte:',
      optDraw1: '1 Carta (Facile)',
      optDraw3: '3 Carte (Classico)',
      labelFelt: 'Stile tavolo:',
      optOak: '🪵 Quercia Taverna',
      optEmerald: '🟢 Smeraldo',
      optNavy: '🔵 Blu Navy',
      optBurgundy: '🔴 Borgogna',
      optSlate: '⚫ Ardesia',
      optViolet: '🟣 Viola',
      labelLang: 'Lingua:',
      sectionAudio: 'Audio & Volume',
      musicLabel: '🎵 Musica di sottofondo (Folk)',
      trackSkipTitle: 'Traccia musicale successiva',
      cardsLabel: '🃏 Suoni delle carte',
      drinksLabel: '🥃 Suoni del sorso (Bicchierino)',
      victoryLabel: '🎺 Suono di vittoria (Fanfara)',
      btnClose: 'Chiudi'
    },
    toasts: {
      dealSolvable: '🌟 Modalità risolvibile: Partita garantita al 100%!',
      dealRandom: '🎲 Modalità casuale: Mescolamento classico.',
      switchDrawConfirm: 'Cambiare la modalità di pesca avvierà una nuova partita. Continuare?',
      sweptSuccess: (count) => `⚡ Inviate ${count} carta/e alle basi!`,
      noSweep: 'Nessuna carta può essere inviata alle basi in questo momento.',
      dealRestarted: '↺ Partita ricominciata dalla mossa 1! Buona fortuna.',
      deckCycled: 'Mazzo scorso',
      autoFinishReady: '⚡ Tutte le carte scoperte! Ora puoi usare Auto-Completa.',
      autoFinishing: 'Completamento automatico delle carte rimanenti...',
      cannotUndo: 'Nessun\'altra mossa da annullare.',
      moveUndone: 'Mossa annullata.',
      hintFoundFoundation: (label, suit) => `Sposta ${label} (${suit}) sulla base`,
      hintFoundReveal: (col) => `Sposta le carte per scoprire la carta nella colonna ${col}`,
      hintFoundTableau: (label, suit, col) => `Sposta ${label} (${suit}) nella colonna ${col}`,
      hintStock: '💡 Aiuto: Pesca una carta dal mazzo per trovare nuove mosse!'
    }
  }
};

// --- Custom Schnaps & Beer SVG Generator (4 Suits) ---
function getShotGlassSVG(suitName, size = 'small') {
  const sizeClass = `shot-svg shot-svg-${size}`;
  const uid = Math.random().toString(36).substr(2, 6);

  switch (suitName) {
    case 'clubs': // 🍺 GROSSES BIERGLAS MIT HENKEL (Schwarzbier)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sbGrad_${uid}" x1="4" y1="12" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3b1b0b"/>
              <stop offset="0.28" stop-color="#1f0c04"/>
              <stop offset="0.7" stop-color="#0f0502"/>
              <stop offset="1" stop-color="#050100"/>
            </linearGradient>
            <linearGradient id="sbFoam_${uid}" x1="12" y1="2.5" x2="12" y2="13" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="0.55" stop-color="#fef3c7"/>
              <stop offset="1" stop-color="#f59e0b"/>
            </linearGradient>
            <linearGradient id="sbBase_${uid}" x1="4" y1="35" x2="22" y2="35" gradientUnits="userSpaceOnUse">
              <stop stop-color="#cbd5e1"/>
              <stop offset="0.5" stop-color="#f8fafc"/>
              <stop offset="1" stop-color="#64748b"/>
            </linearGradient>
          </defs>

          <!-- Subtle Ground Shadow -->
          <ellipse cx="13.5" cy="38.5" rx="9" ry="1.3" fill="rgba(0,0,0,0.22)"/>

          <!-- Sturdy Molded Glass Handle (Henkel on right) -->
          <path d="M21 12.5 C29.8 12.5, 30.2 29.2, 20.2 29.2 C26.2 28, 26.2 14.2, 21 14.8 Z" fill="rgba(255,255,255,0.38)" stroke="#475569" stroke-width="1.45" stroke-linejoin="round"/>
          <path d="M22.5 14 C27.8 14.5, 28 27, 21.8 27.5" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.85"/>

          <!-- Heavy Dimpled Glass Base -->
          <path d="M4.5 32 L5.2 36 Q5.5 38.4 8.5 38.4 L17.5 38.4 Q20.5 38.4 20.8 36 L21.5 32 Z" fill="url(#sbBase_${uid})" stroke="#475569" stroke-width="1.15"/>
          <ellipse cx="13" cy="36.2" rx="6.2" ry="0.9" fill="#ffffff" opacity="0.7"/>

          <!-- Deep Roasted Schwarzbier Liquid Body -->
          <path d="M3.8 11.2 L5.4 33.2 L20.6 33.2 L22.2 11.2 Z" fill="url(#sbGrad_${uid})"/>

          <!-- Warm Mahogany Bottom Refraction Glow -->
          <path d="M6.2 29 L19.8 29 L19.3 32.8 L6.7 32.8 Z" fill="#9a3412" opacity="0.45"/>

          <!-- Outer Glass Mug Wall Outline -->
          <path d="M3.2 11 L5.2 33 Q5.5 38.4 8.5 38.4 L17.5 38.4 Q20.5 38.4 20.8 33 L22.8 11 Z" fill="rgba(255,255,255,0.05)" stroke="#334155" stroke-width="1.45" stroke-linejoin="round"/>

          <!-- Ruby Malt Edge Reflex -->
          <line x1="19.8" y1="13" x2="18.4" y2="31.5" stroke="#b45309" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>

          <!-- Molded Glass Facet Flutes -->
          <line x1="9" y1="13.5" x2="9.4" y2="31" stroke="rgba(255,255,255,0.26)" stroke-width="1"/>
          <line x1="13.5" y1="13.5" x2="13.5" y2="31" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>
          <line x1="17.5" y1="13.5" x2="17.1" y2="31" stroke="rgba(255,255,255,0.2)" stroke-width="0.9"/>

          <!-- Crisp Left Specular Highlight Streak -->
          <path d="M5.4 13 L6.8 31.2" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity="0.95"/>

          <!-- Rich Creamy Malt Foam Head -->
          <path d="M2.2 11.2 C1.5 6.8, 6.2 4.5, 8.6 6.6 C10.6 3.2, 15.4 3.2, 17.8 5.6 C20 4.4, 24 6.6, 23.4 11.2 C21.8 13.8, 4.2 13.8, 2.2 11.2 Z" fill="url(#sbFoam_${uid})" stroke="#b45309" stroke-width="0.95" stroke-linejoin="round"/>
          <path d="M4.2 9.5 Q 8.5 11.5 13.5 10.5 Q 18.5 9.5 21.5 10.8" stroke="rgba(180,83,9,0.35)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
          <circle cx="7" cy="7.2" r="1.5" fill="#ffffff" opacity="0.9"/>
          <circle cx="13" cy="5.4" r="1.9" fill="#ffffff" opacity="0.95"/>
          <circle cx="18.6" cy="6.8" r="1.4" fill="#ffffff" opacity="0.85"/>
        </svg>
      `;

    case 'spades': // 🥃 KLEINES SHOTGLAS (Dunkelgrün, kurz vor schwarz)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dgGrad_${uid}" x1="10" y1="17" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#143d22"/>
              <stop offset="0.35" stop-color="#092111"/>
              <stop offset="0.75" stop-color="#041208"/>
              <stop offset="1" stop-color="#010603"/>
            </linearGradient>
            <linearGradient id="dgBase_${uid}" x1="10" y1="33" x2="22" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#64748b"/>
              <stop offset="0.5" stop-color="#cbd5e1"/>
              <stop offset="1" stop-color="#334155"/>
            </linearGradient>
          </defs>

          <!-- Subtle Ground Shadow -->
          <ellipse cx="16" cy="36.6" rx="6.2" ry="1" fill="rgba(0,0,0,0.22)"/>

          <!-- Heavy Crystal Shot Base -->
          <path d="M10.9 30.5 L11.4 33.8 Q11.5 36.2 13.6 36.2 L18.4 36.2 Q20.5 36.2 20.6 33.8 L21.1 30.5 Z" fill="url(#dgBase_${uid})" stroke="#1e293b" stroke-width="0.9"/>
          <ellipse cx="16" cy="34.4" rx="3.8" ry="0.65" fill="#ffffff" opacity="0.65"/>

          <!-- Deep Forest-Black Herbal Schnaps Liquid -->
          <path d="M10.1 18.6 L11.4 31.8 L20.6 31.8 L21.9 18.6 Z" fill="url(#dgGrad_${uid})"/>

          <!-- Emerald Bottom Refraction -->
          <path d="M11.6 29.2 L20.4 29.2 L20.1 31.6 L11.9 31.6 Z" fill="#15803d" opacity="0.45"/>

          <!-- Tapered Shot Glass Body -->
          <path d="M9 14 L11 33.2 Q11.2 36.2 13.6 36.2 L18.4 36.2 Q20.8 36.2 21 33.2 L23 14 Z" fill="rgba(255,255,255,0.08)" stroke="#334155" stroke-width="1.35" stroke-linejoin="round"/>

          <!-- Liquid Surface Meniscus -->
          <ellipse cx="16" cy="18.6" rx="5.9" ry="1.55" fill="#144526" stroke="#05180c" stroke-width="0.7"/>
          <path d="M11.5 18.5 Q16 19.6 20.5 18.5" stroke="#4ade80" stroke-width="0.5" fill="none" opacity="0.55"/>

          <!-- Subtle Bubble -->
          <circle cx="17.6" cy="23.5" r="1.05" fill="#22c55e" opacity="0.55"/>

          <!-- Specular Glass Highlights -->
          <path d="M10.7 15.8 L12 31.2" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round"/>
          <path d="M21.3 15.8 L20.1 30.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-linecap="round"/>

          <!-- Polished Glass Rim -->
          <ellipse cx="16" cy="14" rx="7" ry="1.65" fill="rgba(255,255,255,0.28)" stroke="#475569" stroke-width="1.15"/>
          <ellipse cx="16" cy="14" rx="6.2" ry="1.2" fill="none" stroke="#ffffff" stroke-width="0.75"/>
        </svg>
      `;

    case 'hearts': // 🍺 GROSSES BIERGLAS (Pilsbier)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pilsGrad_${uid}" x1="4" y1="11" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fef08a"/>
              <stop offset="0.3" stop-color="#facc15"/>
              <stop offset="0.72" stop-color="#eab308"/>
              <stop offset="1" stop-color="#b45309"/>
            </linearGradient>
            <linearGradient id="pilsFoam_${uid}" x1="12" y1="2.5" x2="12" y2="13" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="0.68" stop-color="#f8fafc"/>
              <stop offset="1" stop-color="#cbd5e1"/>
            </linearGradient>
            <linearGradient id="pilsBase_${uid}" x1="4" y1="35" x2="22" y2="35" gradientUnits="userSpaceOnUse">
              <stop stop-color="#e2e8f0"/>
              <stop offset="0.5" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#94a3b8"/>
            </linearGradient>
          </defs>

          <!-- Subtle Ground Shadow -->
          <ellipse cx="13.5" cy="38.5" rx="9" ry="1.3" fill="rgba(0,0,0,0.2)"/>

          <!-- Big Sturdy Mug Handle (Henkel on right) -->
          <path d="M21 12.5 C29.8 12.5, 30.2 29.2, 20.2 29.2 C26.2 28, 26.2 14.2, 21 14.8 Z" fill="rgba(255,255,255,0.45)" stroke="#64748b" stroke-width="1.45" stroke-linejoin="round"/>
          <path d="M22.5 14 C27.8 14.5, 28 27, 21.8 27.5" stroke="#ffffff" stroke-width="0.95" stroke-linecap="round" fill="none" opacity="0.9"/>

          <!-- Heavy Molded Glass Base -->
          <path d="M4.5 32 L5.2 36 Q5.5 38.4 8.5 38.4 L17.5 38.4 Q20.5 38.4 20.8 36 L21.5 32 Z" fill="url(#pilsBase_${uid})" stroke="#64748b" stroke-width="1.15"/>
          <ellipse cx="13" cy="36.2" rx="6.2" ry="0.9" fill="#ffffff" opacity="0.85"/>

          <!-- Golden Pilsner Liquid Body -->
          <path d="M3.8 11.2 L5.4 33.2 L20.6 33.2 L22.2 11.2 Z" fill="url(#pilsGrad_${uid})"/>

          <!-- Bright Amber Bottom Glow -->
          <path d="M6.2 29.2 L19.8 29.2 L19.3 32.8 L6.7 32.8 Z" fill="#fef08a" opacity="0.5"/>

          <!-- Glass Body Outline -->
          <path d="M3.2 11 L5.2 33 Q5.5 38.4 8.5 38.4 L17.5 38.4 Q20.5 38.4 20.8 33 L22.8 11 Z" fill="rgba(255,255,255,0.08)" stroke="#9a3412" stroke-width="1.45" stroke-linejoin="round"/>

          <!-- Rising Effervescent Carbonation Bubbles -->
          <circle cx="8.2" cy="28" r="0.9" fill="#ffffff" opacity="0.9"/>
          <circle cx="11.2" cy="22" r="0.75" fill="#ffffff" opacity="0.85"/>
          <circle cx="15.2" cy="26.5" r="0.85" fill="#ffffff" opacity="0.9"/>
          <circle cx="14" cy="17.5" r="0.65" fill="#ffffff" opacity="0.95"/>
          <circle cx="18" cy="20.5" r="0.75" fill="#ffffff" opacity="0.85"/>

          <!-- Molded Glass Facet Flutes -->
          <line x1="9" y1="13.5" x2="9.4" y2="31" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
          <line x1="13.5" y1="13.5" x2="13.5" y2="31" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <line x1="17.5" y1="13.5" x2="17.1" y2="31" stroke="rgba(255,255,255,0.35)" stroke-width="0.9"/>

          <!-- Left Glass Specular Reflection Streak -->
          <path d="M5.4 13 L6.8 31.2" stroke="#ffffff" stroke-width="1.65" stroke-linecap="round" opacity="0.98"/>

          <!-- Pure Snow-White Foam Head (Cresting on top) -->
          <path d="M2.2 11.2 C1.5 6.5, 6.2 4.3, 8.6 6.4 C10.6 3.0, 15.4 3.0, 17.8 5.4 C20 4.2, 24 6.4, 23.4 11.2 C21.8 13.8, 4.2 13.8, 2.2 11.2 Z" fill="url(#pilsFoam_${uid})" stroke="#64748b" stroke-width="0.95" stroke-linejoin="round"/>
          <path d="M4.2 9.5 Q 8.5 11.5 13.5 10.5 Q 18.5 9.5 21.5 10.8" stroke="rgba(100,116,139,0.3)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
          <circle cx="7" cy="7" r="1.5" fill="#ffffff"/>
          <circle cx="13" cy="5.2" r="1.9" fill="#ffffff"/>
          <circle cx="18.6" cy="6.6" r="1.4" fill="#ffffff"/>
        </svg>
      `;

    case 'diamonds': // 🥃 KLEINES SHOTGLAS (Holunderschnaps)
      return `
        <svg class="${sizeClass}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="holunderGrad_${uid}" x1="10" y1="17" x2="22" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fef9c3"/>
              <stop offset="0.38" stop-color="#fef08a"/>
              <stop offset="0.78" stop-color="#facc15"/>
              <stop offset="1" stop-color="#ca8a04"/>
            </linearGradient>
            <linearGradient id="holBase_${uid}" x1="10" y1="33" x2="22" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fef3c7"/>
              <stop offset="0.5" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#d97706"/>
            </linearGradient>
          </defs>

          <!-- Subtle Ground Shadow -->
          <ellipse cx="16" cy="36.6" rx="6.2" ry="1" fill="rgba(0,0,0,0.18)"/>

          <!-- Heavy Crystal Base -->
          <path d="M10.9 30.5 L11.4 33.8 Q11.5 36.2 13.6 36.2 L18.4 36.2 Q20.5 36.2 20.6 33.8 L21.1 30.5 Z" fill="url(#holBase_${uid})" stroke="#b45309" stroke-width="0.9"/>
          <ellipse cx="16" cy="34.4" rx="3.8" ry="0.65" fill="#ffffff" opacity="0.8"/>

          <!-- Transparent Sun-Gold Elderflower Schnaps Liquid -->
          <path d="M10.1 18.6 L11.4 31.8 L20.6 31.8 L21.9 18.6 Z" fill="url(#holunderGrad_${uid})" opacity="0.92"/>

          <!-- Golden Honey Bottom Glow -->
          <path d="M11.6 29.2 L20.4 29.2 L20.1 31.6 L11.9 31.6 Z" fill="#f59e0b" opacity="0.45"/>

          <!-- Tapered Shot Glass Body -->
          <path d="M9 14 L11 33.2 Q11.2 36.2 13.6 36.2 L18.4 36.2 Q20.8 36.2 21 33.2 L23 14 Z" fill="rgba(254,240,138,0.14)" stroke="#9a3412" stroke-width="1.35" stroke-linejoin="round"/>

          <!-- Liquid Surface Meniscus -->
          <ellipse cx="16" cy="18.6" rx="5.9" ry="1.55" fill="#fffbeb" stroke="#b45309" stroke-width="0.7"/>

          <!-- Sparkling Dew Bubbles -->
          <circle cx="17.5" cy="23.8" r="1.15" fill="#ffffff" opacity="0.95"/>
          <circle cx="14.2" cy="27.5" r="0.8" fill="#ffffff" opacity="0.85"/>

          <!-- Specular Reflections -->
          <path d="M10.7 15.8 L12 31.2" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round"/>
          <path d="M21.3 15.8 L20.1 30.5" stroke="rgba(255,255,255,0.55)" stroke-width="0.8" stroke-linecap="round"/>

          <!-- Polished Rim -->
          <ellipse cx="16" cy="14" rx="7" ry="1.65" fill="rgba(254,240,138,0.28)" stroke="#9a3412" stroke-width="1.15"/>
          <ellipse cx="16" cy="14" rx="6.2" ry="1.2" fill="none" stroke="#ffffff" stroke-width="0.75"/>
        </svg>
      `;

    default:
      return '';
  }
}

// --- Card Pip Layout Generator (1 to 10 Shot Glasses) ---
function getPipsHTML(rankValue, suitName) {
  const coordsMap = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 50, y: 22 }, { x: 50, y: 78 }],
    3: [{ x: 50, y: 19 }, { x: 50, y: 50 }, { x: 50, y: 81 }],
    4: [{ x: 26, y: 22 }, { x: 74, y: 22 }, { x: 26, y: 78 }, { x: 74, y: 78 }],
    5: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    6: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    7: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 35 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    8: [{ x: 26, y: 20 }, { x: 74, y: 20 }, { x: 50, y: 35 }, { x: 26, y: 50 }, { x: 74, y: 50 }, { x: 50, y: 65 }, { x: 26, y: 80 }, { x: 74, y: 80 }],
    9: [{ x: 26, y: 16 }, { x: 74, y: 16 }, { x: 26, y: 38 }, { x: 74, y: 38 }, { x: 50, y: 50 }, { x: 26, y: 62 }, { x: 74, y: 62 }, { x: 26, y: 84 }, { x: 74, y: 84 }],
    10: [{ x: 26, y: 16 }, { x: 74, y: 16 }, { x: 50, y: 27 }, { x: 26, y: 38 }, { x: 74, y: 38 }, { x: 26, y: 62 }, { x: 74, y: 62 }, { x: 50, y: 73 }, { x: 26, y: 84 }, { x: 74, y: 84 }]
  };

  const coords = coordsMap[rankValue] || [{ x: 50, y: 50 }];
  const glassSvg = getShotGlassSVG(suitName, 'pip');

  const pipsHtml = coords.map(pt => `
    <div class="card-pip" style="left: ${pt.x}%; top: ${pt.y}%;">
      ${glassSvg}
    </div>
  `).join('');

  return `<div class="card-pips card-pips-${rankValue}">${pipsHtml}</div>`;
}

// --- Authentic Berliner Bild Court Card SVG Generator (Schnaps Edition) ---
// Single-direction (ungespiegelt) classical royal portraits with rich gradients,
// anatomical hands, fine woodcut-style shading, and prominent beverage vessels.
const COURT_SUIT_THEMES = {
  clubs: {
    key: 'clubs',
    color: '#1a1a1a',
    isDark: true,
    tunicK: '#166534',      // Deep forest emerald
    tunicKDark: '#052e16',
    mantleK: '#b91c1c',     // Royal crimson velvet
    mantleKDark: '#7f1d1d',
    bodiceQ: '#be123c',     // Rich ruby crimson
    bodiceQDark: '#881337',
    bowsQ: '#0284c7',       // Sapphire blue bows
    doubletJ: '#1d4ed8',    // Royal sapphire doublet
    doubletJDark: '#1e3a8a',
    beretJ: '#15803d'       // Emerald velvet beret
  },
  spades: {
    key: 'spades',
    color: '#072210',
    isDark: true,
    tunicK: '#1d4ed8',      // Imperial sapphire blue
    tunicKDark: '#1e3a8a',
    mantleK: '#b91c1c',
    mantleKDark: '#7f1d1d',
    bodiceQ: '#15803d',     // Emerald velvet bodice
    bodiceQDark: '#14532d',
    bowsQ: '#dc2626',       // Crimson bows
    doubletJ: '#15803d',    // Forest emerald doublet
    doubletJDark: '#14532d',
    beretJ: '#b91c1c'       // Crimson velvet beret
  },
  hearts: {
    key: 'hearts',
    color: '#b45309',
    isDark: false,
    tunicK: '#b91c1c',      // Crimson tunic
    tunicKDark: '#7f1d1d',
    mantleK: '#991b1b',
    mantleKDark: '#450a0a',
    bodiceQ: '#15803d',     // Emerald bodice
    bodiceQDark: '#14532d',
    bowsQ: '#e11d48',       // Rose-ruby bows
    doubletJ: '#0369a1',    // Cerulean blue doublet
    doubletJDark: '#0c4a6e',
    beretJ: '#b91c1c'       // Crimson beret
  },
  diamonds: {
    key: 'diamonds',
    color: '#c25e00',
    isDark: false,
    tunicK: '#0369a1',      // Royal cerulean tunic
    tunicKDark: '#0c4a6e',
    mantleK: '#b91c1c',
    mantleKDark: '#7f1d1d',
    bodiceQ: '#1d4ed8',     // Sapphire bodice
    bodiceQDark: '#1e3a8a',
    bowsQ: '#f59e0b',       // Amber-gold bows
    doubletJ: '#1d4ed8',    // Sapphire doublet
    doubletJDark: '#1e3a8a',
    beretJ: '#15803d'       // Emerald beret
  }
};

function getCourtEmblemSVG(suitKey) {
  switch (suitKey) {
    case 'clubs': // 🍺 Großes Bierglas mit Henkel (Schwarzbier)
      return `
        <g transform="scale(1.38) translate(-1, 0)">
          <!-- Handle -->
          <path d="M3.6 -0.8 C8.5 -0.8, 8.8 7.6, 3.2 7.6 C6.6 7, 6.6 0.4, 3.6 0.6 Z" fill="rgba(255,255,255,0.5)" stroke="#334155" stroke-width="0.9"/>
          <!-- Heavy Base -->
          <path d="M-5.2 7.6 L-4.8 9.6 Q-4.6 10.8 -2.5 10.8 L1.8 10.8 Q3.8 10.8 4 9.6 L4.4 7.6 Z" fill="#cbd5e1" stroke="#334155" stroke-width="0.7"/>
          <!-- Dark Beer Liquid -->
          <path d="M-5.4 -1.5 L-4.4 8.2 L3.6 8.2 L4.6 -1.5 Z" fill="#180802" stroke="#0f172a" stroke-width="0.8"/>
          <line x1="2.4" y1="-0.5" x2="1.8" y2="7.2" stroke="#b45309" stroke-width="0.9" opacity="0.85"/>
          <line x1="-1.2" y1="-0.5" x2="-1.2" y2="7.2" stroke="rgba(255,255,255,0.25)" stroke-width="0.7"/>
          <path d="M-3.8 -0.4 L-3.1 7.2" stroke="#ffffff" stroke-width="1.05" stroke-linecap="round" opacity="0.95"/>
          <!-- Creamy Foam Head -->
          <path d="M-5.8 -1.4 C-6.4 -4.2, -3.2 -5.4, -1.2 -4.0 C0.4 -6.0, 3.4 -5.5, 4.2 -3.4 C5.5 -2.8, 5.5 -0.6, 4.4 -0.2 C3.2 1.0, -5.0 1.0, -5.8 -1.4 Z" fill="#fef3c7" stroke="#b45309" stroke-width="0.7"/>
          <circle cx="-2.2" cy="-2.8" r="0.9" fill="#ffffff" opacity="0.9"/>
          <circle cx="1.2" cy="-3.6" r="1.1" fill="#ffffff" opacity="0.95"/>
        </g>
      `;

    case 'spades': // 🥃 Kleines Shotglas dunkelgrün kurz vor schwarz
      return `
        <g transform="scale(1.02) translate(0, 1)">
          <!-- Crystal Base -->
          <path d="M-3.1 4.2 L-2.8 6.4 Q-2.7 7.5 0 7.5 Q2.7 7.5 2.8 6.4 L3.1 4.2 Z" fill="#64748b" stroke="#0f172a" stroke-width="0.65"/>
          <!-- Dark Green Liquid -->
          <path d="M-4.3 -5.2 L-3.0 5.0 L3.0 5.0 L4.3 -5.2 Z" fill="#05180c" stroke="#0f172a" stroke-width="0.85"/>
          <path d="M-3.5 -3.0 L-2.6 4.4 L2.6 4.4 L3.5 -3.0 Z" fill="#092614"/>
          <ellipse cx="0" cy="-3.0" rx="3.5" ry="1.0" fill="#144526" stroke="#041208" stroke-width="0.5"/>
          <ellipse cx="0" cy="-5.2" rx="4.3" ry="1.25" fill="rgba(255,255,255,0.4)" stroke="#334155" stroke-width="0.7"/>
          <line x1="-2.5" y1="-3.5" x2="-1.8" y2="4.0" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="0.95"/>
        </g>
      `;

    case 'hearts': // 🍺 Großes Bierglas mit Henkel (Pilsbier)
      return `
        <g transform="scale(1.38) translate(-1, 0)">
          <!-- Handle -->
          <path d="M3.6 -0.8 C8.5 -0.8, 8.8 7.6, 3.2 7.6 C6.6 7, 6.6 0.4, 3.6 0.6 Z" fill="rgba(255,255,255,0.55)" stroke="#475569" stroke-width="0.9"/>
          <!-- Heavy Base -->
          <path d="M-5.2 7.6 L-4.8 9.6 Q-4.6 10.8 -2.5 10.8 L1.8 10.8 Q3.8 10.8 4 9.6 L4.4 7.6 Z" fill="#e2e8f0" stroke="#475569" stroke-width="0.7"/>
          <!-- Golden Pils Liquid -->
          <path d="M-5.4 -1.5 L-4.4 8.2 L3.6 8.2 L4.6 -1.5 Z" fill="#facc15" stroke="#9a3412" stroke-width="0.8"/>
          <circle cx="-1.5" cy="4.5" r="0.55" fill="#ffffff" opacity="0.9"/>
          <circle cx="1.2" cy="2.5" r="0.5" fill="#ffffff" opacity="0.9"/>
          <line x1="-1.2" y1="-0.5" x2="-1.2" y2="7.2" stroke="rgba(255,255,255,0.45)" stroke-width="0.7"/>
          <path d="M-3.8 -0.4 L-3.1 7.2" stroke="#ffffff" stroke-width="1.05" stroke-linecap="round" opacity="0.95"/>
          <!-- Snow-White Foam Head -->
          <path d="M-5.8 -1.4 C-6.4 -4.2, -3.2 -5.4, -1.2 -4.0 C0.4 -6.0, 3.4 -5.5, 4.2 -3.4 C5.5 -2.8, 5.5 -0.6, 4.4 -0.2 C3.2 1.0, -5.0 1.0, -5.8 -1.4 Z" fill="#ffffff" stroke="#64748b" stroke-width="0.7"/>
          <circle cx="-2.2" cy="-2.8" r="0.9" fill="#ffffff"/>
          <circle cx="1.2" cy="-3.6" r="1.1" fill="#ffffff"/>
        </g>
      `;

    case 'diamonds': // 🥃 Kleines Shotglas transparent hell-gelb (Holunderschnaps)
      return `
        <g transform="scale(1.02) translate(0, 1)">
          <!-- Crystal Base -->
          <path d="M-3.1 4.2 L-2.8 6.4 Q-2.7 7.5 0 7.5 Q2.7 7.5 2.8 6.4 L3.1 4.2 Z" fill="#fef3c7" stroke="#9a3412" stroke-width="0.65"/>
          <!-- Pale Golden Liquid -->
          <path d="M-4.3 -5.2 L-3.0 5.0 L3.0 5.0 L4.3 -5.2 Z" fill="rgba(254,249,195,0.45)" stroke="#9a3412" stroke-width="0.85"/>
          <path d="M-3.5 -2.8 L-2.6 4.4 L2.6 4.4 L3.5 -2.8 Z" fill="#fde047"/>
          <ellipse cx="0" cy="-2.8" rx="3.5" ry="1.0" fill="#fffbeb" stroke="#ca8a04" stroke-width="0.5"/>
          <ellipse cx="0" cy="-5.2" rx="4.3" ry="1.25" fill="rgba(255,255,255,0.5)" stroke="#9a3412" stroke-width="0.7"/>
          <line x1="-2.5" y1="-3.5" x2="-1.8" y2="4.0" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" opacity="0.95"/>
        </g>
      `;

    default:
      return '';
  }
}

function renderKingFigureSVG(suit, uid) {
  const emblem = getCourtEmblemSVG(suit.key || suit.name);

  return `
    <g>
      <!-- Warm Portrait Halo Behind Bust -->
      <ellipse cx="52" cy="70" rx="40" ry="54" fill="url(#auraGrad_${uid})"/>

      <!-- Clip/Mask Path for Clean Portrait Base (Leaves Bottom-Right Index Unobstructed) -->
      <clipPath id="kingClip_${uid}">
        <path d="M 4 0 L 96 0 L 96 116 Q 96 134 68 135 L 22 135 Q 6 135 6 118 Z"/>
      </clipPath>

      <g clip-path="url(#kingClip_${uid})">
        <!-- Broad Royal Crimson Velvet Mantle Draped Over Shoulders -->
        <path d="M 10 136 C 8 102, 12 72, 26 62 L 74 62 C 88 72, 92 102, 90 136 Z" fill="url(#mantleGrad_${uid})" stroke="#1e1b18" stroke-width="1.15"/>
        <!-- Deep Velvet Sleeve & Mantle Folds -->
        <path d="M 15 82 C 13 100, 14 118, 16 135" stroke="${suit.mantleKDark}" stroke-width="2.0" fill="none" opacity="0.75"/>
        <path d="M 21 90 C 19 106, 20 120, 22 135" stroke="#450a0a" stroke-width="1.2" fill="none" opacity="0.6"/>
        <path d="M 85 82 C 87 100, 86 118, 84 135" stroke="${suit.mantleKDark}" stroke-width="2.0" fill="none" opacity="0.75"/>

        <!-- Rich Brocaded Royal Tunic Chest -->
        <path d="M 28 63 L 72 63 L 75 136 L 25 136 Z" fill="url(#tunicGrad_${uid})" stroke="#111827" stroke-width="1.1"/>
        <!-- Ornate Vertical Gold Tapestry Band Down Center Chest -->
        <rect x="46.5" y="64" width="7" height="72" fill="url(#goldVert_${uid})" stroke="#78350f" stroke-width="0.65"/>
        <!-- Ribbed Brocade Texture Lines on Tunic -->
        <line x1="40" y1="65" x2="39" y2="134" stroke="url(#goldVert_${uid})" stroke-width="1.2" opacity="0.85"/>
        <line x1="60" y1="65" x2="61" y2="134" stroke="url(#goldVert_${uid})" stroke-width="1.2" opacity="0.85"/>
        <!-- Horizontal Gold Bullion Frogging & Jeweled Clasps -->
        <g stroke="url(#goldGrad_${uid})" stroke-width="2.3" stroke-linecap="round">
          <path d="M 36 76 Q 50 79.5 64 76"/>
          <path d="M 35 89 Q 50 92.5 65 89"/>
          <path d="M 34 102 Q 50 105.5 66 102"/>
          <path d="M 34 115 Q 50 118.5 66 115"/>
        </g>
        <g fill="#dc2626" stroke="#fef08a" stroke-width="0.65">
          <circle cx="50" cy="77.5" r="2.0"/>
          <circle cx="50" cy="90.5" r="2.0"/>
          <circle cx="50" cy="103.5" r="2.0"/>
          <circle cx="50" cy="116.5" r="2.0"/>
        </g>

        <!-- Wide, Plush Royal Ermine Fur Cape (Hermelinmantel) Over Shoulders -->
        <path d="M 15 135 C 14 98, 17 70, 30 60 L 42 60 C 37 82, 36 108, 37 135 Z" fill="url(#ermineGrad_${uid})" stroke="#64748b" stroke-width="1.05"/>
        <path d="M 85 135 C 86 98, 83 70, 70 60 L 58 60 C 63 82, 64 108, 63 135 Z" fill="url(#ermineGrad_${uid})" stroke="#64748b" stroke-width="1.05"/>
        <!-- Authentic Black-Tipped Ermine Tails -->
        <g fill="#0f172a">
          <path d="M 25 71 L 23.5 77 L 25 75.8 L 26.5 77 Z"/><circle cx="25" cy="69.4" r="0.75"/>
          <path d="M 32 83 L 30.5 89 L 32 87.8 L 33.5 89 Z"/><circle cx="32" cy="81.4" r="0.75"/>
          <path d="M 23 96 L 21.5 102 L 23 100.8 L 24.5 102 Z"/><circle cx="23" cy="94.4" r="0.75"/>
          <path d="M 31 112 L 29.5 118 L 31 116.8 L 32.5 118 Z"/><circle cx="31" cy="110.4" r="0.75"/>
          <path d="M 75 71 L 73.5 77 L 75 75.8 L 76.5 77 Z"/><circle cx="75" cy="69.4" r="0.75"/>
          <path d="M 68 83 L 66.5 89 L 68 87.8 L 69.5 89 Z"/><circle cx="68" cy="81.4" r="0.75"/>
          <path d="M 77 96 L 75.5 102 L 77 100.8 L 78.5 102 Z"/><circle cx="77" cy="94.4" r="0.75"/>
          <path d="M 69 112 L 67.5 118 L 69 116.8 L 70.5 118 Z"/><circle cx="69" cy="110.4" r="0.75"/>
        </g>

        <!-- Wavy Shoulder-Length Chestnut Hair Curls (Back Layer) -->
        <g fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.95">
          <path d="M 35 28 C 25 33, 23 48, 27 62 C 31 66, 38 63, 39 56 C 35 48, 35 36, 35 28 Z"/>
          <path d="M 65 28 C 75 33, 77 48, 73 62 C 69 66, 62 63, 61 56 C 65 48, 65 36, 65 28 Z"/>
        </g>
        <!-- Hair Highlight Waves -->
        <path d="M 29 36 C 26 44, 27 53, 31 60 M 32 40 C 30 47, 31 54, 34 59" stroke="#b45309" stroke-width="0.85" fill="none" opacity="0.75" stroke-linecap="round"/>
        <path d="M 71 36 C 74 44, 73 53, 69 60 M 68 40 C 70 47, 69 54, 66 59" stroke="#b45309" stroke-width="0.85" fill="none" opacity="0.75" stroke-linecap="round"/>

        <!-- Crisp White Scalloped Lace Collar (Spitzenkragen) at Neckline -->
        <path d="M 31 56 C 36 65, 44 68, 50 66 C 56 68, 64 65, 69 56 C 72 62, 64 71, 50 71 C 36 71, 28 62, 31 56 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.95"/>
        <path d="M 35 61 Q 42 67 50 64 Q 58 67 65 61" stroke="#cbd5e1" stroke-width="0.8" fill="none"/>
        <!-- Jeweled Collar Brooch -->
        <ellipse cx="50" cy="63.5" rx="3.4" ry="2.5" fill="#dc2626" stroke="url(#goldGrad_${uid})" stroke-width="0.95"/>
        <circle cx="50" cy="63.5" r="1.0" fill="#fef08a"/>

        <!-- Large Sculpted Noble Head & Face (3/4 Royal Turn) -->
        <path d="M 36.5 25 C 36.5 41, 39.5 53, 50 57.5 C 60.5 53, 63.5 41, 63.5 25 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.85"/>
        <!-- Subtle Cheekbone & Temple Modeling -->
        <path d="M 39 36 C 39 43, 41.5 48, 45 51" stroke="#ea580c" stroke-width="1.6" fill="none" opacity="0.22" stroke-linecap="round"/>
        <path d="M 61 36 C 61 43, 58.5 48, 55 51" stroke="#ea580c" stroke-width="1.6" fill="none" opacity="0.22" stroke-linecap="round"/>
        <circle cx="42.5" cy="40" r="3.4" fill="#ea580c" opacity="0.14"/>
        <circle cx="57.5" cy="40" r="3.4" fill="#ea580c" opacity="0.14"/>

        <!-- Realistic Proportional Human Eyes, Eyelids & Noble Brows -->
        <g>
          <!-- Viewer's Left Eye -->
          <path d="M 40.2 34.5 Q 44.0 32.3 47.5 34.5 Q 44.0 36.4 40.2 34.5 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.65"/>
          <circle cx="44.2" cy="34.4" r="1.55" fill="#1e3a8a"/>
          <circle cx="44.2" cy="34.4" r="0.75" fill="#0f172a"/>
          <circle cx="43.7" cy="33.9" r="0.45" fill="#ffffff"/>
          <path d="M 39.8 34.0 Q 44.0 31.8 47.9 34.2" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 41.0 36.5 Q 44.0 37.3 46.8 36.3" stroke="#9a3412" stroke-width="0.5" fill="none" opacity="0.55"/>
          <path d="M 39.5 31.4 Q 44.0 29.2 48.2 31.2" stroke="#3b1806" stroke-width="1.5" fill="none" stroke-linecap="round"/>

          <!-- Viewer's Right Eye -->
          <path d="M 52.5 34.5 Q 56.0 32.3 59.8 34.5 Q 56.0 36.4 52.5 34.5 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.65"/>
          <circle cx="55.8" cy="34.4" r="1.55" fill="#1e3a8a"/>
          <circle cx="55.8" cy="34.4" r="0.75" fill="#0f172a"/>
          <circle cx="55.3" cy="33.9" r="0.45" fill="#ffffff"/>
          <path d="M 52.1 34.2 Q 56.0 31.8 60.2 34.0" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 53.2 36.3 Q 56.0 37.3 59.0 36.5" stroke="#9a3412" stroke-width="0.5" fill="none" opacity="0.55"/>
          <path d="M 51.8 31.2 Q 56.0 29.2 60.5 31.4" stroke="#3b1806" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Sculpted Classical Nose Bridge & Nostril Shading -->
        <path d="M 49.3 31.5 L 48.8 40.8 Q 48.8 42.6 50.4 42.9 Q 52.0 42.6 52.5 41.5" stroke="#9a3412" stroke-width="1.05" fill="none" stroke-linecap="round"/>
        <path d="M 50.5 32.5 L 50.2 40.5" stroke="#ffedd5" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M 47.4 41.8 Q 48.8 43.0 50.2 42.5" stroke="#7c2d12" stroke-width="0.75" fill="none" stroke-linecap="round"/>

        <!-- Full Sculpted Royal Beard & Sweeping Handlebar Mustache -->
        <path d="M 39.5 47 C 37.5 54, 42 60, 48 61 L 50 59.5 L 52 61 C 58 60, 62.5 54, 60.5 47 Z" fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.85"/>
        <!-- Fine Beard Strand Highlights -->
        <path d="M 43 50 C 43 54, 45 58, 47 59.5 M 50 49.5 L 50 59 M 57 50 C 57 54, 55 58, 53 59.5" stroke="#9a3412" stroke-width="0.75" fill="none" opacity="0.7"/>
        <!-- Lower Lip Glimpse -->
        <path d="M 47.2 46.8 Q 50 48.4 52.8 46.8" stroke="#be123c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <!-- Regal Handlebar Mustache -->
        <path d="M 38.5 45.2 C 42.5 48.2, 47.5 43.8, 50 45.2 C 52.5 43.8, 57.5 48.2, 61.5 45.2 C 59 49.2, 53.2 48.8, 50 47.0 C 46.8 48.8, 41 49.2, 38.5 45.2 Z" fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.75"/>

        <!-- Magnificent Imperial Bügelkrone (Crown) -->
        <g>
          <!-- Crimson Velvet Cap -->
          <path d="M 33.5 23 C 31 11, 41 7.5, 50 12.5 C 59 7.5, 69 11, 66.5 23 Z" fill="url(#mantleGrad_${uid})" stroke="#450a0a" stroke-width="0.9"/>
          <!-- Pearl-Studded Gold Arches -->
          <path d="M 35.5 23 C 34 10.5, 43.5 7, 50 7 C 56.5 7, 66 10.5, 64.5 23" stroke="url(#goldGrad_${uid})" stroke-width="2.2" fill="none"/>
          <line x1="50" y1="6.5" x2="50" y2="23" stroke="url(#goldGrad_${uid})" stroke-width="2.2"/>
          <g fill="#ffffff" stroke="#94a3b8" stroke-width="0.35">
            <circle cx="37" cy="15.5" r="0.9"/>
            <circle cx="40.5" cy="11" r="0.9"/>
            <circle cx="45" cy="8.2" r="0.9"/>
            <circle cx="55" cy="8.2" r="0.9"/>
            <circle cx="59.5" cy="11" r="0.9"/>
            <circle cx="63" cy="15.5" r="0.9"/>
            <circle cx="50" cy="11" r="0.85"/>
            <circle cx="50" cy="15" r="0.85"/>
          </g>
          <!-- Ornate Golden Fleur Peaks -->
          <path d="M 33 22 L 36.5 13 L 40.5 22 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.7"/>
          <path d="M 45.5 22 L 50 11 L 54.5 22 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.7"/>
          <path d="M 59.5 22 L 63.5 13 L 67 22 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.7"/>
          <!-- Heavy Jeweled Circlet Band -->
          <rect x="32" y="21" width="36" height="6" rx="1.6" fill="url(#goldGrad_${uid})" stroke="#451a03" stroke-width="0.9"/>
          <line x1="33.5" y1="22.3" x2="66.5" y2="22.3" stroke="#fef08a" stroke-width="0.7"/>
          <circle cx="37" cy="24" r="1.45" fill="#dc2626" stroke="#451a03" stroke-width="0.45"/>
          <circle cx="43.5" cy="24" r="1.5" fill="#16a34a" stroke="#451a03" stroke-width="0.45"/>
          <polygon points="50,22 52,24 50,26 48,24" fill="#dc2626" stroke="#fef08a" stroke-width="0.5"/>
          <circle cx="56.5" cy="24" r="1.5" fill="#16a34a" stroke="#451a03" stroke-width="0.45"/>
          <circle cx="63" cy="24" r="1.45" fill="#dc2626" stroke="#451a03" stroke-width="0.45"/>
          <!-- Globus Cruciger at Summit -->
          <circle cx="50" cy="5.2" r="1.8" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.55"/>
          <path d="M 50 1.2 L 50 4.0 M 48.2 2.5 L 51.8 2.5" stroke="#d97706" stroke-width="1.2" stroke-linecap="round"/>
        </g>

        <!-- Viewer's Right: Royal Sleeve, Lace Ruffle, Anatomical Hand & Golden Scepter -->
        <g>
          <!-- Scepter Shaft & Fleur Finial -->
          <line x1="80" y1="28" x2="75" y2="136" stroke="#78350f" stroke-width="3.8" stroke-linecap="round"/>
          <line x1="80" y1="28" x2="75" y2="136" stroke="url(#goldGrad_${uid})" stroke-width="2.4" stroke-linecap="round"/>
          <ellipse cx="78.8" cy="52" rx="3.2" ry="1.6" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.65"/>
          <path d="M 80 28 C 74 24, 74 17, 77.5 15.5 C 77.5 20, 78.8 22.5, 80 24 C 81.2 22.5, 82.5 20, 82.5 15.5 C 86 17, 86 24, 80 28 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.7"/>
          <polygon points="80,11.5 83,19.5 80,24.5 77,19.5" fill="#dc2626" stroke="#fde047" stroke-width="0.55"/>
          <circle cx="80" cy="10.5" r="1.4" fill="#fde047" stroke="#78350f" stroke-width="0.45"/>

          <!-- Pleated White Lace Cuff & Gold Sleeve Trim -->
          <path d="M 73 96 L 85 99 L 83 106 L 71 102 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.7"/>
          <path d="M 72 90 C 76 87, 82 88, 84 94 L 73 97 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <!-- Sculpted Hand & Fingers Gripping Scepter -->
          <path d="M 73 84 C 72 81.5, 75 79.5, 78.5 80.5 L 83 82.5 C 85 84, 84.5 91, 81.5 92.5 L 74.5 91.5 C 72 90, 72 86.5, 73 84 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.8"/>
          <path d="M 75.5 83.2 L 82.5 84.2 M 75.2 86.2 L 82.5 87.2 M 75.0 89.0 L 81.5 89.8" stroke="#9a3412" stroke-width="0.7" stroke-linecap="round"/>
          <path d="M 72.8 84 C 74.8 82, 77.8 82.5, 77.8 84.8 C 76.5 86.2, 74 86.2, 72.8 84 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.65"/>
        </g>

        <!-- Viewer's Left: Royal Orb/Shield, Sculpted Hand & Prominent Suit Drink -->
        <g>
          <!-- Imperial Blue & Gold Orb / Shield (Reichsapfel) -->
          <circle cx="28" cy="110" r="15.5" fill="url(#goldGrad_${uid})" stroke="#451a03" stroke-width="1.2"/>
          <circle cx="28" cy="110" r="12.5" fill="#1e3a8a" stroke="#fde047" stroke-width="0.85"/>
          <!-- Jeweled Cross Band on Orb -->
          <path d="M 15.5 110 Q 28 114 40.5 110" stroke="url(#goldGrad_${uid})" stroke-width="2.4" fill="none"/>
          <path d="M 28 97.5 L 28 122.5" stroke="url(#goldGrad_${uid})" stroke-width="2.4"/>
          <circle cx="28" cy="110" r="2.2" fill="#dc2626" stroke="#fef08a" stroke-width="0.5"/>

          <!-- King's Right Hand & Lace Cuff Holding Suit Drink Above Orb -->
          <path d="M 18 93 L 31 90 L 32 95 L 19 98 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <path d="M 19.5 86.5 C 21 83.5, 30.5 83.5, 32 86.5 C 32.8 90.5, 29.8 93.5, 25.5 93 C 21 92.5, 18.8 89.5, 19.5 86.5 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.8"/>
          <path d="M 22 86.5 L 29.5 86.2 M 22 89.2 L 29.5 89.0" stroke="#9a3412" stroke-width="0.65" stroke-linecap="round"/>
          <!-- Golden Coaster / Salver -->
          <ellipse cx="27" cy="83.5" rx="9" ry="2.3" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.8"/>
          <!-- Large Prominent Suit Drink -->
          <g transform="translate(27, 71)">
            ${emblem}
          </g>
        </g>
      </g>

      <!-- Ornate Curved Gold Portrait Base Trim -->
      <path d="M 6 118 Q 6 135 22 135 L 68 135 Q 96 134 96 116" stroke="url(#goldGrad_${uid})" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M 9 124 Q 12 132 24 132 L 66 132 Q 86 132 92 121" stroke="#78350f" stroke-width="0.7" fill="none" opacity="0.6"/>
    </g>
  `;
}

function renderQueenFigureSVG(suit, uid) {
  const emblem = getCourtEmblemSVG(suit.key || suit.name);

  return `
    <g>
      <!-- Warm Portrait Halo Behind Bust -->
      <ellipse cx="52" cy="70" rx="40" ry="54" fill="url(#auraGrad_${uid})"/>

      <clipPath id="queenClip_${uid}">
        <path d="M 4 0 L 96 0 L 96 116 Q 96 134 68 135 L 22 135 Q 6 135 6 118 Z"/>
      </clipPath>

      <g clip-path="url(#queenClip_${uid})">
        <!-- Flowing White Pleated Renaissance Veil & High Standing Medici Ruff Collar -->
        <path d="M 22 68 C 18 40, 26 19, 37 18 L 63 18 C 74 19, 82 40, 78 68 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.0"/>
        <!-- Delicate Fan Pleats on Veil & Medici Ruff -->
        <g stroke="#cbd5e1" stroke-width="0.75">
          <line x1="23" y1="58" x2="37" y2="60"/>
          <line x1="22" y1="49" x2="37" y2="53"/>
          <line x1="24" y1="40" x2="38" y2="46"/>
          <line x1="27" y1="31" x2="39" y2="39"/>
          <line x1="77" y1="58" x2="63" y2="60"/>
          <line x1="78" y1="49" x2="63" y2="53"/>
          <line x1="76" y1="40" x2="62" y2="46"/>
          <line x1="73" y1="31" x2="61" y2="39"/>
        </g>

        <!-- Royal Velvet Mantle Draped Over Shoulders -->
        <path d="M 10 136 C 8 102, 13 74, 27 65 L 73 65 C 87 74, 92 102, 90 136 Z" fill="url(#mantleGrad_${uid})" stroke="#1e1b18" stroke-width="1.15"/>
        <path d="M 16 84 C 14 102, 15 118, 17 135" stroke="${suit.mantleKDark}" stroke-width="1.8" fill="none" opacity="0.75"/>
        <path d="M 84 84 C 86 102, 85 118, 83 135" stroke="${suit.mantleKDark}" stroke-width="1.8" fill="none" opacity="0.75"/>

        <!-- Puffed & Slashed Renaissance Sleeves -->
        <path d="M 27 66 C 14 70, 10 88, 15 106 L 31 100 Z" fill="url(#bodiceGrad_${uid})" stroke="#111827" stroke-width="1.0"/>
        <path d="M 73 66 C 86 70, 90 88, 85 106 L 69 100 Z" fill="url(#bodiceGrad_${uid})" stroke="#111827" stroke-width="1.0"/>
        <!-- White Silk Puffs on Sleeves -->
        <ellipse cx="19" cy="83" rx="3.2" ry="8" fill="#ffffff" stroke="url(#goldGrad_${uid})" stroke-width="0.85" transform="rotate(14 19 83)"/>
        <ellipse cx="81" cy="83" rx="3.2" ry="8" fill="#ffffff" stroke="url(#goldGrad_${uid})" stroke-width="0.85" transform="rotate(-14 81 83)"/>

        <!-- Rich Gold-Embroidered Brocade Corset Bodice -->
        <path d="M 28 66 L 72 66 L 74 136 L 26 136 Z" fill="url(#bodiceGrad_${uid})" stroke="#111827" stroke-width="1.1"/>
        <!-- Gold Brocade Stays on Sides of Corset -->
        <line x1="33" y1="68" x2="36" y2="135" stroke="url(#goldVert_${uid})" stroke-width="2.0"/>
        <line x1="38" y1="70" x2="41" y2="135" stroke="url(#goldVert_${uid})" stroke-width="1.3"/>
        <line x1="67" y1="68" x2="64" y2="135" stroke="url(#goldVert_${uid})" stroke-width="2.0"/>
        <line x1="62" y1="70" x2="59" y2="135" stroke="url(#goldVert_${uid})" stroke-width="1.3"/>

        <!-- Center Cream-Silk Stomacher Panel -->
        <path d="M 38 66 Q 50 73 62 66 L 57 136 L 43 136 Z" fill="#fffbeb" stroke="url(#goldGrad_${uid})" stroke-width="1.3"/>

        <!-- Graceful Neck, Décolletage & Jeweled Royal Necklace -->
        <path d="M 35 64 Q 50 74 65 64 L 58 51 L 42 51 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.65"/>
        <!-- Ruffled White Off-Shoulder Chemise Lace Trim (Like Authentic Berliner Bild) -->
        <path d="M 27 66 C 32 73, 41 76, 50 75 C 59 76, 68 73, 73 66 C 74 72, 63 80, 50 80 C 37 80, 26 72, 27 66 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.9"/>
        <path d="M 31 70 Q 40 76 50 74 Q 60 76 69 70" stroke="#cbd5e1" stroke-width="0.8" fill="none"/>

        <!-- Iconic Berliner Bild Ribbon Bows (Schleifen) Down the Bodice & Shoulder Trim -->
        <g fill="${suit.bowsQ}" stroke="#0f172a" stroke-width="0.65">
          <!-- Shoulder Bows -->
          <path d="M 33 69 L 27 65 C 26 68, 26 70, 28 72 Z"/>
          <path d="M 33 69 L 38 67 C 39 69, 38 71, 37 73 Z"/>
          <circle cx="33" cy="69" r="1.5" fill="#fde047"/>

          <path d="M 67 69 L 62 67 C 61 69, 62 71, 63 73 Z"/>
          <path d="M 67 69 L 73 65 C 74 68, 74 70, 72 72 Z"/>
          <circle cx="67" cy="69" r="1.5" fill="#fde047"/>

          <!-- Center Stomacher Bows -->
          <path d="M 50 76 L 41 71.5 C 39.5 74.5, 39.5 77.5, 41 80.5 Z"/>
          <path d="M 50 76 L 59 71.5 C 60.5 74.5, 60.5 77.5, 59 80.5 Z"/>
          <circle cx="50" cy="76" r="1.9" fill="#fde047"/>

          <path d="M 50 90 L 42 86 C 40.8 88.5, 40.8 91.5, 42 94 Z"/>
          <path d="M 50 90 L 58 86 C 59.2 88.5, 59.2 91.5, 58 94 Z"/>
          <circle cx="50" cy="90" r="1.8" fill="#fde047"/>

          <path d="M 50 104 L 42.5 100.2 C 41.5 102.5, 41.5 105.5, 42.5 107.8 Z"/>
          <path d="M 50 104 L 57.5 100.2 C 58.5 102.5, 58.5 105.5, 57.5 107.8 Z"/>
          <circle cx="50" cy="104" r="1.8" fill="#fde047"/>

          <path d="M 50 118 L 43 114.5 C 42 116.5, 42 119.5, 43 121.5 Z"/>
          <path d="M 50 118 L 57 114.5 C 58 116.5, 58 119.5, 57 121.5 Z"/>
          <circle cx="50" cy="118" r="1.8" fill="#fde047"/>
        </g>

        <!-- Royal Gold Choker & Jeweled Pendant on Décolletage -->
        <path d="M 40.5 58 Q 50 64.5 59.5 58" stroke="url(#goldGrad_${uid})" stroke-width="2.2" fill="none"/>
        <ellipse cx="50" cy="63.5" rx="2.8" ry="3.2" fill="${suit.bowsQ}" stroke="url(#goldGrad_${uid})" stroke-width="0.9"/>
        <circle cx="49.3" cy="62.7" r="0.7" fill="#ffffff" opacity="0.85"/>

        <!-- Sculpted Wavy Renaissance Coiffure Framing Face -->
        <g fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.95">
          <path d="M 36 24 C 27 26, 26 42, 33 48 C 36 49, 38.5 45, 38.5 38 Z"/>
          <path d="M 64 24 C 73 26, 74 42, 67 48 C 64 49, 61.5 45, 61.5 38 Z"/>
        </g>
        <!-- Warm Chestnut Hair Highlights & Pearl Hairpins -->
        <path d="M 31 30 C 29 36, 30 42, 34 45 M 69 30 C 71 36, 70 42, 66 45" stroke="#b45309" stroke-width="0.85" fill="none" stroke-linecap="round" opacity="0.8"/>
        <g fill="#ffffff" stroke="#94a3b8" stroke-width="0.35">
          <circle cx="31.5" cy="33" r="1.0"/>
          <circle cx="31.0" cy="38.5" r="1.0"/>
          <circle cx="68.5" cy="33" r="1.0"/>
          <circle cx="69.0" cy="38.5" r="1.0"/>
        </g>
        <!-- Pearl Drop Earrings -->
        <circle cx="36.2" cy="45.5" r="1.65" fill="#ffffff" stroke="#94a3b8" stroke-width="0.45"/>
        <circle cx="63.8" cy="45.5" r="1.65" fill="#ffffff" stroke="#94a3b8" stroke-width="0.45"/>

        <!-- Graceful Sculpted Queen Portrait Face -->
        <path d="M 37.5 24 C 37.5 40, 41 51, 50 54.5 C 59 51, 62.5 40, 62.5 24 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.8"/>
        <!-- Soft Rosy Overlay for Delicate Complexion -->
        <path d="M 38 24 C 38 40, 41.5 50.5, 50 54 C 58.5 50.5, 62 40, 62 24 Z" fill="url(#skinQueen_${uid})" opacity="0.55"/>
        <!-- Center-Parted Rich Chestnut Hair Framing Forehead -->
        <path d="M 36.5 30 C 37.5 19, 45.5 18.5, 50 23.5 C 54.5 18.5, 62.5 19, 63.5 30 C 59.5 24, 53 23.5, 50 26.2 C 47 23.5, 40.5 24, 36.5 30 Z" fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.8"/>

        <!-- Soft Cheek Blush & Subtle Chin Modeling -->
        <circle cx="42.5" cy="39.5" r="3.4" fill="#e11d48" opacity="0.16"/>
        <circle cx="57.5" cy="39.5" r="3.4" fill="#e11d48" opacity="0.16"/>
        <path d="M 47.2 50.8 Q 50 52.2 52.8 50.8" stroke="#c2410c" stroke-width="0.7" fill="none" opacity="0.45" stroke-linecap="round"/>

        <!-- Expressive Almond Eyes, Curved Lashes & Arched Brows -->
        <g>
          <!-- Left Eye -->
          <path d="M 40.8 34.2 Q 44.2 32.0 47.6 34.2 Q 44.2 36.0 40.8 34.2 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.6"/>
          <circle cx="44.3" cy="34.1" r="1.5" fill="#1e3a8a"/>
          <circle cx="44.3" cy="34.1" r="0.7" fill="#0f172a"/>
          <circle cx="43.8" cy="33.6" r="0.42" fill="#ffffff"/>
          <path d="M 40.3 33.8 Q 44.2 31.5 48.0 34.0" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 40.2 31.0 Q 44.2 28.8 48.2 30.8" stroke="#3b1806" stroke-width="1.25" fill="none" stroke-linecap="round"/>

          <!-- Right Eye -->
          <path d="M 52.4 34.2 Q 55.8 32.0 59.2 34.2 Q 55.8 36.0 52.4 34.2 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.6"/>
          <circle cx="55.7" cy="34.1" r="1.5" fill="#1e3a8a"/>
          <circle cx="55.7" cy="34.1" r="0.7" fill="#0f172a"/>
          <circle cx="55.2" cy="33.6" r="0.42" fill="#ffffff"/>
          <path d="M 52.0 34.0 Q 55.8 31.5 59.7 33.8" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 51.8 30.8 Q 55.8 28.8 59.8 31.0" stroke="#3b1806" stroke-width="1.25" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Sculpted Nose & Classic Rosebud Lips -->
        <path d="M 49.5 31.5 L 49.0 40.2 Q 49.2 41.8 50.6 42.0" stroke="#9a3412" stroke-width="0.95" fill="none" stroke-linecap="round"/>
        <path d="M 50.5 32.5 L 50.2 39.8" stroke="#ffffff" stroke-width="0.75" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M 46.2 45.8 C 47.8 44.3, 49.2 44.8, 50 45.3 C 50.8 44.8, 52.2 44.3, 53.8 45.8 C 52.2 48.2, 47.8 48.2, 46.2 45.8 Z" fill="#be123c" stroke="#881337" stroke-width="0.55"/>
        <path d="M 46.6 45.9 Q 50 46.7 53.4 45.9" stroke="#881337" stroke-width="0.6" fill="none"/>

        <!-- Golden Floral Diadem Crown & Emerald Plume -->
        <path d="M 35 21 C 30 11, 37 5.5, 41 6.5 C 41.5 11.5, 39.5 16.5, 38.5 20 Z" fill="#10b981" stroke="#065f46" stroke-width="0.75"/>
        <path d="M 35 22.5 Q 50 17.5 65 22.5 L 63.5 18 Q 50 13.5 36.5 18 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.85"/>
        <polygon points="39.5,18 42,10.5 44.5,18" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.6"/>
        <polygon points="47,16.5 50,8 53,16.5" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.6"/>
        <polygon points="55.5,18 58,10.5 60.5,18" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.6"/>
        <circle cx="42" cy="9.8" r="1.1" fill="#ffffff" stroke="#94a3b8" stroke-width="0.35"/>
        <circle cx="50" cy="7.2" r="1.3" fill="#ffffff" stroke="#94a3b8" stroke-width="0.35"/>
        <circle cx="58" cy="9.8" r="1.1" fill="#ffffff" stroke="#94a3b8" stroke-width="0.35"/>
        <circle cx="50" cy="18.2" r="1.45" fill="#dc2626"/>
        <circle cx="43" cy="19" r="1.2" fill="#0284c7"/>
        <circle cx="57" cy="19" r="1.2" fill="#0284c7"/>

        <!-- Viewer's Right: Graceful Forearm, Lace Cuff & Blooming Tudor Rose -->
        <g>
          <!-- Rose Stem & Leaves -->
          <path d="M 72 104 C 75 88, 78 75, 79 63" stroke="#15803d" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M 76.5 78 C 70.5 76, 69.5 70.5, 74.5 70.5 C 77 72, 77.5 75.5, 76.5 78 Z" fill="#16a34a" stroke="#14532d" stroke-width="0.6"/>
          <path d="M 78 72 C 84 70, 85 64.5, 80 64.5 C 78 66, 77.5 69.5, 78 72 Z" fill="#16a34a" stroke="#14532d" stroke-width="0.6"/>
          <!-- Multi-Petaled Tudor Rose Blossom -->
          <g transform="translate(79, 59)">
            <circle cx="0" cy="-4.0" r="3.1" fill="#e11d48" stroke="#881337" stroke-width="0.6"/>
            <circle cx="3.8" cy="-1.2" r="3.1" fill="#e11d48" stroke="#881337" stroke-width="0.6"/>
            <circle cx="2.4" cy="3.2" r="3.1" fill="#e11d48" stroke="#881337" stroke-width="0.6"/>
            <circle cx="-2.4" cy="3.2" r="3.1" fill="#e11d48" stroke="#881337" stroke-width="0.6"/>
            <circle cx="-3.8" cy="-1.2" r="3.1" fill="#e11d48" stroke="#881337" stroke-width="0.6"/>
            <circle cx="0" cy="0" r="3.3" fill="#fda4af" stroke="#be123c" stroke-width="0.55"/>
            <circle cx="0" cy="0" r="1.7" fill="#fde047" stroke="#b45309" stroke-width="0.5"/>
          </g>
          <!-- Pleated White Lace Cuff & Sculpted Hand -->
          <path d="M 70 94 L 82 98 L 80 104 L 68 100 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <path d="M 70.5 87 C 70.5 83.5, 79.5 83.5, 81 87.5 C 81.8 91.5, 78.5 94.5, 73.5 93.8 C 70.5 93, 69.8 90, 70.5 87 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.75"/>
          <path d="M 73 86.8 L 79.5 87.2 M 72.8 89.5 L 79.5 90.0" stroke="#9a3412" stroke-width="0.6" stroke-linecap="round"/>
        </g>

        <!-- Viewer's Left: Graceful Hand Presenting Large Suit Beverage -->
        <g>
          <!-- Lace Cuff & Sculpted Hand -->
          <path d="M 17 96 L 30 92.5 L 31.5 98 L 18.5 101.5 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <path d="M 18.5 88.5 C 20 85, 29.5 85, 31 88.5 C 31.8 92.5, 28.5 95, 23.5 94.5 C 19.5 94, 17.8 91.5, 18.5 88.5 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.75"/>
          <path d="M 21 88.5 L 29 88.2 M 21 91.2 L 29 91.0" stroke="#9a3412" stroke-width="0.6" stroke-linecap="round"/>
          <!-- Golden Coaster Under Vessel -->
          <ellipse cx="25.5" cy="85.2" rx="9" ry="2.3" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.8"/>
          <!-- Large Prominent Suit Drink -->
          <g transform="translate(25.5, 72.8)">
            ${emblem}
          </g>
        </g>
      </g>

      <!-- Ornate Curved Gold Portrait Base Trim -->
      <path d="M 6 118 Q 6 135 22 135 L 68 135 Q 96 134 96 116" stroke="url(#goldGrad_${uid})" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M 9 124 Q 12 132 24 132 L 66 132 Q 86 132 92 121" stroke="#78350f" stroke-width="0.7" fill="none" opacity="0.6"/>
    </g>
  `;
}

function renderJackFigureSVG(suit, uid) {
  const emblem = getCourtEmblemSVG(suit.key || suit.name);

  return `
    <g>
      <!-- Warm Portrait Halo Behind Bust -->
      <ellipse cx="52" cy="70" rx="40" ry="54" fill="url(#auraGrad_${uid})"/>

      <clipPath id="jackClip_${uid}">
        <path d="M 4 0 L 96 0 L 96 116 Q 96 134 68 135 L 22 135 Q 6 135 6 118 Z"/>
      </clipPath>

      <g clip-path="url(#jackClip_${uid})">
        <!-- Cavalier Crimson Velvet Outer Cloak -->
        <path d="M 10 136 C 8 102, 13 72, 27 62 L 73 62 C 87 72, 92 102, 90 136 Z" fill="url(#mantleGrad_${uid})" stroke="#1e1b18" stroke-width="1.15"/>
        <path d="M 16 84 C 14 102, 15 118, 17 135" stroke="#450a0a" stroke-width="1.8" fill="none" opacity="0.7"/>
        <path d="M 84 84 C 86 102, 85 118, 83 135" stroke="#450a0a" stroke-width="1.8" fill="none" opacity="0.7"/>

        <!-- Puffed, Paned & Slashed Renaissance Sleeves -->
        <path d="M 27 64 C 13 68, 9 86, 15 106 L 31 100 Z" fill="url(#doubletGrad_${uid})" stroke="#111827" stroke-width="1.0"/>
        <path d="M 73 64 C 87 68, 91 86, 85 106 L 69 100 Z" fill="url(#doubletGrad_${uid})" stroke="#111827" stroke-width="1.0"/>
        <!-- Crimson & Gold Slashed Panes on Sleeves -->
        <ellipse cx="19" cy="82" rx="3.4" ry="8.5" fill="url(#mantleGrad_${uid})" stroke="url(#goldGrad_${uid})" stroke-width="0.85" transform="rotate(14 19 82)"/>
        <ellipse cx="81" cy="82" rx="3.4" ry="8.5" fill="url(#mantleGrad_${uid})" stroke="url(#goldGrad_${uid})" stroke-width="0.85" transform="rotate(-14 81 82)"/>

        <!-- Tailored Renaissance Doublet Chest with Chevron Braiding -->
        <path d="M 29 60 L 71 60 L 73 136 L 27 136 Z" fill="url(#doubletGrad_${uid})" stroke="#111827" stroke-width="1.1"/>
        <line x1="50" y1="60" x2="50" y2="135" stroke="url(#goldVert_${uid})" stroke-width="2.6"/>

        <!-- Bold White & Gold Chevron Laces Down Chest (Like Berliner Bild Bube) -->
        <g stroke="#ffffff" stroke-width="2.1" stroke-linecap="round">
          <path d="M 39 70 L 50 78 L 61 70"/>
          <path d="M 38 82 L 50 90 L 62 82"/>
          <path d="M 38 94 L 50 102 L 62 94"/>
          <path d="M 37 106 L 50 114 L 63 106"/>
          <path d="M 37 118 L 50 126 L 63 118"/>
        </g>
        <g fill="#fde047" stroke="#78350f" stroke-width="0.6">
          <circle cx="50" cy="78" r="1.7"/>
          <circle cx="50" cy="90" r="1.7"/>
          <circle cx="50" cy="102" r="1.7"/>
          <circle cx="50" cy="114" r="1.7"/>
          <circle cx="50" cy="126" r="1.7"/>
        </g>

        <!-- Diagonal Golden Baldric (Schulterwehrgehänge) Across Chest -->
        <path d="M 33 61 L 41 61 L 68 122 L 60 122 Z" fill="url(#goldGrad_${uid})" stroke="#451a03" stroke-width="0.9"/>
        <rect x="47" y="86" width="8" height="8" rx="1.3" fill="#fef08a" stroke="#78350f" stroke-width="0.8" transform="rotate(30 51 90)"/>

        <!-- Broad, Plush Golden-Brown Sable Fur Collar (Pelzschaube) -->
        <path d="M 20 62 C 25 59, 34 63, 37 135 L 23 135 C 20 108, 19 80, 20 62 Z" fill="#b45309" stroke="#451a03" stroke-width="1.05"/>
        <path d="M 80 62 C 75 59, 66 63, 63 135 L 77 135 C 80 108, 81 80, 80 62 Z" fill="#b45309" stroke="#451a03" stroke-width="1.05"/>
        <g stroke="#fde68a" stroke-width="0.85" stroke-linecap="round" opacity="0.8">
          <line x1="25" y1="72" x2="29" y2="77"/>
          <line x1="24" y1="86" x2="28" y2="91"/>
          <line x1="25" y1="100" x2="29" y2="105"/>
          <line x1="24" y1="114" x2="28" y2="119"/>
          <line x1="75" y1="72" x2="71" y2="77"/>
          <line x1="76" y1="86" x2="72" y2="91"/>
          <line x1="75" y1="100" x2="71" y2="105"/>
          <line x1="76" y1="114" x2="72" y2="119"/>
        </g>

        <!-- Crisp White Pointed Van Dyck Lace Collar -->
        <polygon points="34,54 49,66 42,53" fill="#ffffff" stroke="#94a3b8" stroke-width="0.9"/>
        <polygon points="66,54 51,66 58,53" fill="#ffffff" stroke="#94a3b8" stroke-width="0.9"/>

        <!-- Wavy Auburn-Chestnut Hair Locks -->
        <g fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.9">
          <path d="M 35 28 C 27 33, 26 46, 32 57 C 36 55, 38 46, 38 34 Z"/>
          <path d="M 65 28 C 73 33, 74 46, 68 57 C 64 55, 62 46, 62 34 Z"/>
        </g>
        <path d="M 31 36 C 29 42, 30 49, 33 54 M 69 36 C 71 42, 70 49, 67 54" stroke="#b45309" stroke-width="0.8" fill="none" opacity="0.75"/>

        <!-- Handsome Young Nobleman Head & Chiseled Jaw (3/4 Turn) -->
        <path d="M 37 24 C 37 40, 40.5 51, 50 55 C 59.5 51, 63 40, 63 24 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.85"/>
        <path d="M 39.5 36 C 39.5 43, 42 48, 45.5 51" stroke="#ea580c" stroke-width="1.4" fill="none" opacity="0.22" stroke-linecap="round"/>
        <path d="M 60.5 36 C 60.5 43, 58 48, 54.5 51" stroke="#ea580c" stroke-width="1.4" fill="none" opacity="0.22" stroke-linecap="round"/>
        <circle cx="42.5" cy="39.5" r="3.2" fill="#ea580c" opacity="0.15"/>
        <circle cx="57.5" cy="39.5" r="3.2" fill="#ea580c" opacity="0.15"/>

        <!-- Confident Almond Eyes & Brows -->
        <g>
          <path d="M 40.5 34.0 Q 44.2 31.8 47.6 34.0 Q 44.2 35.8 40.5 34.0 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.6"/>
          <circle cx="44.3" cy="33.9" r="1.5" fill="#1d4ed8"/>
          <circle cx="44.3" cy="33.9" r="0.7" fill="#0f172a"/>
          <circle cx="43.8" cy="33.4" r="0.42" fill="#ffffff"/>
          <path d="M 40.1 33.6 Q 44.2 31.3 48.0 33.8" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 39.8 30.8 L 48.0 30.0" stroke="#3b1806" stroke-width="1.4" stroke-linecap="round"/>

          <path d="M 52.4 34.0 Q 55.8 31.8 59.5 34.0 Q 55.8 35.8 52.4 34.0 Z" fill="#ffffff" stroke="#1e1b18" stroke-width="0.6"/>
          <circle cx="55.7" cy="33.9" r="1.5" fill="#1d4ed8"/>
          <circle cx="55.7" cy="33.9" r="0.7" fill="#0f172a"/>
          <circle cx="55.2" cy="33.4" r="0.42" fill="#ffffff"/>
          <path d="M 52.0 33.8 Q 55.8 31.3 59.9 33.6" stroke="#1e1b18" stroke-width="1.05" fill="none" stroke-linecap="round"/>
          <path d="M 52.0 30.0 L 60.2 30.8" stroke="#3b1806" stroke-width="1.4" stroke-linecap="round"/>
        </g>

        <!-- Sculpted Nose, Dashing Cavalier Mustache & Pointed Goatee -->
        <path d="M 49.5 31.0 L 49.0 40.2 Q 49.2 41.8 50.6 42.0" stroke="#9a3412" stroke-width="1.0" fill="none" stroke-linecap="round"/>
        <path d="M 50.5 32.0 L 50.2 39.8" stroke="#ffedd5" stroke-width="0.75" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M 45.8 46.2 Q 50 48.0 54.2 46.2" stroke="#be123c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- Upturned Cavalier Mustache -->
        <path d="M 41 44.5 C 44.5 46.8, 47.8 43.2, 50 44.5 C 52.2 43.2, 55.5 46.8, 59 44.5 C 56.8 47.6, 52.8 47.2, 50 45.8 C 47.2 47.2, 43.2 47.6, 41 44.5 Z" fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.65"/>
        <!-- Pointed Goatee (Spitzbart) -->
        <path d="M 47.5 49.2 L 50 55.2 L 52.5 49.2 Z" fill="url(#hairGrad_${uid})" stroke="#1c0a00" stroke-width="0.6"/>

        <!-- Jaunty Velvet Renaissance Beret & Sweeping White Ostrich Feather Plume -->
        <g>
          <ellipse cx="51" cy="18.5" rx="24.5" ry="7.8" fill="${suit.beretJ}" stroke="#111827" stroke-width="1.05" transform="rotate(-7 51 18.5)"/>
          <path d="M 30.5 21.5 Q 51 25 71 19" stroke="url(#goldGrad_${uid})" stroke-width="2.4" fill="none"/>
          <!-- Lush Sweeping Ostrich Plume -->
          <path d="M 32 21 C 21 12, 33 4.5, 50 5.5 C 64 6.5, 76 11.5, 76 16 C 67 13, 55 10.5, 43 11 C 34 11.5, 30 15.5, 32 21 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.95"/>
          <path d="M 36 12.5 Q 50 8.5 67 12.5" stroke="#cbd5e1" stroke-width="0.8" fill="none"/>
          <g stroke="#e2e8f0" stroke-width="0.75" stroke-linecap="round">
            <line x1="41" y1="9" x2="46" y2="7.5"/>
            <line x1="51" y1="8.5" x2="56" y2="7.8"/>
            <line x1="60" y1="10" x2="65" y2="9.2"/>
          </g>
          <!-- Jeweled Feather Brooch Clasp -->
          <circle cx="32.5" cy="20.5" r="2.8" fill="url(#goldGrad_${uid})" stroke="#451a03" stroke-width="0.7"/>
          <circle cx="32.5" cy="20.5" r="1.35" fill="#dc2626"/>
        </g>

        <!-- Viewer's Right: Gleaming Steel Halberd (Hellebarde) & Gloved/Cuffed Hand -->
        <g>
          <!-- Ash Wood Pole Shaft -->
          <line x1="78" y1="10" x2="74" y2="136" stroke="#451a03" stroke-width="3.4" stroke-linecap="round"/>
          <line x1="77.5" y1="10" x2="73.5" y2="136" stroke="#9a3412" stroke-width="1.2" stroke-linecap="round"/>
          <!-- Gleaming Steel Halberd Blade, Spear Point & Fluke -->
          <polygon points="78,2 81,14 75,14" fill="url(#steelGrad_${uid})" stroke="#1e293b" stroke-width="0.85"/>
          <path d="M 78,13 C 89,15 90,29 81.5,33 C 84,26 82.8,20.5 78,23.5 Z" fill="url(#steelGrad_${uid})" stroke="#1e293b" stroke-width="0.9"/>
          <path d="M 80,16.5 C 86,18 86.5,26.5 82,29.5" stroke="#ffffff" stroke-width="0.75" fill="none"/>
          <path d="M 78,15 L 70,18 L 78,21.5 Z" fill="url(#steelGrad_${uid})" stroke="#1e293b" stroke-width="0.85"/>
          <!-- Crimson & Gold Tassel Below Blade -->
          <path d="M 75 26.5 L 80.5 26.5 L 81.5 32 L 74 32 Z" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.6"/>

          <!-- Lace Cuff & Sculpted Hand Gripping Shaft -->
          <path d="M 71 95 L 83 98.5 L 81 105 L 69 101 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <path d="M 71.5 85 C 71 82.5, 74 80.5, 77.5 81.5 L 82 83.5 C 84 85, 83.5 92, 80.5 93.5 L 73.5 92.5 C 71 91, 71 87.5, 71.5 85 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.8"/>
          <path d="M 74 84.2 L 81 85.2 M 73.8 87.2 L 81 88.2 M 73.6 90.0 L 80 90.8" stroke="#9a3412" stroke-width="0.65" stroke-linecap="round"/>
        </g>

        <!-- Viewer's Left: Ornate Sword Hilt & Hand Presenting Large Suit Beverage -->
        <g>
          <!-- Golden Rapier Sword Hilt Below Hand -->
          <path d="M 18 110 Q 24 106 29 114 Q 29 123 23 125 Q 17 122 18 110 Z" fill="none" stroke="url(#goldGrad_${uid})" stroke-width="1.8"/>
          <circle cx="20.5" cy="107.5" r="2.6" fill="url(#goldGrad_${uid})" stroke="#451a03" stroke-width="0.7"/>

          <!-- Lace Cuff & Sculpted Hand Holding Suit Drink -->
          <path d="M 17 95.5 L 30 92 L 31.5 97.5 L 18.5 101 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="0.7"/>
          <path d="M 18.5 88 C 20 84.5, 29.5 84.5, 31 88 C 31.8 92, 28.5 94.5, 23.5 94 C 19.5 93.5, 17.8 91, 18.5 88 Z" fill="url(#skinGrad_${uid})" stroke="#9a3412" stroke-width="0.8"/>
          <path d="M 21 88 L 29 87.8 M 21 90.8 L 29 90.5" stroke="#9a3412" stroke-width="0.65" stroke-linecap="round"/>
          <!-- Golden Coaster Under Vessel -->
          <ellipse cx="25.5" cy="84.8" rx="9" ry="2.3" fill="url(#goldGrad_${uid})" stroke="#78350f" stroke-width="0.8"/>
          <!-- Large Prominent Suit Drink -->
          <g transform="translate(25.5, 72.2)">
            ${emblem}
          </g>
        </g>
      </g>

      <!-- Ornate Curved Gold Portrait Base Trim -->
      <path d="M 6 118 Q 6 135 22 135 L 68 135 Q 96 134 96 116" stroke="url(#goldGrad_${uid})" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M 9 124 Q 12 132 24 132 L 66 132 Q 86 132 92 121" stroke="#78350f" stroke-width="0.7" fill="none" opacity="0.6"/>
    </g>
  `;
}

function getCourtCardSVG(rankValue, suitKey) {
  const suit = COURT_SUIT_THEMES[suitKey] || COURT_SUIT_THEMES.clubs;
  const uid = Math.random().toString(36).substr(2, 6);

  let figureContent = '';
  if (rankValue === 13) {
    figureContent = renderKingFigureSVG(suit, uid);
  } else if (rankValue === 12) {
    figureContent = renderQueenFigureSVG(suit, uid);
  } else {
    figureContent = renderJackFigureSVG(suit, uid);
  }

  return `
    <svg class="court-svg" viewBox="0 0 100 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="auraGrad_${uid}" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.55"/>
          <stop offset="65%" stop-color="#fde68a" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="goldGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="30%" stop-color="#f59e0b"/>
          <stop offset="65%" stop-color="#b45309"/>
          <stop offset="85%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="goldVert_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#b45309"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <linearGradient id="skinGrad_${uid}" x1="30%" y1="15%" x2="80%" y2="90%">
          <stop offset="0%" stop-color="#ffedd5"/>
          <stop offset="60%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#fdba74"/>
        </linearGradient>
        <linearGradient id="skinQueen_${uid}" x1="30%" y1="15%" x2="80%" y2="90%">
          <stop offset="0%" stop-color="#fff1f2"/>
          <stop offset="65%" stop-color="#ffe4e6"/>
          <stop offset="100%" stop-color="#fecdd3"/>
        </linearGradient>
        <linearGradient id="hairGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="50%" stop-color="#451a03"/>
          <stop offset="100%" stop-color="#1c0a00"/>
        </linearGradient>
        <linearGradient id="ermineGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="steelGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="45%" stop-color="#94a3b8"/>
          <stop offset="75%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="mantleGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stop-color="${suit.mantleKDark}"/>
          <stop offset="25%" stop-color="${suit.mantleK}"/>
          <stop offset="75%" stop-color="${suit.mantleK}"/>
          <stop offset="100%" stop-color="${suit.mantleKDark}"/>
        </linearGradient>
        <linearGradient id="tunicGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${suit.tunicKDark}"/>
          <stop offset="30%" stop-color="${suit.tunicK}"/>
          <stop offset="70%" stop-color="${suit.tunicK}"/>
          <stop offset="100%" stop-color="${suit.tunicKDark}"/>
        </linearGradient>
        <linearGradient id="bodiceGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${suit.bodiceQDark}"/>
          <stop offset="30%" stop-color="${suit.bodiceQ}"/>
          <stop offset="70%" stop-color="${suit.bodiceQ}"/>
          <stop offset="100%" stop-color="${suit.bodiceQDark}"/>
        </linearGradient>
        <linearGradient id="doubletGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${suit.doubletJDark}"/>
          <stop offset="30%" stop-color="${suit.doubletJ}"/>
          <stop offset="70%" stop-color="${suit.doubletJ}"/>
          <stop offset="100%" stop-color="${suit.doubletJDark}"/>
        </linearGradient>
      </defs>
      ${figureContent}
    </svg>
  `;
}

// --- Traditional Irish Pub Folk Background Music Playlist Player ---
// Features 4 acoustic Irish Pub Folk tavern session tracks (Guitars, Fiddles, Whistle, Bodhrán, Mandolin)
const IRISH_FOLK_PLAYLIST = [
  { id: 1, title: 'Irish Pub Folk - Track 1', file: 'music/irish_folk_1.mp3' },
  { id: 2, title: 'Irish Pub Folk - Track 2', file: 'music/irish_folk_2.mp3' },
  { id: 3, title: 'Irish Pub Folk - Track 3', file: 'music/irish_folk_3.mp3' },
  { id: 4, title: 'Irish Pub Folk - Track 4', file: 'music/irish_folk_4.mp3' }
];

class IrishFolkMusicPlayer {
  constructor() {
    this.playlist = IRISH_FOLK_PLAYLIST;
    this.currentIndex = 0;
    this.trackChangeCallbacks = [];

    this.audio = document.getElementById('bg-music');
    if (!this.audio) {
      this.audio = new Audio(this.playlist[0].file);
      this.audio.id = 'bg-music';
      document.body.appendChild(this.audio);
    }
    this.audio.loop = false; // Must be false so 'ended' event fires to advance playlist
    this.audio.preload = 'auto';
    this.baseVolume = 0.20; // Raised by ~25% so 80% slider provides desired tavern presence
    const storedVol = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    this.volumePercent = storedVol !== null ? parseInt(storedVol, 10) : 80;
    this.audio.volume = this.effectiveVolume;
    this.duckTimeout = null;
    this.wasPlayingBeforeHide = false;

    // Ensure audio src points to playlist
    if (!this.audio.src || this.audio.src.indexOf('irish_folk.mp3') !== -1) {
      this.audio.src = this.playlist[0].file;
    }

    // Advance to next track when current one finishes
    this.audio.addEventListener('ended', () => {
      this.nextTrack(true);
    });

    // Error handling: if a track fails to load, gracefully advance to next
    this.audio.addEventListener('error', (err) => {
      console.warn('Music playback error on track ' + (this.currentIndex + 1) + ', advancing:', err);
      setTimeout(() => {
        if (this.isPlaying || localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED) !== 'false') {
          this.nextTrack(true);
        }
      }, 1000);
    });
  }

  get effectiveVolume() {
    return Math.min(1.0, Math.max(0.0, this.baseVolume * (this.volumePercent / 80)));
  }

  get isPlaying() {
    return !!(this.audio && !this.audio.paused && !this.audio.ended);
  }

  getCurrentTrack() {
    return {
      ...this.playlist[this.currentIndex],
      index: this.currentIndex,
      total: this.playlist.length
    };
  }

  onTrackChange(cb) {
    if (typeof cb === 'function') {
      this.trackChangeCallbacks.push(cb);
      cb(this.getCurrentTrack());
    }
  }

  notifyTrackChange() {
    const info = this.getCurrentTrack();
    this.trackChangeCallbacks.forEach(cb => {
      try { cb(info); } catch (e) { console.error(e); }
    });
  }

  setVolume(percent) {
    this.volumePercent = Math.min(100, Math.max(0, parseInt(percent, 10) || 0));
    if (this.audio) {
      this.audio.volume = this.effectiveVolume;
    }
  }

  loadTrack(index, autoplay = false) {
    this.currentIndex = ((index % this.playlist.length) + this.playlist.length) % this.playlist.length;
    const track = this.playlist[this.currentIndex];
    if (this.audio) {
      const wasPlaying = this.isPlaying;
      this.audio.src = track.file;
      this.audio.volume = this.effectiveVolume;
      this.notifyTrackChange();
      if (autoplay || wasPlaying) {
        this.start();
      }
    }
  }

  nextTrack(autoplay = true) {
    this.loadTrack(this.currentIndex + 1, autoplay);
  }

  prevTrack(autoplay = true) {
    this.loadTrack(this.currentIndex - 1, autoplay);
  }

  start() {
    if (!this.audio) return;
    this.audio.volume = this.effectiveVolume;
    if (this.audio.paused) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Background music awaiting user gesture:', err);
        });
      }
    }
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
  }

  duck(targetGain = 0.025, durationSec = 3.2) {
    if (!this.audio) return;
    clearTimeout(this.duckTimeout);
    const duckedLevel = Math.max(0.005, targetGain * (this.volumePercent / 80));
    this.audio.volume = duckedLevel;
    this.duckTimeout = setTimeout(() => {
      if (this.audio) {
        this.audio.volume = this.effectiveVolume;
      }
    }, durationSec * 1000);
  }

  pauseOnHide() {
    if (this.isPlaying) {
      this.wasPlayingBeforeHide = true;
      this.audio.pause();
    } else {
      this.wasPlayingBeforeHide = false;
    }
  }

  resumeOnShow() {
    if (this.wasPlayingBeforeHide) {
      this.start();
      this.wasPlayingBeforeHide = false;
    }
  }
}

// --- Sound Manager with Real Studio Foley Audio Assets & Multi-channel Volume Controls ---
// Audio Channels:
// - Background Music: Irish Folk tavern acoustic session
// - Card Sounds: Flip / Draw, Place / Snap, and Shove / Sweep (CC0: Kenney Casino)
// - Drinking Sounds: Real human sip & swallow with natural pitch/tempo variations (CC0: OwlStorm)
// - Victory Sound: Authentic heavy brass/orchestral fanfare (CC0: CynicMusic)
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.music = null;
    this.audioBuffers = {};
    this.audioElements = {};
    this.isPreloaded = false;

    // Music channel
    this.musicEnabled = localStorage.getItem(STORAGE_KEYS.MUSIC_ENABLED) !== 'false';
    const storedMusicVol = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    this.musicVolume = storedMusicVol !== null ? parseInt(storedMusicVol, 10) : 80;

    // Card sounds channel (flip, place, sweep)
    this.soundCardsEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_CARDS_ENABLED) !== 'false';
    const storedCardsVol = localStorage.getItem(STORAGE_KEYS.SOUND_CARDS_VOLUME);
    this.soundCardsVolume = storedCardsVol !== null ? parseInt(storedCardsVol, 10) : 80;

    // Drinking sounds channel (foundation sip / swallow)
    this.soundDrinksEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_DRINKS_ENABLED) !== 'false';
    const storedDrinksVol = localStorage.getItem(STORAGE_KEYS.SOUND_DRINKS_VOLUME);
    this.soundDrinksVolume = storedDrinksVol !== null ? parseInt(storedDrinksVol, 10) : 80;

    // Victory sound channel (fanfare)
    this.soundVictoryEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_VICTORY_ENABLED) !== 'false';
    const storedVictoryVol = localStorage.getItem(STORAGE_KEYS.SOUND_VICTORY_VOLUME);
    this.soundVictoryVolume = storedVictoryVol !== null ? parseInt(storedVictoryVol, 10) : 80;

    this.soundPaths = {
      flip: [
        'sounds/card-flip-1.ogg',
        'sounds/card-flip-2.ogg',
        'sounds/card-flip-3.ogg',
        'sounds/card-flip-4.ogg'
      ],
      place: [
        'sounds/card-place-1.ogg',
        'sounds/card-place-2.ogg',
        'sounds/card-place-3.ogg',
        'sounds/card-place-4.ogg'
      ],
      foundation: [
        'sounds/drink-1.wav',
        'sounds/drink-2.wav',
        'sounds/drink-3.wav',
        'sounds/drink-4.wav',
        'sounds/drink-5.wav'
      ],
      sweep: [
        'sounds/card-shove.ogg'
      ],
      victory: [
        'sounds/victory.mp3'
      ]
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.music) {
      this.music = new IrishFolkMusicPlayer();
      this.music.setVolume(this.musicVolume);
    }
    this.preloadSounds();
  }

  preloadSounds() {
    if (this.isPreloaded) return;
    this.isPreloaded = true;

    // Preload both Web Audio API buffers (for zero-latency multi-playback)
    // and HTML5 Audio elements as an instant fallback
    const allPaths = Object.values(this.soundPaths).flat();
    allPaths.forEach(path => {
      // 1. HTML5 audio element cache
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = path;
        this.audioElements[path] = audio;
      } catch (e) {}

      // 2. Web Audio decoded buffer cache
      if (this.ctx && window.fetch) {
        fetch(path)
          .then(res => res.arrayBuffer())
          .then(ab => this.ctx.decodeAudioData(ab))
          .then(decoded => {
            this.audioBuffers[path] = decoded;
          })
          .catch(() => {
            // Audio elements will serve as fallback
          });
      }
    });
  }

  setMusicEnabled(enabled) {
    this.init();
    this.musicEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.MUSIC_ENABLED, this.musicEnabled ? 'true' : 'false');
    if (this.music) {
      if (this.musicEnabled) {
        this.music.start();
      } else {
        this.music.stop();
      }
    }
    return this.musicEnabled;
  }

  setMusicVolume(volumePercent) {
    this.musicVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, this.musicVolume.toString());
    if (this.music) {
      this.music.setVolume(this.musicVolume);
    }
  }

  setSoundCardsEnabled(enabled) {
    this.soundCardsEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_CARDS_ENABLED, this.soundCardsEnabled ? 'true' : 'false');
    return this.soundCardsEnabled;
  }

  setSoundCardsVolume(volumePercent) {
    this.soundCardsVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_CARDS_VOLUME, this.soundCardsVolume.toString());
  }

  setSoundDrinksEnabled(enabled) {
    this.soundDrinksEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_DRINKS_ENABLED, this.soundDrinksEnabled ? 'true' : 'false');
    return this.soundDrinksEnabled;
  }

  setSoundDrinksVolume(volumePercent) {
    this.soundDrinksVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_DRINKS_VOLUME, this.soundDrinksVolume.toString());
  }

  setSoundVictoryEnabled(enabled) {
    this.soundVictoryEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_VICTORY_ENABLED, this.soundVictoryEnabled ? 'true' : 'false');
    return this.soundVictoryEnabled;
  }

  setSoundVictoryVolume(volumePercent) {
    this.soundVictoryVolume = Math.min(100, Math.max(0, parseInt(volumePercent, 10) || 0));
    localStorage.setItem(STORAGE_KEYS.SOUND_VICTORY_VOLUME, this.soundVictoryVolume.toString());
  }

  startMusic() {
    this.init();
    if (this.music && this.musicEnabled && !this.music.isPlaying) {
      this.music.start();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  toggleMusic() {
    return this.setMusicEnabled(!this.musicEnabled);
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  isPlayingMusic() {
    return !!(this.music && this.music.isPlaying);
  }

  nextMusicTrack() {
    this.init();
    if (this.music && typeof this.music.nextTrack === 'function') {
      this.music.nextTrack(this.musicEnabled);
    }
  }

  getCurrentMusicTrack() {
    if (this.music && typeof this.music.getCurrentTrack === 'function') {
      return this.music.getCurrentTrack();
    }
    return null;
  }

  // Generic sound player that tries Web Audio buffer first, falling back to HTML5 Audio
  playSound(category, volume = 0.6, pitchVariation = 0.04) {
    if (!this.enabled) return;
    this.init();

    const list = this.soundPaths[category];
    if (!list || list.length === 0) return;
    const path = list[Math.floor(Math.random() * list.length)];

    // Primary: Web Audio API BufferSource (zero-latency, overlapping, pitch-varied)
    const buf = this.audioBuffers[path];
    if (buf && this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buf;
        if (pitchVariation > 0) {
          source.playbackRate.value = 1.0 + (Math.random() * 2 - 1) * pitchVariation;
        }
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start();
        return;
      } catch (e) {
        // Fallback below
      }
    }

    // Secondary: HTML5 Audio clone fallback
    try {
      const audioEl = this.audioElements[path] ? this.audioElements[path].cloneNode() : new Audio(path);
      audioEl.volume = Math.min(1.0, Math.max(0.0, volume));
      audioEl.play().catch(() => {});
    } catch (e) {}
  }

  // Real card flip / draw sound
  playFlip() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.42 * (this.soundCardsVolume / 80));
    this.playSound('flip', vol, 0.05);
  }

  // Real card place / snap onto tableau or stack
  playPlace() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.48 * (this.soundCardsVolume / 80));
    this.playSound('place', vol, 0.04);
  }

  // Real sip / drink / gulp sound when moving card to foundation (drinking the shot)
  // Reduced by 5 dB from 1.20 (0.675 at baseline 80% volume)
  playFoundation() {
    if (!this.soundDrinksEnabled) return;
    const vol = Math.min(1.0, 0.675 * (this.soundDrinksVolume / 80));
    this.playSound('foundation', vol, 0.04);
  }

  // Real card sweep / shove sound
  playSweep() {
    if (!this.soundCardsEnabled) return;
    const vol = Math.min(1.0, 0.55 * (this.soundCardsVolume / 80));
    this.playSound('sweep', vol, 0.04);
  }

  // Real victory fanfare celebration
  playVictory() {
    if (!this.soundVictoryEnabled || !this.enabled) return;
    this.init();
    if (this.music) {
      // Duck Irish Folk background music during victory fanfare
      this.music.duck(0.02, 10.0);
    }
    const vol = Math.min(1.0, 0.85 * (this.soundVictoryVolume / 80));
    this.playSound('victory', vol, 0.0);
  }
}

// --- Confetti / Fireworks Particle System ---
class CelebrationFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.particles = [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
    for (let i = 0; i < 180; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1,
        decay: Math.random() * 0.008 + 0.004
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let alive = 0;
    this.particles.forEach(p => {
      if (p.life > 0) {
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        this.ctx.restore();
      }
    });

    if (alive > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// --- Solvable Deal Generator & Fast Solver ---
class SolvableDealGenerator {
  constructor() {
    this.curatedDeals = [
      [
        0, 14, 28, 42, 1, 15, 29, 43, 2, 16, 30, 44, 3, 17, 31, 45, 4, 18, 32, 46, 5, 19, 33, 47, 6, 20, 34, 48,
        7, 21, 35, 49, 8, 22, 36, 50, 9, 23, 37, 51, 10, 24, 38, 11, 25, 39, 12, 26, 40, 13, 27, 41
      ],
      [
        12, 25, 38, 51, 11, 24, 37, 50, 10, 23, 36, 49, 9, 22, 35, 48, 8, 21, 34, 47, 7, 20, 33, 46, 6, 19, 32, 45,
        0, 13, 26, 39, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44
      ],
      [
        26, 1, 39, 14, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44, 6, 19, 32, 45, 7, 20, 33, 46,
        8, 21, 34, 47, 9, 22, 35, 48, 10, 23, 36, 49, 11, 24, 37, 50, 12, 25, 38, 51, 0, 13, 27, 40
      ],
      [
        13, 27, 41, 2, 16, 30, 44, 3, 17, 31, 45, 4, 18, 32, 46, 5, 19, 33, 47, 6, 20, 34, 48, 7, 21, 35, 49, 8,
        22, 36, 50, 9, 23, 37, 51, 10, 24, 38, 11, 25, 39, 12, 26, 40, 0, 14, 28, 42, 1, 15, 29, 43
      ],
      [
        39, 13, 0, 26, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44, 6, 19, 32, 45,
        7, 20, 33, 46, 8, 21, 34, 47, 9, 22, 35, 48, 10, 23, 36, 49, 11, 24, 37, 50, 12, 25, 38, 51
      ],
      [
        51, 38, 25, 12, 50, 37, 24, 11, 49, 36, 23, 10, 48, 35, 22, 9, 47, 34, 21, 8, 46, 33, 20, 7, 45, 32, 19, 6,
        0, 13, 26, 39, 1, 14, 27, 40, 2, 15, 28, 41, 3, 16, 29, 42, 4, 17, 30, 43, 5, 18, 31, 44
      ],
      [
        12, 11, 10, 9, 8, 7, 6, 25, 24, 23, 22, 21, 20, 19, 38, 37, 36, 35, 34, 33, 32, 51, 50, 49, 48, 47, 46, 45,
        0, 1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 31, 39, 40, 41, 42, 43, 44
      ],
      [
        0, 26, 13, 39, 1, 27, 14, 40, 2, 28, 15, 41, 3, 29, 16, 42, 4, 30, 17, 43, 5, 31, 18, 44, 6, 32, 19, 45,
        7, 33, 20, 46, 8, 34, 21, 47, 9, 35, 22, 48, 10, 36, 23, 49, 11, 37, 24, 50, 12, 38, 25, 51
      ]
    ];
  }

  permuteDeck(deckIndices) {
    const swapBlack = Math.random() > 0.5;
    const swapGreen = Math.random() > 0.5;
    const swapColors = Math.random() > 0.5;

    let suitMap = [0, 1, 2, 3];
    if (swapBlack) [suitMap[0], suitMap[1]] = [suitMap[1], suitMap[0]];
    if (swapGreen) [suitMap[2], suitMap[3]] = [suitMap[3], suitMap[2]];
    if (swapColors) {
      suitMap = [suitMap[2], suitMap[3], suitMap[0], suitMap[1]];
    }

    return deckIndices.map(cardIdx => {
      const origSuit = Math.floor(cardIdx / 13);
      const rank = cardIdx % 13;
      const newSuit = suitMap[origSuit];
      return newSuit * 13 + rank;
    });
  }

  isSolvable(rawCards, drawMode = 1) {
    const foundations = [0, 0, 0, 0];
    const tableau = [[], [], [], [], [], [], []];
    let cardIdx = 0;

    for (let c = 0; c < 7; c++) {
      for (let r = 0; r <= c; r++) {
        const id = rawCards[cardIdx++];
        tableau[c].push({
          suit: Math.floor(id / 13),
          rank: (id % 13) + 1,
          color: Math.floor(id / 13) < 2 ? 'dark' : 'light',
          faceUp: r === c
        });
      }
    }

    const stock = [];
    while (cardIdx < rawCards.length) {
      const id = rawCards[cardIdx++];
      stock.push({
        suit: Math.floor(id / 13),
        rank: (id % 13) + 1,
        color: Math.floor(id / 13) < 2 ? 'dark' : 'light',
        faceUp: false
      });
    }

    let waste = [];
    let passes = 0;
    let maxSteps = 450;

    while (maxSteps-- > 0) {
      if (foundations.reduce((a, b) => a + b, 0) === 52) return true;

      let moved = false;

      // 1. Safe foundation moves
      for (let c = 0; c < 7; c++) {
        const col = tableau[c];
        if (col.length > 0) {
          const top = col[col.length - 1];
          if (top.faceUp && this.canAutoFoundation(top, foundations)) {
            foundations[top.suit]++;
            col.pop();
            if (col.length > 0) col[col.length - 1].faceUp = true;
            moved = true;
            break;
          }
        }
      }
      if (moved) continue;

      if (waste.length > 0) {
        const top = waste[waste.length - 1];
        if (this.canAutoFoundation(top, foundations)) {
          foundations[top.suit]++;
          waste.pop();
          moved = true;
          continue;
        }
      }

      // 2. Uncover face-down cards
      for (let src = 0; src < 7; src++) {
        const srcCol = tableau[src];
        const firstUp = srcCol.findIndex(k => k.faceUp);
        if (firstUp > 0) {
          const moving = srcCol[firstUp];
          for (let dst = 0; dst < 7; dst++) {
            if (dst === src) continue;
            const dstCol = tableau[dst];
            if (dstCol.length === 0) {
              if (moving.rank === 13) {
                tableau[dst].push(...srcCol.splice(firstUp));
                if (srcCol.length > 0) srcCol[srcCol.length - 1].faceUp = true;
                moved = true;
                break;
              }
            } else {
              const target = dstCol[dstCol.length - 1];
              if (target.faceUp && moving.color !== target.color && moving.rank === target.rank - 1) {
                tableau[dst].push(...srcCol.splice(firstUp));
                if (srcCol.length > 0) srcCol[srcCol.length - 1].faceUp = true;
                moved = true;
                break;
              }
            }
          }
        }
        if (moved) break;
      }
      if (moved) continue;

      // 3. Waste to tableau
      if (waste.length > 0) {
        const topWaste = waste[waste.length - 1];
        for (let dst = 0; dst < 7; dst++) {
          const dstCol = tableau[dst];
          if (dstCol.length === 0) {
            if (topWaste.rank === 13) {
              tableau[dst].push(waste.pop());
              moved = true;
              break;
            }
          } else {
            const target = dstCol[dstCol.length - 1];
            if (target.faceUp && topWaste.color !== target.color && topWaste.rank === target.rank - 1) {
              tableau[dst].push(waste.pop());
              moved = true;
              break;
            }
          }
        }
      }
      if (moved) continue;

      // 4. Draw from stock
      if (stock.length > 0) {
        const count = Math.min(drawMode, stock.length);
        for (let i = 0; i < count; i++) {
          const card = stock.pop();
          card.faceUp = true;
          waste.push(card);
        }
        moved = true;
      } else if (waste.length > 0 && passes < 3) {
        passes++;
        while (waste.length > 0) {
          const card = waste.pop();
          card.faceUp = false;
          stock.push(card);
        }
        moved = true;
      }

      if (!moved) break;
    }

    return foundations.reduce((a, b) => a + b, 0) >= 42;
  }

  canAutoFoundation(card, foundations) {
    if (foundations[card.suit] !== card.rank - 1) return false;
    if (card.rank <= 2) return true;
    const opp1 = card.suit < 2 ? 2 : 0;
    const opp2 = card.suit < 2 ? 3 : 1;
    return foundations[opp1] >= card.rank - 2 && foundations[opp2] >= card.rank - 2;
  }

  createSmartCandidate() {
    const deck = Array.from({ length: 52 }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const faceUpIndices = [0, 2, 5, 9, 14, 20, 27];
    const aceIndices = deck.map((c, i) => (c % 13 === 0 ? i : -1)).filter(i => i >= 0);

    aceIndices.forEach((pos, idx) => {
      if (pos > 20 && pos < 28 && idx < 2) {
        const targetPos = faceUpIndices[idx % faceUpIndices.length];
        [deck[pos], deck[targetPos]] = [deck[targetPos], deck[pos]];
      }
    });

    return deck;
  }

  getGuaranteedDeal(drawMode) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate = this.createSmartCandidate();
      if (this.isSolvable(candidate, drawMode)) {
        return candidate;
      }
    }

    const template = this.curatedDeals[Math.floor(Math.random() * this.curatedDeals.length)];
    return this.permuteDeck(template);
  }
}

// --- Main Solitaire Game Engine ---
class SolitaireGame {
  constructor() {
    this.drawMode = parseInt(localStorage.getItem(STORAGE_KEYS.DRAW_MODE) || '1', 10);
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    const storedFelt = localStorage.getItem(STORAGE_KEYS.FELT_THEME);
    this.feltTheme = urlTheme || (storedFelt && storedFelt !== 'emerald' ? storedFelt : 'oak');
    this.dealType = localStorage.getItem(STORAGE_KEYS.DEAL_TYPE) || 'random';
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    this.lang = urlLang || localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'de';

    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = [[], [], [], [], [], [], []];

    this.initialDealState = null;
    this.score = 0;
    this.moves = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.gameWon = false;
    this.autoFinishing = false;

    this.history = [];
    this.selected = null;
    this.dragData = null;
    this.pointerDragState = null;
    this.lastCardClick = null;
    this.justFinishedDrag = false;
    this.currentScoreTab = this.drawMode === 3 ? 'draw3' : 'draw1';
    this.currentDeviceFilter = 'all';
    this.globalScoresCache = { draw1: null, draw3: null };
    this.isLoadingScores = false;

    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.sound = new SoundManager();
    this.celebration = new CelebrationFX(document.getElementById('fireworks-canvas'));
    this.dealGenerator = new SolvableDealGenerator();

    this.initDOM();
    this.applyTheme(this.feltTheme);
    this.updateDealBadge();
    this.initEvents();
    this.startNewGame();
  }

  initDOM() {
    this.dom = {
      score: document.getElementById('score-val'),
      moves: document.getElementById('moves-val'),
      timer: document.getElementById('timer-val'),
      stock: document.getElementById('stock-pile'),
      waste: document.getElementById('waste-pile'),
      selectDraw: document.getElementById('select-draw-mode'),
      selectFelt: document.getElementById('select-felt-theme'),
      selectDeal: document.getElementById('select-deal-type'),
      selectLanguage: document.getElementById('select-language'),
      dealBadge: document.getElementById('deal-badge'),
      gameToast: document.getElementById('game-toast'),
      btnAutocomplete: document.getElementById('btn-autocomplete'),
      btnSweep: document.getElementById('btn-sweep'),
      tableFelt: document.querySelector('.table-felt'),
      btnReplay: document.getElementById('btn-replay'),
      foundations: [
        document.getElementById('foundation-0'),
        document.getElementById('foundation-1'),
        document.getElementById('foundation-2'),
        document.getElementById('foundation-3')
      ],
      tableau: [
        document.getElementById('tableau-0'),
        document.getElementById('tableau-1'),
        document.getElementById('tableau-2'),
        document.getElementById('tableau-3'),
        document.getElementById('tableau-4'),
        document.getElementById('tableau-5'),
        document.getElementById('tableau-6')
      ],
      btnNew: document.getElementById('btn-new'),
      btnUndo: document.getElementById('btn-undo'),
      btnHint: document.getElementById('btn-hint'),
      btnSettings: document.getElementById('btn-settings'),
      settingsModal: document.getElementById('settings-modal'),
      btnCloseSettings: document.getElementById('btn-close-settings'),
      btnSettingsX: document.getElementById('btn-settings-x'),
      toggleMusic: document.getElementById('toggle-music'),
      sliderMusic: document.getElementById('slider-music'),
      valMusic: document.getElementById('val-music'),
      btnNextTrack: document.getElementById('btn-next-track'),
      audioTrackTitle: document.getElementById('audio-track-title'),
      toggleSoundCards: document.getElementById('toggle-sound-cards'),
      sliderSoundCards: document.getElementById('slider-sound-cards'),
      valSoundCards: document.getElementById('val-sound-cards'),
      toggleSoundDrinks: document.getElementById('toggle-sound-drinks'),
      sliderSoundDrinks: document.getElementById('slider-sound-drinks'),
      valSoundDrinks: document.getElementById('val-sound-drinks'),
      toggleSoundVictory: document.getElementById('toggle-sound-victory'),
      sliderSoundVictory: document.getElementById('slider-sound-victory'),
      valSoundVictory: document.getElementById('val-sound-victory'),
      btnScores: document.getElementById('btn-scores'),
      winModal: document.getElementById('win-modal'),
      btnWinReplay: document.getElementById('btn-win-replay'),
      btnWinScores: document.getElementById('btn-win-scores'),
      winDealType: document.getElementById('win-deal-type'),
      winMode: document.getElementById('win-mode'),
      winTime: document.getElementById('win-time'),
      winMoves: document.getElementById('win-moves'),
      winScore: document.getElementById('win-score'),
      winNameInput: document.getElementById('win-name-input'),
      winNameBox: document.getElementById('win-name-box'),
      winSolvableNote: document.getElementById('win-solvable-note'),
      btnSaveScore: document.getElementById('btn-save-score'),
      winSaveMsg: document.getElementById('win-save-msg'),
      scoresModal: document.getElementById('scores-modal'),
      scoresTbody: document.getElementById('scores-tbody'),
      btnCloseScores: document.getElementById('btn-close-scores'),
      tabDraw1: document.getElementById('tab-draw1'),
      tabDraw3: document.getElementById('tab-draw3'),
      filterDeviceAll: document.getElementById('filter-device-all'),
      filterDeviceDesktop: document.getElementById('filter-device-desktop'),
      filterDeviceMobile: document.getElementById('filter-device-mobile'),
      btnRefreshScores: document.getElementById('btn-refresh-scores')
    };

    if (this.dom.selectDraw) this.dom.selectDraw.value = this.drawMode.toString();
    if (this.dom.selectFelt) this.dom.selectFelt.value = this.feltTheme;
    if (this.dom.selectDeal) this.dom.selectDeal.value = this.dealType;
    if (this.dom.selectLanguage) this.dom.selectLanguage.value = this.lang;
    this.syncSettingsUI();
    this.updateUIText();
  }

  openSettingsModal() {
    if (!this.dom.settingsModal) return;
    this.syncSettingsUI();
    this.dom.settingsModal.classList.remove('hidden');
  }

  closeSettingsModal() {
    if (!this.dom.settingsModal) return;
    this.dom.settingsModal.classList.add('hidden');
  }

  syncSettingsUI() {
    if (this.dom.toggleMusic) this.dom.toggleMusic.checked = this.sound.musicEnabled;
    if (this.dom.sliderMusic) this.dom.sliderMusic.value = this.sound.musicVolume;
    if (this.dom.valMusic) this.dom.valMusic.textContent = this.sound.musicVolume + '%';
    if (this.dom.audioTrackTitle && this.sound) {
      const track = this.sound.getCurrentMusicTrack();
      if (track) {
        this.dom.audioTrackTitle.textContent = `Titel: ${track.title} (${track.index + 1}/${track.total})`;
      }
    }

    if (this.dom.toggleSoundCards) this.dom.toggleSoundCards.checked = this.sound.soundCardsEnabled;
    if (this.dom.sliderSoundCards) this.dom.sliderSoundCards.value = this.sound.soundCardsVolume;
    if (this.dom.valSoundCards) this.dom.valSoundCards.textContent = this.sound.soundCardsVolume + '%';

    if (this.dom.toggleSoundDrinks) this.dom.toggleSoundDrinks.checked = this.sound.soundDrinksEnabled;
    if (this.dom.sliderSoundDrinks) this.dom.sliderSoundDrinks.value = this.sound.soundDrinksVolume;
    if (this.dom.valSoundDrinks) this.dom.valSoundDrinks.textContent = this.sound.soundDrinksVolume + '%';

    if (this.dom.toggleSoundVictory) this.dom.toggleSoundVictory.checked = this.sound.soundVictoryEnabled;
    if (this.dom.sliderSoundVictory) this.dom.sliderSoundVictory.value = this.sound.soundVictoryVolume;
    if (this.dom.valSoundVictory) this.dom.valSoundVictory.textContent = this.sound.soundVictoryVolume + '%';

    this.updateAudioRowMuteClasses();
  }

  updateAudioRowMuteClasses() {
    const musicRow = this.dom.toggleMusic ? this.dom.toggleMusic.closest('.audio-setting-row') : null;
    if (musicRow) musicRow.classList.toggle('is-muted', !this.sound.musicEnabled);

    const cardsRow = this.dom.toggleSoundCards ? this.dom.toggleSoundCards.closest('.audio-setting-row') : null;
    if (cardsRow) cardsRow.classList.toggle('is-muted', !this.sound.soundCardsEnabled);

    const drinksRow = this.dom.toggleSoundDrinks ? this.dom.toggleSoundDrinks.closest('.audio-setting-row') : null;
    if (drinksRow) drinksRow.classList.toggle('is-muted', !this.sound.soundDrinksEnabled);

    const victoryRow = this.dom.toggleSoundVictory ? this.dom.toggleSoundVictory.closest('.audio-setting-row') : null;
    if (victoryRow) victoryRow.classList.toggle('is-muted', !this.sound.soundVictoryEnabled);
  }

  setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    if (this.dom.selectLanguage) this.dom.selectLanguage.value = lang;

    const updateCardLabel = (c) => {
      if (c.rank === 12) c.label = this.lang === 'de' ? 'D' : 'Q';
      if (c.rank === 11) c.label = this.lang === 'de' ? 'B' : 'J';
    };
    if (this.stock) this.stock.forEach(updateCardLabel);
    if (this.waste) this.waste.forEach(updateCardLabel);
    if (this.foundations) this.foundations.forEach(f => f.forEach(updateCardLabel));
    if (this.tableau) this.tableau.forEach(col => col.forEach(updateCardLabel));

    this.updateUIText();
    this.render();
  }

  updateUIText() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    document.documentElement.lang = this.lang;
    document.title = t.pageTitle;

    const elMainTitle = document.getElementById('title-main');
    if (elMainTitle) elMainTitle.textContent = t.mainTitle;

    const elBadge = document.getElementById('badge-edition');
    if (elBadge) elBadge.textContent = t.badgeEdition;

    this.updateDealBadge();

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setTxt('label-deal', t.labelDeal);
    setTxt('opt-deal-solvable', t.optSolvable);
    setTxt('opt-deal-random', t.optRandom);
    setTxt('label-draw', t.labelDraw);
    setTxt('opt-draw-1', t.optDraw1);
    setTxt('opt-draw-3', t.optDraw3);
    setTxt('label-felt', t.labelFelt);
    setTxt('opt-felt-oak', t.optOak);
    setTxt('opt-felt-emerald', t.optEmerald);
    setTxt('opt-felt-navy', t.optNavy);
    setTxt('opt-felt-burgundy', t.optBurgundy);
    setTxt('opt-felt-slate', t.optSlate);
    setTxt('opt-felt-violet', t.optViolet);
    setTxt('label-lang', t.labelLang);

    setTxt('label-stat-score', t.statScore);
    setTxt('label-stat-moves', t.statMoves);
    setTxt('label-stat-time', t.statTime);

    if (this.dom.btnAutocomplete) {
      this.dom.btnAutocomplete.textContent = t.btnAutoFinish;
      this.dom.btnAutocomplete.title = t.btnAutoFinishTitle;
    }
    if (this.dom.btnSweep) {
      this.dom.btnSweep.textContent = t.btnSweep;
      this.dom.btnSweep.title = t.btnSweepTitle;
    }
    if (this.dom.btnHint) {
      this.dom.btnHint.textContent = t.btnHint;
      this.dom.btnHint.title = t.btnHintTitle;
    }
    if (this.dom.btnUndo) {
      this.dom.btnUndo.textContent = t.btnUndo;
      this.dom.btnUndo.title = t.btnUndoTitle;
    }
    if (this.dom.btnReplay) {
      this.dom.btnReplay.textContent = t.btnReplay;
      this.dom.btnReplay.title = t.btnReplayTitle;
    }
    if (this.dom.btnScores) {
      this.dom.btnScores.textContent = t.btnScores;
      this.dom.btnScores.title = t.btnScoresTitle;
    }
    if (this.dom.btnSettings) {
      const labelSettings = document.getElementById('label-btn-settings');
      if (labelSettings) {
        labelSettings.textContent = t.btnSettings ? t.btnSettings.replace('⚙️ ', '') : 'Einstellungen';
      }
      this.dom.btnSettings.title = t.btnSettingsTitle || 'Einstellungen öffnen';
    }
    if (this.dom.btnNew) {
      this.dom.btnNew.textContent = t.btnNew;
      this.dom.btnNew.title = t.btnNewTitle;
    }

    if (this.dom.stock) this.dom.stock.title = t.stockTitle;
    if (this.dom.waste) this.dom.waste.title = t.wasteTitle;
    if (this.dom.foundations) {
      const suits = ['clubs', 'spades', 'hearts', 'diamonds'];
      suits.forEach((suit, i) => {
        if (this.dom.foundations[i]) {
          this.dom.foundations[i].title = t.foundations[suit];
        }
      });
    }

    setHtml('legend-rules-title', t.legend.rulesTitle);
    setTxt('legend-black-glass', t.legend.blackGlass);
    setTxt('legend-black-drop', t.legend.blackDrop);
    setTxt('legend-green-glass', t.legend.greenGlass);
    setTxt('legend-green-drop', t.legend.greenDrop);
    setHtml('legend-sweep-hint', t.legend.sweepHint);

    setTxt('win-modal-badge', t.winModal.badge);
    setTxt('win-modal-title', t.winModal.title);
    setTxt('win-modal-desc', t.winModal.desc);
    setTxt('win-label-deal', t.winModal.labelDeal);
    setTxt('win-label-mode', t.winModal.labelMode);
    setTxt('win-label-time', t.winModal.labelTime);
    setTxt('win-label-moves', t.winModal.labelMoves);
    setTxt('win-label-score', t.winModal.labelScore);
    setTxt('win-label-name', t.winModal.labelName);
    if (this.dom.winNameInput) this.dom.winNameInput.placeholder = t.winModal.namePlaceholder;
    setTxt('btn-save-score', t.winModal.btnSaveScore);
    setTxt('win-save-msg', t.winModal.saveSuccess);
    setTxt('btn-win-scores', t.winModal.btnScores);
    setTxt('btn-win-replay', t.winModal.btnReplay);
    if (t.winModal.solvableNotice) {
      setTxt('win-solvable-note', t.winModal.solvableNotice);
    }

    setTxt('scores-modal-badge', t.scoresModal.badge);
    setTxt('scores-modal-title', t.scoresModal.title);
    setTxt('tab-draw1', t.scoresModal.tabDraw1);
    setTxt('tab-draw3', t.scoresModal.tabDraw3);
    setTxt('filter-device-all', t.scoresModal.filterAll);
    setTxt('filter-device-desktop', t.scoresModal.filterDesktop);
    setTxt('filter-device-mobile', t.scoresModal.filterMobile);
    if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.title = t.scoresModal.refreshTitle;
    setTxt('th-player', t.scoresModal.thPlayer);
    setTxt('th-score', t.scoresModal.thScore);
    setTxt('th-time', t.scoresModal.thTime);
    setTxt('th-moves', t.scoresModal.thMoves);
    setTxt('th-date', t.scoresModal.thDate);
    setTxt('btn-close-scores', t.scoresModal.btnClose);

    // Settings Modal Localization
    const sm = t.settingsModal || {};
    setTxt('settings-modal-badge', sm.badge || 'KONFIGURATION');
    setTxt('settings-modal-title', sm.title || '⚙️ Einstellungen');
    setTxt('section-game-title', sm.sectionGame || 'Spiel & Tisch');
    setTxt('label-setting-deal', sm.labelDeal || t.labelDeal || 'Spielstil:');
    setTxt('opt-deal-solvable', sm.optDealSolvable || t.optSolvable);
    setTxt('opt-deal-random', sm.optDealRandom || t.optRandom);
    setTxt('label-setting-draw', sm.labelDraw || t.labelDraw || 'Karten ziehen:');
    setTxt('opt-draw-1', sm.optDraw1 || t.optDraw1);
    setTxt('opt-draw-3', sm.optDraw3 || t.optDraw3);
    setTxt('label-setting-felt', sm.labelFelt || t.labelFelt || 'Tisch-Oberfläche:');
    setTxt('opt-felt-oak', sm.optOak || t.optOak);
    setTxt('opt-felt-emerald', sm.optEmerald || t.optEmerald);
    setTxt('opt-felt-navy', sm.optNavy || t.optNavy);
    setTxt('opt-felt-burgundy', sm.optBurgundy || t.optBurgundy);
    setTxt('opt-felt-slate', sm.optSlate || t.optSlate);
    setTxt('opt-felt-violet', sm.optViolet || t.optViolet);
    setTxt('label-setting-lang', sm.labelLang || t.labelLang || 'Sprache:');
    setTxt('section-audio-title', sm.sectionAudio || 'Sound & Lautstärke');
    setTxt('label-setting-music', sm.musicLabel || '🎵 Musik (Irischer Folk)');
    if (this.dom.btnNextTrack) {
      this.dom.btnNextTrack.title = sm.trackSkipTitle || 'Nächster Musiktitel (Titel wechseln)';
    }
    setTxt('label-setting-cards', sm.cardsLabel || '🃏 Karten-Sounds');
    setTxt('label-setting-drinks', sm.drinksLabel || '🥃 Trink-Sounds (Ablage)');
    setTxt('label-setting-victory', sm.victoryLabel || '🎺 Sieges-Fanfare');
    setTxt('btn-close-settings', sm.btnClose || 'Schließen');
  }

  applyTheme(theme) {
    this.feltTheme = theme;
    document.body.setAttribute('data-felt', theme);
    localStorage.setItem(STORAGE_KEYS.FELT_THEME, theme);
  }

  updateDealBadge() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    if (this.dealType === 'solvable') {
      this.dom.dealBadge.textContent = t.dealSolvable;
      this.dom.dealBadge.className = 'badge badge-gold';
      this.dom.dealBadge.title = t.dealSolvableTitle;
    } else {
      this.dom.dealBadge.textContent = t.dealRandom;
      this.dom.dealBadge.className = 'badge';
      this.dom.dealBadge.title = t.dealRandomTitle;
    }
  }

  showToast(message, duration = 2800) {
    this.dom.gameToast.textContent = message;
    this.dom.gameToast.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.dom.gameToast.classList.add('hidden');
    }, duration);
  }

  initEvents() {
    this.dom.btnNew.addEventListener('click', () => this.startNewGame());
    this.dom.btnReplay.addEventListener('click', () => this.replayCurrentDeal());
    this.dom.btnUndo.addEventListener('click', () => this.undo());
    this.dom.btnHint.addEventListener('click', () => this.giveHint());
    this.dom.btnAutocomplete.addEventListener('click', () => this.autoFinish());

    if (this.dom.btnSweep) {
      this.dom.btnSweep.addEventListener('click', () => {
        this.sendAllPossibleToFoundations();
      });
    }

    if (this.dom.btnSettings) {
      this.dom.btnSettings.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    if (this.dom.btnCloseSettings) {
      this.dom.btnCloseSettings.addEventListener('click', () => {
        this.closeSettingsModal();
      });
    }

    if (this.dom.btnSettingsX) {
      this.dom.btnSettingsX.addEventListener('click', () => {
        this.closeSettingsModal();
      });
    }

    if (this.dom.settingsModal) {
      this.dom.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.dom.settingsModal) {
          this.closeSettingsModal();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.settingsModal && !this.dom.settingsModal.classList.contains('hidden')) {
          this.closeSettingsModal();
        }
      }
    });

    // Settings Audio Listeners
    if (this.dom.toggleMusic) {
      this.dom.toggleMusic.addEventListener('change', (e) => {
        this.sound.setMusicEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
      });
    }

    if (this.dom.sliderMusic) {
      this.dom.sliderMusic.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setMusicVolume(val);
        if (this.dom.valMusic) this.dom.valMusic.textContent = val + '%';
      });
    }

    if (this.dom.btnNextTrack) {
      this.dom.btnNextTrack.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.nextMusicTrack();
        const track = this.sound.getCurrentMusicTrack();
        if (track && this.dom.audioTrackTitle) {
          this.dom.audioTrackTitle.textContent = `Titel: ${track.title} (${track.index + 1}/${track.total})`;
        }
      });
    }

    if (this.sound && this.sound.music && typeof this.sound.music.onTrackChange === 'function') {
      this.sound.music.onTrackChange((track) => {
        if (this.dom.audioTrackTitle && track) {
          this.dom.audioTrackTitle.textContent = `Titel: ${track.title} (${track.index + 1}/${track.total})`;
        }
      });
    }

    if (this.dom.toggleSoundCards) {
      this.dom.toggleSoundCards.addEventListener('change', (e) => {
        this.sound.setSoundCardsEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
        if (e.target.checked) this.sound.playFlip();
      });
    }

    if (this.dom.sliderSoundCards) {
      let previewDebounce = null;
      this.dom.sliderSoundCards.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundCardsVolume(val);
        if (this.dom.valSoundCards) this.dom.valSoundCards.textContent = val + '%';
        clearTimeout(previewDebounce);
        previewDebounce = setTimeout(() => this.sound.playFlip(), 120);
      });
    }

    if (this.dom.toggleSoundDrinks) {
      this.dom.toggleSoundDrinks.addEventListener('change', (e) => {
        this.sound.setSoundDrinksEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
        if (e.target.checked) this.sound.playFoundation();
      });
    }

    if (this.dom.sliderSoundDrinks) {
      let previewDebounce = null;
      this.dom.sliderSoundDrinks.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundDrinksVolume(val);
        if (this.dom.valSoundDrinks) this.dom.valSoundDrinks.textContent = val + '%';
        clearTimeout(previewDebounce);
        previewDebounce = setTimeout(() => this.sound.playFoundation(), 120);
      });
    }

    if (this.dom.toggleSoundVictory) {
      this.dom.toggleSoundVictory.addEventListener('change', (e) => {
        this.sound.setSoundVictoryEnabled(e.target.checked);
        this.updateAudioRowMuteClasses();
      });
    }

    if (this.dom.sliderSoundVictory) {
      this.dom.sliderSoundVictory.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.sound.setSoundVictoryVolume(val);
        if (this.dom.valSoundVictory) this.dom.valSoundVictory.textContent = val + '%';
      });
    }

    // User gesture listener to unlock Web Audio & start background music if enabled
    const unlockAudioAndStartMusic = () => {
      this.sound.init();
      if (this.sound.isMusicEnabled()) {
        this.sound.startMusic();
      }
      if (this.sound.isPlayingMusic()) {
        window.removeEventListener('pointerdown', unlockAudioAndStartMusic);
        window.removeEventListener('keydown', unlockAudioAndStartMusic);
        window.removeEventListener('click', unlockAudioAndStartMusic);
        window.removeEventListener('touchstart', unlockAudioAndStartMusic);
      }
    };
    window.addEventListener('pointerdown', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('keydown', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('click', unlockAudioAndStartMusic, { passive: true });
    window.addEventListener('touchstart', unlockAudioAndStartMusic, { passive: true });

    // Pause music when tab is hidden, resume when tab is active again
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.sound && this.sound.music) {
          this.sound.music.pauseOnHide();
        }
      } else {
        if (this.sound && this.sound.isMusicEnabled() && this.sound.music) {
          this.sound.music.resumeOnShow();
        }
      }
    });

    if (this.dom.selectLanguage) {
      this.dom.selectLanguage.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }

    this.dom.selectFelt.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    this.dom.selectDeal.addEventListener('change', (e) => {
      this.dealType = e.target.value;
      localStorage.setItem(STORAGE_KEYS.DEAL_TYPE, this.dealType);
      this.updateDealBadge();
      this.startNewGame();
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(this.dealType === 'solvable' ? t.toasts.dealSolvable : t.toasts.dealRandom);
    });

    this.dom.selectDraw.addEventListener('change', (e) => {
      const newMode = parseInt(e.target.value, 10);
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      if (this.moves > 0 && !this.gameWon) {
        if (confirm(t.toasts.switchDrawConfirm)) {
          this.drawMode = newMode;
          localStorage.setItem(STORAGE_KEYS.DRAW_MODE, newMode.toString());
          this.startNewGame();
        } else {
          this.dom.selectDraw.value = this.drawMode.toString();
        }
      } else {
        this.drawMode = newMode;
        localStorage.setItem(STORAGE_KEYS.DRAW_MODE, newMode.toString());
        this.startNewGame();
      }
    });

    // Stock pile click
    this.dom.stock.addEventListener('click', () => this.handleStockClick());

    // Foundation and tableau slots
    this.dom.foundations.forEach((slot, fIdx) => {
      slot.addEventListener('click', () => this.handleSlotClick('foundation', fIdx));
      this.attachDropHandlers(slot, 'foundation', fIdx);
    });

    this.dom.tableau.forEach((slot, tIdx) => {
      slot.addEventListener('click', (e) => {
        if (!e.target.closest('.card')) {
          this.handleSlotClick('tableau', tIdx);
        }
      });
      this.attachDropHandlers(slot, 'tableau', tIdx);
    });

    // Save Name & Score Event Handlers
    this.dom.btnSaveScore.addEventListener('click', () => this.commitPlayerScore());
    this.dom.winNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.commitPlayerScore();
      }
    });

    // Victory modal buttons
    this.dom.btnWinReplay.addEventListener('click', () => {
      this.commitPlayerScore();
      this.dom.winModal.classList.add('hidden');
      this.startNewGame();
    });

    this.dom.btnWinScores.addEventListener('click', () => {
      this.commitPlayerScore();
      this.dom.winModal.classList.add('hidden');
      this.openHighScores(this.drawMode === 3 ? 'draw3' : 'draw1');
    });

    // High Scores Modal Controls
    this.dom.btnScores.addEventListener('click', () => this.openHighScores(this.drawMode === 3 ? 'draw3' : 'draw1'));
    this.dom.btnCloseScores.addEventListener('click', () => this.dom.scoresModal.classList.add('hidden'));

    this.dom.tabDraw1.addEventListener('click', () => this.switchScoreTab('draw1'));
    this.dom.tabDraw3.addEventListener('click', () => this.switchScoreTab('draw3'));
    if (this.dom.filterDeviceAll) this.dom.filterDeviceAll.addEventListener('click', () => this.switchDeviceFilter('all'));
    if (this.dom.filterDeviceDesktop) this.dom.filterDeviceDesktop.addEventListener('click', () => this.switchDeviceFilter('desktop'));
    if (this.dom.filterDeviceMobile) this.dom.filterDeviceMobile.addEventListener('click', () => this.switchDeviceFilter('mobile'));
    if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.addEventListener('click', () => this.refreshScores());

    // --- Right-Click Feature: Sweep all possible visible cards to Foundations! ---
    window.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      this.sendAllPossibleToFoundations();
    });

    // Mobile / Touch Felt double-tap or double-click to sweep to foundations
    let lastFeltTapTime = 0;
    const triggerFeltSweep = (e) => {
      if (e.target.closest('.card.face-up') || e.target.closest('button') || e.target.closest('select') || e.target.closest('input') || e.target.closest('.modal-card')) {
        return;
      }
      const now = Date.now();
      if (now - lastFeltTapTime < 380) {
        if (e.cancelable) e.preventDefault();
        this.sendAllPossibleToFoundations();
        lastFeltTapTime = 0;
      } else {
        lastFeltTapTime = now;
      }
    };

    if (this.dom.tableFelt) {
      this.dom.tableFelt.addEventListener('touchend', triggerFeltSweep, { passive: false });
      this.dom.tableFelt.addEventListener('dblclick', triggerFeltSweep);
    }

    this.initPointerDrag();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSelection();
        this.dom.scoresModal.classList.add('hidden');
      }
    });
  }

  // --- Right-Click Action: Sweep all possible visible cards to Foundations ---
  sendAllPossibleToFoundations() {
    if (this.gameWon || this.autoFinishing) return;

    let totalMoved = 0;
    let stateSaved = false;

    let movedInPass = true;
    while (movedInPass) {
      movedInPass = false;

      // 1. Check Waste pile (top card)
      if (this.waste.length > 0) {
        const wasteCard = this.waste[this.waste.length - 1];
        for (let f = 0; f < 4; f++) {
          if (this.canMoveToFoundation(wasteCard, f)) {
            if (!stateSaved) {
              this.saveState();
              stateSaved = true;
            }
            this.waste.pop();
            this.foundations[f].push(wasteCard);
            this.score += 10;
            this.moves++;
            totalMoved++;
            movedInPass = true;
            break;
          }
        }
      }
      if (movedInPass) continue;

      // 2. Check Tableau columns (top face-up card of each column)
      for (let t = 0; t < 7; t++) {
        const col = this.tableau[t];
        if (col.length > 0) {
          const topCard = col[col.length - 1];
          if (topCard.faceUp) {
            for (let f = 0; f < 4; f++) {
              if (this.canMoveToFoundation(topCard, f)) {
                if (!stateSaved) {
                  this.saveState();
                  stateSaved = true;
                }
                col.pop();
                this.foundations[f].push(topCard);
                this.score += 10;
                this.moves++;
                totalMoved++;
                this.revealTableauTops();
                movedInPass = true;
                break;
              }
            }
          }
        }
        if (movedInPass) break;
      }
    }

    if (totalMoved > 0) {
      this.sound.playFoundation();
      this.clearSelection();
      this.render();
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(t.toasts.sweptSuccess(totalMoved));
      this.checkWinCondition();
    } else {
      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      this.showToast(t.toasts.noSweep, 1800);
    }
  }

  // --- Start & Reset ---
  startNewGame() {
    clearInterval(this.timerInterval);
    this.autoFinishing = false;
    this.timerSeconds = 0;
    this.moves = 0;
    this.score = 0;
    this.history = [];
    this.selected = null;
    this.gameWon = false;
    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.dom.winModal.classList.add('hidden');
    this.dom.btnAutocomplete.classList.add('hidden');
    this.dom.winSaveMsg.classList.add('hidden');
    this.dom.btnSaveScore.textContent = 'Save Score';
    this.dom.btnSaveScore.disabled = false;

    this.updateStats();
    if (this.sound && this.sound.isMusicEnabled() && !this.sound.isPlayingMusic()) {
      this.sound.startMusic();
    }
    this.timerInterval = setInterval(() => {
      if (!this.gameWon) {
        this.timerSeconds++;
        this.updateStats();
      }
    }, 1000);

    let cardIndices;
    if (this.dealType === 'solvable') {
      cardIndices = this.dealGenerator.getGuaranteedDeal(this.drawMode);
    } else {
      cardIndices = Array.from({ length: 52 }, (_, i) => i);
      for (let i = cardIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardIndices[i], cardIndices[j]] = [cardIndices[j], cardIndices[i]];
      }
    }

    const deck = cardIndices.map((idx, idNum) => {
      const suitIdx = Math.floor(idx / 13);
      const rankIdx = idx % 13;
      const suit = SUITS[suitIdx];
      const rank = RANKS[rankIdx];
      const label = rank.value === 13 ? 'K' : rank.value === 12 ? (this.lang === 'de' ? 'D' : 'Q') : rank.value === 11 ? (this.lang === 'de' ? 'B' : 'J') : rank.label;
      return {
        id: idNum + 1,
        suit: suit.name,
        suitTitle: suit.title,
        color: suit.color,
        rank: rank.value,
        value: rank.value,
        label: label,
        faceArt: rank.face || null,
        faceUp: false
      };
    });

    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = [[], [], [], [], [], [], []];

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck.shift();
        if (row === col) card.faceUp = true;
        this.tableau[col].push(card);
      }
    }

    this.stock = deck;

    if (window.location && window.location.search && window.location.search.includes('test_court')) {
      const courtSuits = ['clubs', 'spades', 'hearts', 'diamonds', 'clubs', 'spades', 'hearts'];
      const courtRanks = [13, 12, 11, 13, 12, 11, 13];
      for (let col = 0; col < 7; col++) {
        const topCard = this.tableau[col][this.tableau[col].length - 1];
        topCard.rank = courtRanks[col];
        topCard.value = courtRanks[col];
        topCard.label = courtRanks[col] === 13 ? (this.lang === 'de' ? 'K' : 'K') : courtRanks[col] === 12 ? (this.lang === 'de' ? 'D' : 'Q') : (this.lang === 'de' ? 'B' : 'J');
        topCard.suit = courtSuits[col];
        topCard.color = (courtSuits[col] === 'hearts' || courtSuits[col] === 'diamonds') ? 'light' : 'dark';
      }
    }

    this.initialDealState = {
      stock: this.stock.map(c => ({ ...c })),
      waste: [],
      foundations: [[], [], [], []],
      tableau: this.tableau.map(col => col.map(c => ({ ...c })))
    };

    this.render();
  }

  replayCurrentDeal() {
    if (!this.initialDealState) return;
    clearInterval(this.timerInterval);
    this.autoFinishing = false;
    this.timerSeconds = 0;
    this.moves = 0;
    this.score = 0;
    this.history = [];
    this.selected = null;
    this.gameWon = false;
    this.pendingWinRecord = null;
    this.hasSavedCurrentWin = false;

    this.dom.winModal.classList.add('hidden');
    this.dom.btnAutocomplete.classList.add('hidden');

    this.stock = this.initialDealState.stock.map(c => ({ ...c, faceUp: false }));
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableau = this.initialDealState.tableau.map(col => col.map(c => ({ ...c })));

    this.updateStats();
    this.timerInterval = setInterval(() => {
      if (!this.gameWon) {
        this.timerSeconds++;
        this.updateStats();
      }
    }, 1000);

    this.sound.playFlip();
    this.render();
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    this.showToast(t.toasts.dealRestarted);
  }

  // --- State Snapshot & Undo ---
  saveState() {
    const cloneCard = (c) => ({ ...c });
    const snapshot = {
      stock: this.stock.map(cloneCard),
      waste: this.waste.map(cloneCard),
      foundations: this.foundations.map(arr => arr.map(cloneCard)),
      tableau: this.tableau.map(arr => arr.map(cloneCard)),
      score: this.score,
      moves: this.moves
    };
    this.history.push(snapshot);
    if (this.history.length > 50) this.history.shift();
  }

  undo() {
    if (this.history.length === 0 || this.gameWon || this.autoFinishing) return;
    const prev = this.history.pop();
    this.stock = prev.stock;
    this.waste = prev.waste;
    this.foundations = prev.foundations;
    this.tableau = prev.tableau;
    this.score = Math.max(0, prev.score - 10);
    this.moves++;
    this.clearSelection();
    this.sound.playFlip();
    this.render();
  }

  // --- Auto-Finish Feature ---
  canAutoFinish() {
    if (this.gameWon || this.autoFinishing) return false;
    const allTableauFaceUp = this.tableau.every(col => col.every(card => card.faceUp));
    return allTableauFaceUp && this.stock.length === 0;
  }

  autoFinish() {
    if (this.autoFinishing || this.gameWon) return;
    this.autoFinishing = true;
    this.dom.btnAutocomplete.classList.add('hidden');

    const finishInterval = setInterval(() => {
      let moved = false;

      if (this.waste.length > 0) {
        const wasteCard = this.waste[this.waste.length - 1];
        for (let f = 0; f < 4; f++) {
          if (this.canMoveToFoundation(wasteCard, f)) {
            this.executeMove('waste', 0, this.waste.length - 1, 'foundation', f);
            moved = true;
            break;
          }
        }
      }

      if (!moved) {
        for (let t = 0; t < 7; t++) {
          const col = this.tableau[t];
          if (col.length > 0) {
            const top = col[col.length - 1];
            for (let f = 0; f < 4; f++) {
              if (this.canMoveToFoundation(top, f)) {
                this.executeMove('tableau', t, col.length - 1, 'foundation', f);
                moved = true;
                break;
              }
            }
          }
          if (moved) break;
        }
      }

      const totalInFoundations = this.foundations.reduce((sum, f) => sum + f.length, 0);
      if (totalInFoundations === 52 || !moved) {
        clearInterval(finishInterval);
        this.autoFinishing = false;
      }
    }, 90);
  }

  // --- Card Movement Rules (Alternating: Black ⇄ Color) ---
  canMoveToFoundation(card, foundationIndex) {
    const targetSuit = SUITS[foundationIndex].name;
    if (card.suit !== targetSuit) return false;

    const pile = this.foundations[foundationIndex];
    if (pile.length === 0) {
      return card.rank === 1; // Ace
    }
    const topCard = pile[pile.length - 1];
    return card.rank === topCard.rank + 1;
  }

  canMoveToTableau(movingCard, colIndex) {
    const targetCol = this.tableau[colIndex];
    if (targetCol.length === 0) {
      return movingCard.rank === 13; // King can fill empty column
    }
    const topCard = targetCol[targetCol.length - 1];
    if (!topCard.faceUp) return false;
    // Alternating rule: Black can only go on Color, and Color can only go on Black!
    return movingCard.color !== topCard.color && movingCard.rank === topCard.rank - 1;
  }

  revealTableauTops() {
    let revealed = false;
    this.tableau.forEach(col => {
      if (col.length > 0) {
        const top = col[col.length - 1];
        if (!top.faceUp) {
          top.faceUp = true;
          this.score += 5;
          revealed = true;
        }
      }
    });
    return revealed;
  }

  // --- Stock Handling ---
  handleStockClick() {
    if (this.autoFinishing) return;
    this.saveState();
    this.clearSelection();

    if (this.stock.length > 0) {
      const drawCount = Math.min(this.drawMode, this.stock.length);
      for (let i = 0; i < drawCount; i++) {
        const card = this.stock.pop();
        card.faceUp = true;
        this.waste.push(card);
      }
      this.sound.playFlip();
    } else {
      if (this.waste.length === 0) return;
      while (this.waste.length > 0) {
        const card = this.waste.pop();
        card.faceUp = false;
        this.stock.push(card);
      }
      this.score = Math.max(0, this.score - 20);
      this.sound.playFlip();
    }

    this.moves++;
    this.render();
  }

  // --- Interaction: Drag & Drop (Touch, Pointer & Mouse) ---
  initPointerDrag() {
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));
  }

  handleCardPointerDown(card, source, colIndex, cardIndex, el, event) {
    if (this.autoFinishing || this.gameWon) return;
    if (!card.faceUp) return;
    if (source === 'waste' && cardIndex !== this.waste.length - 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    this.pointerDragState = {
      isDragging: false,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      source,
      colIndex,
      cardIndex,
      card,
      sourceElement: el,
      elementsToMove: [],
      proxyContainer: null,
      grabOffsetX: 0,
      grabOffsetY: 0
    };
  }

  findTargetSlot(x, y) {
    // 1. Point test through floating proxy (which has pointer-events: none)
    const hit = document.elementFromPoint(x, y);
    if (hit) {
      const slot = hit.closest('.card-slot');
      if (slot) {
        const fIdx = this.dom.foundations.indexOf(slot);
        if (fIdx !== -1) return { slot, targetType: 'foundation', targetIndex: fIdx };
        const tIdx = this.dom.tableau.indexOf(slot);
        if (tIdx !== -1) return { slot, targetType: 'tableau', targetIndex: tIdx };
      }
    }

    // Determine dragged card center coordinates from proxy if dragging
    let cardCx = x;
    let cardCy = y;
    if (this.pointerDragState && this.pointerDragState.proxyContainer) {
      const firstChild = this.pointerDragState.proxyContainer.firstElementChild;
      if (firstChild) {
        const proxyRect = firstChild.getBoundingClientRect();
        cardCx = proxyRect.left + proxyRect.width / 2;
        cardCy = proxyRect.top + proxyRect.height / 2;
      }
    }

    // 2. Foundation bounding box test
    for (let f = 0; f < 4; f++) {
      const slot = this.dom.foundations[f];
      const r = slot.getBoundingClientRect();
      const inFinger = (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 15);
      const inCardCenter = (cardCx >= r.left - 6 && cardCx <= r.right + 6 && cardCy >= r.top - 6 && cardCy <= r.bottom + 12);
      if (inFinger || inCardCenter) {
        return { slot, targetType: 'foundation', targetIndex: f };
      }
    }

    // 3. Tableau bounding box test with generous vertical corridor and horizontal tolerance
    // On touch screens, columns are narrow; checking both finger point and dragged card center,
    // and extending the hit corridor downwards ensures natural, effortless King drops.
    let bestTableau = null;
    let bestDist = Infinity;

    for (let t = 0; t < 7; t++) {
      const slot = this.dom.tableau[t];
      const r = slot.getBoundingClientRect();
      const colWidth = r.width;
      const horizMargin = Math.max(12, colWidth * 0.25);
      const topBound = r.top - 20;
      // Allow dropping anywhere in the column down to the bottom of the board/viewport
      const bottomBound = Math.max(r.bottom + 160, window.innerHeight - 60);

      const fingerInside = (x >= r.left - horizMargin && x <= r.right + horizMargin && y >= topBound && y <= bottomBound);
      const cardInside = (cardCx >= r.left - horizMargin && cardCx <= r.right + horizMargin && cardCy >= topBound && cardCy <= bottomBound);

      if (fingerInside || cardInside) {
        const colCenter = r.left + colWidth / 2;
        const dist = Math.min(Math.abs(x - colCenter), Math.abs(cardCx - colCenter));
        if (dist < bestDist) {
          bestDist = dist;
          bestTableau = { slot, targetType: 'tableau', targetIndex: t };
        }
      }
    }

    if (bestTableau) return bestTableau;

    return null;
  }

  handlePointerMove(event) {
    if (!this.pointerDragState) return;
    if (event.pointerId !== this.pointerDragState.pointerId) return;

    const dx = event.clientX - this.pointerDragState.startX;
    const dy = event.clientY - this.pointerDragState.startY;

    if (!this.pointerDragState.isDragging) {
      if (Math.hypot(dx, dy) > 7) {
        this.pointerDragState.isDragging = true;
        this.clearSelection();

        const { source, colIndex, cardIndex, sourceElement } = this.pointerDragState;

        // Collect elements to move: single card or substack
        if (source === 'tableau') {
          const colCards = Array.from(this.dom.tableau[colIndex].querySelectorAll('.card'));
          this.pointerDragState.elementsToMove = colCards.slice(cardIndex);
        } else {
          this.pointerDragState.elementsToMove = [sourceElement];
        }

        // Setup floating drag proxy
        let proxy = document.getElementById('drag-proxy-container');
        if (!proxy) {
          proxy = document.createElement('div');
          proxy.id = 'drag-proxy-container';
          proxy.className = 'drag-proxy-container';
          document.body.appendChild(proxy);
        }
        proxy.innerHTML = '';
        this.pointerDragState.proxyContainer = proxy;

        const baseRect = sourceElement.getBoundingClientRect();
        this.pointerDragState.grabOffsetX = this.pointerDragState.startX - baseRect.left;
        this.pointerDragState.grabOffsetY = this.pointerDragState.startY - baseRect.top;

        const baseTop = sourceElement.offsetTop;
        this.pointerDragState.elementsToMove.forEach(cEl => {
          const clone = cEl.cloneNode(true);
          clone.classList.remove('selected', 'hint-highlight');
          clone.style.position = 'absolute';
          clone.style.left = '0';
          clone.style.top = `${cEl.offsetTop - baseTop}px`;
          clone.style.width = `${baseRect.width}px`;
          clone.style.height = `${baseRect.height}px`;
          clone.style.margin = '0';
          clone.style.pointerEvents = 'none';
          clone.style.transition = 'none';
          proxy.appendChild(clone);
          cEl.style.opacity = '0.22';
        });

        document.body.classList.add('is-pointer-dragging');
        proxy.style.display = 'block';
        proxy.style.transform = `translate3d(${event.clientX - this.pointerDragState.grabOffsetX}px, ${event.clientY - this.pointerDragState.grabOffsetY}px, 0)`;
      }
    }

    if (this.pointerDragState.isDragging) {
      if (event.cancelable) event.preventDefault();

      const proxy = this.pointerDragState.proxyContainer;
      if (proxy) {
        proxy.style.transform = `translate3d(${event.clientX - this.pointerDragState.grabOffsetX}px, ${event.clientY - this.pointerDragState.grabOffsetY}px, 0)`;
      }

      // Highlight target slot if valid
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));

      const target = this.findTargetSlot(event.clientX, event.clientY);
      if (target) {
        const { slot, targetType, targetIndex } = target;
        let isLegal = false;
        if (targetType === 'foundation') {
          if (this.pointerDragState.elementsToMove.length === 1) {
            isLegal = this.canMoveToFoundation(this.pointerDragState.card, targetIndex);
          }
        } else if (targetType === 'tableau') {
          if (this.pointerDragState.source !== 'tableau' || this.pointerDragState.colIndex !== targetIndex) {
            isLegal = this.canMoveToTableau(this.pointerDragState.card, targetIndex);
          }
        }
        if (isLegal) {
          slot.classList.add('drag-over');
        }
      }
    }
  }

  handlePointerUp(event) {
    if (!this.pointerDragState) return;
    if (event.pointerId !== this.pointerDragState.pointerId) return;

    if (this.pointerDragState.isDragging) {
      this.justFinishedDrag = true;
      setTimeout(() => { this.justFinishedDrag = false; }, 150);

      document.body.classList.remove('is-pointer-dragging');
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));

      if (this.pointerDragState.elementsToMove) {
        this.pointerDragState.elementsToMove.forEach(cEl => {
          cEl.style.opacity = '1';
        });
      }

      if (this.pointerDragState.proxyContainer) {
        this.pointerDragState.proxyContainer.innerHTML = '';
        this.pointerDragState.proxyContainer.style.display = 'none';
      }

      const target = this.findTargetSlot(event.clientX, event.clientY);
      const { source, colIndex, cardIndex } = this.pointerDragState;
      this.pointerDragState = null;

      if (target) {
        this.executeMove(source, colIndex, cardIndex, target.targetType, target.targetIndex);
      }
    } else {
      this.pointerDragState = null;
    }
  }

  handlePointerCancel(event) {
    if (!this.pointerDragState) return;
    if (this.pointerDragState.isDragging) {
      document.body.classList.remove('is-pointer-dragging');
      document.querySelectorAll('.card-slot.drag-over').forEach(s => s.classList.remove('drag-over'));
      if (this.pointerDragState.elementsToMove) {
        this.pointerDragState.elementsToMove.forEach(cEl => { cEl.style.opacity = '1'; });
      }
      if (this.pointerDragState.proxyContainer) {
        this.pointerDragState.proxyContainer.innerHTML = '';
        this.pointerDragState.proxyContainer.style.display = 'none';
      }
    }
    this.pointerDragState = null;
  }

  attachDropHandlers(element, targetType, targetIndex) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      if (!this.dragData) return;

      const { source, colIndex, cardIndex } = this.dragData;
      this.executeMove(source, colIndex, cardIndex, targetType, targetIndex);
    });
  }

  handleCardClick(card, source, colIndex, cardIndex, event) {
    if (this.autoFinishing) return;
    if (this.justFinishedDrag) return;
    event.stopPropagation();
    if (!card.faceUp) return;

    if (source === 'waste' && cardIndex !== this.waste.length - 1) {
      return;
    }

    // Double-tap / Quick-tap detection for mobile touch & responsive play
    const now = Date.now();
    const cardKey = `${source}-${colIndex}-${cardIndex}-${card.id}`;
    if (this.lastCardClick && this.lastCardClick.key === cardKey && (now - this.lastCardClick.time) < 380) {
      this.lastCardClick = null;
      this.clearSelection();
      this.handleCardDoubleClick(card, source, colIndex, cardIndex, event);
      return;
    }
    this.lastCardClick = { key: cardKey, time: now };

    if (this.selected) {
      if (this.selected.source === source && this.selected.colIndex === colIndex && this.selected.cardIndex === cardIndex) {
        this.clearSelection();
        return;
      }

      if (source === 'tableau') {
        const success = this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, 'tableau', colIndex);
        if (success) {
          this.clearSelection();
          return;
        }
      } else if (source === 'foundation') {
        const success = this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, 'foundation', colIndex);
        if (success) {
          this.clearSelection();
          return;
        }
      }
    }

    this.selected = { source, colIndex, cardIndex, card };
    this.renderHighlights();
  }

  handleSlotClick(targetType, targetIndex) {
    if (!this.selected || this.autoFinishing) return;
    this.executeMove(this.selected.source, this.selected.colIndex, this.selected.cardIndex, targetType, targetIndex);
    this.clearSelection();
  }

  handleCardDoubleClick(card, source, colIndex, cardIndex, event) {
    if (this.autoFinishing) return;
    event.stopPropagation();
    if (!card.faceUp) return;

    if (source === 'waste' && cardIndex !== this.waste.length - 1) return;

    // 1. Single top card: Try moving to Foundation first
    const isSingleCard =
      (source === 'waste' && cardIndex === this.waste.length - 1) ||
      (source === 'tableau' && cardIndex === this.tableau[colIndex].length - 1) ||
      (source === 'foundation');

    if (isSingleCard) {
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(card, f)) {
          this.executeMove(source, colIndex, cardIndex, 'foundation', f);
          return;
        }
      }
    }

    // 2. Try moving to Tableau column (including Kings moving to empty spaces)
    // Avoid moving a King already sitting alone at the base of an empty column (cardIndex === 0)
    // to another empty column.
    for (let t = 0; t < 7; t++) {
      if (source === 'tableau' && colIndex === t) continue;
      if (card.rank === 13 && source === 'tableau' && cardIndex === 0 && this.tableau[t].length === 0) {
        continue;
      }
      if (this.canMoveToTableau(card, t)) {
        this.executeMove(source, colIndex, cardIndex, 'tableau', t);
        return;
      }
    }
  }

  clearSelection() {
    this.selected = null;
    this.renderHighlights();
  }

  renderHighlights() {
    document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.empty-tableau-base.valid-target').forEach(el => el.classList.remove('valid-target'));
    if (!this.selected) return;

    const { source, colIndex, cardIndex, card } = this.selected;

    if (source === 'waste') {
      const cards = this.dom.waste.querySelectorAll('.card');
      const cardEl = cards[cards.length - 1];
      if (cardEl) cardEl.classList.add('selected');
    } else if (source === 'tableau') {
      const cards = this.dom.tableau[colIndex].querySelectorAll('.card');
      for (let i = cardIndex; i < cards.length; i++) {
        if (cards[i]) cards[i].classList.add('selected');
      }
    }

    // If selected card is a King, highlight all empty tableau column placeholders
    if (card && card.rank === 13) {
      document.querySelectorAll('.empty-tableau-base').forEach(base => {
        base.classList.add('valid-target');
      });
    }
  }

  executeMove(source, fromCol, fromCardIdx, targetType, targetIdx) {
    let movingCards = [];

    if (source === 'waste') {
      if (this.waste.length === 0) return false;
      movingCards = [this.waste[this.waste.length - 1]];
    } else if (source === 'tableau') {
      const col = this.tableau[fromCol];
      if (fromCardIdx < 0 || fromCardIdx >= col.length) return false;
      movingCards = col.slice(fromCardIdx);
    } else if (source === 'foundation') {
      const pile = this.foundations[fromCol];
      if (pile.length === 0) return false;
      movingCards = [pile[pile.length - 1]];
    }

    if (movingCards.length === 0) return false;
    const baseCard = movingCards[0];

    if (targetType === 'foundation') {
      if (movingCards.length !== 1) return false;
      if (!this.canMoveToFoundation(baseCard, targetIdx)) return false;

      this.saveState();

      if (source === 'waste') this.waste.pop();
      else if (source === 'tableau') this.tableau[fromCol].pop();
      else if (source === 'foundation') this.foundations[fromCol].pop();

      this.foundations[targetIdx].push(baseCard);
      this.score += 10;
      this.moves++;
      this.revealTableauTops();
      this.sound.playFoundation();
      this.render();
      this.checkWinCondition();
      return true;
    }

    if (targetType === 'tableau') {
      if (!this.canMoveToTableau(baseCard, targetIdx)) return false;

      this.saveState();

      if (source === 'waste') {
        this.waste.pop();
        this.score += 5;
      } else if (source === 'tableau') {
        this.tableau[fromCol].splice(fromCardIdx);
      } else if (source === 'foundation') {
        this.foundations[fromCol].pop();
        this.score = Math.max(0, this.score - 15);
      }

      this.tableau[targetIdx].push(...movingCards);
      this.moves++;
      this.revealTableauTops();
      this.sound.playPlace();
      this.render();
      return true;
    }

    return false;
  }

  // --- Smart Hint System ---
  giveHint() {
    this.clearSelection();
    document.querySelectorAll('.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));

    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    const suitName = (suit) => (t.suitTitles && t.suitTitles[suit]) || suit;
    let hintFound = null;

    for (let tr = 0; tr < 7; tr++) {
      const col = this.tableau[tr];
      if (col.length === 0) continue;
      const topCard = col[col.length - 1];
      if (!topCard.faceUp) continue;
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(topCard, f)) {
          hintFound = {
            srcEl: this.dom.tableau[tr].querySelector(`.card[data-id="${topCard.id}"]`),
            dstEl: this.dom.foundations[f],
            msg: t.toasts.hintFoundFoundation(topCard.label, suitName(topCard.suit))
          };
          break;
        }
      }
      if (hintFound) break;
    }

    if (!hintFound && this.waste.length > 0) {
      const wasteCard = this.waste[this.waste.length - 1];
      for (let f = 0; f < 4; f++) {
        if (this.canMoveToFoundation(wasteCard, f)) {
          hintFound = {
            srcEl: this.dom.waste.querySelector(`.card[data-id="${wasteCard.id}"]`),
            dstEl: this.dom.foundations[f],
            msg: t.toasts.hintFoundFoundation(wasteCard.label, suitName(wasteCard.suit))
          };
          break;
        }
      }
    }

    if (!hintFound) {
      for (let tr = 0; tr < 7; tr++) {
        const col = this.tableau[tr];
        const firstFaceUpIdx = col.findIndex(c => c.faceUp);
        if (firstFaceUpIdx > 0) {
          const card = col[firstFaceUpIdx];
          for (let targetT = 0; targetT < 7; targetT++) {
            if (targetT === tr) continue;
            if (this.canMoveToTableau(card, targetT)) {
              hintFound = {
                srcEl: this.dom.tableau[tr].querySelector(`.card[data-id="${card.id}"]`),
                dstEl: this.dom.tableau[targetT],
                msg: t.toasts.hintFoundReveal(tr + 1)
              };
              break;
            }
          }
        }
        if (hintFound) break;
      }
    }

    if (!hintFound && this.waste.length > 0) {
      const wasteCard = this.waste[this.waste.length - 1];
      for (let tr = 0; tr < 7; tr++) {
        if (this.canMoveToTableau(wasteCard, tr)) {
          hintFound = {
            srcEl: this.dom.waste.querySelector(`.card[data-id="${wasteCard.id}"]`),
            dstEl: this.dom.tableau[tr],
            msg: t.toasts.hintFoundTableau(wasteCard.label, suitName(wasteCard.suit), tr + 1)
          };
          break;
        }
      }
    }

    if (hintFound && hintFound.srcEl && hintFound.dstEl) {
      hintFound.srcEl.classList.add('hint-highlight');
      hintFound.dstEl.classList.add('hint-highlight');
      this.showToast(`💡 ${hintFound.msg}`);
      setTimeout(() => {
        hintFound.srcEl.classList.remove('hint-highlight');
        hintFound.dstEl.classList.remove('hint-highlight');
      }, 2500);
    } else {
      this.dom.stock.classList.add('hint-highlight');
      this.showToast(t.toasts.hintStock);
      setTimeout(() => this.dom.stock.classList.remove('hint-highlight'), 2000);
    }
  }

  // --- Win Condition & Player Name Entry ---
  checkWinCondition() {
    const totalInFoundations = this.foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalInFoundations === 52) {
      this.gameWon = true;
      clearInterval(this.timerInterval);
      this.sound.playVictory();
      this.celebration.start();

      const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
      const modeName = this.drawMode === 3 ? t.winModal.modeDraw3 : t.winModal.modeDraw1;
      const timeFormatted = this.formatTime(this.timerSeconds);

      this.dom.winDealType.textContent = this.dealType === 'solvable' ? t.winModal.dealSolvable : t.winModal.dealRandom;
      this.dom.winMode.textContent = modeName;
      this.dom.winTime.textContent = timeFormatted;
      this.dom.winMoves.textContent = this.moves;
      this.dom.winScore.textContent = this.score;

      const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
      this.dom.winNameInput.value = savedName;
      this.dom.winSaveMsg.classList.add('hidden');
      this.dom.btnSaveScore.textContent = t.winModal.btnSaveScore;
      this.dom.btnSaveScore.disabled = false;
      this.hasSavedCurrentWin = false;

      this.pendingWinRecord = {
        mode: this.drawMode === 3 ? 'draw3' : 'draw1',
        dealType: this.dealType,
        score: this.score,
        timeSeconds: this.timerSeconds,
        timeFormatted: timeFormatted,
        moves: this.moves,
        date: new Date().toLocaleDateString(this.lang)
      };

      this.dom.winModal.classList.remove('hidden');

      if (this.dealType === 'solvable') {
        if (this.dom.winNameBox) this.dom.winNameBox.classList.add('hidden');
        if (this.dom.winSolvableNote) this.dom.winSolvableNote.classList.remove('hidden');
      } else {
        if (this.dom.winNameBox) this.dom.winNameBox.classList.remove('hidden');
        if (this.dom.winSolvableNote) this.dom.winSolvableNote.classList.add('hidden');
        setTimeout(() => this.dom.winNameInput && this.dom.winNameInput.focus(), 300);
      }
    }
  }

  async commitPlayerScore() {
    if (!this.pendingWinRecord || this.hasSavedCurrentWin || this.pendingWinRecord.dealType === 'solvable') return;

    let playerName = this.dom.winNameInput.value.trim();
    if (!playerName) {
      playerName = 'Player';
    }

    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);

    const record = {
      ...this.pendingWinRecord,
      name: playerName,
      device: getDeviceType(),
      timestamp: Date.now()
    };

    // 1. Record in local device storage
    this.recordLocalHighScore(record);

    // 2. Submit to global Firebase Realtime Database
    this.hasSavedCurrentWin = true;
    this.dom.btnSaveScore.disabled = true;
    this.dom.btnSaveScore.textContent = '...';

    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    try {
      await this.submitGlobalScore(record, record.mode);
      this.globalScoresCache[record.mode] = null; // Invalidate cache
      this.dom.winSaveMsg.textContent = t.winModal.saveSuccess;
    } catch (err) {
      console.warn('Firebase submission failed, saved locally:', err);
      this.dom.winSaveMsg.textContent = t.winModal.saveSuccessLocal || t.winModal.saveSuccess;
    }

    this.dom.winSaveMsg.classList.remove('hidden');
    this.dom.btnSaveScore.textContent = '✓';
  }

  // --- Two Distinct High Score Boards (Draw 1 & Draw 3) with Global & Local Sync ---
  getStorageKeyForMode(mode) {
    return mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3'))
      ? STORAGE_KEYS.HIGH_SCORES_DRAW3
      : STORAGE_KEYS.HIGH_SCORES_DRAW1;
  }

  getLocalHighScoresForMode(mode) {
    const key = this.getStorageKeyForMode(mode);
    try {
      const data = localStorage.getItem(key);
      const list = data ? JSON.parse(data) : [];
      return list.filter(s => s.dealType !== 'solvable');
    } catch {
      return [];
    }
  }

  recordLocalHighScore(record) {
    if (record.dealType === 'solvable') return;
    const key = this.getStorageKeyForMode(record.mode);
    let scores = this.getLocalHighScoresForMode(record.mode);
    scores.push(record);

    scores.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds || a.moves - b.moves);

    const top100 = scores.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(top100));
  }

  async submitGlobalScore(record, mode) {
    if (record.dealType === 'solvable') return false;
    const modeKey = (mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3')))
      ? 'draw3'
      : 'draw1';
    const url = `${FIREBASE_DATABASE_URL}/scores/${modeKey}.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  }

  async fetchGlobalScores(mode) {
    const modeKey = (mode === 'Draw 3' || mode === 'draw3' || mode === 3 || (typeof mode === 'string' && mode.includes('3')))
      ? 'draw3'
      : 'draw1';
    const url = `${FIREBASE_DATABASE_URL}/scores/${modeKey}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data) return [];
      const list = Object.keys(data)
        .map(k => ({ id: k, ...data[k] }))
        .filter(s => s.dealType !== 'solvable');
      list.sort((a, b) => b.score - a.score || a.timeSeconds - b.timeSeconds || a.moves - b.moves);
      return list.slice(0, 100);
    } catch (err) {
      console.warn('Could not load global scores:', err);
      return null;
    }
  }

  openHighScores(targetMode = null) {
    const mode = targetMode || (this.drawMode === 3 ? 'draw3' : 'draw1');
    this.currentScoreTab = mode;
    this.dom.tabDraw1.classList.toggle('active', mode === 'draw1');
    this.dom.tabDraw3.classList.toggle('active', mode === 'draw3');
    this.dom.scoresModal.classList.remove('hidden');
    this.loadAndRenderScores();
  }

  switchScoreTab(tab) {
    this.currentScoreTab = tab;
    this.dom.tabDraw1.classList.toggle('active', tab === 'draw1');
    this.dom.tabDraw3.classList.toggle('active', tab === 'draw3');
    this.loadAndRenderScores();
  }

  switchDeviceFilter(device) {
    this.currentDeviceFilter = device;
    if (this.dom.filterDeviceAll) this.dom.filterDeviceAll.classList.toggle('active', device === 'all');
    if (this.dom.filterDeviceDesktop) this.dom.filterDeviceDesktop.classList.toggle('active', device === 'desktop');
    if (this.dom.filterDeviceMobile) this.dom.filterDeviceMobile.classList.toggle('active', device === 'mobile');
    this.renderHighScoresTable();
  }

  async refreshScores() {
    if (this.isLoadingScores) return;
    this.globalScoresCache[this.currentScoreTab] = null;
    await this.loadAndRenderScores(true);
  }

  async loadAndRenderScores(isManualRefresh = false) {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;

    if (!this.globalScoresCache[this.currentScoreTab] || isManualRefresh) {
      this.isLoadingScores = true;
      if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.classList.add('is-spinning');
      this.dom.scoresTbody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-scores-msg">⏳ ${t.scoresModal.loading || 'Loading...'}</td>
        </tr>
      `;

      const globalList = await this.fetchGlobalScores(this.currentScoreTab);
      if (this.dom.btnRefreshScores) this.dom.btnRefreshScores.classList.remove('is-spinning');
      this.isLoadingScores = false;

      if (globalList !== null) {
        this.globalScoresCache[this.currentScoreTab] = globalList;
      } else {
        // If fetch failed (offline or network error), notify and use local cache as fallback
        this.showToast(t.scoresModal.offlineNotice || 'Offline');
        if (!this.globalScoresCache[this.currentScoreTab]) {
          this.globalScoresCache[this.currentScoreTab] = this.getLocalHighScoresForMode(this.currentScoreTab);
        }
      }
    }

    this.renderHighScoresTable();
  }

  renderHighScoresTable() {
    const t = TRANSLATIONS[this.lang] || TRANSLATIONS.de;
    let rawScores = this.globalScoresCache[this.currentScoreTab] || this.getLocalHighScoresForMode(this.currentScoreTab) || [];
    let scores = rawScores.filter(s => s.dealType !== 'solvable');

    // Apply device filter
    let filtered = scores;
    if (this.currentDeviceFilter !== 'all') {
      filtered = scores.filter(s => (s.device || 'desktop') === this.currentDeviceFilter);
    }

    this.dom.scoresTbody.innerHTML = '';
    if (filtered.length === 0) {
      this.dom.scoresTbody.innerHTML = `
        <tr>
          <td colspan="6" class="no-scores-msg">${t.scoresModal.empty}</td>
        </tr>
      `;
      return;
    }

    filtered.forEach((s, idx) => {
      const tr = document.createElement('tr');
      const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1).toString();
      const isMobile = s.device === 'mobile';
      const deviceIcon = isMobile ? '📱' : '💻';
      const deviceTitle = isMobile ? (t.scoresModal.filterMobile || 'Mobile') : (t.scoresModal.filterDesktop || 'PC');

      tr.innerHTML = `
        <td><strong>${rankBadge}</strong></td>
        <td class="player-name-cell" title="${escapeHtml(s.name || 'Player')}">
          <span class="player-device-badge" title="${deviceTitle}">${deviceIcon}</span>
          <span class="player-name-text">${escapeHtml(s.name || 'Player')}</span>
        </td>
        <td><strong>${s.score}</strong></td>
        <td>${s.timeFormatted}</td>
        <td>${s.moves}</td>
        <td>${s.date}</td>
      `;
      this.dom.scoresTbody.appendChild(tr);
    });
  }

  // --- Rendering UI ---
  render() {
    this.updateStats();
    this.renderStock();
    this.renderWaste();
    this.renderFoundations();
    this.renderTableau();
    this.renderHighlights();

    if (this.canAutoFinish()) {
      this.dom.btnAutocomplete.classList.remove('hidden');
    } else {
      this.dom.btnAutocomplete.classList.add('hidden');
    }
  }

  updateStats() {
    this.dom.score.textContent = this.score;
    this.dom.moves.textContent = this.moves;
    this.dom.timer.textContent = this.formatTime(this.timerSeconds);
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  createCardElement(card, source, colIndex, cardIndex) {
    const el = document.createElement('div');
    el.classList.add('card', `suit-${card.suit}`);
    el.dataset.id = card.id;

    if (!card.faceUp) {
      el.classList.add('face-down');
      return el;
    }

    el.classList.add('face-up', card.color);

    const isInteractive = source !== 'waste' || cardIndex === this.waste.length - 1;
    if (isInteractive) {
      el.addEventListener('click', (e) => this.handleCardClick(card, source, colIndex, cardIndex, e));
      el.addEventListener('dblclick', (e) => this.handleCardDoubleClick(card, source, colIndex, cardIndex, e));
      el.addEventListener('pointerdown', (e) => this.handleCardPointerDown(card, source, colIndex, cardIndex, el, e));
    }

    const rankValue = card.rank || card.value || 1;
    let cardBodyHTML = '';
    let topCornerSuitHTML = '';

    if (rankValue >= 11) {
      // Authentic German Berliner Bild Court Cards (Bube, Dame, König) with Schnaps & Drop suits
      cardBodyHTML = `<div class="card-court-figure">${getCourtCardSVG(rankValue, card.suit)}</div>`;
      topCornerSuitHTML = `<span class="card-corner-suit">${getShotGlassSVG(card.suit, 'corner')}</span>`;
    } else {
      // Number Cards (1 to 10) - Shot glasses matching the number of the card
      cardBodyHTML = getPipsHTML(rankValue, card.suit);
    }

    el.innerHTML = `
      <div class="card-corner top-left">
        <span class="card-rank">${card.label}</span>
        ${topCornerSuitHTML}
      </div>
      ${cardBodyHTML}
      <div class="card-corner bottom-right">
        <span class="card-rank">${card.label}</span>
      </div>
    `;

    return el;
  }

  renderStock() {
    this.dom.stock.innerHTML = '';
    if (this.stock.length > 0) {
      const top = document.createElement('div');
      top.classList.add('card', 'face-down');
      this.dom.stock.appendChild(top);
    } else {
      const marker = document.createElement('div');
      marker.className = 'slot-marker';
      marker.textContent = '↺';
      this.dom.stock.appendChild(marker);
    }
  }

  renderWaste() {
    this.dom.waste.innerHTML = '';
    const len = this.waste.length;
    if (len === 0) {
      this.dom.waste.classList.remove('has-cards');
      return;
    }
    this.dom.waste.classList.add('has-cards');

    const visibleCount = this.drawMode === 3 ? Math.min(3, len) : 1;
    const startIndex = len - visibleCount;

    for (let i = startIndex; i < len; i++) {
      const card = this.waste[i];
      const el = this.createCardElement(card, 'waste', 0, i);
      if (this.drawMode === 3) {
        const offsetIndex = i - startIndex;
        el.style.left = `${offsetIndex * 18}px`;
        el.style.zIndex = offsetIndex + 1;
      } else {
        el.style.left = '0px';
        el.style.zIndex = 1;
      }
      this.dom.waste.appendChild(el);
    }
  }

  renderFoundations() {
    this.foundations.forEach((pile, fIdx) => {
      const slot = this.dom.foundations[fIdx];
      slot.innerHTML = '';

      if (pile.length > 0) {
        const topCard = pile[pile.length - 1];
        const el = this.createCardElement(topCard, 'foundation', fIdx, pile.length - 1);
        el.style.zIndex = pile.length;
        slot.appendChild(el);
      } else {
        const watermark = document.createElement('span');
        watermark.className = 'slot-watermark';
        watermark.innerHTML = getShotGlassSVG(SUITS[fIdx].name, 'watermark');
        slot.appendChild(watermark);
      }
    });
  }

  createEmptyTableauBase(colIdx) {
    const el = document.createElement('div');
    el.className = 'empty-tableau-base';
    el.setAttribute('data-col', colIdx);
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Empty Column ${colIdx + 1} - Place King`);
    el.innerHTML = `
      <span class="empty-slot-crown">👑</span>
      <span class="empty-slot-label">K</span>
    `;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleSlotClick('tableau', colIdx);
    });
    return el;
  }

  renderTableau() {
    this.tableau.forEach((col, colIdx) => {
      const slot = this.dom.tableau[colIdx];
      slot.innerHTML = '';

      if (col.length === 0) {
        slot.appendChild(this.createEmptyTableauBase(colIdx));
        return;
      }

      let topOffset = 0;
      col.forEach((card, cardIdx) => {
        const el = this.createCardElement(card, 'tableau', colIdx, cardIdx);
        el.style.top = `${topOffset}px`;
        el.style.zIndex = cardIdx + 1;
        slot.appendChild(el);
        topOffset += card.faceUp ? 26 : 14;
      });
    });
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stock-pile')) {
    window.solitaireApp = new SolitaireGame();
  }
});
