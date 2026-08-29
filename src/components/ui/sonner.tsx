"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      expand={false}
      visibleToasts={3}
      gap={8}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-foreground border border-border shadow-2xl rounded-2xl p-4 font-sans text-xs transition-all duration-300",
          description:
            "text-muted-foreground text-[11px] font-normal leading-relaxed mt-1",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-muted/80 transition-colors",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
