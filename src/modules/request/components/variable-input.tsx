"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/modules/layout/stores";
import { useEnvironments, useWorkspaceGlobals } from "@/modules/environments/hooks/environments";

interface VariableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  collectionVariables?: any[];
  inputClassName?: string;
}

export const VariableInput = forwardRef<HTMLInputElement, VariableInputProps>(
  ({ className, inputClassName, value, onChange, collectionVariables = [], ...props }, ref) => {
    const { selectedWorkspace, activeEnvironmentId } = useWorkspaceStore();
    const { data: environments } = useEnvironments(selectedWorkspace?.id);
    const { data: globalVariables } = useWorkspaceGlobals(selectedWorkspace?.id);

    const [scrollLeft, setScrollLeft] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    // The overlay div whose position + padding we sync pixel-perfectly with the input
    const overlayRef = useRef<HTMLDivElement>(null);

    // Suggestion state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorPos, setCursorPos] = useState(0);
    const [suggestionStartIndex, setSuggestionStartIndex] = useState(0);

    // Merge refs
    const handleRef = (e: HTMLInputElement | null) => {
      inputRef.current = e;
      if (typeof ref === 'function') {
        ref(e);
      } else if (ref) {
        ref.current = e;
      }
    };

    // ─── Pixel-perfect overlay sync ─────────────────────────────────────────────
    // Runs synchronously after every paint so the overlay EXACTLY matches the
    // input's position and padding, no matter what className the caller passes.
    useLayoutEffect(() => {
      const input = inputRef.current;
      const overlay = overlayRef.current;
      const wrapper = wrapperRef.current;
      if (!input || !overlay || !wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const s = getComputedStyle(input);

      // Position overlay to exactly cover the input (relative to wrapper)
      overlay.style.left   = `${inputRect.left   - wrapperRect.left}px`;
      overlay.style.top    = `${inputRect.top    - wrapperRect.top}px`;
      overlay.style.width  = `${inputRect.width}px`;
      overlay.style.height = `${inputRect.height}px`;

      // Match the input's own padding so text starts at the identical pixel
      overlay.style.paddingLeft   = s.paddingLeft;
      overlay.style.paddingRight  = s.paddingRight;
      overlay.style.paddingTop    = s.paddingTop;
      overlay.style.paddingBottom = s.paddingBottom;

      // Match font so character widths are identical
      overlay.style.fontSize   = s.fontSize;
      overlay.style.fontFamily = s.fontFamily;
      overlay.style.fontWeight = s.fontWeight;
      overlay.style.letterSpacing = s.letterSpacing;
    });

    // ─── Variable resolution ────────────────────────────────────────────────────
    const envVars = environments?.find(e => e.id === activeEnvironmentId)?.values || [];

    const resolveVariable = (key: string) => {
      const checkMatch = (v: any) => v.key === key || v.key === `{{${key}}}`;

      let match = collectionVariables.find(checkMatch);
      if (match) return { value: match.currentValue || match.value, scope: "Collection" };

      match = (envVars as any[]).find(checkMatch);
      if (match) return { value: match.currentValue || match.value, scope: "Environment" };

      match = (globalVariables as any[])?.find(checkMatch);
      if (match) return { value: match.currentValue || match.value, scope: "Global" };

      return null;
    };

    // Autocomplete list
    const allVars = [
      ...collectionVariables.map(v => ({ key: v.key.replace(/[{}]/g, ''), value: v.currentValue || v.value, scope: "Collection" })),
      ...(envVars as any[]).map(v => ({ key: v.key.replace(/[{}]/g, ''), value: v.currentValue || v.value, scope: "Environment" })),
      ...((globalVariables as any[]) || []).map(v => ({ key: v.key.replace(/[{}]/g, ''), value: v.currentValue || v.value, scope: "Global" }))
    ].filter((v, i, a) => v.key && a.findIndex(t => t.key === v.key) === i);

    const filteredVars = allVars.filter(v => v.key.toLowerCase().includes(suggestionQuery.toLowerCase()));

    const checkTrigger = (val: string, cursor: number) => {
      const textBeforeCursor = val.slice(0, cursor);
      const match = textBeforeCursor.match(/\{{1,2}([^}]*)$/);
      if (match) {
        setSuggestionQuery(match[1]);
        setSuggestionStartIndex(match.index!);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (props.onKeyUp) props.onKeyUp(e);
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) return;
      const target = e.target as HTMLInputElement;
      setCursorPos(target.selectionStart || 0);
      checkTrigger(target.value, target.selectionStart || 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      setCursorPos(e.target.selectionStart || 0);
      checkTrigger(e.target.value, e.target.selectionStart || 0);
    };

    const selectSuggestion = (key: string) => {
      const val = String(value || "");
      const before = val.slice(0, suggestionStartIndex);
      const after = val.slice(cursorPos);
      const newValue = `${before}{{${key}}}${after}`;

      const e = { target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>;
      if (onChange) onChange(e);

      setShowSuggestions(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = suggestionStartIndex + key.length + 4;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && filteredVars.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredVars.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredVars.length) % filteredVars.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          selectSuggestion(filteredVars[selectedIndex].key);
        } else if (e.key === 'Escape') {
          setShowSuggestions(false);
        }
      }
      if (props.onKeyDown) props.onKeyDown(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => setShowSuggestions(false), 200);
      if (props.onBlur) props.onBlur(e);
    };

    const handleScroll = () => {
      if (inputRef.current) {
        setScrollLeft(inputRef.current.scrollLeft);
      }
    };

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.addEventListener('scroll', handleScroll);
        return () => inputRef.current?.removeEventListener('scroll', handleScroll);
      }
    }, []);

    // ─── Render highlighted text ────────────────────────────────────────────────
    const renderHighlightedText = () => {
      const text = String(value || "");
      if (!text) return null;

      const regex = /(\{\{[^}]+\}\})/g;
      const parts = text.split(regex);

      return parts.map((part, i) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const varName = part.slice(2, -2);
          const resolved = resolveVariable(varName);
          const isFound = !!resolved;

          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "rounded",
                    isFound ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {part}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-zinc-800 border-zinc-700 text-xs z-[100]">
                  {isFound ? (
                    <div className="flex flex-col gap-1">
                      <div className="text-zinc-400 font-mono">Scope: {resolved.scope}</div>
                      <div className="font-semibold text-zinc-200 truncate max-w-[200px]">Value: {resolved.value}</div>
                    </div>
                  ) : (
                    <div className="text-red-400">Variable not found</div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <span key={i} className="text-zinc-200">{part}</span>;
      });
    };

    return (
      // Outer wrapper: receives className for layout (flex-1, min-w-0, etc.)
      <div ref={wrapperRef} className={cn("relative", className)}>

        {/* ── Highlight overlay ───────────────────────────────────────────────
            Position + padding are synced pixel-perfectly to the <input> via
            useLayoutEffect above. Initial values are 0 so there's no flash. */}
        <div
          ref={overlayRef}
          aria-hidden
          className="absolute pointer-events-none overflow-hidden whitespace-pre flex items-center"
          style={{ left: 0, top: 0, width: 0, height: 0 }}
        >
          <div
            style={{ transform: `translateX(-${scrollLeft}px)`, whiteSpace: 'pre' }}
            className="flex items-center shrink-0"
          >
            {renderHighlightedText()}
            {!value && <span className="text-zinc-500">{props.placeholder}</span>}
          </div>
        </div>

        {/* ── Real input ──────────────────────────────────────────────────────
            Text color is transparent so the overlay shows through.
            The caret and selection remain visible. */}
        <input
          {...props}
          ref={handleRef}
          value={value}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder=""
          className={cn(
            "relative w-full bg-transparent border-0 focus:ring-0 focus:border-0",
            "text-transparent caret-white selection:bg-indigo-500/30",
            "outline-none",
            inputClassName
          )}
          style={{ color: "transparent" }}
        />

        {/* ── Suggestion dropdown ─────────────────────────────────────────── */}
        {showSuggestions && filteredVars.length > 0 && (
          <div className="absolute top-[100%] left-0 mt-1 w-72 bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl z-[100] overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {filteredVars.map((v, i) => (
                <div
                  key={v.key}
                  onClick={() => selectSuggestion(v.key)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer border-b border-zinc-700/50 last:border-0 transition-colors",
                    i === selectedIndex ? "bg-indigo-500/20" : "hover:bg-zinc-700"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-zinc-200 font-medium">{v.key}</span>
                    <span className="text-[10px] text-zinc-400 uppercase bg-zinc-900 px-1.5 py-0.5 rounded">{v.scope}</span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate mt-1">Value: {v.value || <span className="italic">empty</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VariableInput.displayName = "VariableInput";
