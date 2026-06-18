"use client";

import React, { useEffect, useState } from "react";

export const LoginBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0F172A] selection:bg-blue-500/30">
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* Radial Gradient overlay to soften the grid in the center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0F172A_80%)]" />

      {/* Animated Glow in Corners */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />

      {/* Floating Code Snippets */}
      {mounted && (
        <>
          <div className="absolute top-1/4 left-[10%] md:left-16 text-[10px] md:text-xs text-blue-300/30 font-mono rotate-[-5deg] animate-[float_15s_ease-in-out_infinite]">
            {`GET /api/v1/users`}
            <br />
            {`Authorization: Bearer ***`}
          </div>
          
          <div className="absolute bottom-1/3 left-[5%] md:left-[10%] text-[10px] md:text-xs text-emerald-300/30 font-mono rotate-[2deg] animate-[float_20s_ease-in-out_infinite_reverse]">
            {`{`}
            <br />
            &nbsp;&nbsp;{`"status": 200,`}
            <br />
            &nbsp;&nbsp;{`"data": { "id": "usr_942" }`}
            <br />
            {`}`}
          </div>

          <div className="absolute top-1/3 right-[10%] md:right-[15%] text-[10px] md:text-xs text-purple-300/30 font-mono rotate-[8deg] animate-[float_18s_ease-in-out_infinite]">
            {`POST /graphql`}
            <br />
            {`{"query": "mutation {..."}`}
          </div>
          
          <div className="absolute bottom-1/4 right-[5%] text-[10px] md:text-xs text-zinc-300/30 font-mono rotate-[-3deg] animate-[float_22s_ease-in-out_infinite_reverse]">
            {`HTTP/1.1 429 Too Many Requests`}
            <br />
            {`Retry-After: 3600`}
          </div>
        </>
      )}

      {/* Keyframes for floating animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </div>
  );
};
