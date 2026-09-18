# Upstream origin

This repository is a fork of:

- Repository: `https://github.com/duongvm57/paseo-slp`
- Baseline commit: `a75c4dbb51ad1f0ef9c7a96bc6fa8e496dc411c3`
- Baseline date: 2026-09-16 (published; first commit 2026-09-08)
- Forked and read: 2026-09-17

The author shared it freely with the Cú Đêm AI community. The repository carries
no license file, so that permission travels as a statement rather than a term
attached to the code. Recorded on the Human's word, 2026-09-17; personal use.

Upstream remains `upstream`; this fork owns what it adds from here forward.

## What this fork adds

- **A Claude provider family.** `bin/claude-role.mjs`, `claudeRoleArgs` and
  `injectClaudeRole`. Upstream ships `codex`, `pi` and a generic ACP adapter
  restricted to Devin `swe-2` models, and mentions Claude once, in a test.
- **Optional per-role tool menus.** `src/tools.mjs`. Absent declaration writes no
  key, so an installation stays byte-identical to upstream until someone turns it on.

Two facts about Claude that no document stated and that cost an experiment each:
the CLI keeps only the **last** `--append-system-prompt` and refuses that flag
beside `--append-system-prompt-file`; and under the Agent SDK the prompt does not
travel on argv at all, arriving in the stdin `initialize` control request as
`request.appendSystemPrompt`. An argv-only wrapper delivers no role in protocol mode.

## Where this line of work came from

This fork replaced `agent-room`, a component developed in
`tuannd9288/oh-my-kit` between 2026-09-10 and 2026-09-18 and retired when this
package proved further along. Its complete state, its maintenance records, its
council directory and an export of all fifteen of its issues live on the
[`archived/agent-room`](https://github.com/tuannd9288/oh-my-kit/tree/archived/agent-room)
branch. Its `plugins/agent-room/UPSTREAM.md` holds the long-form research
summarised below.

That component derived from `hoangnb24/codex-room-setup` at `a38c5cea`, itself
shared with the group without a license file.

## The source model, and where implementations narrow it

Demonthorn's SLP, extracted from eight source images on 2026-09-17 and preserved
on the archived branch:

- The source **rejects** `Supervisor > Lead > Peer` as a ranking. Supervisor is
  broad by space and concern, Lead deep by room ownership and acceptance, Peer
  deep by task-local engineering judgment. It calls this a distributed authority graph.
- Specialisation sits at the **governance** layer too: Architecture, Product-intent,
  Safety, Delivery and Cross-workspace Supervisors, many-to-many with workspaces.
- A Supervisor may intervene **directly in a Peer** when routing through the Lead
  is too slow, and must then notify the Lead durably enough to restore its account
  of intent, ownership, topology, the decision that reached the Peer, and the
  consequences for integration and acceptance. Without that return path the two
  direct work from incompatible accounts of the same room.
- The source does not define a room-opening procedure, does not require a
  Supervisor in every room, and does not make architecture exclusive to Supervisor.

Both this package and the retired component narrow the same way: one Supervisor,
addressed before its Peers, with direct intervention behind an explicit Human
mandate. `src/references/governance.md` states "Human may also speak directly with
Lead", which matches the source.

## Operating lessons worth keeping

From upstream's own trace diagnoses of live runs on 2026-09-12, recorded in
`docs/duplicate-peer-diagnosis.md` and `docs/lead-progress-diagnosis.md`:

- An aborted `create_agent` **may still have created the child**. An empty
  `list_agents` is not proof that the request had no side effect. Reserve the scope
  until the original operation resolves; two Peers holding one write scope is the
  failure this prevents.
- A grouped summary of interventions is not a causal account. Read the native
  timeline before concluding that a coordinator's nudge caused what followed.

From the retired component, measured rather than assumed:

- One admission-and-relay exercise cost nine Human approvals across five tools;
  a later assignment reached twenty-four Paseo tool calls. Every new tool a Lead
  touches stops the room until a Human answers, and no role may answer for them.
- A tool count derived from one extraction pattern was asserted twice and was
  wrong both times. Compare tool names and effects against the live host, never
  against a list compiled into a package.
