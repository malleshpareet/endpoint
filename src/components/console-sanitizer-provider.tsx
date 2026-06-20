"use client";

import { useEffect } from "react";
import { sanitizeConsoleArgs } from "@/lib/sanitize";

let isIntercepted = false;

export function ConsoleSanitizerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isIntercepted) return;
    isIntercepted = true;

    // Save original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalDebug = console.debug;
    
    // Print Self-XSS Warning
    setTimeout(() => {
      originalLog.apply(console, [
        '%cWARNING!', 
        'color: red; font-size: 30px; font-weight: bold; background-color: yellow; padding: 4px;'
      ]);
      originalLog.apply(console, [
        '%cUsing this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you do not understand.',
        'font-size: 16px; font-family: sans-serif;'
      ]);
    }, 100);

    // Override them
    console.log = (...args: any[]) => {
      originalLog.apply(console, sanitizeConsoleArgs(args));
    };
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, sanitizeConsoleArgs(args));
    };
    console.error = (...args: any[]) => {
      originalError.apply(console, sanitizeConsoleArgs(args));
    };
    console.info = (...args: any[]) => {
      originalInfo.apply(console, sanitizeConsoleArgs(args));
    };
    console.debug = (...args: any[]) => {
      originalDebug.apply(console, sanitizeConsoleArgs(args));
    };

  }, []);

  return <>{children}</>;
}
