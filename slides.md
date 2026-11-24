---
theme: default
title: Technical Credit Background Agent — Sprint 1 Progress
info: CS6510 Sprint 1 progress, technical approach, task board, blockers, and next steps.
author: Xiaoyu and Yezhen
class: cover
aspectRatio: 16/9
canvasWidth: 980
transition: fade
fonts:
  sans: Segoe UI
  mono: Consolas
  provider: none
---

<div class="eyebrow">CS6510 / Sprint 1 progress / 23 November 2026</div>

# Technical Credit<br><span class="teal">Background Agent</span>

<p class="cover-sub">Automatic analysis for the existing VS Code extension</p>

<p class="cover-meta">Xiaoyu Zhou and Yezhen Chen</p>

<!--
Good afternoon. We are building the Background Agent for the Technical Credit VS Code extension. Today I will show what is implemented, how the scheduler prevents duplicate work, where the Sprint 1 board stands, and what we need for a complete interactive product. Our current agent deliberately uses a mock detector, so the progress we show does not depend on a Claude API key.
-->

---

<div class="eyebrow">01 / Original aim</div>

# Technical Credit while editing

<p class="lede">A Java developer should receive timely TC suggestions without repeatedly running a manual command.</p>

<div class="rule-list">
  <div><b>Observe</b><span>React to supported Java file activity.</span></div>
  <div><b>Schedule</b><span>Keep editing responsive and avoid duplicate detector calls.</span></div>
  <div><b>Reuse</b><span>Restore results for unchanged content after a restart.</span></div>
</div>

<p class="bottom-note">Final product: shared detector and existing Preview / Accept / Dismiss UI. Sprint 1: the background foundation with a mock detector.</p>

<!--
The original aim is to make TC analysis part of normal editing. The existing extension already offers an explicit Analyse for TC command. Our work adds an automatic path for Java files. We want it to be responsive, because analysis takes time, and economical, because each real detector run may make several API calls. Sprint 1 delivered the background foundation: event capture, scheduling, deduplication, and persistent caching with a mock detector. Reusing the real detector and the existing annotation UI is planned for Sprint 2.
-->

---

<div class="eyebrow">02 / Investigated system</div>

# One extension, two entry points

<div class="lane"><span class="lane-label">Manual today</span><span>Cursor + command</span><i>→</i><span>Current detector</span><i>→</i><span>Preview / Accept / Dismiss</span></div>
<div class="lane green"><span class="lane-label">Background now</span><span>Java events</span><i>→</i><span>Scheduler + cache</span><i>→</i><span>Mock detector + log</span></div>

<div class="two-col slim">
  <div><h2>Current boundary</h2><p>The manual workflow connects cursor selection, Claude calls, ADR matching, and annotation preview.</p></div>
  <div><h2>Integration work</h2><p>Decouple the detector and presentation UI so both entry points can reuse them.</p></div>
</div>

<p class="source-line">Source: TechnicalCredit repository, <code>src/analyse.ts</code>, <code>src/background/</code>, and BA-13/14/17.</p>

<!--
We inspected the existing extension before designing our path. The current manual workflow selects a construct from the cursor, calls Claude, checks ADRs, and opens the annotation preview as one connected flow. Our background path observes file events, checks the cache, and runs a mock detector. To reuse the existing detector and annotation UI, we need to decouple both from that manual workflow: the detector should accept explicit input without an active editor, and the presentation layer should accept validated results from either entry point. Sprint 2 will make those changes and send current background findings into the same Preview, Accept, and Dismiss interface.
-->

---

<div class="eyebrow">03 / Verification approach</div>

# How we verify the agent

<div class="progress-line"><strong>Offline tests</strong><span>Drive file events, cache lookups, and active / pending transitions with controlled detector responses.</span></div>
<div class="progress-line"><strong>F5 smoke test</strong><span>Open and edit Java in the Extension Development Host; inspect state changes while the editor stays responsive.</span></div>
<div class="progress-line"><strong>Build checks</strong><span>Type-check, lint, and bundle before demonstrating the extension.</span></div>

