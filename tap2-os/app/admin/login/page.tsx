"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push(from);
      } else {
        const data = await res.json();
        setError(data.error ?? "Authentication failed.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0358F1]/10">
          <Lock className="h-4 w-4 text-[#0358F1]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Integration Hub</p>
          <p className="text-xs text-gray-400">Admin credentials required</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="admin"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0358F1] focus:ring-2 focus:ring-[#0358F1]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0358F1] focus:ring-2 focus:ring-[#0358F1]/10 transition-all"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-lg bg-[#0358F1] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0247c9] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/brand/symbol-blue.png" alt="Tap2" width={36} height={36} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Tap2 OS</h1>
          <p className="text-sm text-gray-500 mt-1">Internal access only</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-400">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-gray-400 mt-6">
          Set <code className="bg-gray-100 px-1 rounded">ADMIN_USERNAME</code> and{" "}
          <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code> in Vercel environment variables.
        </p>
      </div>
    </div>
  );
}
