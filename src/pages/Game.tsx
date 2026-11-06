import * as React from "react";

import {useGame, GameStateMachine, GameState, INITIAL_GAME_STATE, GameProvider} from "src/context/GameContext";
import {emptyGrid, INITIAL_SUDOKU_STATE, SudokuProvider, SudokuState, useSudoku} from "src/context/SudokuContext";

import {Sudoku} from "src/components/sudoku/Sudoku";

import GameTimer from "./Game/GameTimer";

import Button from "src/components/Button";
import SudokuGame from "src/lib/game/SudokuGame";
import SudokuMenuNumbers from "src/components/sudoku/SudokuMenuNumbers";
import SudokuMenuControls from "src/components/sudoku/SudokuMenuControls";
import {Container} from "src/components/Layout";
import Shortcuts from "./Game/shortcuts/Shortcuts";
import Checkbox from "src/components/Checkbox";
import {cellsToSimpleSudoku, stringifySudoku, parseSudoku} from "src/lib/engine/utility";
import {solve} from "src/lib/engine/solverAC3";
import {Link, useLocation, useNavigate} from "@tanstack/react-router";
import {localStoragePlayedSudokuRepository} from "src/lib/database/playedSudokus";
import {UserPreferences} from "src/lib/database/userPreferences";
import {formatDuration} from "src/utils/format";
import {throttle} from "lodash";
import {TimerProvider} from "src/context/TimerContext";
import {useEffect} from "react";
import {CellCoordinates, SimpleSudoku} from "src/lib/engine/types";
import {SettingsModal} from "src/components/SettingsModal";
import {ConfirmModal} from "src/components/ConfirmModal";
import {useTranslation} from "react-i18next";
import {
  INITIAL_USER_PREFERENCES_STATE,
  UserPreferencesProvider,
  useUserPreferences,
} from "src/context/UserPrefencesContext";
import {getSudokusPaginated, useSudokuCollections} from "src/lib/game/sudokus";
import {t} from "i18next";
import {translateCollectionName} from "src/lib/database/collections";

function PauseButton({
  disabled,
  paused,
  pauseGame,
  continueGame,
}: {
  disabled: boolean;
  paused: boolean;
  pauseGame: () => void;
  continueGame: () => void;
}) {
  const {t} = useTranslation();
  return (
    <Button
      disabled={disabled}
      onClick={paused ? continueGame : pauseGame}
      className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-zinc-700 dark:hover:bg-zinc-650 text-stone-700 dark:text-zinc-200 border-none shadow-none ml-1"
    >
      {paused ? t("continue") : t("pause")}
    </Button>
  );
}

