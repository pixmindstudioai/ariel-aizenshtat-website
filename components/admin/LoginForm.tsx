"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/admin/actions/auth";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";

/** טופס התחברות לממשק הניהול */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await signIn(email, password);
    if (result.ok) {
      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } else {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-bold">
          אימייל
        </label>
        <input
          id="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          className="admin-input text-left"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-bold">
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          required
          dir="ltr"
          autoComplete="current-password"
          className="admin-input text-left"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-admin-primary mt-1 !py-3 text-base">
        {pending ? (
          "מתחבר..."
        ) : (
          <>
            כניסה לממשק הניהול{" "}
            <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
              <AssetImage asset={icons.growth} decorative variant="flat" className="w-full h-auto" />
            </span>
          </>
        )}
      </button>
    </form>
  );
}
