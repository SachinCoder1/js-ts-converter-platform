---
title: "The .editorconfig File: Why Every Project Needs One"
description: "Learn what .editorconfig does, its syntax, common settings for tabs vs spaces, and how it keeps formatting consistent across editors and teams."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["editorconfig", "developer-tools", "formatting", "workflow"]
keyword: "editorconfig file"
difficulty: "beginner"
readTime: "4 min read"
tool: "/env-to-types"
---

# The .editorconfig File: Why Every Project Needs One

You open a pull request. The diff is 400 lines  but 380 of them are whitespace changes. Someone's editor auto-converted tabs to spaces (or the other way around), and now the entire file shows as modified. The actual code change? Two lines.

I've seen this happen more times than I can count. It's annoying, it wastes review time, and it's entirely preventable with a single file: `.editorconfig`.

## What EditorConfig Actually Does

An **editorconfig file** is a simple config file that defines basic formatting rules  indentation style, indent size, line endings, character encoding, trailing whitespace. It sits in your project root, and editors that support it (which is basically all of them) automatically apply those settings when you open a file from that project.

The key point: it works **across editors**. VS Code, IntelliJ, Vim, Sublime, Emacs, Atom (rest in peace)  they all read `.editorconfig`. So it doesn't matter that half your team uses VS Code and the other half uses Neovim. Everyone gets the same formatting behavior without touching their personal editor settings.

No plugin wars. No "but my editor defaults to tabs." The `.editorconfig` file is the single source of truth.

## The Syntax (It's Dead Simple)

Here's a starter `.editorconfig` that works for most JavaScript/TypeScript projects:

```ini
# Top-most EditorConfig file
root = true

# Default settings for all files
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# Markdown files - trailing whitespace is significant
[*.md]
trim_trailing_whitespace = false

# Makefiles require tabs
[Makefile]
indent_style = tab

# YAML files
[*.{yml,yaml}]
indent_size = 2

# Python files (if you have any)
[*.py]
indent_size = 4
```

The `root = true` line at the top tells the editor to stop looking for `.editorconfig` files in parent directories. Without it, EditorConfig will walk up the directory tree and merge settings from any `.editorconfig` files it finds  which is sometimes useful in monorepos, but usually you just want one file at the root.

### Section Headers

The bracket syntax is glob-based:

| Pattern | Matches |
|---------|---------|
| `[*]` | All files |
| `[*.js]` | All JavaScript files |
| `[*.{ts,tsx}]` | TypeScript and TSX files |
| `[Makefile]` | Only the file named Makefile |
| `[lib/**.js]` | JS files in the lib directory (recursive) |
| `[{package.json,.travis.yml}]` | Specific named files |

Settings in more specific sections override the defaults from `[*]`.

## The Properties You'll Actually Use

Here's a quick reference of the most common properties:

| Property | Values | What It Controls |
|----------|--------|-----------------|
| `indent_style` | `space` or `tab` | Whether indentation uses spaces or tabs |
| `indent_size` | Number (e.g., `2`, `4`) | How many spaces per indent level |
| `tab_width` | Number | Visual width of tab character (defaults to `indent_size`) |
| `end_of_line` | `lf`, `cr`, `crlf` | Line ending style |
| `charset` | `utf-8`, `latin1`, etc. | File encoding |
| `trim_trailing_whitespace` | `true` or `false` | Remove trailing spaces on save |
| `insert_final_newline` | `true` or `false` | Ensure file ends with a newline |

That's really the whole spec. EditorConfig is intentionally minimal  it handles the low-level formatting stuff that causes noise in diffs, and leaves the opinionated code formatting to tools like Prettier and ESLint.

## Tabs vs Spaces: Just Pick One

I'm not going to wade into the tabs vs spaces debate here  that war has been raging since before I started coding and it'll outlast us all. But I will say this: **it doesn't matter which one you pick, as long as the entire project uses the same one.**

The JavaScript/TypeScript ecosystem has largely settled on 2 spaces. Python uses 4 spaces. Go uses tabs. Whatever your language's convention is, put it in `.editorconfig` and move on with your life.

The important thing is that the setting lives in the project, not in individual developer configs. When a new person joins the team, they don't need to configure anything. They open the project, and their editor just does the right thing.

## EditorConfig vs Prettier: Do I Need Both?

Short answer: yes, and they complement each other.

**EditorConfig** handles the basics  indentation, line endings, trailing whitespace. It works at the editor level, in real time, as you type.

**Prettier** handles code formatting  semicolons, quotes, line wrapping, bracket spacing. It runs as a build step or pre-commit hook.

There's some overlap (both can handle indentation), but they serve different purposes. EditorConfig prevents formatting drift as you type. Prettier enforces a consistent code style after the fact. Together, they mean your team virtually never has formatting-related diff noise.

If you've got [Husky and lint-staged set up](/blog/git-hooks-husky-lint-staged), Prettier runs automatically on every commit. EditorConfig makes sure the files are reasonably formatted even before that hook fires.

> **Tip:** Make sure your Prettier config and `.editorconfig` agree on basics like indent size. If `.editorconfig` says 2 spaces and Prettier says 4, you'll get annoying back-and-forth reformatting. Prettier actually reads `.editorconfig` by default, so as long as you don't override the setting in `.prettierrc`, they'll stay in sync.

## Editor Support

Most modern editors support EditorConfig natively or with a lightweight plugin:

| Editor | Support |
|--------|---------|
| VS Code | Built-in (via EditorConfig extension  one click install) |
| IntelliJ / WebStorm | Built-in |
| Vim / Neovim | Plugin: `editorconfig-vim` |
| Sublime Text | Plugin: `EditorConfig` |
| Emacs | Plugin: `editorconfig-emacs` |
| GitHub | Reads `.editorconfig` for web editor |

If an editor doesn't support it, the file is just ignored  it doesn't break anything. So there's literally zero downside to adding one.

## Setting It Up (30 Seconds)

1. Create a `.editorconfig` file in your project root
2. Paste in the starter config from above
3. Adjust the settings to match your project's conventions
4. Commit it

That's it. No npm install, no configuration tool, no build step. Just a file.

If you're also setting up your project's [.gitignore](/blog/gitignore-explained), these two files go hand-in-hand  `.editorconfig` keeps formatting clean, `.gitignore` keeps the repo clean.

And when you're working with environment files that need type-safe access in your code, [SnipShift's env to types converter](https://snipshift.dev/env-to-types) can generate TypeScript interfaces or Zod schemas from your `.env` files  one less thing to maintain manually.

An `.editorconfig` file is one of those tiny additions that prevents a whole category of team friction. No more whitespace-only diffs. No more "please fix your indentation" PR comments. No more fighting about tabs vs spaces. Just add the file, and let it quietly do its job. Every project needs one  and now you know how to set it up.
