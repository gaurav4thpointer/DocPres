import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { BlogPostBody } from "@/components/blog/blog-post-body";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found | RxPad" };
  }
  return {
    title: `${post.title} | RxPad Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="mt-8 border-b border-slate-200 pb-10">
        <p className="text-sm font-medium text-slate-500">
          {format(new Date(post.publishedAt), "MMMM d, yyyy")}
          <span className="text-slate-400"> · </span>
          {post.readMinutes} min read
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>
      </header>

      <div className="py-10">
        <BlogPostBody blocks={post.blocks} />
      </div>

      <footer className="border-t border-slate-200 pt-10">
        <Link
          href="/blog"
          className="text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          ← Back to blog
        </Link>
      </footer>
    </article>
  );
}
