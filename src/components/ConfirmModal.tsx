import * as React from "react";
import {useTranslation} from "react-i18next";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const {t} = useTranslation();

  // Handle ESC key to cancel and Enter key to confirm
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        onConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm bg-[#fbfaf7] dark:bg-[#161c22] rounded-2xl p-6 shadow-2xl border border-stone-200/90 dark:border-zinc-750 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Warning Icon */}
        <div
          className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
            isDestructive
              ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
              : "bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400"
          }`}
        >
          {isDestructive ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Title & Message */}
        <div>
          {title && (
            <h3 className="text-lg font-bold text-stone-900 dark:text-white tracking-tight mb-1.5">
              {title}
            </h3>
          )}
          <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            {cancelText || t("cancel", "取消")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-white transition-all shadow-xs cursor-pointer ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 active:scale-95"
                : "bg-teal-600 hover:bg-teal-700 active:scale-95"
            }`}
          >
            {confirmText || t("confirm", "确定")}
          </button>
        </div>
      </div>
    </div>
  );
};
