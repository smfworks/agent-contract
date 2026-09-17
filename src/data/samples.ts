import type { SampleMeta } from "../types.ts";

export const SAMPLES: SampleMeta[] = [
  {
    id: "pr-review",
    file: "/samples/pr-review.json",
    label: "PR review",
    blurb: "Comments only · session",
    draft: {
      title: "PR review session",
      human: "Staff engineer",
      agent: "Review bot",
      goal: "Leave review comments on the open pull request. Human decides merge.",
      success: [
        "Every changed file has a comment or an explicit LGTM",
        "Blockers called out with file and line",
        "A summary of risk is posted on the PR",
      ],
      stop: [
        "Do not merge, push, or approve as the human",
        "Do not change CI secrets or deploy config",
        "Do not rewrite git history",
      ],
      scope: "This pull request only. No other repos.",
      expiryKind: "session",
      expiryDate: "",
    },
  },
  {
    id: "research-brief",
    file: "/samples/research-brief.json",
    label: "Research brief",
    blurb: "Survey + one-pager · dated",
    draft: {
      title: "Literature pass",
      human: "Lab lead",
      agent: "Literature scout",
      goal: "Survey the repo and related papers. Deliver a one-page brief with open questions.",
      success: [
        "Sources cited with links or paths",
        "Open questions listed, not answered by invention",
        "Brief is a local draft — no public post",
      ],
      stop: [
        "Do not send email or post publicly",
        "Do not write the working tree",
        "Do not claim legal or medical conclusions",
      ],
      scope: "Read-only survey of this repo and public papers.",
      expiryKind: "date",
      expiryDate: "2026-12-31",
    },
  },
  {
    id: "ship-a-fix",
    file: "/samples/ship-a-fix.json",
    label: "Ship a fix",
    blurb: "Repro → PR · session",
    draft: {
      title: "Ship the failing test",
      human: "Maintainer",
      agent: "Ship crew",
      goal: "Reproduce the bug, write a failing test, fix it, and open a PR.",
      success: [
        "Failing test exists, then turns green",
        "Change is scoped to the bug",
        "PR opened against main with a short summary",
      ],
      stop: [
        "Do not deploy or touch production",
        "Do not force-push or rewrite published history",
        "Money, payments, and public posts stay human",
      ],
      scope: "This repository. Tests and a pull request only.",
      expiryKind: "session",
      expiryDate: "",
    },
  },
  {
    id: "inbox-drafts",
    file: "/samples/inbox-drafts.json",
    label: "Inbox drafts",
    blurb: "Drafts only · dated",
    draft: {
      title: "Inbox triage drafts",
      human: "Operator",
      agent: "Draft clerk",
      goal: "Draft replies for flagged threads. Human sends.",
      success: [
        "Each flagged thread has a draft in the composer",
        "Tone matches the thread; facts are sourced",
        "Nothing is sent without a human click",
      ],
      stop: [
        "Never send mail",
        "Never share credentials or paste secrets",
        "Do not add new recipients the human did not name",
      ],
      scope: "Flagged threads in this inbox only.",
      expiryKind: "date",
      expiryDate: "2026-10-01",
    },
  },
];
