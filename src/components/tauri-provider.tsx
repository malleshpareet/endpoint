"use client";
import { useEffect } from "react";

export function TauriProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
        document.body.classList.add("tauri-glass");
      }
      
      const disableContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener("contextmenu", disableContextMenu);
      
      return () => {
        document.removeEventListener("contextmenu", disableContextMenu);
      };
    }
  }, []);

  return null;
}
