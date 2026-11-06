import * as React from "react";
import {SUDOKU_NUMBERS} from "src/lib/engine/utility";
import {CellCoordinates, Cell} from "src/lib/engine/types";
import Button from "src/components/Button";
import clsx from "clsx";
import SudokuGame from "src/lib/game/SudokuGame";

export interface SudokuMenuNumbersProps {
  notesMode: boolean;
  activeCell?: CellCoordinates;
  showOccurrences: boolean;
  sudoku: Cell[];
  showHints: boolean;
  setNumber: (cellCoordinates: CellCoordinates, number: number) => void;
  setNotes: (cellCoordinates: CellCoordinates, notes: number[]) => void;
}

const SudokuMenuNumbers: React.FC<SudokuMenuNumbersProps> = ({
  notesMode,
  activeCell,
  showOccurrences,
  sudoku,
  showHints,
  setNumber,
  setNotes,
}) => {
  return (
    <div className="grid w-full justify-center gap-1.5 sm:gap-2 grid-cols-9">
      {SUDOKU_NUMBERS.map((n) => {
        const occurrences = sudoku.filter((c) => c.number === n).length;
        const isComplete = occurrences === 9;
        const isOverfilled = occurrences > 9;

        const conflicting = SudokuGame.conflictingFields(sudoku);

        const activeCellData = activeCell ? sudoku[activeCell.y * 9 + activeCell.x] : undefined;
        const userNotes = activeCellData?.notes ?? [];
        const conflictingCell = activeCell ? conflicting[activeCell.y * 9 + activeCell.x] : undefined;
        const autoNotes = (showHints ? conflictingCell?.possibilities : []) ?? [];

        const setNumberOrNote = () => {
          if (!activeCell) {
            return;
          }

          if (notesMode) {
            const startingNotes = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;

            const newNotes = startingNotes.includes(n) ? startingNotes.filter((note) => note !== n) : [...userNotes, n];
            setNotes(activeCell, newNotes);
          } else {
            setNumber(activeCell, n);
          }
        };

        const hasUserNote = notesMode && userNotes.includes(n) && activeCellData?.number === 0;
        const hasAutoNote =
          notesMode &&
          userNotes.length === 0 &&
          autoNotes.includes(n) &&
          !userNotes.includes(n) &&
          activeCellData?.number === 0;

        return (
          <Button
            aria-label={`Set ${n}`}
            className={clsx(
              "relative flex items-center justify-center h-12 sm:h-14 md:h-16 text-xl sm:text-2xl font-bold font-mono rounded-xl border transition-all duration-150 shadow-xs",
              {
                "opacity-40 bg-stone-100 dark:bg-zinc-850 border-stone-200 dark:border-zinc-800 text-stone-400 dark:text-zinc-500 hover:opacity-80":
                  isComplete && !hasUserNote && !hasAutoNote,
                "bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400":
                  showOccurrences && isOverfilled,
                "bg-sky-600 dark:bg-sky-600 text-white border-sky-600 ring-2 ring-sky-400/40 shadow-sm":
                  hasUserNote,
                "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800":
                  hasAutoNote,
                "bg-white dark:bg-zinc-800 border-stone-200/80 dark:border-zinc-700/80 text-stone-800 dark:text-zinc-100 hover:border-teal-500/70 dark:hover:border-teal-400/70 hover:bg-teal-50/40 dark:hover:bg-zinc-750":
                  !isComplete && !hasUserNote && !hasAutoNote && !isOverfilled,
              },
            )}
            data-testid={`sudoku-number-${n}`}
            onClick={setNumberOrNote}
            key={n}
          >
            {n}
            {showOccurrences && (
              <span
                className={clsx(
                  "absolute right-1 bottom-1 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 rounded-full text-[9px] font-semibold font-mono leading-none",
                  isComplete
                    ? "bg-stone-300 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300"
                    : isOverfilled
                    ? "bg-red-600 text-white"
                    : "bg-teal-600 dark:bg-teal-500 text-white shadow-2xs",
                )}
                data-testid={`sudoku-number-occurrences-${n}`}
              >
                {occurrences}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default SudokuMenuNumbers;