<div class="evidence"><b>Acceptance rule</b><span>Use automated assertions for timing and call counts; use F5 to check visible behavior.</span></div>

<p class="bottom-note">The demo later shows the current implementation and the evidence collected from these checks.</p>

<!--
We use three checks because each catches a different kind of problem. Offline tests drive Java events and controlled detector responses, then assert cache hits, active and pending state, and which file version a result belongs to. In F5, we open a Java file in the Extension Development Host, edit and save it, and inspect the Background output while confirming that editing remains responsive. Finally, TypeScript, lint, and bundle checks catch integration mistakes before the demo. Timing boundaries and exact call counts belong in automated tests with a fake clock; the F5 check tells us whether the extension behaves visibly as expected.
-->

---

<div class="eyebrow">04 / Technical approach</div>

# Active, pending, and the current file

<div class="timeline">
  <div><em>1</em><b>A starts</b><span>A is active; the detector analyzes snapshot A.</span></div>
  <div><em>2</em><b>File becomes C</b><span>C replaces any older pending snapshot.</span></div>
  <div><em>3</em><b>A finishes</b><span>Store A under A's hash; mark it stale for display.</span></div>
  <div><em>4</em><b>Recheck C</b><span>Use cache if valid; otherwise schedule C.</span></div>
</div>

<p class="bottom-note">A result can be useful in cache while still being ineligible to display on a newer file version.</p>

<!--
Here is the important scheduling case. Analysis starts on content A. While it runs, the developer edits the same file to C. We do not start a second request immediately. The scheduler holds only the latest snapshot as pending. When A finishes successfully, it stores the result under A's hash, then checks whether A is still current. It is not, so the result is not eligible for display. The scheduler rechecks C against the cache before starting another request. This already gives per-file in-flight deduplication. The final UI will also recheck at delivery and click time.
-->

---

<div class="eyebrow">05 / Sprint 1 development order</div>

# Scheduler first, timing rules next

<div class="progress-line"><strong>Foundation</strong><span>BA-02–04 and BA-10: events, mock detector, persistent cache, and detector contract.</span></div>
<div class="progress-line"><strong>BA-08 first</strong><span>One scheduler owns cache checks, detector calls, and per-file active / pending state.</span></div>
<div class="progress-line"><strong>BA-05 → 07</strong><span>Add coalescing, debounce, then cooldown inside that scheduler.</span></div>
<div class="progress-line"><strong>BA-09 last</strong><span>Verify the integrated mock flow with a fake clock and present it in the status tab.</span></div>

<p class="bottom-note">For a cache miss, the earliest start is the later of the latest edit + debounce and last completion + cooldown.</p>

<!--
We deliberately developed these cards out of number order. After the file monitor, mock detector, cache, and detector contract, we implemented BA-08 first. That gave one scheduler ownership of the cache check, detector call, and each file's active and latest pending snapshot. We then added BA-05 event coalescing, BA-06 debounce, and BA-07 cooldown inside that same scheduler. BA-09 came last to test the integrated behavior with a fake clock and expose it through a read-only status tab. For a cache miss, the scheduler waits until both per-file deadlines are satisfied: the quiet period after the latest edit and the cooldown after the last completion. This order kept the request lifecycle in one place while we added timing rules.
-->

---

<div class="eyebrow">06 / Agile board snapshot</div>

# All ten Sprint 1 cards are Done

<div class="board-counts"><div><b>10</b><span>Done</span></div><div><b>0</b><span>In progress / review</span></div><div><b>0</b><span>Sprint 1 To Do</span></div><div><b>14</b><span>Backlog</span></div><div><b>2</b><span>Blockers / decisions</span></div></div>

<div class="board-detail"><b>Sprint 1 complete</b><span>BA-01–10 are Done, including BA-09's functional tests and demonstration task.</span></div>

