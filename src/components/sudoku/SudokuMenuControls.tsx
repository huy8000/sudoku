import * as React from "react";
import Button from "../Button";
import clsx from "clsx";
import {CellCoordinates} from "src/lib/engine/types";
import {useTranslation} from "react-i18next";

export const UndoButton: React.FC<{
  canUndo: boolean;
  undo: () => void;
}> = ({canUndo, undo}) => {
  const {t} = useTranslation();
  return (
    <Button
      disabled={!canUndo}
      onClick={undo}
      className="flex flex-col items-center justify-center h-12 sm:h-14 p-1 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/90 hover:bg-stone-50 dark:hover:bg-zinc-750 transition-all shadow-xs"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a5 5 0 015 5v2M3 10l6-6m-6 6l6 6" />
      </svg>
      <span className="text-[11px] sm:text-xs font-medium text-stone-700 dark:text-zinc-300 mt-0.5">{t("undo_btn")}</span>
    </Button>
  );
};

export const EraseButton: React.FC<{
  activeCellCoordinates: CellCoordinates | undefined;
  clearCell: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, clearCell}) => {
  const {t} = useTranslation();
  return (
    <Button
      onClick={() => activeCellCoordinates && clearCell(activeCellCoordinates)}
      className="flex flex-col items-center justify-center h-12 sm:h-14 p-1 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/90 hover:bg-stone-50 dark:hover:bg-zinc-750 transition-all shadow-xs"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-[11px] sm:text-xs font-medium text-stone-700 dark:text-zinc-300 mt-0.5">{t("erase_btn")}</span>
    </Button>
  );
};

const NotesButton: React.FC<{
  notesMode: boolean;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
}> = ({notesMode, activateNotesMode, deactivateNotesMode}) => {
  const {t} = useTranslation();
  return (
    <Button
      onClick={() => (notesMode ? deactivateNotesMode() : activateNotesMode())}
      className={clsx(
        "relative flex flex-col items-center justify-center h-12 sm:h-14 p-1 rounded-xl border transition-all shadow-xs",
        {
          "bg-sky-600 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-500 hover:bg-sky-700": notesMode,
          "border-stone-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/90 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-750":
            !notesMode,
        },
      )}
    >
      <div className="relative">
        <svg
          className={clsx("w-4 h-4 sm:w-5 sm:h-5", notesMode ? "text-white" : "text-stone-600 dark:text-zinc-300")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <span
          className={clsx(
            "absolute -top-1 -right-2 text-[8px] font-bold px-1 py-0.2 rounded-full uppercase leading-tight",
            notesMode ? "bg-white text-sky-700" : "bg-stone-200 text-stone-600 dark:bg-zinc-700 dark:text-zinc-300",
          )}
        >
          {notesMode ? "ON" : "OFF"}
        </span>
      </div>
      <span className="text-[11px] sm:text-xs font-medium mt-0.5">{t("note_btn")}</span>
    </Button>
  );
};

const HintButton: React.FC<{
  activeCellCoordinates: CellCoordinates;
  getHint: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, getHint}) => {
  const {t} = useTranslation();
  return (
    <Button
      onClick={() => activeCellCoordinates && getHint(activeCellCoordinates)}
      className="flex flex-col items-center justify-center h-12 sm:h-14 p-1 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/90 hover:bg-stone-50 dark:hover:bg-zinc-750 transition-all shadow-xs"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <span className="text-[11px] sm:text-xs font-medium text-stone-700 dark:text-zinc-300 mt-0.5">{t("hint_btn")}</span>
    </Button>
  );
};

const SudokuMenuControls: React.FC<{
  notesMode: boolean;
  activeCellCoordinates: CellCoordinates;
  clearCell: (cellCoordinates: CellCoordinates) => void;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  getHint: (cellCoordinates: CellCoordinates) => void;
  canUndo: boolean;
  undo: () => void;
}> = ({
  notesMode,
  activeCellCoordinates,
  clearCell,
  activateNotesMode,
  deactivateNotesMode,
  getHint,
  canUndo,
  undo,
}) => {
  return (
    <div className="grid w-full grid-cols-4 gap-2.5">
      <UndoButton canUndo={canUndo} undo={undo} />
      <EraseButton activeCellCoordinates={activeCellCoordinates} clearCell={clearCell} />
      <NotesButton
        notesMode={notesMode}
        activateNotesMode={activateNotesMode}
        deactivateNotesMode={deactivateNotesMode}
      />
      <HintButton activeCellCoordinates={activeCellCoordinates} getHint={getHint} />
    </div>
  );
};

export default SudokuMenuControls;
