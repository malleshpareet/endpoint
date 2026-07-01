import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Privacy Policy — Httply",
    description: "Learn how Httply collects, uses, and protects your personal data. Your privacy is important to us.",
};

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Privacy Policy</h1>
                    <p className="text-[13.5px] text-white/35">Last updated: July 1, 2026</p>
                </div>

                {/* Sections */}
                <div className="space-y-10 text-[14px] leading-7 text-white/55">

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">1. Introduction</h2>
                        <p>
                            Httply (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">2. Information We Collect</h2>
                        <p className="mb-3">We collect information you provide directly to us, including:</p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50 mb-4">
                            <li><strong className="text-white/70">Account Information:</strong> Name, email address, and profile picture provided through your OAuth provider (Google or GitHub).</li>
                            <li><strong className="text-white/70">Usage Data:</strong> API requests, collections, environments, and other content you create within the Service.</li>
                            <li><strong className="text-white/70">Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
                            <li><strong className="text-white/70">Log Data:</strong> Pages visited, time spent, actions taken, and error reports.</li>
                        </ul>
                        <p>
                            We do <strong className="text-white/70">not</strong> store sensitive data such as API keys or secret tokens beyond what is necessary to operate the Service within your session.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">3. How We Use Your Information</h2>
                        <p className="mb-3">We use the information we collect to:</p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50">
                            <li>Provide, maintain, and improve the Service.</li>
                            <li>Authenticate and manage your account.</li>
                            <li>Enable collaboration features such as shared workspaces and team environments.</li>
                            <li>Send transactional communications (e.g., account notifications).</li>
                            <li>Analyze usage patterns to improve product experience.</li>
                            <li>Comply with legal obligations.</li>
                        </ul>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">4. OAuth Sign-In (Google & GitHub)</h2>
                        <p>
                            When you sign in via Google or GitHub, we receive basic profile information (name, email, avatar) from those providers. We do not receive your passwords. Your use of those providers&apos; services is governed by their respective privacy policies. We only request the minimum permissions necessary to authenticate you.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">5. Data Sharing & Disclosure</h2>
                        <p className="mb-3">We do not sell your personal data. We may share your information only in the following circumstances:</p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50">
                            <li><strong className="text-white/70">Service Providers:</strong> Trusted third-party vendors who assist in operating the Service (e.g., hosting, analytics), bound by confidentiality obligations.</li>
                            <li><strong className="text-white/70">Legal Requirements:</strong> When required by law, regulation, or valid legal process.</li>
                            <li><strong className="text-white/70">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to you.</li>
                            <li><strong className="text-white/70">Safety:</strong> To protect the rights, property, or safety of Httply, our users, or others.</li>
                        </ul>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">6. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time. We will delete or anonymize your data within 30 days of such a request, except where we are required by law to retain it.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">7. Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your information, including TLS encryption for data in transit, secure storage, and access controls. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">8. Cookies & Tracking</h2>
                        <p>
                            We use session cookies necessary for authentication and to maintain your login state. We may use minimal analytics cookies to understand usage patterns. You can configure your browser to refuse cookies, though this may affect Service functionality.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">9. Your Rights</h2>
                        <p className="mb-3">Depending on your location, you may have the right to:</p>
                        <ul className="space-y-2 pl-5 list-disc marker:text-orange-400/50">
                            <li>Access the personal data we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
                            <li>Object to or restrict processing of your data.</li>
                            <li>Data portability — receive your data in a structured format.</li>
                        </ul>
                        <p className="mt-3">To exercise these rights, please contact us.</p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">10. Children&apos;s Privacy</h2>
                        <p>
                            The Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">11. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
                        </p>
                    </section>

                    <div className="h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

                    <section>
                        <h2 className="text-[16px] font-semibold text-white/85 mb-3">12. Contact Us</h2>
                        <p>
                            If you have questions or concerns about this Privacy Policy or our data practices, please contact us. We are dedicated to working with you to resolve any privacy concerns.
                        </p>
                    </section>
                </div>

                {/* Footer links */}
                <div className="mt-16 pt-8 border-t flex flex-wrap gap-5 items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[12px] text-white/20">© {new Date().getFullYear()} Httply. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/terms" className="text-[12px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">Terms of Service</Link>
                        <Link href="/sign-in" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