<p class="source-line">Board snapshot: 23 Nov 2026 · <a href="https://trello.com/b/5c1ZvcoP/technicalcredit-task-board-sprint-1">TechnicalCredit task board</a></p>

<!--
I checked the board again on November 23. All ten Sprint 1 cards, BA-01 through BA-10, are now in Done. No card is in Sprint 1 To Do, In Progress, or Under Review. The fourteen Backlog cards cover Sprint 2 Background Agent integration and the optional one-hop import stretch goal. We use BA for Background Agent and MFTC for multi-file context, with one continuous numbering sequence.
-->

---

<div class="eyebrow">07 / Demonstration and acceptance</div>

# Sprint 1 demonstration

<div class="two-col">
  <div><h2>Visible workflow</h2><p>Open Java in the Extension Development Host. Show mock calls, cache outcomes, and active / pending transitions in the read-only Background Status tab.</p></div>
  <div><h2>Automated verification</h2><p>Offline tests use a fake clock and detector to check Auto Save, debounce, cooldown, and active / pending deduplication.</p><p>Separate tests check restart cache reuse and status-page updates.</p></div>
</div>

<p class="bottom-note">The status tab shows metadata only. The functional test asserts 0 → 1 → 1 → 2 → 2 calls.</p>

<!--
Preparation: use the BA-09 branch or a later integration branch. Run npm ci, open it in VS Code, and press F5. Open a Java workspace in the Extension Development Host. Do not run the manual Analyse for TC command; it uses the live Claude detector.

Before the demo, say: “This is the Sprint 1 mock detector, not real TC advice. Analyses counts mock detector calls started this session. Follow-ups counts calls started for pending work after a previous request settles; it is part of Analyses. Repeats ignored counts same-content reports that need no new call. It is independent of cache hits: a new file can generate open and activate events with identical content. Cache hits and misses tell us whether the current content and detector version have a reusable result. Results stored counts successful cache writes. Running is the active snapshot; Waiting is the latest pending snapshot; Waiting for shows quiet time, cooldown, or the active request. Latest result says current or stale and analysed or cached. The v number is the document version; the short hash identifies content. Counters reset after restart, while cache entries persist.”

Visible workflow: 1. Run Technical Credit: Show Background Status from the command palette; explain that the read-only tab opens beside the editor and does not trigger analysis. 2. Create SprintDemo.java in the workspace with a public class and a count field; explain that the scheduler receives a snapshot and waits for a quiet period. 3. Stop typing; point to Waiting, Running, Analyses, and Latest result as they update; explain that the mock finding is test data and does not insert an annotation. 4. Change count from 1 to 2 and save, then undo to 1 and save; point to Waiting, Cache hits, and unchanged Analyses after the quiet period; explain reuse of an already analysed version. If Running and Waiting overlap, point them out; the automated test covers that case if the short mock window is missed. 5. Run the status command again to show that it reveals the same tab.

Automated verification (describe without running a command): Offline functional tests use a fake clock and fake detector to verify Auto Save, debounce, cooldown, and active/pending deduplication without waiting for real timers or calling Claude. The 0 -> 1 -> 1 -> 2 -> 2 call sequence checks that repeated edits wait for quiet time, changes during an active call or cooldown do not start extra calls, and only the latest eligible pending snapshot starts a follow-up. A separate restart test checks that unchanged content hits persistent cache with zero new-session detector calls. Status-page tests check displayed counters, file states, and updates.
-->

---

<div class="eyebrow">08 / Completion path</div>

# Sprint 2 connects detection to the UI

<div class="roadmap-row"><b>BA-12–14</b><span>Enumerate each top-level Java class, interface, and enum; extract the existing detector from the manual command; run it in background.</span></div>
<div class="roadmap-row"><b>BA-15–16</b><span>Require explicit live enablement, bound API calls, and decide how stale cached results are retained.</span></div>
<div class="roadmap-row"><b>BA-17–18</b><span>Deliver current and cached findings to the existing Preview / Accept / Dismiss UI; test the full workflow.</span></div>

