"use client";

import { useEffect, useState, memo } from "react";
import { Loader2, CheckCircle2, Circle, LogIn, Shield, Send, Clock, Check, XCircle } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  status: "loading" | "success" | "error";
  errorMessage?: string;
}

const steps = [
  { id: 1, label: "Login", icon: LogIn, description: "Authenticating with GitHub" },
  { id: 2, label: "2FA", icon: Shield, description: "Verifying two-factor auth" },
  { id: 3, label: "Submit", icon: Send, description: "Submitting application" },
  { id: 4, label: "Pending", icon: Clock, description: "Waiting for approval" },
];

const ProgressSteps = memo(function ProgressSteps({
  currentStep,
  status,
  errorMessage,
}: ProgressStepsProps) {
  const [animatedStep, setAnimatedStep] = useState(0);

  useEffect(() => {
    if (currentStep > animatedStep) {
      const timer = setTimeout(() => {
        setAnimatedStep(currentStep);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, animatedStep]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />

        {/* Progress Line Active */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(((animatedStep - 1) / (steps.length - 1)) * 100, 100)}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < animatedStep - 1;
            const isCurrent = index === animatedStep - 1;
            const isPending = index >= animatedStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center transition-all duration-300 ${
                  isCurrent ? "scale-110" : ""
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-blue-500 text-white"
                      : isCurrent
                      ? status === "error"
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900/30"
                      : "bg-white dark:bg-zinc-800 text-zinc-400 border-2 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    status === "error" ? (
                      <XCircle className="w-5 h-5" />
                    ) : status === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium transition-colors ${
                      isCompleted || isCurrent
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Description */}
      <div className="mt-8 text-center">
        {status === "error" ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
            <p className="text-red-600 dark:text-red-400 font-medium">{errorMessage || "Verification failed"}</p>
          </div>
        ) : status === "success" ? (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
            <p className="text-green-600 dark:text-green-400 font-medium">✨ Verification started successfully!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-zinc-600 dark:text-zinc-400">
              {steps[Math.min(animatedStep - 1, steps.length - 1)]?.description}
            </p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProgressSteps;
