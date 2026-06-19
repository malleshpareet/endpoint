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
    <header className='grid grid-cols-5 grid-rows-1 gap-2 overflow-x-auto overflow-hidden p-2 border'>
      <div className='col-span-2 flex items-center justify-between space-x-2 hover:cursor-pointer hover:opacity-80 ml-4'>
        <Image src="/logo__2_-removebg-preview.png" alt="Logo" width={48} height={48} className="object-contain" />
      </div>

      <div className='col-span-1 flex items-center justify-between space-x-2'>
        <div className="border-animation relative p-[1px] rounded flex-1 self-stretch overflow-hidden flex items-center justify-center" aria-hidden="true">
          <SearchBar />
        </div>
      </div>

      <div className='col-span-2 flex items-center justify-end space-x-2'>
        <InviteMember />
        <WorkSpace user={user} />
        <button
          id="fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className='flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
        >
          {isFullscreen
            ? <Minimize2 className='w-4 h-4' />
            : <Maximize2 className='w-4 h-4' />
          }
        </button>
        <UserButton user={user} size='sm' />
      </div>
    </header>
  )
}

export default Header