# How to Use Git Stash Like a Pro (Beyond `git stash` and `git stash pop`)

Most developers know exactly two git stash commands: `git stash` and `git stash pop`. And honestly, that covers maybe 60% of the situations where stashing is useful. But the other 40%? That's where things get interesting  and where knowing a few **advanced git stash** tricks can save you real time.

I used to treat stash like a single-slot save in a video game. Stash, do something, pop. But once I learned you can name stashes, apply them without removing them, stash only specific files, and even create branches from stashes  it became one of my most-used Git features.

Let me walk you through all of it.

## Quick Refresher: The Basics

For the uninitiated, `git stash` takes your uncommitted changes (both staged and unstaged) and saves them on a stack, reverting your working directory to the last commit.

```bash
git stash        # Save changes and clean working directory
git stash pop    # Apply the most recent stash and remove it from the stack
```

Simple enough. But the stash stack can hold multiple entries, and this is where most people's knowledge ends. Let's go deeper.

## Stash with a Message (Stop Guessing What's in There)

By default, stashes get auto-generated names like `stash@{0}: WIP on main: abc1234 Some commit message`. That's useless when you have five stashes and can't remember which one has your half-finished login form.

```bash
git stash push -m "WIP: login form validation"
```

Now when you list your stashes, you'll actually know what's in each one:

```bash
git stash list
# stash@{0}: On feature/auth: WIP: login form validation
# stash@{1}: On main: quick API fix for demo
# stash@{2}: On feature/auth: sidebar layout experiment
```

I do this every single time now. The 2 extra seconds to type a message saves minutes of guessing later.

## Stash Specific Files

Sometimes you only want to stash some of your changes, not everything. Maybe you've got some experimental code in one file and a clean fix in another  you want to commit the fix and stash the experiment.

```bash
# Stash only specific files
git stash push -m "experiment: new sidebar layout" src/components/Sidebar.tsx src/styles/sidebar.css
```

This stashes only the listed files and leaves everything else in your working directory untouched. Super useful when you're juggling multiple changes that shouldn't be in the same commit.

## Apply vs Pop: The Difference That Matters

Here's one that trips people up. Both `apply` and `pop` restore a stash  but they behave differently:

| Command | Applies stash? | Removes from stack? |
|---------|---------------|-------------------|
| `git stash pop` | Yes | Yes (on success) |
| `git stash apply` | Yes | No |

Why would you want `apply` instead of `pop`? Two reasons:

1. **You want to apply the same stash to multiple branches.** Maybe you've got a utility function stashed and you want it on both `feature/auth` and `feature/cart`. Apply it to one, switch branches, apply it to the other. Pop would delete it after the first use.

2. **Safety.** If applying a stash causes conflicts, `pop` won't actually remove it from the stack (it only removes on success). But with `apply`, you're explicitly in control  nothing gets deleted until you run `git stash drop`.

```bash
# Apply a specific stash without removing it
git stash apply stash@{2}

# Drop a specific stash when you're done with it
git stash drop stash@{2}

# Nuclear option: clear ALL stashes
git stash clear
```

> **Warning:** `git stash clear` deletes every stash with no undo. I've done this accidentally exactly once. That was enough.

## List and Inspect Stashes

When stashes pile up, you need to dig through them:

```bash
# List all stashes
git stash list

# Show what changed in the most recent stash
git stash show

# Show the full diff (not just file names)
git stash show -p

# Show a specific stash's diff
git stash show -p stash@{2}
```

The `-p` flag is what you want when you're trying to remember what a stash contains. Without it, you just get file names  with it, you get the actual changes.

## Create a Branch from a Stash

This is one of those features that, once you know about it, you'll wonder how you ever lived without. Say you stashed some work a few days ago, and now you realize it deserves its own feature branch:

```bash
git stash branch feature/sidebar-redesign stash@{1}
```

This creates a new branch from the commit where the stash was originally created, applies the stash, and drops it from the stack. All in one command.

It's particularly useful when your stash conflicts with the current branch. Instead of fighting through merge conflicts, just branch off from where the stash was made  where everything is guaranteed to apply cleanly.

## Partial Stash with `--patch`

This is the power-user move. `--patch` lets you interactively choose which hunks (chunks of changes) to stash, within individual files.

```bash
git stash push --patch
```

Git will walk you through each change hunk and ask:

```
Stash this hunk [y,n,q,a,d,/,s,e,?]?
```

The key options:

- `y`  stash this hunk
- `n`  skip this hunk
- `s`  split this hunk into smaller pieces
- `q`  quit (don't stash remaining hunks)

This is perfect when you've made two unrelated changes in the same file and want to stash one without the other. It's sort of like `git add --patch` but for stashing instead of staging.

I'll be honest  I don't use `--patch` every day. But when I need it, nothing else does the job. It's the kind of thing where you'll know the moment you need it.

## Stashing Untracked and Ignored Files

By default, `git stash` only saves tracked files. New files that haven't been added to Git yet don't get stashed. Which can be confusing when you stash, switch branches, and your new files are just... still there.

```bash
# Include untracked files
git stash push --include-untracked
# Or the shorthand
git stash push -u

# Include untracked AND ignored files (rare, but sometimes useful)
git stash push --all
```

I almost always use `-u` when stashing. Otherwise you end up with ghost files floating around that don't belong to any branch.

## Quick Reference: Every Stash Command You Need

| Command | What It Does |
|---------|-------------|
| `git stash` | Stash all tracked changes |
| `git stash push -m "msg"` | Stash with a descriptive message |
| `git stash push file1 file2` | Stash specific files only |
| `git stash push -u` | Include untracked files |
| `git stash push --patch` | Interactively choose hunks to stash |
| `git stash list` | Show all stashes |
| `git stash show -p` | View full diff of latest stash |
| `git stash apply` | Apply latest stash (keep on stack) |
| `git stash pop` | Apply latest stash (remove from stack) |
| `git stash apply stash@{N}` | Apply a specific stash |
| `git stash drop stash@{N}` | Delete a specific stash |
| `git stash branch <name>` | Create branch from stash |
| `git stash clear` | Delete all stashes (careful!) |

## When Stash Isn't the Right Tool

Stash is great for quick context switches  "hold my changes while I check out another branch." But it's not a replacement for branches or commits.

If you're stashing the same work repeatedly, or if a stash sits around for more than a day or two, it probably deserves a proper branch and a WIP commit. Stashes are easy to forget about, and they don't show up in `git log`  so they're effectively invisible to your team.

My rule of thumb: if it'll take more than a few hours to get back to the stashed work, commit it on a branch instead. Even a `wip: half-finished sidebar` commit is better than a stash that you'll forget about next week.

If you do end up in a situation where you've lost track of a stash or accidentally dropped one, the reflog might still have it. Check out our guide on [undoing git commits](/blog/undo-git-commit-every-scenario)  the reflog section applies to stashes too.

And for those workflow moments where you're bouncing between branches and need to convert config formats on the fly  say, turning environment variables into TypeScript types for a quick test  [SnipShift's env to types converter](https://snipshift.dev/env-to-types) handles that in seconds.

For more on keeping your Git workflow tight, our guides on [rebase vs merge](/blog/git-rebase-vs-merge) and [setting up Git hooks](/blog/git-hooks-husky-lint-staged) are worth a read.

Git stash is one of those tools that scales with your knowledge. The basics are fine. But once you're comfortable with named stashes, partial stashing, and stash branches, you'll find yourself reaching for it in situations you used to handle with awkward workarounds. Learn the commands, save yourself some headaches.
