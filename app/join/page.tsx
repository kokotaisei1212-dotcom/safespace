"use client";
import { useState } from "react";

export default function Join() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!email || !username || !password) {
      setError("All fields required");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setStep("verify");
    } else {
      setError("Something went wrong");
    }
  }

  async function handleVerify() {
    if (!code) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/feed";
    } else {
      const data = await res.json();
      setError(data.error || "Invalid code");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-medium mb-1 text-center text-gray-900">
          {step === "register" ? "Create account" : "Check your email"}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          {step === "register"
            ? "Women only"
            : `We sent a code to ${email}`}
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {step === "register" ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-gray-400 text-sm"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-900 rounded-lg text-white font-medium hover:bg-gray-700 transition text-sm mt-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-900 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-gray-400 text-sm text-center tracking-widest text-lg"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-900 rounded-lg text-white font-medium hover:bg-gray-700 transition text-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              onClick={() => setStep("register")}
              className="text-gray-400 text-sm text-center hover:text-gray-600"
            >
              Back
            </button>
          </div>
        )}

        <p className="text-gray-300 text-xs text-center mt-8">
          By joining you confirm you are a woman.
        </p>
      </div>
    </main>
  );
}
