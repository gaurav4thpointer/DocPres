import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_LINK = "https://wa.me/918800865479";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6 lg:max-w-6xl">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">RxPad</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              Blog
            </Link>
            <Link
              href="/#contact-us"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Contact
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700">
                WhatsApp
              </Button>
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:max-w-6xl">
          <div className="flex items-center gap-2 text-slate-600">
            <Stethoscope className="h-4 w-4" />
            <span className="text-sm font-medium">RxPad</span>
          </div>
          <p className="text-center text-sm text-slate-500 sm:text-right">
            Insights for modern prescription and clinic workflows.
          </p>
        </div>
      </footer>
    </div>
  );
}
