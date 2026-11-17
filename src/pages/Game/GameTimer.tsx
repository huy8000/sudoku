import * as React from "react";
import {useTimer} from "src/context/TimerContext";
import {formatDuration} from "src/utils/format";

const GameTimer: React.FC = () => {
  const {displayTime} = useTimer();

  return <time dateTime={`PT${Math.floor(displayTime)}S`}>{formatDuration(displayTime)}</time>;
};

export default GameTimer;
