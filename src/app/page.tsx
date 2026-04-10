"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import ApiKeyInput from "@/components/ApiKeyInput";
import { useRouter } from "next/navigation";

export default function Home() {
  const { apiKey, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (apiKey && user) {
      router.push("/dashboard");
    }
  }, [apiKey, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <ApiKeyInput onSuccess={() => router.push("/dashboard")} />
    </div>
  );
}
