import * as React from "react";
import {Bounds} from "src/components/sudoku/types";
import clsx from "clsx";

export const GridLineX = ({top, width, makeBold}: {top: number; width: number; makeBold: boolean}) => {
  return (
    <div
      style={{
        width: `${width}%`,
        top: `${top}%`,
        height: makeBold ? 2.5 : 1,
      }}
      className={clsx("absolute left-0 -translate-y-1/2 pointer-events-none transition-colors", {
        "z-10 bg-stone-800 dark:bg-zinc-200": makeBold,
        "z-10 bg-stone-200/90 dark:bg-zinc-700/60": !makeBold,
      })}
    />
  );
};

export const GridLineY = ({left, height, makeBold}: {left: number; height: number; makeBold: boolean}) => {
  return (
    <div
      style={{
        height: `${height}%`,
        left: `${left}%`,
        width: makeBold ? 2.5 : 1,
      }}
      className={clsx("absolute top-0 -translate-x-1/2 pointer-events-none transition-colors", {
        "z-10 bg-stone-800 dark:bg-zinc-200": makeBold,
        "z-10 bg-stone-200/90 dark:bg-zinc-700/60": !makeBold,
      })}
    />
  );
};

export const CellNote = ({left, top, children}: {left: number; top: number; children: React.ReactNode}) => {
  return (
    <div
      style={{top: `${top}%`, left: `${left}%`}}
      className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-medium text-stone-500 dark:text-zinc-400 select-none leading-none"
    >
      {children}
    </div>
  );
};

export const CellNoteContainer = ({
  initial,
  bounds,
  children,
  testId,
}: {
  initial: boolean;
  bounds: Bounds;
  children: React.ReactNode;
  testId?: string;
}) => {
  return (
    <div
      data-testid={testId}
      style={{
        width: `${bounds.width}%`,
        height: `${bounds.height}%`,
        top: `${bounds.top}%`,
        left: `${bounds.left}%`,
      }}
      className={clsx("pointer-events-none absolute z-10", {
        "font-bold": initial,
      })}
    >
      {children}
    </div>
  );
};

export const GridCell = ({
  conflict,
  highlight,
  highlightNumber,
  bounds,
  active,
  notesMode,
  initial,
  number,
  testId,
  ariaLabel,
  onClick,
  onRightClick,
}: {
  conflict: boolean;
  highlight: boolean;
  highlightNumber: boolean;
  bounds: Bounds;
  active: boolean;
  notesMode: boolean;
  initial: boolean;
  number: number;
  testId?: string;
  ariaLabel?: string;
  onClick: () => void;
  onRightClick: () => void;
}) => {
  let backgroundColor = "bg-white dark:bg-zinc-900";
  if (highlight) {
    backgroundColor = "bg-stone-100/90 dark:bg-zinc-800/60";
  }
  if (highlightNumber) {
    backgroundColor = "bg-teal-100/60 dark:bg-teal-900/40";
  }
  if (conflict) {
    backgroundColor = "bg-red-100/80 dark:bg-red-950/50";
  }
  if (active) {
    backgroundColor = notesMode
      ? "bg-sky-500/20 dark:bg-sky-400/25"
      : "bg-teal-500/20 dark:bg-teal-400/25";
  }

  let borderColor = "border-transparent";
  if (active) {
    borderColor = notesMode
      ? "border-sky-500 dark:border-sky-400 ring-2 ring-sky-400/30 ring-inset"
      : "border-teal-600 dark:border-teal-400 ring-2 ring-teal-500/30 ring-inset";
  }

  const dimensions = {
    width: `${bounds.width}%`,
    height: `${bounds.height}%`,
    top: `${bounds.top}%`,
    left: `${bounds.left}%`,
  };

  return (
    <>
      <div
        aria-label={ariaLabel}
        data-cell-active={active ? "true" : "false"}
        data-cell-conflict={conflict ? "true" : "false"}
        data-cell-initial={initial ? "true" : "false"}
        data-cell-notes-mode={notesMode ? "true" : "false"}
        data-cell-value={number === 0 ? "" : number}
        data-testid={testId}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRightClick();
        }}
        style={dimensions}
        className={clsx(
          "absolute z-20 border-2 transition-all duration-100 cursor-pointer",
          borderColor,
          !active && "hover:bg-stone-200/40 dark:hover:bg-zinc-700/30",
        )}
      />
      <div
        style={dimensions}
        className={clsx("absolute z-0 transition-colors duration-100", backgroundColor)}
      />
    </>
  );
};

export const GridCellNumber = ({
  initial,
  highlight,
  left,
  top,
  children,
  testId,
  conflict,
}: {
  initial: boolean;
  highlight: boolean;
  conflict: boolean;
  left: number;
  top: number;
  children: React.ReactNode;
  testId?: string;
}) => {
  return (
    <div
      data-testid={testId}
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
      className={clsx(
        "pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 font-sans select-none transition-colors",
        initial ? "text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-50" : "text-xl sm:text-2xl font-semibold",
        {
          "text-teal-700 dark:text-teal-300 font-bold": highlight && !conflict && !initial,
          "text-teal-600 dark:text-teal-400": !initial && !highlight && !conflict,
          "text-red-600 dark:text-red-400 font-bold": conflict && !initial,
        },
      )}
    >
      {children}
    </div>
  );
};
