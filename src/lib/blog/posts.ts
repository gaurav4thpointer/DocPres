export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readMinutes: number;
  blocks: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "digital-prescription-records-busy-opd",
    title: "Why digital prescription records matter for busy OPDs",
    excerpt:
      "Paper slips get lost, handwriting varies, and peak-hour clinics need the same facts in seconds. Here is how structured digital records help without slowing you down.",
    publishedAt: "2025-02-10",
    readMinutes: 6,
    blocks: [
      {
        type: "p",
        text: "Outpatient departments live in bursts. Ten quiet minutes can turn into a queue at the door, and in that mode every extra step on a computer feels expensive. Yet the cost of unstructured notes, missing follow-up context, and illegible instructions is paid later—in callbacks, repeated questions, and avoidable confusion for patients and staff.",
      },
      {
        type: "h2",
        text: "Continuity beats starting from zero each visit",
      },
      {
        type: "p",
        text: "When a patient returns for the same complaint or a related one, the fastest consult is one where allergies, chronic medicines, and recent prescriptions are already in one place. Digital records do not replace clinical judgment; they reduce the time spent reconstructing history from memory or shuffling through files.",
      },
      {
        type: "ul",
        items: [
          "Prior visits and medicines become searchable instead of buried in folders.",
          "Teams can align on the same record instead of relying on verbal handoffs.",
          "Printing a clean Rx stays consistent even when the day is hectic.",
        ],
      },
      {
        type: "h2",
        text: "Design for the peak hour, not the ideal hour",
      },
      {
        type: "p",
        text: "The best clinic software respects muscle memory: short paths to find a patient, pick medicines from a curated list, and generate a legible prescription. If the workflow only feels good on a slow Sunday, it will fail on a packed Monday. Aim for defaults, templates, and repeatable steps that stay fast under load.",
      },
      {
        type: "p",
        text: "Digital prescription tools work when they match how doctors already think: patient first, then diagnosis-oriented notes, then clear instructions the patient can follow. Anything that adds friction without clear clinical or administrative benefit will get abandoned at the keyboard.",
      },
    ],
  },
  {
    slug: "clinic-medicine-library-saves-time",
    title: "Building a clinic medicine library that actually saves time",
    excerpt:
      "A shared medicine list is more than a spreadsheet. Learn how to curate strengths, forms, and common instructions so prescribing stays accurate and fast.",
    publishedAt: "2025-02-18",
    readMinutes: 7,
    blocks: [
      {
        type: "p",
        text: "Most prescribing delay is not typing speed—it is decision support in miniature. Doctors mentally narrow options, recall strengths, and phrase instructions in ways patients understand. A clinic-level medicine library captures those decisions once and reuses them hundreds of times.",
      },
      {
        type: "h2",
        text: "Start with what you prescribe every week",
      },
      {
        type: "p",
        text: "Seed your library from the top twenty medicines in your OPD. Include the exact formulations you prefer (tablet vs syrup, brand or generic where it matters to you), and typical duration language you already use. Expand gradually; an enormous list full of duplicates slows everyone down.",
      },
      {
        type: "ul",
        items: [
          "Merge duplicate entries when the same drug appears under different names.",
          "Standardize units and spacing so printed Rx looks professional.",
          "Review quarterly: drop obsolete lines, add new first-line choices.",
        ],
      },
      {
        type: "h2",
        text: "Pair medicines with advice templates",
      },
      {
        type: "p",
        text: "Reusable advice blocks—hydration reminders, follow-up timing, when to seek urgent care—reduce repetitive writing while keeping nuance where you need it. Templates should be short, editable per patient, and written in plain language patients can act on.",
      },
      {
        type: "p",
        text: "The goal is not to automate clinical thinking but to remove clerical repetition. When the library reflects your real practice, new doctors and locums onboard faster, and senior clinicians spend less time correcting inconsistent instructions.",
      },
    ],
  },
  {
    slug: "eye-prescriptions-structured-templates",
    title: "Eye prescriptions and structured templates: what to capture",
    excerpt:
      "Ophthalmology and optometry notes span refraction, pressures, and anatomical findings. Structured fields keep exams comparable visit to visit and print clearly for patients.",
    publishedAt: "2025-03-02",
    readMinutes: 8,
    blocks: [
      {
        type: "p",
        text: "Eye-specific consultations generate dense data: visual acuity, refraction, intraocular pressure, slit-lamp highlights, and a plan that may include glasses, drops, or procedures. Free text alone often buries the one number a patient cares about most, or the follow-up interval that staff must schedule.",
      },
      {
        type: "h2",
        text: "Separate measurement from interpretation",
      },
      {
        type: "p",
        text: "Structured templates shine when objective findings sit in predictable places. That does not mean removing clinical narrative—it means anchoring it. A pressure reading beside the date of measurement is easier to track than the same figure lost in a paragraph.",
      },
      {
        type: "ul",
        items: [
          "Vision and refraction: note distance and near, with units consistent every time.",
          "Pressure and method: specify how the reading was taken when it affects comparison.",
          "Plan: link instructions to measurable goals (symptom relief, pressure target, return criteria).",
        ],
      },
      {
        type: "h2",
        text: "Patients take home the printout",
      },
      {
        type: "p",
        text: "The prescription or visit summary is often the only artifact a patient keeps. When key numbers and plans appear in a clean layout, compliance and return visits improve. Structured eye templates help reception and optical partners too—they can see what was ordered without deciphering shorthand.",
      },
      {
        type: "p",
        text: "Whether you use general or specialty workflows, the principle holds: capture once, reuse intelligently, and keep the printed page legible. Your future self—and the patient returning next month—will thank you.",
      },
    ],
  },
  {
    slug: "print-ready-rx-branding-clarity",
    title: "Print-ready prescriptions: branding, clarity, and patient trust",
    excerpt:
      "A prescription is a legal and clinical document and a piece of your clinic’s reputation. Small layout choices improve readability and confidence.",
    publishedAt: "2025-03-12",
    readMinutes: 5,
    blocks: [
      {
        type: "p",
        text: "Patients judge quality partly by what they can read. Crowded margins, tiny fonts, and ambiguous abbreviations undermine trust even when the medical content is correct. Print-ready systems treat the page as part of the care experience, not an afterthought.",
      },
      {
        type: "h2",
        text: "Hierarchy guides the eye",
      },
      {
        type: "p",
        text: "Lead with patient identifiers and date, then medicines in a consistent order: name, strength, dose frequency, duration. Advice and follow-up should stand apart so pharmacists and families can scan quickly. White space is not wasted space; it prevents dangerous misreads.",
      },
      {
        type: "h2",
        text: "Branding should support, not overwhelm",
      },
      {
        type: "ul",
        items: [
          "Logo and clinic address should be clear but leave room for the Rx block.",
          "Signature and stamp areas should align with local regulatory expectations.",
          "Use the same template for general and specialty visits where possible for familiarity.",
        ],
      },
      {
        type: "p",
        text: "When doctors print from the same system every time, staff spend less time reformatting PDFs and patients receive a predictable document they can file or photograph. Consistency is a subtle signal of professionalism.",
      },
    ],
  },
  {
    slug: "reducing-documentation-fatigue",
    title: "Reducing documentation fatigue without cutting corners",
    excerpt:
      "Burnout from clerical work is common. Here is a practical balance: keep medicolegally sound notes while stripping redundant typing from each consult.",
    publishedAt: "2025-03-20",
    readMinutes: 6,
    blocks: [
      {
        type: "p",
        text: "Documentation exists to support continuity, communication, and accountability. Fatigue sets in when clinicians retype the same phrases, hunt for old files, or maintain parallel systems that never stay in sync. The fix is not shorter notes for their own sake—it is removing duplication while preserving what matters.",
      },
      {
        type: "h2",
        text: "Automate repetition, not thinking",
      },
      {
        type: "p",
        text: "Templates for common advice, normal exam phrasing where appropriate, and a personal medicine library all reduce keystrokes. What should remain manual is the unique part of the encounter: the specific history, the reasoning for this plan, and the warnings tailored to the patient in front of you.",
      },
      {
        type: "ul",
        items: [
          "Use defaults for stable chronic regimens; edit only what changed today.",
          "Link follow-up instructions to symptoms that should trigger earlier review.",
          "Batch admin work when possible so clinical time stays focused on patients.",
        ],
      },
      {
        type: "h2",
        text: "Measure what slows you down",
      },
      {
        type: "p",
        text: "For one week, notice where delays cluster: finding patients, adding medicines, or printing. Those bottlenecks deserve tooling first. Small workflow wins compound across hundreds of consultations a month.",
      },
      {
        type: "p",
        text: "Platforms built for OPD reality—fast search, structured specialty fields, and reliable print—turn documentation from a nightly burden into something that mostly finishes before the patient leaves the room.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
