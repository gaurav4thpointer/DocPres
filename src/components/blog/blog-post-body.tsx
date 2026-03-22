import type { BlogBlock } from "@/lib/blog/posts";

export function BlogPostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="max-w-none text-slate-600">
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2
              key={i}
              id={slugify(block.text)}
              className="scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900 first:mt-0 mt-10"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p key={i} className="mt-4 leading-relaxed first:mt-0">
              {block.text}
            </p>
          );
        }
        return (
          <ul key={i} className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
