# BLOGS.md  SnipShift Blog Generation System

## READ THIS FIRST

You are writing blog posts for SnipShift.dev, a platform with 20+ free developer converter tools. Your job is to write blog posts that:
1. Rank on Google for specific keywords
2. Sound like a real human developer wrote them (NOT like AI)
3. Drive traffic back to SnipShift tools
4. Actually teach something useful

Every blog post must follow the rules in this document. No exceptions.

**MANDATORY**: the blog post length.. must be respected.. if it's 2000 words then it should be more than 2000 words.. not less. you need to count it with some wordcounter script or something... but we need to make sure it is more than that..


---

## THE VOICE  How to Sound Human

This is the most important section. Google's helpful content update and AI content policies penalize generic AI writing. Every post must feel like it was written by a senior developer who blogs on the side  opinionated, casual where appropriate, technically precise, and genuinely helpful.

### Voice Rules

**DO write like this:**
- "I've been writing TypeScript for about 6 years now, and the one thing that still trips up most teams I work with is..."
- "Look, I know this sounds obvious, but bear with me."
- "Here's the thing nobody tells you about Zod schemas..."
- "If you've ever stared at a 500-line JavaScript file wondering where to even start with TypeScript migration, yeah, same."
- "This is one of those problems that's way easier than it looks once you know the trick."
- Start some sentences with "And" or "But"  real humans do this
- Use contractions: "don't", "it's", "you'll", "we're"  always
- Occasionally use dashes for asides  like this  instead of parentheses
- Reference real frustrations: "the 3am production bug", "that PR review that never ends"

**DO NOT write like this:**
- "In today's rapidly evolving landscape of modern web development..." (AI slop opener)
- "Let's dive in!" or "Without further ado" (dead giveaway phrases)
- "In this comprehensive guide, we will explore..." (robotic)
- "It's worth noting that..." or "It's important to understand that..." (filler)
- "In conclusion," or "To summarize," (formulaic)
- "Harness the power of" or "Leverage the potential of" (corporate AI speak)
- "Straightforward" or "Delve" or "Tapestry" or "Landscape" (known AI vocabulary flags)
- Perfect parallel sentence structures throughout  vary your rhythm
- Every paragraph being exactly the same length  mix short and long
- Lists where every item starts with the same grammatical pattern

### Sentence Rhythm

Real humans write with varied rhythm. Mix:
- Short punchy sentences. Like this.
- Medium sentences that make a clear point without dragging on.
- Longer sentences that take the reader on a bit of a journey, connecting multiple ideas together with natural flow  the kind you'd write if you were explaining something to a colleague over coffee and didn't want to stop mid-thought.

Never write 5 paragraphs in a row that are all the same length. Never write 5 sentences in a row that all start with "The" or "This" or "It". Vary your openings.

### Opinions & Personality

Every post should have at least one opinion. Real developers have opinions. Examples:
- "Honestly, I think PropTypes were always a stopgap. TypeScript does everything PropTypes did, but better."
- "I know some people swear by Joi for validation, but Zod has won me over completely."
- "Hot take: if your team is still debating whether to adopt TypeScript in 2026, the debate is already over."
- "I'm not going to pretend GraphQL is always the right choice. Sometimes REST is just simpler."

These opinions don't need to be controversial  just genuine. A blog post with zero opinions reads like a textbook.

### Imperfections (Intentional)

Sprinkle in VERY subtle humanisms:
- Occasionally start a sentence with "And" or "So" or "But"
- Use "kind of" or "sort of" once or twice per post
- Use an em dash  like this  instead of always using commas
- Refer to personal experience: "In my last project...", "A team I worked with..."
- Admit uncertainty occasionally: "I'm not 100% sure this is the best approach, but it's worked well for me"
- Use "you" directly  talk TO the reader, not AT them

DO NOT overdo these. One or two per section is enough. The goal is natural, not sloppy.

---

## BLOG POST STRUCTURE

Every blog post follows this structure, but the exact sections vary per topic. This is a template, not a straitjacket.

### 1. Title (H1)
- Include the primary keyword naturally
- Keep under 60 characters if possible (Google truncates longer titles)
- Use a number, "how to", or a specific promise when appropriate
- Examples:
  - "How to Convert JavaScript to TypeScript (Without Losing Your Mind)"
  - "JSON to Zod: Generate Validation Schemas in Seconds"
  - "5 Things I Wish I Knew Before Migrating from PropTypes to TypeScript"

### 2. Meta Description
- 150-160 characters
- Include primary keyword
- Include a call to action or value proposition
- Written as a complete thought, not a fragment

