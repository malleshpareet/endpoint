"use client";

import React, { useEffect, useState } from "react";
import { Joyride, EventData, STATUS, Step } from "react-joyride";
import { useTourStore } from "@/modules/layout/stores/useTourStore";
import { useRequestPlaygroundStore } from "@/modules/request/store/useRequestStore";

const TOUR_STEPS: Step[] = [
  {
    target: "body",
    placement: "center",
    content: (
      <div className="text-left text-zinc-200">
        <h2 className="text-xl font-bold text-white mb-2">Welcome to Httply! 👋</h2>
        <p className="text-sm">
          Let's take a quick tour to help you get familiar with the core features of the application. 
          You can always restart this tour from the Help menu later.
        </p>
      </div>
    ),
    skipBeacon: true,
  },
  {
    target: ".tour-workspace",
    content: "Switch between different workspaces here. Your data is isolated per workspace.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: ".tour-sidebar",
    content: "Manage your Collections, Environment Variables, and History from this sidebar.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: ".tour-request-url",
    content: "Enter your API endpoint URL here. You can also paste a raw cURL command to instantly populate the method, URL, and headers!",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: ".tour-environment-select",
    content: "Select the active environment variables (e.g. Local, Production) for this request.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: ".tour-send-btn",
    content: "Ready? Click Send to dispatch your request and view the response below.",
    placement: "left",
    skipBeacon: true,
  },
];

export const OnboardingTour = () => {
  const { run, setRun, stepIndex, setStepIndex, hasSeenTour, completeTour } = useTourStore();
  const { tabs, addTab } = useRequestPlaygroundStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let timer: NodeJS.Timeout;
    // Auto-start tour if they haven't seen it yet
    if (!hasSeenTour) {
      timer = setTimeout(() => {
        setRun(true);
        useTourStore.setState({ hasSeenTour: true });
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [hasSeenTour, setRun]);

  useEffect(() => {
    // If the tour reaches step 3 (.tour-request-url) and no tab is open, create one
    // so the target elements exist in the DOM.
    if (run && stepIndex === 3 && tabs.length === 0) {
      addTab();
    }
  }, [run, stepIndex, tabs.length, addTab]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (type === "step:after" || type === "error:target_not_found") {
      setStepIndex(index + (data.action === "prev" ? -1 : 1));
    } else if (finishedStatuses.includes(status)) {
      completeTour();
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        showProgress: true,
        buttons: ["back", "skip", "primary"],
        arrowColor: "#1e1e24",
        backgroundColor: "#1e1e24",
        overlayColor: "rgba(0, 0, 0, 0.6)",
        primaryColor: "#4f46e5", // Indigo 600
        textColor: "#e4e4e7",
        zIndex: 1000,
      }}
      styles={{
        tooltipContainer: {
          textAlign: "left",
        },
        buttonPrimary: {
          backgroundColor: "#4f46e5",
          fontSize: "13px",
          fontWeight: 600,
          padding: "8px 16px",
        },
        buttonBack: {
          marginRight: 10,
          color: "#a1a1aa",
          fontSize: "13px",
        },
        buttonSkip: {
          color: "#a1a1aa",
          fontSize: "13px",
        },
      }}
    />
  );
};
