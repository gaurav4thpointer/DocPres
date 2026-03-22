import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, BookOpen } from "lucide-react";
import { blogPosts } from "@/lib/blog/posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog | RxPad",
  description:
    "Practical ideas on digital prescriptions, clinic workflows, medicine libraries, and print-ready documentation.",
};

const sortedPosts = [...blogPosts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 lg:max-w-6xl">
      <div className="mb-12 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
          <BookOpen className="h-3.5 w-3.5" />
          RxPad journal
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Notes on OPD efficiency, structured prescribing, and building habits that
          hold up on busy clinic days.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2">
        {sortedPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block h-full">
              <Card className="h-full border-slate-200 bg-white transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                    <span className="text-slate-400"> · </span>
                    {post.readMinutes} min read
                  </p>
                  <CardTitle className="text-lg leading-snug text-slate-900 group-hover:text-sky-700">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-slate-600">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-700">
                    Read article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
