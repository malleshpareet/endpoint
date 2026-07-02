"use client"
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import UserButton from '@/modules/authentication/components/user-button'
import { UserProps } from '../types'
import SearchBar from './search-bar'
import InviteMember from './invite-memeber'
import WorkSpace from './workspace'
import NotificationBell from './notification-bell'
import { Hint } from '@/components/ui/hint'

interface Props {
  user: UserProps
}

const Header = ({ user }: Props) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
  const modKey = isMac ? '⌘' : 'Ctrl'

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 600)
    toast.success('Refreshed')
  }, [isRefreshing, queryClient])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        handleRefresh()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleRefresh])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  return (
    <header className='h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0f0f11] shrink-0'>
      {/* Left — Logo */}
      <div className='flex items-center gap-3 min-w-[120px]'>
        <Image
          src="/logo__2_-removebg-preview.png"
          alt="Httply"
          width={28}
          height={28}
          className="object-contain opacity-90"
        />
        <span className="text-sm font-semibold text-white/80 tracking-tight hidden sm:block">
          Httply
        </span>
      </div>

      {/* Center — Search */}
      <div className='flex items-center gap-2 flex-1 max-w-sm mx-4'>
        <SearchBar />
      </div>

      {/* Right — Controls */}
      <div className='flex items-center gap-1.5 min-w-[120px] justify-end'>
        <Hint label={`Refresh (${modKey}+Shift+R)`} side="bottom">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all disabled:opacity-40'
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </Hint>
        <InviteMember />
        <WorkSpace user={user} />
        <div className="w-px h-4 bg-white/10 mx-1" />
        <NotificationBell />
        <button
          id="fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className='flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all'
        >
          {isFullscreen
            ? <Minimize2 className='w-3.5 h-3.5' />
            : <Maximize2 className='w-3.5 h-3.5' />
          }
        </button>
        <UserButton user={user} size='sm' />
      </div>
    </header>
  )
}

export default Header