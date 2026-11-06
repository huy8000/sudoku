import * as React from "react";
import {useTranslation} from "react-i18next";
import {useUserPreferences} from "src/context/UserPrefencesContext";
import Checkbox from "src/components/Checkbox";
import {DarkModeButton} from "src/components/DarkModeButton";
import LanguageSelector from "src/components/LanguageSelector";
import clsx from "clsx";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({isOpen, onClose}) => {
  const {
    state,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  } = useUserPreferences();
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = React.useState<"settings" | "shortcuts" | "about">("settings");

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#fbfaf7] dark:bg-[#161c22] text-stone-800 dark:text-zinc-100 rounded-2xl shadow-2xl border border-stone-200/90 dark:border-zinc-750 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings")}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">{t("settings")}</h2>
          </div>
          <button
            type="button"
            data-testid="close-settings-button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors"
            aria-label={t("close")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-200/70 dark:border-zinc-800 px-6 bg-stone-100/40 dark:bg-zinc-850/40 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={clsx("py-3 px-4 border-b-2 transition-colors", {
              "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 font-semibold":
                activeTab === "settings",
              "border-transparent text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200":
                activeTab !== "settings",
            })}
          >
            {t("settings")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shortcuts")}
            className={clsx("py-3 px-4 border-b-2 transition-colors", {
              "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 font-semibold":
                activeTab === "shortcuts",
              "border-transparent text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200":
                activeTab !== "shortcuts",
            })}
          >
            {t("shortcuts")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={clsx("py-3 px-4 border-b-2 transition-colors", {
              "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 font-semibold":
                activeTab === "about",
              "border-transparent text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200":
                activeTab !== "about",
            })}
          >
            {t("about")}
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Game rules & helpers */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-3">
                  {t("settings")}
                </h3>
                <div className="grid gap-2.5">
                  <Checkbox id="generated_notes" checked={state.showHints} onChange={toggleShowHints}>
                    {t("show_auto_notes")}
                  </Checkbox>
                  <Checkbox id="highlight_wrong_entries" checked={state.showWrongEntries} onChange={toggleShowWrongEntries}>
                    {t("highlight_wrong_entries")}
                  </Checkbox>
                  <Checkbox id="highlight_conflicts" checked={state.showConflicts} onChange={toggleShowConflicts}>
                    {t("highlight_conflicts")}
                  </Checkbox>
                  <Checkbox id="circle_menu" checked={state.showCircleMenu} onChange={toggleShowCircleMenu}>
                    {t("show_circle_menu")}
                  </Checkbox>
                  <Checkbox id="show_occurrences" checked={state.showOccurrences} onChange={toggleShowOccurrences}>
                    {t("show_occurrences")}
                  </Checkbox>
                </div>
              </div>

              {/* Preferences */}
              <div className="pt-4 border-t border-stone-200/70 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-3">
                  {t("language")} &amp; UI
                </h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60">
                    <span className="text-sm font-medium text-stone-700 dark:text-zinc-200">
                      深色模式 / Dark Mode
                    </span>
                    <DarkModeButton />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60">
                    <span className="text-sm font-medium text-stone-700 dark:text-zinc-200">
                      {t("language")}
                    </span>
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div>
              <div className="grid gap-2">
                {[
                  {label: t("arrow_keys"), keys: ["↑", "↓", "←", "→"]},
                  {label: t("number_keys"), keys: ["1-9"]},
                  {label: t("backspace"), keys: ["Backspace"]},
                  {label: t("escape"), keys: ["Esc"]},
                  {label: t("hint"), keys: ["H"]},
                  {label: t("note_mode"), keys: ["N"]},
                  {label: t("undo"), keys: ["Ctrl", "Z"]},
                  {label: t("redo"), keys: ["Ctrl", "Y"]},
                  {label: t("copy_paste_notes"), keys: ["Ctrl+C", "Ctrl+V"]},
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 text-sm"
                  >
                    <span className="text-stone-700 dark:text-zinc-300 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 text-xs font-semibold font-mono rounded-md bg-stone-100 dark:bg-zinc-700 border border-stone-300/80 dark:border-zinc-600 text-stone-800 dark:text-zinc-200 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4 text-sm text-stone-600 dark:text-zinc-300 leading-relaxed p-2">
              <p>
                {t("about_text")}{" "}
                <a
                  target="_blank"
                  className="text-teal-600 dark:text-teal-400 font-semibold underline hover:opacity-80"
                  href="https://github.com/TN1ck/super-sudoku"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                .
              </p>
              <p>
                <a
                  href="https://tn1ck.com"
                  target="_blank"
                  className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  rel="noreferrer"
                >
                  {t("created_by")}
                </a>{" "}
                {t("report_issue")}{" "}
                <a
                  target="_blank"
                  className="text-teal-600 dark:text-teal-400 font-semibold underline hover:opacity-80"
                  href="https://github.com/TN1ck/super-sudoku/issues"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-3.5 border-t border-stone-200/70 dark:border-zinc-800 bg-stone-100/40 dark:bg-zinc-850/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};
