"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "dark" | "light";
export type ThemeId = ThemeMode; // Compatibility

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: (e?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => void;
  setTheme: (theme: ThemeMode, e?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = useCallback((t: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.classList.remove(
      "dark",
      "light",
      "theme-obsidian",
      "theme-crimson",
      "theme-emerald",
      "theme-sapphire",
      "theme-alabaster"
    );

    if (t === "light") {
      root.classList.add("light", "theme-alabaster");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    } else {
      root.classList.add("dark", "theme-obsidian");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    }
  }, []);

  // Initialize from storage or default to dark (Obsidian)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexusguard_theme") as string | null;
      let initialTheme: ThemeMode = "dark";

      if (stored === "light" || stored === "alabaster") {
        initialTheme = "light";
      } else {
        initialTheme = "dark";
      }

      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
    } catch {
      applyThemeToDOM("dark");
    } finally {
      setMounted(true);
    }
  }, [applyThemeToDOM]);

  // Circular clip-path wipe transition matching the video showcase
  const triggerTransition = useCallback(
    (
      newTheme: ThemeMode,
      e?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }
    ) => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        setThemeState(newTheme);
        return;
      }

      // Determine click origin point
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (e && "clientX" in e && typeof e.clientX === "number") {
        x = e.clientX;
        y = e.clientY;
      } else {
        const toggleEl = document.querySelector('[data-theme-toggle="true"]');
        if (toggleEl) {
          const rect = toggleEl.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }

      // Calculate max radius needed to cover the entire viewport
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const commitChange = () => {
        setThemeState(newTheme);
        applyThemeToDOM(newTheme);
        try {
          localStorage.setItem("nexusguard_theme", newTheme);
        } catch (err) {
          console.error("Failed to save theme in localStorage", err);
        }
      };

      // Native View Transitions API support (Chrome, Edge, Safari 18+)
      if ("startViewTransition" in document) {
        try {
          const transition = (document as any).startViewTransition(() => {
            commitChange();
          });

          transition.ready
            .then(() => {
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                  ],
                },
                {
                  duration: 650,
                  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                  pseudoElement: "::view-transition-new(root)",
                }
              );
            })
            .catch(() => {
              commitChange();
            });
          return;
        } catch {
          // Fall through
        }
      }

      // Fallback circular reveal overlay
      try {
        const ripple = document.createElement("div");
        ripple.className = "fixed inset-0 pointer-events-none z-[999999]";
        ripple.style.backgroundColor = newTheme === "dark" ? "#050607" : "#f8f9fa";
        ripple.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        ripple.style.transition = "clip-path 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease 500ms";
        document.body.appendChild(ripple);

        commitChange();

        requestAnimationFrame(() => {
          ripple.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
          setTimeout(() => {
            ripple.style.opacity = "0";
            setTimeout(() => {
              ripple.remove();
            }, 200);
          }, 600);
        });
      } catch {
        commitChange();
      }
    },
    [applyThemeToDOM]
  );

  const setTheme = useCallback(
    (newTheme: ThemeMode, e?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => {
      triggerTransition(newTheme, e);
    },
    [triggerTransition]
  );

  const toggleTheme = useCallback(
    (e?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      triggerTransition(nextTheme, e);
    },
    [theme, triggerTransition]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
