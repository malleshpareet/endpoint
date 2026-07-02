"use client";

import { createContext, useContext, ReactNode } from "react";

const AIFeatureContext = createContext<boolean>(true);

export function AIFeatureProvider({
  children,
  enableAIFeatures,
}: {
  children: ReactNode;
  enableAIFeatures: boolean;
}) {
  return (
    <AIFeatureContext.Provider value={enableAIFeatures}>
      {children}
    </AIFeatureContext.Provider>
  );
}

export function useAIFeatures() {
  return useContext(AIFeatureContext);
}
