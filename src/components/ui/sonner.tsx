"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        className:
          "group toast bg-white text-zinc-950 border border-zinc-200 shadow-xl dark:bg-black dark:text-white dark:border-zinc-800/90 rounded-2xl p-4 font-sans text-xs transition-colors",
        descriptionClassName: "text-zinc-500 dark:text-zinc-400 text-[11px] font-normal leading-relaxed mt-0.5",
      }}
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
      }}
      {...props}
    />
  );
};

export { Toaster };