const ClearGameButton: React.FC<{
  clearGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  disabled: boolean;
}> = ({clearGame, pauseGame, continueGame, disabled}) => {
  const {t} = useTranslation();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClick = () => {
    pauseGame();
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    continueGame();
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    clearGame();
    // Wait 100ms as we have to wait until the updateTimer is called (should normally take 1/60 second)
    await new Promise((resolve) => setTimeout(resolve, 100));
    continueGame();
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={handleClick}
        className="text-xs sm:text-sm font-medium px-3 py-2 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 border-transparent shadow-none"
      >
        {t("clear")}
      </Button>

      <ConfirmModal
        isOpen={showConfirm}
        message={t("confirm_clear")}
        confirmText={t("confirm", "确定")}
        cancelText={t("cancel", "取消")}
        isDestructive={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

const NewGameButton: React.FC = () => {
  const {pauseGame} = useGame();
  const navigate = useNavigate();
  const {t} = useTranslation();

  const pauseAndChoose = async () => {
    pauseGame();
    await navigate({
      to: "/select-game",
    });
  };

  return (
    <Button
      className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs border-teal-600"
      onClick={pauseAndChoose}
    >
      {t("new_game")}
    </Button>
  );
};

const NextSudokuButton: React.FC<{gameState: GameState; setDisableAutoSync: (disabled: boolean) => void}> = ({
  gameState,
  setDisableAutoSync,
}) => {
  const {getCollection} = useSudokuCollections();
  const collection = React.useMemo(() => {
    try {
      return getCollection(gameState.sudokuCollectionName);
    } catch (error) {
      console.error("Error loading sudoku collection:", error);
      return null;
    }
  }, [gameState.sudokuCollectionName, getCollection]);
  const collectionName = collection
    ? translateCollectionName(collection.name)
    : translateCollectionName(gameState.sudokuCollectionName);

  // Pre-calculate next sudoku parameters
  const nextSudokuParams = React.useMemo(() => {
    if (!collection) {
      return null;
    }

    try {
      const nextIndex = gameState.sudokuIndex + 1;

      const result = getSudokusPaginated(collection, nextIndex, 1);
      const sudoku = result.sudokus[0];

      if (sudoku) {
        return {
          sudokuIndex: nextIndex + 1,
          sudoku: stringifySudoku(sudoku.sudoku),
          sudokuCollectionName: gameState.sudokuCollectionName,
        };
      }
    } catch (error) {
      console.error("Error calculating next sudoku:", error);
    }
    return null;
  }, [gameState.sudokuIndex, gameState.sudokuCollectionName, collection]);

  if (!nextSudokuParams) {
    return (
      <div>
        <p className="dark:text-white text-black mb-4 max-w-64 text-center">
          {t("collection_finished", {collection: collectionName})}
        </p>
        <Link to="/select-game" className="w-full">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full rounded-xl py-2.5 font-semibold shadow-xs">{t("select_new_sudoku")}</Button>
        </Link>
      </div>
    );
  }

  const handleClick = () => {
    // TODO: Hacky solution for now, but it works.
    // What is happening is that we sync the URL state, but us changing the URL here
    // Will lead to an out of sync state with the game state.
    setDisableAutoSync(true);
    // Re-enable after a short delay to let navigation complete
    setTimeout(() => {
      setDisableAutoSync(false);
    }, 2000);
  };

  return (
    <Link to="/" search={nextSudokuParams} className="w-full" onClick={handleClick}>
      <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full rounded-xl py-2.5 font-semibold shadow-xs">
        {t("select_next_sudoku", {
          collection: collectionName,
          sudokuIndex: nextSudokuParams.sudokuIndex,
        })}
      </Button>
    </Link>
  );
};

const ShareButton: React.FC<{
  gameState: GameState;
  sudokuState: SudokuState;
}> = ({gameState, sudokuState}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Error copying to clipboard", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
    const params = new URLSearchParams({
      sudokuIndex: String(gameState.sudokuIndex + 1),
      sudoku: stringifiedSudoku,
      sudokuCollectionName: gameState.sudokuCollectionName,
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}#/?${params.toString()}`;

    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const {t} = useTranslation();

  return (
    <button
      aria-label={t("share")}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
      data-testid="share-sudoku"
      onClick={handleShare}
      type="button"
    >
      {copied ? (
        <span className="text-teal-600 dark:text-teal-400 font-semibold">✓ {t("copied")}</span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{t("share")}</span>
        </>
      )}
    </button>
  );
};

const CenteredContinueButton: React.FC<{visible: boolean; onClick: () => void}> = ({visible, onClick}) => (
  <div
    onClick={onClick}
    data-testid="continue-overlay"
    className={`${visible ? "flex" : "hidden"} flex-col justify-center items-center w-full h-full absolute z-30 inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs hover:cursor-pointer transition-all duration-200`}
  >
    <div className="bg-teal-600 dark:bg-teal-500 rounded-full w-20 h-20 flex justify-center items-center shadow-2xl transition-transform duration-200 ease-out hover:scale-110 active:scale-95 group">
      <svg className="w-9 h-9 text-white translate-x-0.5 fill-current" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
    <span className="text-white text-xs font-semibold mt-3 tracking-wider uppercase opacity-90 drop-shadow-md">
      点击继续
    </span>
  </div>
);

const DifficultyShow = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 capitalize tracking-wide shadow-2xs"
    {...props}
  >
    {children}
  </div>
);

function stripWrappingQuotes(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

function getRawSearchParam(name: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const hashSearch = window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
  const searchSources = [hashSearch, window.location.search.replace(/^\?/, "")].filter(Boolean);

  for (const source of searchSources) {
    const value = new URLSearchParams(source).get(name);
    if (value !== null) {
      return stripWrappingQuotes(value);
    }
  }

  return undefined;
}

function getSearchString(search: Record<string, unknown>, name: string) {
  const rawValue = getRawSearchParam(name);
  if (rawValue !== undefined) {
    return rawValue;
  }

  const value = search[name];
  if (typeof value === "string") {
    return stripWrappingQuotes(value);
  }
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value.toString();
  }
  return undefined;
}

function getSearchNumber(search: Record<string, unknown>, name: string) {
  const value = getSearchString(search, name);
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const GameInner: React.FC<{
  sudokuState: SudokuState;
  setSudoku: (sudoku: SimpleSudoku, solvedSudoku: SimpleSudoku) => void;
  setNumber: (cellCoordinates: CellCoordinates, number: number) => void;
  setNotes: (cellCoordinates: CellCoordinates, notes: number[]) => void;
  clearCell: (cellCoordinates: CellCoordinates) => void;
  getHint: (cellCoordinates: CellCoordinates) => void;
  undo: () => void;
  redo: () => void;
  game: GameState;
  userPreferencesState: UserPreferences;
  pauseGame: () => void;
  continueGame: () => void;
  wonGame: () => void;
  showMenu: () => void;
  selectCell: (cellCoordinates: CellCoordinates) => void;
  activateNotesMode: () => void;
  hideMenu: () => void;
  resetGame: () => void;
  deactivateNotesMode: () => void;
  setDisableAutoSync: (disabled: boolean) => void;
  copyNotes: (notes: number[]) => void;
}> = ({
  sudokuState,
  setSudoku,
  setNumber,
  setNotes,
  clearCell,
  getHint,
  undo,
  redo,
  game,
  userPreferencesState,
  pauseGame,
  continueGame,
  wonGame,
  showMenu,
  selectCell,
  activateNotesMode,
  hideMenu,
  resetGame,
  deactivateNotesMode,
  setDisableAutoSync,
  copyNotes,
}) => {
  const canUndo = sudokuState.historyIndex < sudokuState.history.length - 1;
  const sudoku = sudokuState.current;
  const {t} = useTranslation();
  const {getCollection} = useSudokuCollections();
  const collectionName = React.useMemo(() => {
    try {
      return translateCollectionName(getCollection(game.sudokuCollectionName).name);
    } catch (error) {
      console.error("Error loading sudoku collection:", error);
      return translateCollectionName(game.sudokuCollectionName);
    }
  }, [game.sudokuCollectionName, getCollection]);

  React.useEffect(() => {
    const isSolved = SudokuGame.isSolved(sudoku);
    if (isSolved) {
      wonGame();
    }
  }, [sudoku, wonGame]);
  const onVisibilityChange = React.useCallback(() => {
    if (document.visibilityState === "hidden") {
      pauseGame();
    } else {
      // So the user knows that it was paused, we wait a bit before continuing.
      setTimeout(() => {
        continueGame();
      }, 200);
    }
  }, [pauseGame, continueGame]);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange, false);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange, false);
      }
    };
  }, [onVisibilityChange]);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const wasRunningRef = React.useRef(false);

  const openSettings = React.useCallback(() => {
    if (game.state === GameStateMachine.running) {
      wasRunningRef.current = true;
      pauseGame();
    } else {
      wasRunningRef.current = false;
    }
    setIsSettingsOpen(true);
  }, [game.state, pauseGame]);

  const closeSettings = React.useCallback(() => {
    setIsSettingsOpen(false);
    if (wasRunningRef.current && game.state === GameStateMachine.paused) {
      continueGame();
    }
  }, [game.state, continueGame]);

  const pausedGame = game.state === GameStateMachine.paused;
  const activeCell = game.activeCellCoordinates
    ? sudoku.find((s) => {
        return s.x === game.activeCellCoordinates!.x && s.y === game.activeCellCoordinates!.y;
      })
    : undefined;

  return (
    <div className="w-full min-h-[calc(100vh-1rem)] flex flex-col justify-center items-center py-4 sm:py-6 px-4">
      <div className="w-full max-w-[500px] sm:max-w-[520px] flex flex-col gap-3.5">
        <Shortcuts
          gameState={game.state}
          continueGame={continueGame}
          pauseGame={pauseGame}
          activateNotesMode={activateNotesMode}
          deactivateNotesMode={deactivateNotesMode}
          setNumber={setNumber}
          clearNumber={clearCell}
          getHint={getHint}
          setNotes={setNotes}
          undo={undo}
          redo={redo}
          sudoku={sudoku}
          activeCell={activeCell}
          notesMode={game.notesMode}
          showHints={userPreferencesState.showHints}
          selectCell={selectCell}
          clipboardNotes={game.clipboardNotes}
          copyNotes={copyNotes}
        />
        <header className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/games/"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-stone-200/60 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all shadow-2xs"
              title="返回游戏列表"
            >
              <span>←</span>
              <span>heyhuyu</span>
            </a>
            <DifficultyShow data-testid="current-game-label">{`${collectionName} #${game.sudokuIndex + 1}`}</DifficultyShow>
            <ShareButton gameState={game} sudokuState={sudokuState} />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-zinc-800/90 border border-stone-200/80 dark:border-zinc-700/80 shadow-xs">
            <span className="text-xs text-stone-400 dark:text-zinc-500">⏱</span>
            <div className="font-mono text-sm font-semibold text-stone-800 dark:text-zinc-100">
              <GameTimer />
            </div>
            <PauseButton
              disabled={game.won}
              paused={game.state === GameStateMachine.paused}
              continueGame={continueGame}
              pauseGame={pauseGame}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ClearGameButton
              pauseGame={pauseGame}
              continueGame={continueGame}
              disabled={game.won || game.state === GameStateMachine.paused}
              clearGame={() => {
                const simpleSudoku = cellsToSimpleSudoku(sudokuState.current);
                const solved = solve(simpleSudoku);
                if (solved.sudoku) {
                  setSudoku(simpleSudoku, solved.sudoku);
                }
                resetGame();
              }}
            />
            <NewGameButton />
            <button
              type="button"
              data-testid="settings-button"
              aria-label={t("settings")}
              onClick={openSettings}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700/80 text-stone-700 dark:text-zinc-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-stone-50 dark:hover:bg-zinc-700/80 transition-all shadow-xs cursor-pointer"
              title={t("settings")}
            >
              <svg className="w-4.5 h-4.5 transition-transform duration-300 hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Hero Board - Exactly Centered! */}
        <main className="w-full">
          <Sudoku
            showWrongEntries={userPreferencesState.showWrongEntries && game.state === GameStateMachine.running}
            showConflicts={userPreferencesState.showConflicts && game.state === GameStateMachine.running}
            notesMode={game.notesMode}
            shouldShowMenu={
              userPreferencesState.showCircleMenu &&
              game.showMenu &&
              game.state === GameStateMachine.running
            }
            sudoku={game.state === GameStateMachine.paused ? emptyGrid : sudoku}
            showMenu={showMenu}
            hideMenu={hideMenu}
            selectCell={selectCell}
            showHints={userPreferencesState.showHints && game.state === GameStateMachine.running}
            showOccurrences={userPreferencesState.showOccurrences}
            toggleNotesMode={() => (game.notesMode ? deactivateNotesMode() : activateNotesMode())}
            activeCell={game.state === GameStateMachine.running ? activeCell : undefined}
            setNumber={setNumber}
            setNotes={setNotes}
            clearNumber={clearCell}
          >
            {game.won && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm p-4 text-stone-900 dark:text-white">
                <div className="w-full max-w-xs bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-zinc-700 text-center space-y-4">
                  <div className="text-3xl">🎉</div>
                  <div className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">{t("congrats")}</div>
                  <div className="py-3 px-4 bg-stone-50 dark:bg-zinc-750 rounded-xl space-y-1.5 text-sm border border-stone-100 dark:border-zinc-700/60">
                    <div className="text-stone-500 dark:text-zinc-400 text-xs">
                      {t(game.timesSolved === 1 ? "solved_time" : "solved_times", {count: game.timesSolved})}
                    </div>
                    <div className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                      {t("this_time", {time: formatDuration(game.secondsPlayed)})}
                    </div>
                    {game.previousTimes.length > 0 && (
                      <div className="text-xs text-stone-400 dark:text-zinc-500">
                        {t("best_time", {time: formatDuration(Math.min(...game.previousTimes))})}
                      </div>
                    )}
                  </div>
                  <NextSudokuButton gameState={game} setDisableAutoSync={setDisableAutoSync} />
                </div>
              </div>
            )}

            <CenteredContinueButton visible={pausedGame && !game.won} onClick={continueGame} />
          </Sudoku>
        </main>

        {/* Fallback persistent numbers only when floating circle menu is disabled */}
        {!userPreferencesState.showCircleMenu && (
          <div className="w-full mt-3">
            <SudokuMenuNumbers
              notesMode={game.notesMode}
              showOccurrences={userPreferencesState.showOccurrences}
              activeCell={game.activeCellCoordinates}
              sudoku={sudokuState.current}
              showHints={userPreferencesState.showHints}
              setNumber={setNumber}
              setNotes={setNotes}
            />
          </div>
        )}

        {/* Action Controls - Cleanly centered beneath board */}
        <div className="w-full">
          <SudokuMenuControls
            notesMode={game.notesMode}
            activeCellCoordinates={game.activeCellCoordinates ?? {x: 0, y: 0}}
            clearCell={clearCell}
            activateNotesMode={activateNotesMode}
            deactivateNotesMode={deactivateNotesMode}
            getHint={getHint}
            canUndo={canUndo}
            undo={undo}
          />
        </div>
        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
      </div>
    </div>
  );
};

