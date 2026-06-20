"use client";

import { Hint } from "@/components/ui/hint";
import { Globe, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const TabbedLeftPanel = () => {
    const pathname = usePathname();
    const activeTab = pathname.split("/")[1] || "rest";

    const sidebarItems = [
        { icon: LinkIcon, label: "rest", link: "/" },
        { icon: Globe, label: "realtime", link: "/realtime" },
    ];

    return (
        <div className="flex flex-col items-center h-full py-3 gap-1">
            {sidebarItems.map((item, index) => {
                const isActive = activeTab === item.label;
                return (
                    <Hint label={item.label} key={index} side="right">
                        <Link
                            href={item.link}
                            className={`relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 ${
                                isActive
                                    ? "text-white bg-indigo-500/20"
                                    : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]"
                            }`}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-indigo-400" />
                            )}
                            <item.icon className="w-3.5 h-3.5" />
                        </Link>
                    </Hint>
                );
            })}
        </div>
    );
};

export default TabbedLeftPanel;