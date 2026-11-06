import React from "react";
import {SimpleSudoku} from "src/lib/engine/types";

const GridLineX = ({top, width, makeBold}: {top: number; width: number; makeBold: boolean}) => (
  <div
    className={`absolute left-0 h-px transform -translate-y-1/2 ${makeBold ? "bg-gray-400 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-600"}`}
    style={{
      width: `${width}%`,
      top: `${top}%`,
    }}
  />
);

const GridLineY = ({left, height, makeBold}: {left: number; height: number; makeBold: boolean}) => (
  <div
    className={`absolute top-0 w-px transform -translate-x-1/2 ${makeBold ? "bg-gray-400 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-600"}`}
    style={{
      height: `${height}%`,
      left: `${left}%`,
    }}
  />
);

const SudokuPreviewGrid = React.memo(
  ({width, height, hideLeftRight = false}: {width: number; height: number; hideLeftRight?: boolean}) => {
    return (
      <div>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineX makeBold={makeBold} key={i} width={width} top={(i * height) / 9} />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const hide = [0, 9].includes(i);
          if (hideLeftRight && hide) {
            return null;
          }
          const makeBold = [3, 6].includes(i);
          return <GridLineY makeBold={makeBold} key={i} height={height} left={(i * height) / 9} />;
        })}
      </div>
    );
  },
);

export default class SudokuPreview extends React.PureComponent<{
  sudoku: SimpleSudoku;
  id: number;
  darken?: boolean;
  size?: number;
  onClick: () => void;
}> {
  render() {
    const {sudoku, id, onClick, size = 150} = this.props;
    const containerHeight = size;
    const containerWidth = size;
    const height = 100;
    const width = 100;
    const fontSize = size / 16;

    const xSection = height / 9;
    const ySection = width / 9;

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        onClick();
      }
    };

    return (
      <div
        aria-label={`Select sudoku ${id}`}
        className="user-select-none hover:cursor-pointer group"
        data-testid={`sudoku-preview-${id}`}
        role="button"
        tabIndex={id + 4}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <div
          className="relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-zinc-700/80 shadow-xs hover:shadow-md hover:border-teal-500/50 hover:scale-[1.02] transition-all duration-200"
          style={{
            height: containerHeight,
            width: containerWidth,
            fontSize,
            lineHeight: 1,
          }}
        >
          <div className="absolute z-10 top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            <div style={{fontSize: size / 3.2}} className="font-extrabold font-mono text-stone-900 dark:text-zinc-100 opacity-80 drop-shadow-sm">
              {id}
            </div>
          </div>
          <SudokuPreviewGrid width={width} height={height} hideLeftRight />
          {sudoku.map((row, y) => {
            return (
              <div key={y}>
                {row.map((n, x) => {
                  return n !== 0 ? (
                    <div
                      key={x}
                      className="text-stone-700 dark:text-zinc-300 font-medium font-mono"
                      style={{
                        position: "absolute",
                        left: xSection * (x + 0.5) + "%",
                        top: ySection * (y + 0.5) + "%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {n}
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
          {this.props.darken ? (
            <div className="absolute z-20 top-0 left-0 w-full h-full bg-stone-900/10 dark:bg-black/30 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none" />
          ) : null}
        </div>
      </div>
    );
  }
}