// Save every 2 seconds.
const throttledSave = throttle(localStoragePlayedSudokuRepository.saveSudokuState, 2000);

export function AppProvider({children}: {children: React.ReactNode}) {
  // Load initial state from persistence
  const currentSudokuKey = localStoragePlayedSudokuRepository.getCurrentSudokuKey();
  const currentSudoku = currentSudokuKey
    ? localStoragePlayedSudokuRepository.getSudokuState(currentSudokuKey)
    : undefined;

  const initialSudokuState: SudokuState = currentSudoku
    ? {
        history: [currentSudoku.sudoku],
        historyIndex: 0,
        current: currentSudoku.sudoku,
      }
    : INITIAL_SUDOKU_STATE;

  const initialGameState: GameState = currentSudoku ? currentSudoku.game : INITIAL_GAME_STATE;

  const initialUserPreferencesState: UserPreferences = INITIAL_USER_PREFERENCES_STATE;

  return (
    <GameProvider initialState={initialGameState}>
      <UserPreferencesProvider initialState={initialUserPreferencesState}>
        <TimerProvider>
          <SudokuProvider initialState={initialSudokuState}>{children}</SudokuProvider>
        </TimerProvider>
      </UserPreferencesProvider>
    </GameProvider>
  );
}

const GameWithRouteManagement = () => {
  const location = useLocation();
  const {
    setGameState,
    state: gameState,
    continueGame,
    newGame,
    pauseGame,
    wonGame,
    showMenu,
    selectCell,
    activateNotesMode,
    deactivateNotesMode,
    resetGame,
    hideMenu,
    copyNotes,
  } = useGame();
  const {state: userPreferencesState} = useUserPreferences();
  const {
    setSudokuState,
    state: sudokuState,
    setSudoku,
    setNumber,
    setNotes,
    clearCell,
    getHint,
    undo,
    redo,
  } = useSudoku();
  const [initialized, setInitialized] = React.useState(false);
  const [disableAutoSync, setDisableAutoSync] = React.useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const currentPath = location.pathname;
  const search = location.search as Record<string, unknown>;
  const sudokuIndex = getSearchNumber(search, "sudokuIndex");
  const sudoku = getSearchString(search, "sudoku");
  const sudokuCollectionName = getSearchString(search, "sudokuCollectionName");

  useEffect(() => {
    if (gameState && sudokuState && initialized && currentPath === "/" && !disableAutoSync) {
      throttledSave(gameState, sudokuState);
      // Also update the URL to the current game state if it differs.
      const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudokuState.current));
      const shouldUpdateUrl = stringifiedSudoku !== sudoku;
      if (shouldUpdateUrl) {
        navigate({
          replace: true,
          to: "/",
          search: {
            sudokuIndex: gameState.sudokuIndex + 1,
            sudoku: stringifiedSudoku,
            sudokuCollectionName: gameState.sudokuCollectionName,
          },
        });
      }
    }
  }, [gameState, sudokuState, initialized, currentPath, sudoku, navigate, disableAutoSync]);

  // In the AppProvider, we load the sudoku from the local storage.
  // TODO: Combine it with this logic.
  React.useEffect(() => {
    // If the URL does not contain a sudoku, we don't need to do anything.
    if (sudokuIndex === undefined || sudoku === undefined || sudokuCollectionName === undefined) {
      setInitialized(true);
      return;
    }

    const currentSudoku = cellsToSimpleSudoku(sudokuState.current);
    // If the current sudoku is the same as the one in the URL, we don't need to do anything.
    if (stringifySudoku(currentSudoku) === sudoku) {
      setInitialized(true);
      return;
    }

    console.info("Loading sudoku from URL", sudokuIndex, sudoku, sudokuCollectionName);
    // We only show a message if the user has played for more than 5 seconds and has not won.
    if (gameState.secondsPlayed > 5 && !gameState.won) {
      const areYouSure = confirm(
        t("confirm_new_game", {
          currentCollectionName: translateCollectionName(gameState.sudokuCollectionName),
          currentIndex: gameState.sudokuIndex + 1,
          newCollectionName: translateCollectionName(sudokuCollectionName),
          newIndex: sudokuIndex,
        }),
      );
      if (!areYouSure) {
        setInitialized(true);
        return;
      }
    }

    // The user wants to play the sudoku from the URL.
    try {
      const parsedSudoku = parseSudoku(sudoku);
      const solvedSudoku = solve(parsedSudoku);
      if (solvedSudoku.sudoku) {
        setSudoku(parsedSudoku, solvedSudoku.sudoku);
      } else {
        alert(t("invalid_sudoku_url"));
        setInitialized(true);
        return;
      }
    } catch (error) {
      alert(t("invalid_sudoku_url"));
      setInitialized(true);
      console.error(error);
      return;
    }

    const storedSudoku = localStoragePlayedSudokuRepository.getSudokuState(sudoku);
    newGame(
      sudokuIndex - 1, // We subtract 1 because the index is 0-based, but we want to display it as 1-based in the URL.
      sudokuCollectionName,
      storedSudoku?.game.timesSolved ?? 0,
      storedSudoku?.game.previousTimes ?? [],
    );

    // If we have a stored sudoku, we need to set the game state and sudoku state.
    if (storedSudoku && !storedSudoku.game.won) {
      setGameState({
        ...storedSudoku.game,
      });
      setSudokuState({
        current: storedSudoku.sudoku,
        history: [storedSudoku.sudoku],
        historyIndex: 0,
      });
    }
    setInitialized(true);
    continueGame();
  }, [
    sudokuIndex,
    sudoku,
    sudokuCollectionName,
    setGameState,
    setSudokuState,
    setInitialized,
    continueGame,
    sudokuState,
    gameState.secondsPlayed,
    gameState.won,
    gameState.sudokuCollectionName,
    gameState.sudokuIndex,
    newGame,
    setSudoku,
    t,
  ]);

  return (
    <GameInner
      sudokuState={sudokuState}
      setSudoku={setSudoku}
      setNumber={setNumber}
      setNotes={setNotes}
      clearCell={clearCell}
      getHint={getHint}
      undo={undo}
      redo={redo}
      game={gameState}
      userPreferencesState={userPreferencesState}
      pauseGame={pauseGame}
      continueGame={continueGame}
      wonGame={wonGame}
      showMenu={showMenu}
      selectCell={selectCell}
      activateNotesMode={activateNotesMode}
      hideMenu={hideMenu}
      resetGame={resetGame}
      deactivateNotesMode={deactivateNotesMode}
      setDisableAutoSync={setDisableAutoSync}
      copyNotes={copyNotes}
    />
  );
};

const Game = () => {
  return (
    <AppProvider>
      <GameWithRouteManagement />
    </AppProvider>
  );
};

export default Game;