<p class="bottom-note">BA-11 adds detector-version reanalysis for open files. The manual command continues to bypass background scheduling and cache.</p>

<!--
Completing the interactive product requires more than replacing the mock detector. First, Tree-sitter must enumerate all top-level constructs in a file because the background job has no cursor. We then separate the existing detection logic from the manual command's editor and UI code. The background adapter uses that same core. Before live automatic calls, we need explicit enablement and call limits, plus a cache policy for stale results. Finally, fresh and cached findings reach the existing CodeLens preview and Accept or Dismiss interaction, with another current-version check. BA-18 tests the complete flow and protects the original manual workflow.
-->

---

<div class="eyebrow">09 / Stretch goal</div>

# One hop of import context

<div class="import-example"><div><b>A.java</b><span>Analysis target and annotation location</span></div><i>imports</i><div><b>B.java</b><span>Direct workspace dependency, used as context</span></div></div>

<p class="lede smaller">MFTC-19–24: resolve explicit imports, bound dependency context, include dependency hashes in cache identity, reschedule A when B changes, suppress stale results, and test the full path.</p>

<p class="bottom-note">Scope stops after direct imports. No recursive dependency graph, external library resolution, or annotation in B.</p>

<!--
Our selected stretch goal is one hop of import context. If A imports B, we analyze A while supplying a bounded structural summary of B. Findings still belong to A. Tree-sitter can parse each Java file, but our code must build the workspace index and resolve imports. A result's identity then includes A's content, the selected dependency hashes, and the detector version. If B changes, we enqueue a new analysis for each open A that depends on it, using A's own debounce and cooldown. MFTC-19 through 24 cover that work. We are keeping the boundary narrow so it remains a stretch goal rather than a whole-codebase architecture analyzer.
-->

---

<div class="eyebrow">10 / Blockers and decisions</div>

# Two items need a decision or access

<div class="blocker"><b>Claude API credential</b><span>A professor-provided credential and bounded live-call permission are needed for the final real-detector smoke test. Offline development and fake-client tests can continue.</span></div>
<div class="blocker"><b>Stale-result cache policy</b><span>One entry per file can let an old successful result replace a newer cached version. Choose whether to skip stale writes or retain a small bounded history before paid calls.</span></div>

<p class="bottom-note">If live access is unavailable by the demo, show the verified mock workflow and report the real-call check as pending.</p>

<!--
The board has two blocker or decision cards. The first is access to Claude for a small real-call smoke test. Without it, we can still implement and test the integration with an injected fake client, but we cannot claim that a real response was verified. The second is our cache policy. Because the current cache keeps one entry per file and detector version, storing stale A can evict a useful cached C. That causes avoidable requests when the file returns to C. The decision is to skip storing stale results or keep a bounded history. We need it before broad paid use and before MFTC's dependency-aware cache. If either item remains unresolved at the final demo, we will state the limitation and show the offline evidence.
-->

---

<div class="eyebrow">11 / Next steps</div>

# Connect the completed mock slice

<div class="step"><b>1</b><span>Present Sprint 1's mock workflow and automated acceptance evidence.</span></div>
<div class="step"><b>2</b><span>Resolve the stale-result cache policy before paid automatic calls.</span></div>
<div class="step"><b>3</b><span>Reuse the real detector and existing UI through BA-12–18.</span></div>
<div class="step"><b>4</b><span>Attempt MFTC after the single-file interactive flow is stable.</span></div>

<p class="closing">Target: a current, reviewable suggestion in the same VS Code workflow developers already use.</p>

<!--
The task board now shows the complete Sprint 1 mock slice in Done. We can present the visible workflow alongside its automated acceptance evidence. In Sprint 2 we will resolve the cache choice, reuse the existing detector, and deliver only current results through the existing annotation UI. The one-hop import context follows once that single-file interactive path is stable. This sequence leaves a useful single-file product even if the stretch goal or live credential arrives late. Thank you. We welcome questions about the scheduler and integration plan.
-->
