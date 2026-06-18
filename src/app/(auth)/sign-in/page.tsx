"use client"
import { signIn } from '@/lib/auth-client'
import { FaGoogle, FaGithub } from "react-icons/fa";
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
        <main className="relative flex w-full min-h-screen items-center justify-center px-4 font-sans selection:bg-blue-500/30">
            {/* Custom Background */}
            <LoginBackground />

            {/* Global Loading Overlay */}
            {loading !== null && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A]/80 backdrop-blur-md transition-opacity duration-300">
                    <Spinner className="h-12 w-12 text-[#F8FAFC] mb-4" />
                    <p className="text-lg font-medium text-[#F8FAFC]">Authenticating...</p>
                </div>
            )}

            {/* Glassmorphism Login Card */}
            <section 
                className={`w-full max-w-[420px] rounded-[20px] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md border transition-all duration-700 ease-out flex flex-col items-center text-center ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                    backgroundColor: "rgba(17, 24, 39, 0.85)", // Dark glass bg
                    borderColor: "rgba(255, 255, 255, 0.08)", // Subtle white border
                }}
            >
                {/* Header Section */}
                <div className="mb-8 flex flex-col items-center">
                    <Image src="/logo__2_-removebg-preview.png" alt="Httply Logo" width={64} height={64} className="object-contain mb-6" />
                    <h1 className="text-2xl md:text-[28px] font-bold text-[#F8FAFC] tracking-tight mb-2">
                        Welcome to Httply
                    </h1>
                    <p className="text-[15px] text-[#94A3B8] leading-relaxed max-w-[280px]">
                        Test, debug, and collaborate on APIs from one place.
                    </p>
                </div>

                {/* Authentication Buttons */}
                <div className="w-full space-y-3">
                    <button
                        disabled={loading !== null}
                        onClick={async () => {
                            setLoading('google')
                            await signIn.social({
                                provider: 'google',
                                callbackURL: "/"
                            })
                            setLoading(null)
                        }}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3.5 text-[15px] font-semibold text-[#0F172A] shadow-sm transition-all duration-200 hover:bg-white hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {loading === 'google' ? (
                            <Spinner className="h-5 w-5 text-[#0F172A]" />
                        ) : (
                            <FaGoogle className="h-4 w-4 text-[#0F172A]" />
                        )}
                        Continue with Google
                    </button>

                    <button
                        disabled={loading !== null}
                        onClick={async () => {
                            setLoading('github')
                            await signIn.social({
                                provider: 'github',
                                callbackURL: "/"
                            })
                            setLoading(null)
                        }}
                        className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] px-4 py-3.5 text-[15px] font-semibold text-[#F8FAFC] shadow-sm transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)] hover:scale-[1.02] hover:border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-zinc-500/50 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {loading === 'github' ? (
                            <Spinner className="h-5 w-5 text-[#F8FAFC]" />
                        ) : (
                            <FaGithub className="h-[18px] w-[18px] text-[#F8FAFC]" />
                        )}
                        Continue with GitHub
                    </button>
                </div>

                {/* Divider */}
                <div className="relative my-8 w-full">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgba(255,255,255,0.08)]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#111827] px-3 text-[#94A3B8]">or</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <p className="text-[14px] text-[#F8FAFC] font-medium">
                        Sign in securely using your developer account.
                    </p>
                    <p className="text-[12px] text-[#94A3B8] text-center max-w-[260px] leading-relaxed">
                        By continuing, you agree to the Terms of Service and Privacy Policy.
                    </p>
                </div>
            </section>
        </main>
    )
}

export default LoginPage