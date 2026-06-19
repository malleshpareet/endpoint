"use client";

import React from "react";

export const LoginBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden">
      {/* Fine dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,black_100%)]" />

      {/* Top-left warm amber glow */}
      <div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)" }}
      />

      {/* Bottom-right cool blue glow */}
      <div
        className="absolute -bottom-40 -right-24 w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }}
      />

      {/* Horizontal subtle line across middle */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* ── Floating API snippets ── */}
      <style>{`
        @keyframes snippetFloat {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-7px); }
          100% { transform: translateY(0px); }
        }
        .snip {
          position: absolute;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 11.5px;
          line-height: 1.75;
          pointer-events: none;
          user-select: none;
          white-space: pre;
          animation: snippetFloat var(--dur, 7s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          opacity: var(--op, 0.25);
        }
        .snip .m-get   { color: #4ade80; }
        .snip .m-post  { color: #fb923c; }
        .snip .path    { color: rgba(255,255,255,0.55); }
        .snip .hk      { color: rgba(255,255,255,0.32); }
        .snip .hv      { color: #7dd3fc; }
        .snip .brace   { color: rgba(255,255,255,0.30); }
        .snip .jk      { color: #c084fc; }
        .snip .js      { color: #86efac; }
        .snip .jn      { color: #fbbf24; }
        .snip .err     { color: #f87171; }
      `}</style>

      {/* LEFT TOP — GET request (OUT — close to edge) */}
      <div
        className="snip"
        style={{
          top: "22%",
          left: "3%",
          "--dur": "7s",
          "--delay": "0s",
          "--op": "0.28",
        } as React.CSSProperties}
      >
        <span className="m-get">GET</span><span className="path"> /api/v1/users</span>{"\n"}
        <span className="hk">Authorization: </span><span className="hv">Bearer ***</span>
      </div>

      {/* LEFT BOTTOM — JSON response (IN — slightly indented) */}
      <div
        className="snip"
        style={{
          top: "60%",
          left: "9%",
          "--dur": "8.5s",
          "--delay": "1.5s",
          "--op": "0.25",
        } as React.CSSProperties}
      >
        <span className="brace">{"{"}</span>{"\n"}
        {"  "}<span className="jk">&quot;status&quot;</span><span className="brace">: </span><span className="jn">200</span><span className="brace">,</span>{"\n"}
        {"  "}<span className="jk">&quot;data&quot;</span><span className="brace">: [{"{ "}</span><span className="jk">&quot;id&quot;</span><span className="brace">: </span><span className="js">&quot;usr_942&quot;</span><span className="brace">{" }"}]</span>{"\n"}
        <span className="brace">{"}"}</span>
      </div>

      {/* RIGHT TOP — POST GraphQL (IN — slightly indented) */}
      <div
        className="snip"
        style={{
          top: "33%",
          right: "9%",
          "--dur": "9s",
          "--delay": "0.8s",
          "--op": "0.28",
        } as React.CSSProperties}
      >
        <span className="m-post">POST</span><span className="path"> /graphql</span>{"\n"}
        <span className="brace">{"{"}</span><span className="jk">&quot;query&quot;</span><span className="brace">: </span><span className="js">&quot;mutation [...]&quot;</span><span className="brace">{"}"}</span>
      </div>

      {/* RIGHT BOTTOM — 429 error (OUT — close to edge) */}
      <div
        className="snip"
        style={{
          top: "70%",
          right: "3%",
          "--dur": "7.5s",
          "--delay": "2s",
          "--op": "0.25",
        } as React.CSSProperties}
      >
        <span className="err">HTTP/1.1 429 Too Many Requests</span>{"\n"}
        <span className="hk">Retry-After: </span><span className="jn">3600</span>
      </div>
    </div>
  );
};
