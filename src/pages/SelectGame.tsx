import * as React from "react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/Layout";
import Button from "../components/Button";
import {useNavigate} from "@tanstack/react-router";
import {DarkModeButton} from "src/components/DarkModeButton";
import {useTranslation} from "react-i18next";

const SelectGame = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const goBack = () => {
    navigate({
      to: "/",
    });
  };

  return (
    <Container className="py-6">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex gap-4 items-center justify-between pb-4 border-b border-stone-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <a
              href="/games/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-stone-200/60 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
              title="返回游戏列表"
            >
              <span>←</span>
              <span>heyhuyu</span>
            </a>
            <h1 className="text-xl sm:text-2xl text-stone-900 dark:text-white font-bold tracking-tight">
              {t("select_game_title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeButton />
            <Button
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-sm font-semibold flex-shrink-0 shadow-xs border-teal-600"
              onClick={goBack}
            >
              {"← " + t("go_back")}
            </Button>
          </div>
        </div>
        <p className="text-stone-500 dark:text-zinc-400 text-sm">{t("select_game_subtitle")}</p>
      </div>
      <GameSelect />
    </Container>
  );
};

export default SelectGame;
