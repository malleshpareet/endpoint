"use client"
import { Maximize2, Minimize2 } from 'lucide-react'
import Image from 'next/image'
import { useState, useCallback } from 'react'

import UserButton from '@/modules/authentication/components/user-button'
import { UserProps } from '../types'
import SearchBar from './search-bar'
import InviteMember from './invite-memeber'
import WorkSpace from './workspace'

interface Props {
  user: UserProps
}

const Header = ({ user }: Props) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

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
      <div className='flex-1 max-w-sm mx-4'>
        <SearchBar />
      </div>

      {/* Right — Controls */}
      <div className='flex items-center gap-1.5 min-w-[120px] justify-end'>
        <InviteMember />
        <WorkSpace user={user} />
        <div className="w-px h-4 bg-white/10 mx-1" />
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