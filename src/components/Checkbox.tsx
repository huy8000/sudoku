import React from "react";

const Checkbox: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}> = ({id, onChange, checked, children}) => {
  return (
    <label
      htmlFor={id}
      className="relative flex items-center p-3 rounded-xl bg-white/70 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer select-none"
    >
      <div className="flex h-5 items-center">
        <input
          checked={checked}
          onChange={(e) => {
            onChange(e.target.checked);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          id={id}
          aria-describedby={`${id}-description`}
          name={id}
          type="checkbox"
          className="h-5 w-5 rounded-md border-stone-300 dark:border-zinc-600 text-teal-600 focus:ring-teal-500/30 cursor-pointer bg-white dark:bg-zinc-750"
        />
      </div>
      <div className="ml-3 text-sm font-medium text-stone-700 dark:text-zinc-200">{children}</div>
    </label>
  );
};

export default Checkbox;
