"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";

export const ThemeSelector: React.FC<{ layout?: string; className?: string; showTitle?: boolean }> = (props) => {
  return <ThemeToggle variant="pill" className={props.className} />;
};
