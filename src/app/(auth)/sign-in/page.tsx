"use client"
import { signIn } from '@/lib/auth-client'
import { FaGoogle, FaGithub } from "react-icons/fa";
import Image from 'next/image';
import Link from 'next/link'
import React, { useState, useEffect, Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

const ErrorToaster = () => {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);
    return null;
}

const LoginPage = () => {
    const [loading, setLoading] = useState<'github' | 'google' | null>(null)
    const [mounted, setMounted] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const phrases = [
        'Test, share, and ship',
        'Debug, iterate, and scale',
        'Collaborate and ship faster',
        'Build, inspect, and deploy',
    ];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const current = phrases[phraseIndex];
        const speed = isDeleting ? 40 : 70;

        const timer = setTimeout(() => {
            if (!isDeleting && typedText === current) {
                // Pause at full word before deleting
                setTimeout(() => setIsDeleting(true), 1800);
                return;
            }
            if (isDeleting && typedText === '') {
                setIsDeleting(false);
                setPhraseIndex(i => (i + 1) % phrases.length);
                return;
            }
            setTypedText(prev =>
                isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
            );
        }, speed);

        return () => clearTimeout(timer);
    }, [typedText, isDeleting, phraseIndex]);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "headline": "Httply - Sign In",
        "description": "Sign in to Httply.",
        "publisher": { "@type": "Organization", "name": "Httply" }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
                
                * { box-sizing: border-box; }

                .login-root {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    display: flex;
                    min-height: 100vh;
                    background: #0c0c0e;
                    color: #e4e4e7;
                }

                /* ---- LEFT PANEL ---- */
                .left-panel {
                    display: none;
                    width: 52%;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 40px 56px;
                    position: relative;
                    overflow: hidden;
                    background: #0a0a0c;
                    border-right: 1px solid rgba(255,255,255,0.04);
                }
                @media (min-width: 1024px) {
                    .left-panel { display: flex; }
                }

                /* Noise overlay */
                .left-panel::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    opacity: 0.4;
                }
                @keyframes blink {
                    0%, 45% { opacity: 1; }
                    55%, 100% { opacity: 0; }
                }
                .lp-cursor {
                    display: inline-block;
                    width: 3px;
                    height: 0.85em;
                    background: #6366f1;
                    margin-left: 4px;
                    margin-right: 1px;
                    vertical-align: middle;
                    border-radius: 2px;
                    animation: blink 1.1s ease-in-out infinite;
                    position: relative;
                    top: -1px;
                    box-shadow: 0 0 8px rgba(99,102,241,0.6);
                }

                .lp-brand {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    position: relative;
                    z-index: 1;
                }
                .lp-brand-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: rgba(228,228,231,0.85);
                    letter-spacing: -0.2px;
                }

                /* Main editorial statement */
                .lp-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    z-index: 1;
                }

                .lp-eyebrow {
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 1.4px;
                    text-transform: uppercase;
                    color: rgba(99,102,241,0.7);
                    margin-bottom: 20px;
                }

                .lp-headline {
                    font-size: 32px;
                    font-weight: 600;
                    line-height: 1.18;
                    letter-spacing: -0.8px;
                    color: #e4e4e7;
                    margin: 0 0 20px 0;
                    max-width: 420px;
                }

                .lp-headline em {
                    font-style: normal;
                    color: rgba(228,228,231,0.35);
                    display: block;
                }

                .lp-desc {
                    font-size: 14px;
                    line-height: 1.7;
                    color: rgba(228,228,231,0.38);
                    max-width: 380px;
                    margin: 0 0 48px 0;
                }

                /* Testimonial */
                .lp-testimonial {
                    border-left: 2px solid rgba(99,102,241,0.3);
                    padding: 0 0 0 20px;
                    margin-bottom: 0;
                }
                .lp-quote {
                    font-size: 14px;
                    line-height: 1.7;
                    color: rgba(228,228,231,0.55);
                    font-style: italic;
                    margin: 0 0 14px 0;
                }
                .lp-cite {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .lp-cite-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: rgba(99,102,241,0.15);
                    border: 1px solid rgba(99,102,241,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(99,102,241,0.8);
                    flex-shrink: 0;
                }
                .lp-cite-name {
                    font-size: 12.5px;
                    font-weight: 500;
                    color: rgba(228,228,231,0.55);
                }
                .lp-cite-role {
                    font-size: 11.5px;
                    color: rgba(228,228,231,0.25);
                }

                /* Bottom stats bar */
                .lp-stats {
                    display: flex;
                    gap: 32px;
                    position: relative;
                    z-index: 1;
                    padding-top: 32px;
                    border-top: 1px solid rgba(255,255,255,0.04);
                }
                .lp-stat-val {
                    font-size: 20px;
                    font-weight: 600;
                    letter-spacing: -0.5px;
                    color: rgba(228,228,231,0.8);
                    margin-bottom: 2px;
                }
                .lp-stat-label {
                    font-size: 11.5px;
                    color: rgba(228,228,231,0.25);
                    letter-spacing: 0.1px;
                }

                /* ---- RIGHT PANEL ---- */
                .right-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 32px;
                    background: #0f0f12;
                    position: relative;
                }

                .form-wrap {
                    width: 100%;
                    max-width: 360px;
                    opacity: 0;
                    transform: translateY(8px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .form-wrap.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .form-header { margin-bottom: 32px; }
                .form-eyebrow {
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                    color: rgba(228,228,231,0.25);
                    margin-bottom: 10px;
                }
                .form-title {
                    font-size: 22px;
                    font-weight: 600;
                    color: #e4e4e7;
                    letter-spacing: -0.5px;
                    margin: 0 0 6px 0;
                    line-height: 1.25;
                }
                .form-subtitle {
                    font-size: 13.5px;
                    color: rgba(228,228,231,0.4);
                    margin: 0;
                    line-height: 1.5;
                }

                .auth-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }

                .auth-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    border: none;
                    border-radius: 8px;
                    padding: 11px 16px;
                    font-size: 13.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
                    letter-spacing: -0.1px;
                }
                .auth-btn:active { transform: scale(0.985); }
                .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                .btn-google {
                    background: #5b5ef4;
                    color: #fff;
                }
                .btn-google:hover:not(:disabled) { background: #4f52e8; }

                .btn-github {
                    background: rgba(255,255,255,0.04);
                    color: rgba(228,228,231,0.85);
                    border: 1px solid rgba(255,255,255,0.07);
                }
                .btn-github:hover:not(:disabled) { background: rgba(255,255,255,0.07); }

                .divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 28px;
                }
                .divider-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.05);
                }
                .divider-text {
                    font-size: 11px;
                    color: rgba(228,228,231,0.2);
                    white-space: nowrap;
                    letter-spacing: 0.3px;
                }

                .trust-block { display: flex; flex-direction: column; gap: 10px; margin-bottom: 0; }
                .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12.5px;
                    color: rgba(228,228,231,0.35);
                }
                .trust-item svg { width: 14px; height: 14px; opacity: 0.5; flex-shrink: 0; }

                .right-footer {
                    position: absolute;
                    bottom: 28px;
                    font-size: 11.5px;
                    color: rgba(228,228,231,0.2);
                    text-align: center;
                }
                .right-footer a {
                    color: rgba(228,228,231,0.35);
                    text-decoration: none;
                }
                .right-footer a:hover { color: rgba(228,228,231,0.55); }
            `}</style>

            <main className="login-root">
                <Suspense fallback={null}><ErrorToaster /></Suspense>

                {loading !== null && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(12,12,14,0.8)', backdropFilter: 'blur(6px)' }}>
                        <Spinner className="h-5 w-5 text-white mb-3" />
                        <p style={{ fontSize: '13px', color: 'rgba(228,228,231,0.5)', letterSpacing: '0.2px' }}>Authenticating...</p>
                    </div>
                )}

                {/* Left Panel */}
                <div className="left-panel">

                    {/* Brand */}
                    <div className="lp-brand">
                        <Image
                            src="/logo__2_-removebg-preview.png"
                            alt="Httply"
                            width={24}
                            height={24}
                            style={{ objectFit: 'contain' }}
                        />
                        <span className="lp-brand-name">Httply</span>
                    </div>

                    {/* Editorial body */}
                    <div className="lp-body">
                        <p className="lp-eyebrow">API and webhook testing platform</p>
                        <h2 className="lp-headline">
                            {typedText}<span className="lp-cursor" />{' '}
                            <em>without the friction.</em>
                        </h2>
                        <p className="lp-desc">
                            A workspace built for engineering teams who need speed, clarity, and collaboration — without the bloat of legacy API tools.
                        </p>

                        {/* Testimonial */}
                        <div className="lp-testimonial">
                            <p className="lp-quote">
                                &ldquo;Httply cut our API testing cycle in half. The team collaboration features are exactly what we were missing from our previous tool.&rdquo;
                            </p>
                            <div className="lp-cite">
                                <div className="lp-cite-avatar">MP</div>
                                <div>
                                    <div className="lp-cite-name">Mallesh Pareet</div>
                                    <div className="lp-cite-role">Founder and Developer of Httply</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="lp-stats">
                        <div>
                            <div className="lp-stat-val">1K+</div>
                            <div className="lp-stat-label">Engineering teams</div>
                        </div>
                        <div>
                            <div className="lp-stat-val">12K+</div>
                            <div className="lp-stat-label">API requests tested</div>
                        </div>
                        <div>
                            <div className="lp-stat-val">99.9%</div>
                            <div className="lp-stat-label">Uptime SLA</div>
                        </div>
                    </div>

                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    <div className={`form-wrap ${mounted ? 'visible' : ''}`}>
                        <div className="form-header">
                            <p className="form-eyebrow">Httply Platform</p>
                            <h1 className="form-title">Sign in to your workspace</h1>
                            <p className="form-subtitle">Access your API collections, environments, and team settings.</p>
                        </div>

                        <div className="auth-buttons">
                            <button
                                className="auth-btn btn-google"
                                disabled={loading !== null}
                                onClick={async () => {
                                    setLoading('google');
                                    const res = await signIn.social({ provider: 'google', callbackURL: "/" });
                                    if (res?.error) toast.error(res.error.message || "An error occurred");
                                    setLoading(null);
                                }}
                            >
                                {loading === 'google' ? <Spinner className="h-4 w-4" /> : <FaGoogle style={{ width: 14, height: 14 }} />}
                                Continue with Google
                            </button>

                            <button
                                className="auth-btn btn-github"
                                disabled={loading !== null}
                                onClick={async () => {
                                    setLoading('github');
                                    const res = await signIn.social({ provider: 'github', callbackURL: "/" });
                                    if (res?.error) toast.error(res.error.message || "An error occurred");
                                    setLoading(null);
                                }}
                            >
                                {loading === 'github' ? <Spinner className="h-4 w-4" /> : <FaGithub style={{ width: 15, height: 15 }} />}
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="divider">
                            <div className="divider-line" />
                            <span className="divider-text">Single sign-on available</span>
                            <div className="divider-line" />
                        </div>

                        <div className="trust-block">
                            <div className="trust-item">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M8 1l1.9 4.1 4.1.6-3 2.9.7 4.1L8 11l-3.7 1.9.7-4.1-3-2.9 4.1-.6z" />
                                </svg>
                                SOC 2 Type II certified infrastructure
                            </div>
                            <div className="trust-item">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="7" width="10" height="8" rx="1.5" />
                                    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
                                </svg>
                                End-to-end encrypted workspaces
                            </div>
                            <div className="trust-item">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="8" cy="8" r="6.5" />
                                    <path d="M8 4.5V8l2.5 2" />
                                </svg>
                                99.9% uptime SLA guarantee
                            </div>
                        </div>
                    </div>

                    <div className="right-footer">
                        By continuing you agree to our{' '}
                        <Link href="/terms">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy">Privacy Policy</Link>.
                    </div>
                </div>
            </main>
        </>
    )
}

export default LoginPage