### 3. Frontmatter (YAML)
Every blog .md file starts with:
```yaml
---
title: "The Blog Title Here"
description: "150-160 char meta description with keyword"
date: "YYYY-MM-DD"
author: "SnipShift Team"
tags: ["typescript", "javascript", "migration"]
keyword: "primary target keyword"
difficulty: "beginner" | "intermediate" | "advanced"
readTime: "X min read"
tool: "/js-to-ts"  # link to the relevant SnipShift tool
---
```

### 4. Opening (First 2-3 paragraphs)
- Hook the reader immediately  a relatable problem, a surprising fact, or a direct question
- Do NOT start with "In today's world..." or any variant
- Get to the point within 3 paragraphs. Developers have zero patience for fluffy intros.
- Mention what the reader will learn/gain by the end

**Good opener example:**
```
You just inherited a 40,000-line JavaScript codebase. Your tech lead wants it in TypeScript by Q3. And the original developer? Left the company six months ago.

If that sounds familiar, you're not alone. TypeScript migration is one of those tasks that sounds simple in a sprint planning meeting and turns into a multi-quarter odyssey in practice.

I've done this migration three times now  twice at startups, once at a mid-size company  and I've learned a few things the hard way. Here's the approach that actually works.
```

### 5. Body Content
- Use H2 for major sections, H3 for subsections
- Include code examples  real, runnable code, not pseudocode
- Code blocks should be properly fenced with language identifiers: ```typescript, ```javascript, ```json, etc.
- Every code example should have a brief explanation before it (what it does) and optionally after it (why it matters)
- Break up long sections with subheadings  no wall of text longer than 4-5 paragraphs without a break
- Use bold for key terms or important points  but sparingly, not every other sentence
- Include at least one table or comparison somewhere in the post where it makes sense
- Include at least one Mermaid diagram or visual where it adds value (architecture flow, conversion pipeline, decision tree)

### 6. Tool CTA (Natural, Not Salesy)
- Once or twice per post, naturally mention the relevant SnipShift tool
- Frame it as a solution to the problem being discussed, NOT as an advertisement
- Include as a natural part of the explanation, not a separate "advertisement" section

**Good CTA example:**
```
If you want to try this conversion without setting up a local toolchain, 
[SnipShift's JS to TypeScript converter](https://snipshift.dev/js-to-ts) 
does exactly this  paste your JS on the left, get typed TS on the right. 
It uses AI to generate proper interfaces instead of just slapping `any` everywhere.
```

**Bad CTA example:**
```
## Try SnipShift Today!
SnipShift is the best JS to TS converter on the market! 
Click here to try it now! It's free and amazing!
```

The good version teaches, then offers a tool. The bad version sells. Always teach first.

### 7. Closing (Final 1-2 paragraphs)
- Summarize the key takeaway in 1-2 sentences
- Don't use "In conclusion"  just naturally wrap up
- Optional: suggest what to learn/do next
- Optional: ask a question to encourage engagement

### 8. Internal Links (SEO Critical)
Every blog post must link to:
- The relevant SnipShift tool (1-2 links)
- 2-3 other related blog posts (if they exist)  "If you're also converting your CSS to Tailwind, check out our guide on [CSS to Tailwind migration strategies](/blog/css-to-tailwind-migration)."
- 1 link back to the homepage or tools hub

These links should be contextual  woven into sentences, not dumped in a "Related Posts" block at the bottom (though you can have that too).

---

## SEO REQUIREMENTS

### Keyword Placement
- Primary keyword in: title, meta description, first 100 words, at least one H2, URL slug
- Use the primary keyword 3-5 times naturally throughout the post (NOT keyword stuffing)
- Use 3-5 secondary/related keywords sprinkled naturally
- Use semantic variations: "convert JS to TS" / "JavaScript to TypeScript migration" / "type your JavaScript code"

### URL Slug
- Short, keyword-rich, lowercase, hyphenated
- Example: `/blog/convert-javascript-to-typescript-guide`
- NOT: `/blog/the-complete-comprehensive-guide-to-converting-your-javascript-code-to-typescript-in-2025`

### Image Alt Text
If the post references any images, diagrams, or screenshots:
- Alt text must describe the image AND include a keyword naturally
- Example: `alt="Side-by-side comparison of JavaScript code converted to TypeScript with proper interfaces"`

### Content Length
- Tutorial/Guide posts: 1,500-2,500 words
- Comparison posts: 1,200-2,000 words
- Quick tip posts: 800-1,200 words
- Pillar/comprehensive posts: 2,500-4,000 words

Longer is NOT always better. A focused 1,200-word post that answers a specific question will outrank a 5,000-word rambling guide. Quality > quantity.

---

## VISUAL ELEMENTS

### Code Blocks
- ALWAYS include real, working code examples
- Use syntax highlighting (language identifier in fence)
- Show before/after when demonstrating conversions
- Keep individual code blocks under 30 lines  break longer examples into multiple blocks with explanation between them
- Add comments inside code that explain WHY, not just WHAT

### Mermaid Diagrams
Use Mermaid diagrams for:
- Conversion pipelines: "JS → AST → Type Inference → AI Enhancement → TypeScript"
- Decision trees: "Should you use interface or type?"
- Architecture diagrams: "How the conversion works under the hood"
- Comparison flows: "PropTypes vs TypeScript typing approach"

Example:
```mermaid
graph LR
    A[JavaScript Code] --> B[Babel Parser]
    B --> C[AST Analysis]
    C --> D{Complex types?}
    D -->|Yes| E[AI Type Inference]
    D -->|No| F[Rule-based Conversion]
    E --> G[TypeScript Output]
    F --> G
```

Include at least one Mermaid diagram per post where it adds clarity. Don't force one where it doesn't make sense.

### Tables
Use markdown tables for:
- Feature comparisons (Zod vs Yup vs Joi)
- Type mappings (JavaScript type → TypeScript equivalent)
- Tool comparisons
- Quick reference charts

Example:
```markdown
| JavaScript Value | TypeScript Type | Zod Schema |
|-----------------|-----------------|-------------|
| `"hello"` | `string` | `z.string()` |
| `42` | `number` | `z.number()` |
| `true` | `boolean` | `z.boolean()` |
| `[1, 2, 3]` | `number[]` | `z.array(z.number())` |
| `null` | `null` | `z.null()` |
```

### Callout Boxes
Use blockquotes for tips, warnings, and notes:
```markdown
> **Tip:** If you're migrating a large codebase, start with your utility files first. 
> They tend to have the simplest type signatures and give you quick wins.

> **Warning:** Don't blindly trust AI-generated types in production. 
> Always review the output, especially for complex generic types.
```

---

## POST-GENERATION CHECKLIST

After writing each blog post, verify:

```
VOICE
[ ] Does the opening hook the reader in the first sentence?
[ ] Are there zero instances of "dive in", "landscape", "leverage", "harness", "delve"?
[ ] Does it sound like a human wrote it? Read it out loud  does it sound natural?
[ ] Are there opinions or personal takes (not just neutral facts)?
[ ] Is sentence length varied (short, medium, long mixed throughout)?
[ ] Are contractions used consistently (don't, it's, you'll)?

SEO
[ ] Primary keyword in title, meta description, first 100 words, one H2, URL slug?
[ ] 3-5 natural uses of primary keyword throughout?
[ ] 3-5 secondary keywords included?
[ ] Internal links: tool link + 2-3 related blog links + homepage?
[ ] Meta description is 150-160 characters?
[ ] URL slug is short and keyword-rich?

CONTENT
[ ] At least 2 real code examples with proper syntax highlighting?
[ ] At least 1 Mermaid diagram or table?
[ ] Code examples are correct and runnable?
[ ] Post length matches category target?
[ ] Tool CTA is natural, not salesy?
[ ] Closing wraps up without "In conclusion"?

FORMATTING
[ ] Frontmatter YAML is complete and valid?
[ ] H2s and H3s create a logical hierarchy?
[ ] No wall of text longer than 5 paragraphs without a subheading?
[ ] Callout boxes used for tips/warnings?
[ ] Bold used sparingly for emphasis?
```

---

## HOW TO USE THIS FILE

When generating a blog post, Claude Code will receive:
1. This BLOGS.md file (read it first, always)
2. A title or topic
3. Optionally: target keyword, target length, and any specific points to cover

**Workflow:**
1. Read this entire BLOGS.md
2. Receive the blog topic/title from the user
3. Determine which category it falls into
4. Write the blog post following all rules above
5. Save as `/blog/[slug].md` with proper frontmatter
6. Run through the post-generation checklist mentally before outputting

**Output format:** A complete .md file with YAML frontmatter, ready to be consumed by any static site generator (Astro, Next.js, Hugo, etc.).

---

## FINAL REMINDER

The single most important thing: **would a real developer share this post with their team?**

If the answer is no  if it reads like SEO filler, if it teaches nothing new, if it sounds like ChatGPT wrote it  rewrite it. Every post should make the reader think "this person actually knows what they're talking about." That's the bar.