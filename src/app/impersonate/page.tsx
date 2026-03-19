"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function ImpersonateContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const submitted = useRef(false);

  useEffect(() => {
    if (!token || submitted.current) return;
    submitted.current = true;
    signIn("impersonate", {
      token,
      redirect: false,
      callbackUrl: "/dashboard",
    }).then((result) => {
      if (result?.error) {
        window.location.href = "/admin?error=impersonate_failed";
      } else if (result?.url) {
        window.location.href = result.url;
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-sky-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Signing in as clinic...</p>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-8 w-8 border-2 border-sky-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ImpersonateContent />
    </Suspense>
  );
}
