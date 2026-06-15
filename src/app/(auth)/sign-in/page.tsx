"use client"
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import { FaGoogle, FaGithub } from "react-icons/fa";
import Link from 'next/link'
import React, { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

const LoginPage = () => {
    const [loading, setLoading] = useState<'github' | 'google' | null>(null)

    return (
        <>
            {loading !== null && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Spinner className="h-12 w-12 text-primary mb-4" />
                    <p className="text-lg font-medium text-foreground">Signing in...</p>
                </div>
            )}
            <section className='flex w-full min-h-screen items-center justify-center bg-zinc-50 dark:bg-transparent px-4 py-16 md:py-32 font-sans'>
                <div className='bg-card h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)] '>
                    <div className='p-8 pb-6'>
                        <div>
                            <Link href={"/"}>
                                <h1 className='text-2xl font-bold'>Httply</h1>
                            </Link>
                            <h1 className='mb-1 mt-4 text-xl font-semibold'>Sign in to Httply</h1>
                            <p className="text-sm text-muted-foreground">Welcome back! Sign in to continue</p>
                        </div>

                        <div className='mt-6 grid grid-cols-1 gap-3'>
                            <Button variant='outline' className='w-full' disabled={loading !== null} onClick={async () => {
                                setLoading('github')
                                await signIn.social({
                                    provider: 'github',
                                    callbackURL: "/"
                                })
                                setLoading(null)
                            }}>
                                {loading === 'github' ? <Spinner className='mr-2' /> : <FaGithub className='mr-2 h-4 w-4' />}
                                Sign in with GitHub
                            </Button>
                            <Button variant='outline' className='w-full' disabled={loading !== null} onClick={async () => {
                                setLoading('google')
                                await signIn.social({
                                    provider: 'google',
                                    callbackURL: "/"
                                })
                                setLoading(null)
                            }}>
                                {loading === 'google' ? <Spinner className='mr-2' /> : <FaGoogle className='mr-2 h-4 w-4' />}
                                Sign in with Google
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LoginPage