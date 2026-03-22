import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  Stethoscope,
  FileText,
  Users,
  Pill,
  Printer,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  Building2,
  HeartPulse,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORT_PHONE = "+91 8800865479";
const SUPPORT_EMAIL = "hello@4thpointer.com";
const WHATSAPP_LINK = "https://wa.me/918800865479";

export default async function RootPage() {
  const session = await auth();
  if (session) {
    const role = (session.user as { role?: UserRole }).role;
    redirect(role === UserRole.ADMIN ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">RxPad</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="#contact-us"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Contact Us
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700">
                Chat on WhatsApp
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(2,6,23,1))]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-medium tracking-wide text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Built for secure clinical workflows
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              One platform for
              <br />
              modern prescription care.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Manage patients, medicines, and OPD prescriptions with a fast,
              reliable, and print-ready system designed for busy doctors.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="#contact-us">
                <Button size="lg" className="gap-2 bg-sky-600 text-white hover:bg-sky-700">
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Request Product Demo
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <DarkPill icon={<Clock3 className="h-4 w-4 text-sky-300" />} label="Faster OPD flow" />
              <DarkPill icon={<BadgeCheck className="h-4 w-4 text-sky-300" />} label="Structured records" />
              <DarkPill icon={<Printer className="h-4 w-4 text-sky-300" />} label="Clinic-ready print" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-medium text-slate-300">Today&apos;s workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Designed to save each consultation minute
            </h2>
            <div className="mt-6 space-y-3">
              <HeroList text="Find patient history and previous prescriptions quickly" />
              <HeroList text="Pick medicines from your curated clinic list" />
              <HeroList text="Create specialization-based prescriptions in one place" />
              <HeroList text="Print with clinic branding in a clean format" />
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Support</p>
              <p className="mt-1 text-sm text-slate-200">Phone: {SUPPORT_PHONE}</p>
              <p className="text-sm text-slate-200">Email: {SUPPORT_EMAIL}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <ValueStrip icon={<Users className="h-5 w-5 text-sky-300" />} text="Doctor-focused UX" />
            <ValueStrip icon={<Building2 className="h-5 w-5 text-sky-300" />} text="Built for clinics & OPDs" />
            <ValueStrip icon={<ShieldCheck className="h-5 w-5 text-sky-300" />} text="Secure account access" />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            Core modules in RxPad
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
            Every module is optimized for day-to-day doctor workflow.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-slate-700" />}
              title="Patient Management"
              description="Maintain searchable patient records and visit history."
            />
            <FeatureCard
              icon={<Pill className="h-6 w-6 text-slate-700" />}
              title="Medicine Database"
              description="Use your own medicine catalog for faster prescribing."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-slate-700" />}
              title="Specialization-based Prescriptions"
              description="Handle prescriptions tailored to your specialization."
            />
            <FeatureCard
              icon={<Printer className="h-6 w-6 text-slate-700" />}
              title="Professional Print"
              description="Print branded prescriptions with signature and stamp."
            />
            <FeatureCard
              icon={<ClipboardList className="h-6 w-6 text-slate-700" />}
              title="Template-driven Advice"
              description="Reuse common instructions and reduce repetitive writing."
            />
            <FeatureCard
              icon={<HeartPulse className="h-6 w-6 text-slate-700" />}
              title="Reliable Daily Use"
              description="Simple and stable interface for high consultation volume."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            Simple process, consistent outcome
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <StepCard
              step="01"
              title="Select patient"
              description="Open an existing record or create a new one in seconds."
            />
            <StepCard
              step="02"
              title="Write prescription"
              description="Choose medicines, dosage details, and advice templates."
            />
            <StepCard
              step="03"
              title="Generate and print"
              description="Create a clean document with clinic branding and print."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            Why clinics choose RxPad
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <InfoCard
              title="Reduce writing overhead"
              description="Reduce repetitive writing with reusable templates and a medicine library."
            />
            <InfoCard
              title="Standardize documentation"
              description="Keep patient records and prescriptions structured and consistent."
            />
            <InfoCard
              title="Built for OPD reality"
              description="Keep consultation flow smooth even during peak hours."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            Packages and pricing
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Choose the package that matches your monthly usage. All plans follow
            a pay-as-you-go model.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <PricingCard
              name="Starter"
              usage="Up to 2,000 per month"
              price="Rs 10"
              model="Pay as you go"
              features={[
                "Patient management",
                "Medicine library",
                "General prescriptions",
              ]}
              ctaLabel="Choose Starter"
              ctaHref="#contact-us"
            />
            <PricingCard
              name="Growth"
              usage="Up to 10,000 per month"
              price="Rs 8"
              model="Pay as you go"
              features={[
                "Everything in Starter",
                "Eye prescription templates",
                "Template-based advice",
              ]}
              ctaLabel="Choose Growth"
              ctaHref="#contact-us"
              highlighted
            />
            <PricingCard
              name="Scale"
              usage="Up to 50,000 per month"
              price="Rs 6"
              model="Pay as you go"
              features={[
                "Everything in Growth",
                "High-volume print workflow",
                "Priority onboarding support",
              ]}
              ctaLabel="Contact Sales"
              ctaHref="#contact-us"
            />
          </div>
        </div>
      </section>

      <section id="contact-us" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Contact Us
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Need onboarding help, setup support, or a walkthrough for your
                clinic team? Reach out and we will guide you.
              </p>
              <div className="mt-6 space-y-3">
                <a
                  href={`tel:${SUPPORT_PHONE.replaceAll(" ", "")}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                >
                  <div className="rounded-lg border border-slate-200 bg-white p-2">
                    <Phone className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{SUPPORT_PHONE}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                >
                  <div className="rounded-lg border border-slate-200 bg-white p-2">
                    <Mail className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{SUPPORT_EMAIL}</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Quick support
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Talk to us on WhatsApp
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                For fast responses, send us your clinic name and requirement on
                WhatsApp.
              </p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Ready to modernize your prescription workflow?
            </h2>
            <p className="max-w-2xl text-slate-300">
              Self sign-in is not available right now. Contact us and we will
              help you get started quickly.
            </p>
            <Link href="#contact-us">
              <Button size="lg" className="gap-2 bg-sky-600 text-white hover:bg-sky-700">
                Contact Us to Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">RxPad</span>
          </div>
          <p className="text-sm text-slate-400">
            Digital Prescription Manager for Clinics
          </p>
        </div>
      </footer>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}

function DarkPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function HeroList({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
      <p className="text-sm text-slate-200">{text}</p>
    </div>
  );
}

function ValueStrip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      {icon}
      <p className="text-sm text-slate-200">{text}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold tracking-wide text-sky-700">{step}</p>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  usage,
  price,
  model,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
}: {
  name: string;
  usage: string;
  price: string;
  model: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlighted
          ? "border-sky-200 bg-sky-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          highlighted ? "text-sky-700" : "text-slate-700"
        }`}
      >
        {name}
      </p>
      <p className="mt-4 text-sm text-slate-600">{usage}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{price}</p>
      <p className="mt-2 text-sm text-slate-600">{model}</p>
      <div className="mt-5 border-t border-slate-200/80 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Features
        </p>
        <ul className="mt-3 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={ctaHref}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          highlighted
            ? "bg-sky-600 text-white hover:bg-sky-700"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
