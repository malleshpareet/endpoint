import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Terms of Service — Httply",
    description: "Read the Httply Terms of Service. Understand your rights and responsibilities when using our API client platform.",
};

export default function TermsPage() {
    return (
        <main
            className="min-h-screen w-full"
            style={{
                background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,146,60,0.07) 0%, transparent 70%), #080808",
                fontFamily: "'Inter', 'system-ui', sans-serif",
            }}
        >
            {/* Nav */}
            <header className="sticky top-0 z-10 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)" }}>
                <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
                    <Link href="/sign-in" className="flex items-center gap-2.5 group">
                        <Image src="/logo__2_-removebg-preview.png" alt="Httply" width={26} height={26} className="object-contain" />
                        <span className="text-[14px] font-semibold text-white/80 group-hover:text-white transition-colors">Httply</span>
                    </Link>
                    <Link
                        href="/sign-in"
                        className="text-[12.5px] text-white/40 hover:text-white/70 transition-colors"
                    >
                        ← Back to sign in
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[11px] font-medium text-orange-400/80 tracking-wider uppercase" style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.15)" }}>
                        Legal
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Terms of Service</h1>
                    <p className="text-[13.5px] text-white/35">Last updated: July 1, 2026</p>
                </div>

                {/* Sections */}
                <div className="space-y-10 text-[14px] leading-7 text-white/55">

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Httply (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">2. Description of Service</h2>
                        <p>
                            Httply is a professional API client platform built for development teams. The Service allows users to create, test, debug, and collaborate on REST API requests. Features may include request collections, environment variables, real-time collaboration, and integrations with third-party services.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">3. User Accounts</h2>
                        <p className="mb-3">
                            To access certain features of the Service, you must sign in using a supported OAuth provider (Google or GitHub). You are responsible for:
                        </p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50">
                            <li>Maintaining the confidentiality of your account credentials.</li>
                            <li>All activities that occur under your account.</li>
                            <li>Notifying us immediately of any unauthorized use of your account.</li>
                        </ul>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">4. Acceptable Use</h2>
                        <p className="mb-3">You agree not to use the Service to:</p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50">
                            <li>Violate any applicable laws or regulations.</li>
                            <li>Transmit harmful, offensive, or unlawful content.</li>
                            <li>Attempt to gain unauthorized access to any systems or networks.</li>
                            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                            <li>Scrape, crawl, or use automated methods to access the Service without our written consent.</li>
                        </ul>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">5. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of Httply and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Httply.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">6. User Content</h2>
                        <p>
                            You retain ownership of any content, requests, or data you create within the Service. By using the Service, you grant Httply a limited, non-exclusive license to store and process your content solely to provide and improve the Service. We will never sell your data to third parties.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">7. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, third parties, or for any other reason. You may also terminate your account at any time by contacting us.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">8. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Httply shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">10. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the &ldquo;Last updated&rdquo; date. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">11. Contact</h2>
                        <p>
                            If you have any questions about these Terms, please contact us. We are committed to resolving any concerns fairly and transparently.
                        </p>
                    </section>
                </div>

                {/* Footer links */}
                <div className="mt-16 pt-8 border-t flex flex-wrap gap-5 items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[12px] text-white/20">© {new Date().getFullYear()} Httply. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="text-[12px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">Privacy Policy</Link>
                        <Link href="/sign-in" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
