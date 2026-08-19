# MeeTheDoc development team

This directory defines the multi-agent development team for this repository. Its purpose
is to make all future development **structured, reviewed, tested, and safe**.

| Agent | Model | Role |
|---|---|---|
| `engineering-manager` | Opus | Coordinator and technical lead. Entry point for all work. Never writes application code. |
| `implementer` | Sonnet | Focused engineer. Implements one scoped task at a time against acceptance criteria. |
| `reviewer` | Sonnet | Independent, read-only code reviewer. Approves or requires changes. |
| `test-writer` | Sonnet | Test engineer. Covers acceptance criteria, runs the suite, reports results honestly. |

## Required workflow

```
request
  → engineering-manager: understand → inspect code → break into tasks → acceptance criteria
      → implementer   (implement one task)
      → reviewer      (approve / changes required) ──┐
      ↑                                              │ issues go back to implementer
      └──────────────────────────────────────────────┘
      → test-writer   (write + run tests) ── failures go back to implementer/test-writer
  → complete only when: criteria met + review approved + relevant tests pass
```

Trivial edits keep the process lightweight — one task, brief criteria, a quick review
pass, a targeted test run — but review and validation are never skipped entirely.
Anything touching authentication, authorization, external APIs, database access, or
personal/health information always gets full review and explicit failure-case tests.

## How to use it

Address feature requests to the engineering manager:

```
> Use the engineering-manager agent to add <feature>.
```

The manager handles the delegation to `implementer`, `reviewer`, and `test-writer`
itself; you do not need to invoke those directly.
