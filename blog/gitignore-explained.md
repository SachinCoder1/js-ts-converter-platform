---
title: ".gitignore Explained: What to Ignore (And What Not To)"
description: "Master .gitignore syntax, common patterns for node_modules and .env, global gitignore, negation rules, and debugging with git check-ignore."
date: "2026-03-25"
author: "SnipShift Team"
tags: ["git", "gitignore", "devops", "version-control"]
keyword: "gitignore explained"
difficulty: "beginner"
readTime: "6 min read"
tool: "/env-to-types"
---

# .gitignore Explained: What to Ignore (And What Not To)

I once reviewed a pull request that added 300MB of `node_modules` to the repository. The developer was new to the team and genuinely didn't know `.gitignore` was a thing. No judgment  we've all been there. But that PR became a running joke for months.

The thing is, `.gitignore` seems dead simple until it doesn't work the way you expect. Then you're Googling "why isn't gitignore ignoring my file" and falling into a rabbit hole of caching issues, negation syntax, and order-of-precedence rules.

Let me save you that trip. Here's **.gitignore explained**  the syntax, the common patterns, the gotchas, and how to debug when things go sideways.

## The Basics: How .gitignore Works

A `.gitignore` file tells Git which files and directories to skip when tracking changes. Put it in the root of your repository, and Git reads it every time you stage files.

```bash
# This is a comment
node_modules/
.env
dist/
```

That's the simplest form. Each line is a pattern. Lines starting with `#` are comments. Blank lines are ignored. That's pretty much the whole syntax  except for the dozen edge cases that'll trip you up.

### Pattern Matching Rules

Here's a quick reference:

| Pattern | What It Matches |
|---------|----------------|
| `file.txt` | Any file named `file.txt` in any directory |
| `/file.txt` | Only `file.txt` in the repo root |
| `dir/` | Any directory named `dir` and everything inside |
| `*.log` | Any file ending in `.log` |
| `**/*.log` | Any `.log` file in any subdirectory |
| `!important.log` | **Don't** ignore `important.log` (negation) |
| `build/*/temp` | `temp` inside any direct subdirectory of `build/` |

A few rules that catch people off guard:

**Trailing slash matters.** `dist` matches both files and directories named "dist." `dist/` matches only directories. Always use the trailing slash for directories  it's more intentional and avoids accidental matches.

**Patterns are relative to the `.gitignore` location.** A pattern like `src/*.js` in a root `.gitignore` matches `src/app.js` but not `src/utils/helper.js`. Use `src/**/*.js` if you want to match all nested files too.

**Order matters for negation.** If you ignore everything and then try to un-ignore a specific file, the order of lines determines the result. More on this in the negation section.

## The Starter .gitignore Every Project Needs

Here's what I drop into virtually every JavaScript/TypeScript project:

```bash
# Dependencies
node_modules/

# Build output
dist/
build/
.next/
out/

# Environment variables (NEVER commit secrets)
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# Editor directories
.idea/
.vscode/
*.swp
*.swo

# Debug and logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test coverage
coverage/

# TypeScript cache
*.tsbuildinfo
```

Let me walk through the reasoning:

**`node_modules/`**  This is non-negotiable. Your dependencies are defined in `package.json` and locked in `package-lock.json`. Anyone can recreate `node_modules/` with `npm install`. Committing it bloats the repo, slows clones, and creates insane merge conflicts.

**`dist/` and `build/`**  Build artifacts are derived from source code. They're reproducible and have no place in version control. Same goes for `.next/` if you're using Next.js.

**`.env` and variants**  This is the big one. Your `.env` files often contain database passwords, API keys, and other secrets. Committing them is a security incident waiting to happen. The one exception is `.env.example`  commit that as documentation for your team. Check our guide on [managing multiple env files](/blog/manage-multiple-env-files) for the full setup.

**`.DS_Store`**  macOS creates these hidden files in every directory you open in Finder. They contain folder view preferences and have zero business in a git repo. Every Mac developer has accidentally committed one.

**`.idea/` and `.vscode/`**  Editor-specific config. Some teams choose to commit `.vscode/settings.json` for shared formatting settings, which is reasonable. But `.idea/` (JetBrains) usually contains personal workspace data and shouldn't be committed.

> **Tip:** If you're setting up a TypeScript project with ESLint and Prettier, you'll want to commit the config files but ignore the cache files. See our [ESLint and Prettier setup guide](/blog/eslint-prettier-typescript-setup) for which files to commit and which to ignore.

## Global .gitignore  Ignore Files Across All Repos

Some files are always irrelevant regardless of the project  `.DS_Store`, `Thumbs.db`, editor swap files. Instead of adding them to every project's `.gitignore`, set up a **global gitignore**:

```bash
# Create the global gitignore file
touch ~/.gitignore_global

# Tell Git to use it
git config --global core.excludesfile ~/.gitignore_global
```

Then add your personal ignores:

```bash
# ~/.gitignore_global

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Editors
*.swp
*.swo
*~
.idea/
.vscode/

# Environment
.env.local
.env.*.local
```

