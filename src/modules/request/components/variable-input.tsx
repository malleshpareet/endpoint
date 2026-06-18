"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/modules/layout/stores";
import { useEnvironments, useWorkspaceGlobals } from "@/modules/environments/hooks/environments";

interface VariableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  collectionVariables?: any[];
}

export const VariableInput = forwardRef<HTMLInputElement, VariableInputProps>(
  ({ className, value, onChange, collectionVariables = [], ...props }, ref) => {
    const { selectedWorkspace, activeEnvironmentId } = useWorkspaceStore();
    const { data: environments } = useEnvironments(selectedWorkspace?.id);
    const { data: globalVariables } = useWorkspaceGlobals(selectedWorkspace?.id);

    const [scrollLeft, setScrollLeft] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Merge refs
    const handleRef = (e: HTMLInputElement | null) => {
      inputRef.current = e;
      if (typeof ref === 'function') {
        ref(e);
      } else if (ref) {
        ref.current = e;
      }
    };

    // Get all available variables for resolution tooltips
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

    // Render highlighted text
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
                    "rounded px-[2px] mx-[1px]",
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
      <div className={cn("relative flex items-center w-full", className)}>
        {/* Background layer for highlighted text */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none whitespace-pre overflow-hidden flex items-center px-3 py-2 text-sm",
          )}
        >
          <div 
            className="w-full h-full flex items-center"
            style={{ transform: `translateX(-${scrollLeft}px)` }}
          >
            {renderHighlightedText()}
            {/* invisible placeholder to ensure same width/height as input if needed */}
            {!value && <span className="text-zinc-500">{props.placeholder}</span>}
          </div>
        </div>

        {/* Foreground input layer (text transparent, caret visible) */}
        <input
          {...props}
          ref={handleRef}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full bg-transparent border-0 focus:ring-0 focus:border-0 text-sm px-3 py-2",
            "text-transparent caret-white selection:bg-indigo-500/30 selection:text-transparent",
            "outline-none"
          )}
          style={{ color: "transparent" }}
        />
      </div>
    );
  }
);

VariableInput.displayName = "VariableInput";
