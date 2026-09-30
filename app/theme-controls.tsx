"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type ThemeChoice = "system" | "dark" | "light";
const STORAGE_KEY = "afterglow-theme";

function resolveEffective(choice: ThemeChoice): "light" | "dark" {
  if (choice === "light") return "light";
  if (choice === "dark") return "dark";
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function applyTheme(choice: ThemeChoice) {
  const effective = resolveEffective(choice);
  document.documentElement.dataset.theme = effective;
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.style.colorScheme = effective;
  if (effective === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }
}

function useThemeChoice() {
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
    const initial: ThemeChoice = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setChoiceState(initial);
    applyTheme(initial);
    const media = matchMedia("(prefers-color-scheme: light)");
    const syncSystem = () => {
      const current = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
      if (!current || current === "system") {
        applyTheme("system");
      }
    };
    const syncControls = () => {
      const cur = (localStorage.getItem(STORAGE_KEY) || "system") as ThemeChoice;
      setChoiceState(cur);
      applyTheme(cur);
    };
    media.addEventListener("change", syncSystem);
    addEventListener("afterglow:theme", syncControls);
    return () => {
      media.removeEventListener("change", syncSystem);
      removeEventListener("afterglow:theme", syncControls);
    };
  }, []);
  function setChoice(next: ThemeChoice) {
    localStorage.setItem(STORAGE_KEY, next);
    setChoiceState(next);
    applyTheme(next);
    dispatchEvent(new Event("afterglow:theme"));
  }
  return { choice, setChoice };
}

const options = [
  { value: "system" as const, label: "Auto", description: "Match this device", icon: Monitor },
  { value: "dark" as const, label: "Midnight", description: "Dark and cinematic", icon: Moon },
  { value: "light" as const, label: "Pearl", description: "Light and editorial", icon: Sun },
];

export function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { choice, setChoice } = useThemeChoice();
  return <div className={`theme-selector ${compact ? "compact" : ""}`} role="radiogroup" aria-label="Colour theme">
    {options.map(({ value, label, description, icon: Icon }) => <button type="button" key={value} role="radio" aria-checked={choice === value} className={choice === value ? "active" : ""} onClick={() => setChoice(value)}><Icon size={compact ? 16 : 19}/><span><strong>{label}</strong>{!compact && <small>{description}</small>}</span></button>)}
  </div>;
}

export function ThemeQuickToggle() {
  const { choice, setChoice } = useThemeChoice();
  const current = options.find(option => option.value === choice) ?? options[0];
  const Icon = current.icon;
  const next: ThemeChoice = choice === "system" ? "dark" : choice === "dark" ? "light" : "system";
  return <button type="button" className="theme-quick-toggle" onClick={() => setChoice(next)} aria-label={`Theme: ${current.label}. Switch theme`} title={`Theme: ${current.label}`}><Icon size={17}/></button>;
}
