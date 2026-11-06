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
    <Container className="mt-4">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/games/"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
              title="返回游戏列表"
            >
              ← heyhuyu
            </a>
            <h1 className="text-2xl text-gray-900 dark:text-white font-bold">{t("select_game_title")}</h1>
          </div>
          <div className="flex gap-2">
            <DarkModeButton />
            <Button className="bg-teal-600 dark:bg-teal-600 text-white flex-shrink-0" onClick={goBack}>
              {"◀ " + t("go_back")}
            </Button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t("select_game_subtitle")}</p>
      </div>
      <GameSelect />
    </Container>
  );
};

export default SelectGame;
