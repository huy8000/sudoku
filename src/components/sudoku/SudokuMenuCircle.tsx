import * as React from "react";
import {SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {Cell} from "src/lib/engine/types";
import {Bounds} from "src/components/sudoku/types";
import SudokuGame from "src/lib/game/SudokuGame";

export const MenuContainer = ({bounds, children}: {bounds: Bounds; children: React.ReactNode}) => (
  <div
    className="absolute pointer-events-none"
    style={{
      width: `${bounds.width}%`,
      height: `${bounds.height}%`,
      top: `${bounds.top}%`,
      left: `${bounds.left}%`,
    }}
  >
    {children}
  </div>
);

export const MenuWrapper = ({children}: {children: React.ReactNode}) => (
  <div
    className="relative z-50 pointer-events-auto"
    style={{
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
  >
    <div className="menu-wrapper-mobile">{children}</div>
  </div>
);

interface SudokuMenuCircleProps {
  cell: Cell;
  notesMode: boolean;
  showHints: boolean;
  showOccurrences?: boolean;
  setNumber: (cell: Cell, number: number) => void;
  setNotes: (cell: Cell, notes: number[]) => void;
  showMenu: () => void;
  hideMenu?: () => void;
  toggleNotesMode?: () => void;
  clearNumber: (cell: Cell) => void;
  sudoku: Cell[];
}

const MenuCircle: React.FC<SudokuMenuCircleProps> = ({
  cell,
  notesMode,
  showHints,
  showOccurrences = false,
  setNumber,
  setNotes,
  clearNumber,
  sudoku,
  showMenu,
  hideMenu,
  toggleNotesMode,
}) => {
  if (cell === null) {
    return null;
  }

  const conflicting = SudokuGame.conflictingFields(sudoku);
  const userNotes = sudoku[cell.y * 9 + cell.x].notes;
  const conflictingCell = conflicting[cell.y * 9 + cell.x];
  const autoNotes = showHints ? conflictingCell.possibilities : [];
  const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

  // Smart offset positioning so the floating popover does not clip against board edges
  const shiftX = cell.x <= 1 ? "10%" : cell.x >= 7 ? "-110%" : "-50%";
  const shiftY = cell.y <= 1 ? "15%" : cell.y >= 7 ? "-115%" : "-50%";

  return (
    <div
      data-testid="sudoku-menu-circle"
      className="flex flex-col absolute z-50 w-48 bg-white/95 dark:bg-zinc-850/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] border border-stone-200/90 dark:border-zinc-700/80 p-2.5 select-none transition-all duration-150 animate-in fade-in zoom-in-95"
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(${shiftX}, ${shiftY})`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        showMenu();
      }}
    >
      {/* Header bar: mode toggle button + erase + close */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-100 dark:border-zinc-750 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (toggleNotesMode) {
              toggleNotesMode();
            }
          }}
          className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
            notesMode
              ? "bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300"
              : "bg-stone-100 dark:bg-zinc-750 text-stone-700 dark:text-zinc-200 hover:text-teal-600 dark:hover:text-teal-400"
          }`}
          title="切换填数/笔记模式"
        >
          {notesMode ? "✎ 笔记模式" : "填入数字"}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearNumber(cell);
              if (hideMenu && !notesMode) {
                hideMenu();
              }
            }}
            className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 px-1.5 py-0.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-xs font-medium cursor-pointer border-none bg-transparent"
            title="擦除"
          >
            擦除
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (hideMenu) {
                hideMenu();
              }
            }}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 w-5 h-5 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-750 transition-colors text-xs font-bold cursor-pointer border-none bg-transparent"
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3x3 Number Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {SUDOKU_NUMBERS.map((number) => {
          let isActive = number === cell.number;
          if (notesMode) {
            isActive = notesToUse.includes(number);
          }
          const isHint = !notesMode && showHints && conflictingCell.possibilities.includes(number);

          const occurrences = sudoku.filter((c) => c.number === number).length;
          const isComplete = occurrences === 9;

          return (
            <button
              key={number}
              type="button"
              aria-label={`Set ${number}`}
              data-testid={`sudoku-number-${number}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (notesMode) {
                  const newNotes = notesToUse.includes(number)
                    ? notesToUse.filter((note) => note !== number)
                    : [...userNotes, number];
                  setNotes(cell, newNotes);
                } else {
                  if (number === cell.number) {
                    clearNumber(cell);
                  } else {
                    setNumber(cell, number);
                  }
                }
              }}
              className={`h-10 rounded-xl font-bold font-mono text-base flex items-center justify-center transition-all cursor-pointer relative ${
                isActive
                  ? notesMode
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-teal-600 text-white shadow-xs"
                  : isComplete && !notesMode
                  ? "bg-stone-50 dark:bg-zinc-800 text-stone-300 dark:text-zinc-600 border border-stone-100 dark:border-zinc-800"
                  : "bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-750 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-100 border border-stone-200/60 dark:border-zinc-700/60"
              }`}
            >
              {number}
              {isHint && !isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
              {showOccurrences && (
                <span
                  data-testid={`sudoku-number-occurrences-${number}`}
                  className="absolute right-1 bottom-0.5 text-[9px] font-mono leading-none font-semibold text-stone-400 dark:text-zinc-500"
                >
                  {occurrences}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MenuCircle;
