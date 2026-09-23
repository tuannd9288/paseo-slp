---
version: '1'
owner: ''
applies_to: ''
last_reviewed: ''
communication_language: ''
routing_intent: ''
supervisor_notebook: ''
decided_by: ''
decided_at: ''
---

# Workspace Protocol

Lead reads this file before delegation. Supervisor reads it when assigned a
protocol audit. Lead passes only task-relevant constraints to the Peer.

This is a starting template of repository tactics. The Human's current assignment
controls authority. Complete unknown fields from repository evidence and the
assignment before the decision that depends on them; do not treat blanks as grants.
The defaults below can be adapted under the repository's policy mandate.

## Status and project characteristics

Owner, version, review date, scope, communication language, routing intent and
the Supervisor notebook live in the YAML frontmatter above — update it when
decisions change; the frontmatter is the single source for those fields.

- Criticality, dominant risks and expensive-to-reverse decisions: establish per repo.
- External effects and cost/model budget: use explicit assignment boundaries.
- `communication_language` applies to reports, assignments and handbacks between
  agents and to agent replies to the Human. Keep technical identifiers, file
  paths, commands and proper nouns verbatim.

## Decision boundaries

Lead selects methods, routes bounded work, reconciles technical decisions and accepts
project artifacts within the assignment. Human decides product/portfolio changes,
important owner-reserved architecture contracts, irreversible/cost trade-offs beyond
the grant and external effects. Edits, commits, pushes, deploys, host configuration
and other repositories each follow the applicable authority; profile permissions
do not supply it. Record additional repository-specific reserved decisions here.

## Task classes and gates

| Class | Starting topology and evidence gate |
|---|---|
| Tiny / bounded familiar | One Engineer, focused proof and Lead artifact inspection. Lead may implement tiny tightly coupled work if assignment allows. Independent review optional unless material risk appears. |
| Cross-module / lifecycle / migration / security | Read-only Architect investigates before implementation; one owner per write scope; independent Reviewer on stable candidate before Lead acceptance. |
| Foundation / costly architecture lock-in | Independent design lenses or sealed council with distinct mandates; Lead records decision/counterargument/reversal conditions; Engineer then independent review. Human decides owner-only trade-offs. |
| Large dependency in a different domain | Separate bounded lane or dependency Lead within authority; explicit contract, handback and integration owner. |

For council, default to two distinct lenses, at most one challenge/response round
per material proposition, then Lead reconciles. Add another lens only for an
unresolved decision-changing question worth the cost. These are repo defaults,
not universal role requirements. Escalate foundation uncertainty before tests pin
an undecided API or representation. In a new domain, establish enough Human framing
to locate owner boundaries before foundational implementation.

## Ownership and integration

Inspect existing changes and active writers. Record owned/excluded scopes and return
recipients. Concurrent writers require separate worktrees and non-overlapping scope
ownership; otherwise serialize handback. Review only paused, stable candidates.
Assign one integration writer, preserve unrelated changes and reverify the integrated
candidate. Do not infer filesystem isolation from workspace IDs.

### Shared heavy resources

Name each shared heavy resource and record one lock path shared by every
worktree and Lead that uses it. Choose an existing lock primitive or a small
local one with atomic exclusive acquisition and an ownership token. Record
the owning Lead ID and slice, an expiry or review time, a bounded wait timeout,
and the release and recovery procedure. The package specifies this contract,
not a queue service, daemon or universal database policy.

Each Lead acquires the lock before its own or its Peer's heavy run and releases
only its own lock after that run has stopped. An asynchronous launch or handback
does not release it. Expiry triggers verification, not takeover. Recover a stale
lock only after verifying the previous user has stopped and the lock still
belongs to that owner. Otherwise preserve the lock and report BLOCKED.

No Lead or Supervisor runs a queue for other Leads. A Lead that cannot acquire
the lock within the timeout reports one blocker to the Supervisor, which relays
it to the Human. Routine acquisition, release and acknowledgment traffic stays
out of the Supervisor's timeline.

## Routing and skills

`routing_intent` in the frontmatter is `pinned`, `inherit` or `empty`, plus who
decided and when — never restate option IDs there; the catalog file is the
source of truth. An absent repository catalog with recorded inherit intent is a
decision, not an accident; an absent catalog with pinned or no recorded intent
is incomplete onboarding.

