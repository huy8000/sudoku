import * as React from "react";

import {getSudokusPaginated, SudokuRaw, useSudokuCollections} from "src/lib/game/sudokus";
import {SimpleSudoku} from "src/lib/engine/types";
import SudokuPreview from "../../components/sudoku/SudokuPreview";
import {formatDuration} from "src/utils/format";
import {useState} from "react";
import Button from "src/components/Button";
import {stringifySudoku} from "src/lib/engine/utility";
import {useElementWidth} from "src/utils/hooks";
import {useNavigate} from "@tanstack/react-router";
import {localStoragePlayedSudokuRepository, StoredPlayedSudokuState} from "src/lib/database/playedSudokus";
import {Collection, translateCollectionName} from "src/lib/database/collections";
import NewSudoku from "./NewSudoku";
import {useTranslation} from "react-i18next";
import {ConfirmModal} from "src/components/ConfirmModal";
import clsx from "clsx";

const TabItem = ({active, children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {active: boolean}) => (
  <button
    className={clsx(
      "px-3.5 py-1.5 text-xs sm:text-sm font-semibold capitalize rounded-xl transition-all whitespace-nowrap border-none cursor-pointer",
      active
        ? "bg-white text-stone-900 shadow-xs dark:bg-zinc-700 dark:text-white"
        : "bg-transparent text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-300/40 dark:hover:bg-zinc-700/40"
    )}
    {...props}
  >
    {children}
  </button>
);

// Nice page selector. Will show previous / next buttons, then the current page, the first and last page and the surrounding
// pages of the current. Will use ... to show the missing pages.
const PageSelector = ({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const current = page + 1; // Convert to 1-based for display

    // Always show first page
    pages.push(1);

    if (current > 4) {
      pages.push("...");
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(pageCount - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== pageCount) {
        pages.push(i);
      }
    }

    if (current < pageCount - 3) {
      pages.push("...");
    }

    // Always show last page
    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 py-4">
      <Button onClick={() => setPage(page - 1)} disabled={page === 0}>
        {"‹"}
      </Button>

      {getVisiblePages().map((pageNum, index) => (
        <React.Fragment key={index}>
          {pageNum === "..." ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <Button
              onClick={() => setPage((pageNum as number) - 1)}
              className={pageNum === page + 1 ? "bg-teal-600 dark:bg-teal-600 text-white" : ""}
            >
              {pageNum}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button onClick={() => setPage(page + 1)} disabled={page === pageCount - 1}>
        {"›"}
      </Button>
    </div>
  );
};

const SudokuToSelect = ({
  sudoku,
  index,
  sudokuCollectionName,
  storedSudoku,
}: {
  sudoku: SudokuRaw;
  storedSudoku: StoredPlayedSudokuState | undefined;
  index: number;
  sudokuCollectionName: string;
}) => {
  const localSudoku = storedSudoku;
  const unfinished = localSudoku && !localSudoku.game.won;
  const finished = localSudoku && localSudoku.game.won;
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  const proceedNavigate = () => {
    navigate({
      to: "/",
      search: {
        sudokuIndex: index + 1,
        sudoku: stringifySudoku(sudoku.sudoku),
        sudokuCollectionName: sudokuCollectionName,
      },
    });
  };

  const choose = () => {
    if (finished) {
      setShowConfirm(true);
      return;
    }
    proceedNavigate();
  };

  const sudokuContainerRef = React.useRef(null);
  const size = useElementWidth(sudokuContainerRef);

  return (
    <div className="relative group" ref={sudokuContainerRef}>
      {unfinished || finished ? (
        <div className="pointer-events-none absolute left-2 rounded-xl bottom-2 z-10 max-w-min bg-stone-900/90 dark:bg-black/90 backdrop-blur-md px-2.5 py-1.5 text-xs text-white shadow-lg">
          <div>
            <div className="whitespace-nowrap font-medium">{`
              ${unfinished ? t("play_time") : t("last_time")}
              ${formatDuration(localSudoku.game.secondsPlayed)}
            `}</div>
            {localSudoku.game.previousTimes.length > 0 && (
              <div className="whitespace-nowrap text-stone-300">{t("best_time", {
                time: formatDuration(Math.min(...localSudoku.game.previousTimes)),
              })}</div>
            )}
            {localSudoku.game.timesSolved > 0 && (
              <div className="text-teal-400 font-semibold">{t(localSudoku.game.timesSolved === 1 ? "solved_time" : "solved_times", {
                count: localSudoku.game.timesSolved,
              })}</div>
            )}
            {unfinished && <div className="text-amber-400 font-semibold mt-0.5">{t("continue")}</div>}
            {finished && <div className="text-stone-300 mt-0.5">{t("restart?")}</div>}
          </div>
        </div>
      ) : null}
      {size === undefined && (
        <div className="inline-block relative w-full">
          <div style={{marginTop: "100%"}} />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-full h-full bg-stone-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      )}
      {size !== undefined && (
        <SudokuPreview
          size={size}
          onClick={choose}
          id={index + 1}
          sudoku={finished ? sudoku.solution : sudoku.sudoku}
          darken
        />
      )}

      <ConfirmModal
        isOpen={showConfirm}
        message={t("restart_completed_confirm", "确定要重新开始这个数独吗？这将重置计时器，但依然会记录你已通关。")}
        confirmText={t("confirm", "确定")}
        cancelText={t("cancel", "取消")}
        isDestructive={false}
        onConfirm={() => {
          setShowConfirm(false);
          proceedNavigate();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

const GameIndex = ({
  pageSudokus,
  pageStart,
  sudokuCollectionName,
}: {
  pageSudokus: SudokuRaw[];
  pageStart: number;
  sudokuCollectionName: string;
}) => {
  const {t} = useTranslation();

  if (pageSudokus.length === 0) {
    return <div className="text-center text-gray-700 dark:text-gray-300">{t("no_sudokus_in_collection")}</div>;
  }

  return (
    <div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {pageSudokus.map((sudoku, index) => {
          const globalIndex = pageStart + index;
          const sudokuKey = stringifySudoku(sudoku.sudoku);
          const storedSudoku = localStoragePlayedSudokuRepository.getSudokuState(sudokuKey);

          return (
            <SudokuToSelect
              key={globalIndex}
              sudoku={sudoku}
              index={globalIndex}
              sudokuCollectionName={sudokuCollectionName}
              storedSudoku={storedSudoku}
            />
          );
        })}
      </div>
    </div>
  );
};

const usePaginatedSudokus = (collection: Collection, page: number, pageSize: number) => {
  return getSudokusPaginated(collection, page, pageSize);
};

const GameSelect: React.FC = () => {
  const {
    activeCollection,
    setActiveCollectionId,
    collections,
    addCollection,
    isBaseCollection,
    addSudokuToCollection,
    removeCollection,
  } = useSudokuCollections();
  const [page, setPage] = useState(0);
  const {t} = useTranslation();

  const pageSize = 12;
  const {sudokus: pageSudokus, totalPages: pageCount} = usePaginatedSudokus(activeCollection, page, pageSize);
  const pageStart = page * pageSize;

  const setActiveCollectionAndResetPage = (collection: string) => {
    setActiveCollectionId(collection);
    setShowNewSudokuComponent(false);
    setPage(0);
  };

  const saveSudoku = async (sudoku: SimpleSudoku) => {
    addSudokuToCollection(activeCollection.id, sudoku);
    // TODO: add a toast notification
    setShowNewSudokuComponent(false);
  };

  const [showNewSudokuComponent, setShowNewSudokuComponent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const removeCollectionLocal = () => {
    if (isBaseCollectionLocal) {
      alert(t("cannot_delete_base_collection"));
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirm(false);
    removeCollection(activeCollection.id);
    setActiveCollectionId(collections[0].id);
    setPage(0);
  };

  const isBaseCollectionLocal = isBaseCollection(activeCollection.id);

  return (
    <div className="mt-8">
      <div className="flex justify-center mb-8 overflow-x-auto pb-1">
        <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-stone-200/70 dark:bg-zinc-800/80 rounded-2xl border border-stone-200/80 dark:border-zinc-700/60 shadow-inner">
          {collections.map((collection) => (
            <TabItem
              key={collection.id}
              active={activeCollection.id === collection.id}
              onClick={() => setActiveCollectionAndResetPage(collection.id)}
            >
              {translateCollectionName(collection.name)}
            </TabItem>
          ))}
          <TabItem
            active={false}
            onClick={() => {
              const newCollectionName = prompt(t("enter_new_collection_name"));
              if (newCollectionName) {
                const newCollection = addCollection(newCollectionName);
                setActiveCollectionId(newCollection.id);
                setPage(0);
              }
            }}
          >
            {t("add_new_collection")}
          </TabItem>
        </div>
      </div>
      {!isBaseCollectionLocal && (
        <div className="flex justify-between items-center gap-2 mb-4">
          {!showNewSudokuComponent ? (
            <Button className="bg-teal-600 dark:bg-teal-600 text-white" onClick={() => setShowNewSudokuComponent(true)}>
              {t("add_sudoku")}
            </Button>
          ) : (
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close_new_sudoku_creator")}</Button>
          )}
          <Button onClick={removeCollectionLocal}>{t("delete_collection")}</Button>
        </div>
      )}
      {!isBaseCollectionLocal && showNewSudokuComponent && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="text-gray-900 dark:text-white text-lg sm:text-2xl font-bold">{t("create_new_sudoku")}</div>
            <Button onClick={() => setShowNewSudokuComponent(false)}>{t("close")}</Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{t("add_your_own_sudoku", {collection: activeCollection.name})}</p>
          <NewSudoku saveSudoku={saveSudoku} />
        </div>
      )}
      <GameIndex pageSudokus={pageSudokus} pageStart={pageStart} sudokuCollectionName={activeCollection.id} />
      {pageCount > 1 && <PageSelector page={page} pageCount={pageCount} setPage={setPage} />}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        message={t("confirm_delete_collection", {collection: translateCollectionName(activeCollection.name)})}
        confirmText={t("confirm", "确定")}
        cancelText={t("cancel", "取消")}
        isDestructive={true}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default GameSelect;
