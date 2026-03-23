"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stethoscope, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { registerClinicSelfService } from "@/lib/actions/clinic-onboarding";
import { normalizeClinicSlug } from "@/lib/clinic-slug";

const highlights = [
  "Patients, medicines, and prescriptions in one place—no scattered pads or spreadsheets",
  "General and eye-specific Rx templates with layouts built for printing",
  "Letterhead, logo, signature, and stamp on professional printouts",
  "Reusable advice snippets and per-doctor settings to match how you work",
];

const storyParagraphs = [
  "Built for real clinics: multi-doctor support, scoped data for each practice, and workflows that mirror day-to-day consultations.",
];

function passwordStrengthLabel(pw: string): { label: string; score: 0 | 1 | 2 | 3; hint: string } {
  if (!pw) return { label: "", score: 0, hint: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const capped = Math.min(3, Math.max(1, score >= 4 ? 3 : score >= 2 ? 2 : 1));
  if (capped === 1) return { label: "Weak", score: 1, hint: "Add length and mix letters, numbers, or symbols." };
  if (capped === 2) return { label: "Good", score: 2, hint: "Almost there — a longer phrase helps." };
  return { label: "Strong", score: 3, hint: "Great choice for your clinic login." };
}

const registerSchema = z
  .object({
    clinicName: z.string().min(1, "Clinic name is required").trim(),
    clinicEmail: z.string().min(1, "Email is required").email("Enter a valid email").trim(),
    clinicPassword: z.string().min(6, "Use at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.clinicPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((d, ctx) => {
    const fromName = normalizeClinicSlug(d.clinicName);
    if (!fromName || fromName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use a longer clinic name (at least 2 letters or numbers for your clinic URL).",
        path: ["clinicName"],
      });
    }
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterClinicClient() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClinicPassword, setShowClinicPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      clinicName: "",
      clinicEmail: "",
      clinicPassword: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = useWatch({ control, name: "clinicPassword" }) ?? "";
  const strength = useMemo(() => passwordStrengthLabel(watchedPassword), [watchedPassword]);

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("clinicName", data.clinicName);
      fd.append("clinicEmail", data.clinicEmail);
      fd.append("clinicPassword", data.clinicPassword);

      const result = await registerClinicSelfService(fd);
      if (result.success) {
        router.push("/login?registered=1");
        router.refresh();
      } else {
        setServerError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(14,165,233,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row lg:items-stretch">
        <aside className="flex flex-col justify-between border-b border-slate-200 bg-slate-50/80 px-6 pb-8 pt-10 text-slate-900 sm:px-10 lg:w-[min(44%,30rem)] lg:shrink-0 lg:border-b-0 lg:border-r lg:py-14 lg:pl-10 lg:pr-8 xl:pl-14">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 shadow-md shadow-sky-900/10 ring-1 ring-sky-700/10">
                <Stethoscope className="h-6 w-6 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-900">RxPad</p>
                <p className="text-xs font-medium text-slate-600">Digital prescription manager</p>
              </div>
            </div>

            <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              Built for clinics and practices
            </p>

            <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Prescriptions, patients, and your practice—together
            </h1>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-600">
              RxPad is a digital prescription workspace: structured Rx, your branding on printouts, and a single home for everyone who prescribes at your clinic.
            </p>

            <div className="mt-8 space-y-4 border-t border-slate-200 pt-8">
              {storyParagraphs.map((para) => (
                <p key={para} className="max-w-md text-pretty text-sm leading-relaxed text-slate-600">
                  {para}
                </p>
              ))}
            </div>

            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 hidden items-center gap-2 text-xs text-slate-500 lg:flex">
            <ShieldCheck className="h-4 w-4 text-sky-600" aria-hidden />
            <span>Encrypted password storage · Scoped clinic data</span>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center bg-white px-4 pb-12 pt-2 sm:px-6 lg:px-10 lg:py-14">
          <div className="w-full max-w-xl">
            <div className="mb-6 lg:hidden">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 shadow-md ring-1 ring-sky-700/10">
                  <Stethoscope className="h-5 w-5 text-white" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold">RxPad</p>
                  <p className="text-xs text-slate-600">Create your clinic workspace</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Launch your clinic workspace</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Structured prescriptions, clinic-branded printouts, and a single command center for patients, medicines, and doctors.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <section className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      label="Clinic name"
                      required
                      hint="Shown across your workspace and prescription printouts for consistent clinic branding."
                      error={errors.clinicName?.message}
                      htmlFor="clinicName"
                    >
                      <Input
                        id="clinicName"
                        autoComplete="organization"
                        placeholder="ABC Medical Centre"
                        aria-invalid={!!errors.clinicName}
                        {...register("clinicName")}
                      />
                    </FormField>
                    <FormField
                      label="Admin email"
                      required
                      error={errors.clinicEmail?.message}
                      htmlFor="clinicEmail"
                    >
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
                        <Input
                          id="clinicEmail"
                          type="email"
                          autoComplete="email"
                          placeholder="admin@yourclinic.com"
                          className="pl-9"
                          aria-invalid={!!errors.clinicEmail}
                          {...register("clinicEmail")}
                        />
                      </div>
                    </FormField>
                    <FormField
                      label="Password"
                      required
                      error={errors.clinicPassword?.message}
                      htmlFor="clinicPassword"
                    >
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
                        <Input
                          id="clinicPassword"
                          type={showClinicPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          className="pl-9 pr-10"
                          aria-invalid={!!errors.clinicPassword}
                          {...register("clinicPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowClinicPassword((p) => !p)}
                          className="absolute right-3 top-2.5 text-slate-400 transition-colors hover:text-slate-600"
                          aria-label={showClinicPassword ? "Hide password" : "Show password"}
                        >
                          {showClinicPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {watchedPassword.length > 0 && (
                        <div className="mt-2 space-y-1.5" aria-live="polite">
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded-full bg-slate-200 transition-colors",
                                  strength.score >= i &&
                                    (strength.score === 1
                                      ? "bg-amber-500"
                                      : strength.score === 2
                                        ? "bg-sky-500"
                                        : "bg-emerald-500")
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600">
                            <span className="font-medium text-slate-800">{strength.label}</span>
                            {strength.hint ? ` — ${strength.hint}` : null}
                          </p>
                        </div>
                      )}
                    </FormField>
                    <FormField
                      label="Confirm password"
                      required
                      error={errors.confirmPassword?.message}
                      htmlFor="confirmPassword"
                    >
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Re-enter password"
                          className="pl-9 pr-10"
                          aria-invalid={!!errors.confirmPassword}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-3 top-2.5 text-slate-400 transition-colors hover:text-slate-600"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormField>
                  </div>
                </section>

                {serverError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                    aria-live="assertive"
                  >
                    {serverError}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    className="h-11 flex-1 bg-sky-600 shadow-sm hover:bg-sky-700"
                    size="lg"
                    loading={loading}
                  >
                    Create clinic account
                  </Button>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-11 border-slate-200 bg-white text-center sm:min-w-[10rem]"
                    )}
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Secure doctor portal · RxPad
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