Read slp-supervisor/slp-lead saved profiles for those roles. Peer delegation uses
this repository's .paseo-slp/slp-routing.json pool; when the repository has no
catalog, the user-scope pool ($PASEO_HOME/slp-routing.json, default ~/.paseo) is
the declared fallback. Onboarding populates
Human-approved provider/model/settings options and suitability descriptions; an
empty init catalog is a setup scaffold, not ready for Peer delegation, and remains
authoritative over the user-scope pool until removed.
Lead selects a ready Peer option for each task using suitableFor, avoidFor, notes,
priority and budget. Record the rationale, option ID/hash and actual launch bundle.
Validate against fresh provider discovery; do not inherit a saved slp-peer profile
or Lead settings. Inside one work item, apply the installed orchestration
session continuity policy: keep existing context for corrections and re-review;
establish a separate session when a new independent seat is required. No catalog in either scope or no
eligible runtime requires onboarding setup; a missing repository catalog falls
back to the user-scope pool, never to another repository's catalog.

Lead uses macro skills, Supervisor observation/governance skills, Peer task micro
skills. Configure Peer quotaFallback.enabled/optionIds in slp-routing.json; default
disabled, targets restricted to existing eligible pool options. Record allowed pool
maintenance, cost limits and
settlement boundaries. Provider changes for existing work require a new-session
handoff; an eligible pool option does not itself grant replacement authority.
Use paseo-slp-onboarding to update tactics and pool while preserving Human choices.

## Session lifetime

One executable tracked work item (issue) is one branch, one worktree and one
Lead; the Lead finishes its settlement and handback before its change merges,
and ends at the merge or when the item closes. The Supervisor's retrieval of
that handback is the merge gate. After the merge, the Supervisor reads back the
item's workspace and agents, and archives the workspace through the host archive
control whatever the host's archive-on-merge setting, as references/monitoring.md
(merged-workspace cleanup) requires. Engineers and Reviewers follow the same
boundary: inside the item the installed session continuity policy applies —
same Engineer for corrections, same Reviewer for re-review — and a new item gets
new sessions. The only exception is follow-up work on the same item and the same
PR. An item already in flight keeps its Lead until merge; the rule applies from
the next item. A parent, outcome or epic issue with no branch or worktree of its
own is not an executable item: it never gets a Lead to coordinate its child
slices, and each executable child slice gets its own Lead. A module-level Lead
may coordinate several changes only when the module itself is one bounded item
with its own branch, worktree, acceptance boundary and integration candidate.

A lane is the shared context of related slices, for example one module; its
lane card is read by each new slice Lead, so module knowledge survives without
a long-lived Lead.

Each lane keeps a lane card of at most two pages: machine rules, where frozen
measurement tools live, settled precedents and errors already hit. The outgoing
Lead updates the card before it ends; the incoming Lead reads it together with
the item instead of the old session's history. The card lives where it survives
post-merge workspace cleanup: by default `.paseo-slp/lanes/<lane>.md`,
committed with the item's change. A repository that does not version
`.paseo-slp/` records another location in this protocol.

## Monitoring and heartbeat

Use finish/error/permission notifications first. Lead reports material decisions,
reopen/dependency requests and significant risk changes to the assigned Supervisor.
For short bounded work with adequate events, default to no heartbeat. For long work
or incomplete event coverage, decide and record the observer, reporting route,
cron/timezone, expiry/run bound, evidence checkpoint and stop condition before
creating a fallback heartbeat. No universal cadence is prescribed; ownership,
receipts, bounded lifetime and settlement follow references/monitoring.md.
Record the creation/deletion receipts and retain pre-existing monitoring outside
the task.

## Proof and escalation

Identify established repo checks for each requested outcome; record exact commands
and the behavior they demonstrate in the assignment. Match evidence to the risk:
integration/failure/cancellation/migration checks or Human visual/playtest/product
evaluation where needed. Coverage and mock-only checks cannot define success.
Use a deterministic snapshot or exact commit with relevant working changes accounted
for; record external proof separately. Review and verdict bind to the same candidate.

Lead reconciles REOPEN_REQUEST (failed premise) and DEPENDENCY_REQUEST (another owner,
API or scope). BLOCKED identifies a missing decision/prerequisite/capability. After
repeated identical failures, inspect the shared mechanism and prerequisite changes
before retrying; any numeric retry threshold is a repository choice. Owner-only
decisions go through the assigned Supervisor or directly to Human. At handback,
record actual proof, unresolved findings and settlement of task-owned resources.

## Repo anti-patterns and evolution

`supervisor_notebook` in the frontmatter records `.paseo-slp/notebook.md`
(scaffolded by init) or `timeline:<agentId>` with a retrieval note the Human can
follow; onboarding records the choice and its owner there. A separate file write
needs scope just like other writes. Handback preserves notes if durable
retrieval is unavailable and reports the gap.

For each observed repo-specific pattern, record signal, evidence/counterevidence,
suspected mechanism, impact, open question, allowed response and outcome. Begin
without invented repo patterns; use the installed generic catalog when relevant.
Distill repeated failures into tactics, keep authority changes with Human, and record
version, review date, causal evidence, counterargument and reversal conditions.
Review after recurring failures or material architecture change, and check whether
new rules improve evidence or merely add ceremony. Preserve change history.
