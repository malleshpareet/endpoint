"use client"
import { Search } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const SearchBar = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md
          bg-white/[0.04] border border-white/[0.08] text-zinc-500
          hover:bg-white/[0.07] hover:border-white/[0.12] hover:text-zinc-400
          transition-all text-sm"
      >
        <span className="flex items-center gap-2">
          <Search size={13} className="shrink-0" />
          <span className="text-xs">Search</span>
        </span>
        <span className="flex items-center gap-0.5">
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.06] text-zinc-500 rounded border border-white/[0.08]">⌘</kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.06] text-zinc-500 rounded border border-white/[0.08]">K</kbd>
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-[#1a1a1e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
          <CommandInput
            placeholder="Search requests, collections..."
            className="bg-transparent border-none text-zinc-200 placeholder:text-zinc-500 h-12 text-sm"
          />
          <CommandList className="bg-[#1a1a1e] border-t border-white/[0.06]">
            <CommandEmpty className="text-zinc-500 py-8 text-center text-sm">No results found.</CommandEmpty>
            <CommandGroup heading={<span className="text-zinc-500 text-xs font-medium tracking-wider uppercase px-2">Quick Actions</span>}>
              <CommandItem onSelect={() => setOpen(false)} className="text-zinc-300 hover:bg-white/[0.06] rounded-lg mx-1 my-0.5">
                Pre-request Script
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="text-zinc-300 hover:bg-white/[0.06] rounded-lg mx-1 my-0.5">
                Tests
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="text-zinc-300 hover:bg-white/[0.06] rounded-lg mx-1 my-0.5">
                Variables
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)} className="text-zinc-300 hover:bg-white/[0.06] rounded-lg mx-1 my-0.5">
                Documentation
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[#141417]">
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-zinc-500 border border-white/[0.08]">↑</kbd>
                <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-zinc-500 border border-white/[0.08]">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-zinc-500 border border-white/[0.08]">↵</kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <kbd className="px-1 py-0.5 bg-white/[0.06] rounded text-zinc-500 border border-white/[0.08]">ESC</kbd>
              close
            </span>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}

export default SearchBar