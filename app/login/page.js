"use client";

import { Leaf } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  async function signInWithGoogle() {
    const supabase = createClient();
    const origin = window.location.origin;
    const next = new URLSearchParams(window.location.search).get("next");
    const callback = next
      ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback,
      },
    });
  }

  return (
    <div className="min-h-screen bg-memora-bg flex flex-col justify-center items-center px-4 font-sans text-memora-text">
       <div className="bg-white p-8 rounded-2xl shadow-xl border border-memora-border w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <Leaf className="text-memora-primary drop-shadow-sm" size={48} />
          </div>
          <h1 className="font-heading font-extrabold text-3xl mb-2 text-memora-dark">Welcome to Memora</h1>
          <p className="text-memora-muted mb-8 font-medium">Log in or create an account to continue</p>

          <button
             type="button"
             onClick={() => signInWithGoogle()}
             className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm cursor-pointer mb-4"
          >
             <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             Continue with Google
          </button>

          <p className="text-xs text-memora-muted mt-8">By continuing, you acknowledge that you understand and agree to Memora&apos;s Terms and Privacy Policy.</p>
       </div>
    </div>
  );
}
