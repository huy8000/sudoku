import clsx from "clsx";
import React from "react";
import {twMerge} from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

const Button = ({children, className, disabled, active, onClick, type = "button", ...props}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={twMerge(
        clsx(
          "rounded-xl border border-stone-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-stone-800 dark:text-zinc-100 font-medium md:px-4 md:py-2 px-3 py-1.5 shadow-xs transition-all duration-150 hover:bg-stone-50 dark:hover:bg-zinc-700/80 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100",
          className,
          {
            "ring-2 ring-teal-500 scale-105 shadow-sm": active,
          },
        ),
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
