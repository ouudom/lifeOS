"use client";

import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
        aria-label="Toggle color theme"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-secondary text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
      >
        {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
      </Button>
    </div>
  );
}
