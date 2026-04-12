"use client";

import { useEffect } from "react";
import { useStore, useCredits } from "@/lib/store";
import ApiKeyInput from "@/components/ApiKeyInput";
import { useRouter } from "next/navigation";

export default function Home() {
  const { apiKey } = useStore();
  const router = useRouter();
  const { user, isLoading } = useCredits(apiKey);

  useEffect(() => {
    if (apiKey && user && !isLoading) {
      router.push("/dashboard");
    }
  }, [apiKey, user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <ApiKeyInput onSuccess={() => router.push("/dashboard")} />
    </div>
  );
}