Now these patterns apply to every repo on your machine without polluting each project's `.gitignore`. Your project-level `.gitignore` stays focused on project-specific ignores  `node_modules/`, `dist/`, `coverage/`, etc.

I think this is kind of an underrated Git feature. Every developer should set up a global gitignore on day one of a new machine.

## Negation: Un-Ignoring Files

Sometimes you want to ignore a directory but keep specific files inside it. That's where the `!` prefix comes in:

```bash
# Ignore all of build/
build/

# But keep the build script
!build/generate.sh
```

**But here's the catch that gets everyone:** you can't negate a file inside an ignored directory. This **does not work**:

```bash
# This WON'T work as expected
vendor/
!vendor/important-lib/readme.md
```

Git never looks inside `vendor/` because the directory itself is ignored. To work around this, you need to un-ignore the parent directory first:

```bash
# This works
vendor/*
!vendor/important-lib/
vendor/important-lib/*
!vendor/important-lib/readme.md
```

Yeah, it's ugly. The key insight is using `vendor/*` (ignore everything *inside* vendor) instead of `vendor/` (ignore the directory itself). The wildcard version lets Git still "see" the directory, which means negation rules can work on its contents.

## What NOT to Ignore

Some files people instinctively ignore that they actually should commit:

**`package-lock.json` (or `yarn.lock` or `pnpm-lock.yaml`)**  I see developers add this to `.gitignore` way too often. Your lockfile ensures reproducible installs. Without it, `npm install` might give different dependency versions on different machines. Always commit your lockfile.

**`.env.example`**  A template showing what environment variables your app needs. New developers clone the repo, copy `.env.example` to `.env.local`, fill in their values, and they're running. Commit it.

**Configuration files**  `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `tailwind.config.ts`  these are part of your project. Commit them.

**Docker files**  `Dockerfile`, `docker-compose.yml`, `.dockerignore`  these define how your app runs. Commit them.

## Debugging: Why Isn't My File Being Ignored?

This is the #1 `.gitignore` frustration. You add a pattern, but Git still tracks the file. There are two common causes:

### The File Is Already Tracked

If you committed a file before adding it to `.gitignore`, Git continues tracking it. The `.gitignore` only prevents *new* files from being tracked. Fix it by removing the file from Git's index:

```bash
# Remove from Git tracking (keeps the local file)
git rm --cached path/to/file

# For directories
git rm -r --cached path/to/directory

# Then commit
git commit -m "Remove tracked file that should be ignored"
```

A common case: you accidentally committed `.env`, added it to `.gitignore`, but Git still shows changes. Run `git rm --cached .env` to fix it.

### The Pattern Doesn't Match What You Think

Use `git check-ignore` to debug:

```bash
# Check if a specific file is ignored (and by which rule)
git check-ignore -v src/config/.env.local

# Output: .gitignore:5:.env.*.local    src/config/.env.local
# Tells you: file, line number, pattern, matched path

# Check multiple files
git check-ignore -v .DS_Store node_modules/ dist/

# Check why a file is NOT being ignored
git check-ignore -v --no-index src/app.js
# No output = not ignored by any rule
```

The `-v` flag is crucial  it shows you *which rule* in *which file* is matching. Without it, you're guessing.

### .gitignore Files Can Exist in Subdirectories

Git checks `.gitignore` files at every directory level. A `.gitignore` in `src/` only applies to `src/` and its children. The root `.gitignore` applies everywhere. If you've got conflicting rules, the more specific (deeper) `.gitignore` wins.

```
project/
├── .gitignore          # Root-level rules
├── src/
│   ├── .gitignore      # Rules for src/ only
│   └── generated/
│       └── .gitignore  # Rules for generated/ only
```

Most projects only need the root `.gitignore`. Subdirectory `.gitignore` files make sense in monorepos or when a specific directory has unique ignore needs.

## Quick Reference: Copy-Paste Patterns

For a standard Node.js/TypeScript project:

```bash
node_modules/
dist/
build/
coverage/
.env
.env.local
.env.*.local
.DS_Store
*.tsbuildinfo
.next/
```

For Python:

```bash
__pycache__/
*.pyc
.venv/
*.egg-info/
dist/
.env
```

For Go:

```bash
/bin/
*.exe
.env
vendor/  # if using go modules, you don't need vendor/
```

GitHub also maintains a [collection of `.gitignore` templates](https://github.com/github/gitignore) for almost every language and framework. Worth bookmarking.

Getting your `.gitignore` right is one of those "10 minutes now saves 10 hours later" tasks. Set it up at the start of your project, add the global gitignore on your machine, and you'll almost never think about it again. When something does go wrong, `git check-ignore -v` is your best friend.

And if you're working with environment variables across different environments  local, staging, production  make sure you check out our guide on [managing multiple .env files](/blog/manage-multiple-env-files). Because ignoring `.env` in git is only half the battle; the other half is making sure the right values end up in the right place. For automating your entire workflow, our [GitHub Actions tutorial](/blog/github-actions-first-workflow) covers how CI/CD and secrets fit into the picture.

Want to convert between config file formats while setting up your project? [SnipShift's tools](https://snipshift.dev) handle JSON, YAML, and TypeScript conversions  handy when you're wrangling multiple config files.
