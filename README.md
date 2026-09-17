# Agent Contract

Shareable **human↔agent agreement card**: roles, success criteria, stop conditions.

Name both parties, write the goal, list what done looks like and what must not happen, optionally stamp a scope and a session/expiry. Print a dark CONTRACT card. Built for posting on X and dropping next to a skill.

**Write the bound. Print the card. Share the agreement — not a legal instrument, not enforcement.**

[![MIT License](https://img.shields.io/badge/license-MIT-00D4FF?labelColor=0A0F1F)](LICENSE)

SMF Works viral kit:

1. **[Paste → Skill](https://github.com/smfworks/paste-to-skill)** ([demo](https://paste-to-skill.vercel.app)) — what to run
2. **[Skill Lint](https://github.com/smfworks/skill-lint)** — grade / fix
3. **Agent Contract (this)** — roles, success, stop
4. **[Tool Permit](https://github.com/smfworks/tool-permit)** — **GO / ALLOWLIST**
5. **[Refuse Card](https://github.com/smfworks/refuse-card)** — **NO / HOLD** twin
6. **[Agent Receipt](https://github.com/smfworks/agent-receipt)** ([demo](https://agent-receipt-green.vercel.app)) — what happened

## Why a contract card?

Agent work fails when the human and the agent do not share a bound: who decides, what done looks like, and where to stop. A card is small enough to screenshot and specific enough to argue with — PR review vs research brief vs ship-a-fix vs inbox drafts.

It is a **lab artifact for communication**. It is **not a legal contract**, **not legal advice**, and **not an enforcement runtime**. Pair it with a real sandbox, a Tool Permit, a Refuse Card, and a human. Judgment stays human.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build
npm run preview
npm test
```

Node 20+ (22 recommended). Client-side only — no auth, no backend, no API keys, no secrets.

## Use it

1. Pick **PR review**, **Research brief**, **Ship a fix**, or **Inbox drafts**, or write your own title.
2. Name the **human** and the **agent**. Write the **goal**.
3. Add **success criteria** bullets and **stop / must not** bullets. Optional **scope** and **session / date** expiry.
4. **Download PNG**, **Copy share text**, or **Copy JSON**. **Reset** clears the compositor.

Other tools can emit the JSON schema below and skip the builder.

## Samples

Shipped in [`public/samples/`](public/samples/):

| File | Bound |
| --- | --- |
| `pr-review.json` | Comments only. Session. Human merges. |
| `research-brief.json` | Survey + one-pager. Dated. No outbound, no writes. |
| `ship-a-fix.json` | Repro → test → PR. Session. No deploy. |
| `inbox-drafts.json` | Drafts in the composer. Dated. Human sends. |

Load one in the app with `?sample=pr-review`.

## Input / output schema

Canonical JSON Schema: [`public/schema/agent-contract.schema.json`](public/schema/agent-contract.schema.json)

Minimal agreement:

```json
{
  "title": "PR review session",
  "human": "Staff engineer",
  "agent": "Review bot",
  "goal": "Leave review comments. Human decides merge.",
  "success": ["Every changed file has a comment or an explicit LGTM"],
  "stop": ["Do not merge, push, or approve as the human"]
}
```

Printed output (what the card represents):

| Field | Notes |
| --- | --- |
| `schema` | `smf.agent-contract.v1` |
| `id` | `AC-xxxx` serial |
| `title` | Short name for the agreement |
| `human` | Who owns judgment |
| `agent` | Who does the work |
| `goal` | What this session is for |
| `success` | Done-when bullets |
| `stop` | Hard stops / must-not |
| `scope` | Optional one-liner bound |
| `expiry` | `{ "kind": "session" }` or `{ "kind": "date", "date": "YYYY-MM-DD" }` |
| `issuedAt` | ISO-8601 UTC |
| `heuristic` | Always `true` — this is a demo printer |

Aliases accepted on ingest: `name` / `operator` / `issuedFor` / `objective` / `successCriteria` / `mustNot` / `parties.human` / `parties.agent`.

## Host a demo

Static files from `npm run build` (output: `dist/`).

Or Docker:

```bash
docker build -t agent-contract .
docker run --rm -p 8080:80 agent-contract
```

Then open [http://localhost:8080](http://localhost:8080).

## Stack

Vite + React + TypeScript. Contract serialization is client-side (no model, no keys). PNG export via `html-to-image`. Fonts: Inter, Space Grotesk, JetBrains Mono. Palette: navy `#0A0F1F`, cyan `#00D4FF`, GO green `#34D399`.

## Built by SMF Works

[SMF Works](https://smfworks.com) is a human-AI research lab. We publish what we learn, ship open agent tools, and install stacks on hardware you own.

Intelligence is abundant. Judgment is the product.

- Lab: [smfworks.com](https://smfworks.com)
- GitHub: [github.com/smfworks](https://github.com/smfworks)
- X: [@MichaelGannotti](https://x.com/MichaelGannotti)
- Twin: [Tool Permit](https://github.com/smfworks/tool-permit) — GO / ALLOWLIST
- Twin: [Refuse Card](https://github.com/smfworks/refuse-card) — NO / HOLD
- Sister: [Agent Receipt](https://github.com/smfworks/agent-receipt) — what happened

MIT licensed. **Not a legal contract. Not legal advice. Not an enforcement runtime.** This is a shareable agreement card, not an audit, not a sandbox, and not a hosted agent.

## License

[MIT](LICENSE) © 2026 SMF Works
