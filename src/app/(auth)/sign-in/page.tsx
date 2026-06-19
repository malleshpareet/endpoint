"use client"
import { signIn } from '@/lib/auth-client'
import { FaGoogle, FaGithub } from "react-icons/fa";
import { BsShieldLock } from "react-icons/bs";
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { LoginBackground } from '@/components/ui/login-background';

const LoginPage = () => {
    const [loading, setLoading] = useState<'github' | 'google' | null>(null)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className="relative flex w-full min-h-screen items-center justify-center px-4" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
            <LoginBackground />

            {/* Loading Overlay */}
            {loading !== null && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                    <Spinner className="h-8 w-8 text-white mb-3" />
                    <p className="text-sm text-white/60 tracking-wide">Signing you in...</p>
                </div>
            )}

            {/* Card */}
            <div
                className={`relative w-full max-w-[380px] transition-all duration-500 ease-out ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
                {/* Thin top accent line */}
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

                <div
                    className="rounded-2xl border px-8 py-9"
                    style={{
                        background: "rgba(10, 10, 10, 0.92)",
                        borderColor: "rgba(255,255,255,0.07)",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.6)",
                    }}
                >
                    {/* Logo + Brand */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-5">
                            <div className="absolute inset-0 rounded-xl bg-orange-400/10 blur-xl scale-150" />
                            <Image
                                src="/logo__2_-removebg-preview.png"
                                alt="Httply Logo"
                                width={44}
                                height={44}
                                className="relative object-contain"
                            />
                        </div>

                        <h1 className="text-[22px] font-semibold text-white tracking-[-0.3px] mb-1.5">
                            Sign in to Httply
                        </h1>
                        <p className="text-[13px] text-white/40 leading-relaxed text-center whitespace-nowrap">
                            The API client built for teams who ship fast.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2.5">
                        {/* Google */}
                        <button
                            disabled={loading !== null}
                            onClick={async () => {
                                setLoading('google');
                                await signIn.social({ provider: 'google', callbackURL: "/" });
                                setLoading(null);
                            }}
                            className="relative w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            style={{
                                background: "rgba(255,255,255,0.95)",
                                color: "#111",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
                        >
                            {loading === 'google' ? (
                                <Spinner className="h-4 w-4 text-black" />
                            ) : (
                                <FaGoogle className="h-3.5 w-3.5 text-[#111]" />
                            )}
                            Continue with Google
                        </button>

                        {/* GitHub */}
                        <button
                            disabled={loading !== null}
                            onClick={async () => {
                                setLoading('github');
                                await signIn.social({ provider: 'github', callbackURL: "/" });
                                setLoading(null);
                            }}
                            className="relative w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.85)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        >
                            {loading === 'github' ? (
                                <Spinner className="h-4 w-4 text-white" />
                            ) : (
                                <FaGithub className="h-4 w-4 text-white/80" />
                            )}
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3 my-7">
                        <div className="flex-1 h-px bg-white/6" />
                        <span className="text-[11px] text-white/20 tracking-wider uppercase">Secure sign-in</span>
                        <div className="flex-1 h-px bg-white/6" />
                    </div>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-2">
                        <BsShieldLock className="w-3 h-3 text-white/20" />
                        <p className="text-[11.5px] text-white/25 text-center leading-relaxed">
                            By signing in, you agree to our{" "}
                            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors underline underline-offset-2">
                                Terms
                            </span>{" "}
                            &{" "}
                            <span className="text-white/40 hover:text-white/60 cursor-pointer transition-colors underline underline-offset-2">
                                Privacy Policy
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default LoginPage