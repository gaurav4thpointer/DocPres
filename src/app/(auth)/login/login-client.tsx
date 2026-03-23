"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

type Props = { showClinicRegistration: boolean; justRegistered: boolean };

export function LoginClient({ showClinicRegistration, justRegistered }: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [watchedEmail, watchedPassword, error]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else if (!result?.ok) {
        setError("Unable to sign in right now. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-600 shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RxPad</h1>
          <p className="text-gray-500 mt-1 text-sm">Digital Prescription Manager</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          {justRegistered && (
            <div
              className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800 mb-4 flex gap-2"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Your clinic was created. Sign in with your clinic email and password, then use{" "}
              <span className="font-medium">Doctors</span> in the sidebar to add prescribing doctors.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email address" error={errors.email?.message} htmlFor="email">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  className="pl-9"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  {...register("email")}
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} htmlFor="password">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            {error && (
              <div
                className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 flex gap-2"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!isValid}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            {showClinicRegistration && (
              <Link
                href="/register-clinic"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                )}
              >
                New clinic? Register your clinic
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Secure doctor portal · RxPad v1.0
        </p>
      </div>
    </div>
  );
}
