# Sprint 1 presentation — speaker script

English delivery script. Advance one slide at each heading. Allow roughly 9–11 minutes for narration, plus any live demo and questions.

## Slide 1 — Title

Good afternoon. We are building the Background Agent for the Technical Credit VS Code extension. Today I will show what is implemented, how the scheduler prevents duplicate work, where the Sprint 1 board stands, and what we need for a complete interactive product. Our current agent deliberately uses a mock detector, so the progress we show does not depend on a Claude API key.

## Slide 2 — Original aim

The original aim is to make TC analysis part of normal editing. The existing extension already offers an explicit Analyse for TC command. Our work adds an automatic path for Java files. We want it to be responsive, because analysis takes time, and economical, because each real detector run may make several API calls. Sprint 1 delivered the background foundation: event capture, scheduling, deduplication, and persistent caching with a mock detector. Reusing the real detector and the existing annotation UI is planned for Sprint 2.

## Slide 3 — Investigated system

We inspected the existing extension before designing our path. The current manual workflow selects a construct from the cursor, calls Claude, checks ADRs, and opens the annotation preview as one connected flow. Our background path observes file events, checks the cache, and runs a mock detector. To reuse the existing detector and annotation UI, we need to decouple both from that manual workflow: the detector should accept explicit input without an active editor, and the presentation layer should accept validated results from either entry point. Sprint 2 will make those changes and send current background findings into the same Preview, Accept, and Dismiss interface.

## Slide 4 — Verification approach

We use three checks because each catches a different kind of problem. Offline tests drive Java events and controlled detector responses, then assert cache hits, active and pending state, and which file version a result belongs to. In F5, we open a Java file in the Extension Development Host, edit and save it, and inspect the Background output while confirming that editing remains responsive. Finally, TypeScript, lint, and bundle checks catch integration mistakes before the demo. Timing boundaries and exact call counts belong in automated tests with a fake clock; the F5 check tells us whether the extension behaves visibly as expected.

## Slide 5 — Active and pending

Here is the important scheduling case. Analysis starts on content A. While it runs, the developer edits the same file to C. We do not start a second request immediately. The scheduler holds only the latest snapshot as pending. When A finishes successfully, it stores the result under A's hash, then checks whether A is still current. It is not, so the result is not eligible for display. The scheduler rechecks C against the cache before starting another request. That is what we came up for per-file in-flight deduplication. 

## Slide 6 — Sprint 1 development order

We decided to develope these cards out of number order. After the file monitor, mock detector, cache, and detector contract, we implemented BA-08 first. That gave one scheduler ownership of the cache check, detector call, and each file's active and latest pending snapshot. We then added BA-05 event coalescing, BA-06 debounce, and BA-07 cooldown inside that same scheduler. BA-09 came last to test the integrated behavior with a fake clock and expose it through a read-only status tab. For a cache miss, the scheduler waits until both per-file deadlines are satisfied: that is the quiet period after the latest edit and the cooldown after the last completion. 

## Slide 7 — Agile board snapshot

On today, all ten Sprint 1 cards, BA-01 through BA-10, are all in Done. No card is in Sprint 1 To Do, In Progress, or Under Review. The fourteen Backlog cards cover Sprint 2 Background Agent integration and the optional one-hop import stretch goal. [show task board] We use BA for Background Agent and MFTC for multi-file context, with one continuous numbering sequence.

## Slide 8 — Demonstration and acceptance

### Preparation (do not read aloud)

Use a checkout containing BA-09, such as `tc-bg-task09-restart-tests-sprint-demo`; the local BA-08 checkout lacks the status page. From that repository, run `npm ci`, open it in VS Code, and press F5. In the Extension Development Host, open a folder as the Java workspace. Do not run the manual **Analyse for TC** command, which uses the real Claude detector.

### Before the live demo (say this)

“This page shows the Sprint 1 mock detector. It reports scheduling metadata, not real Technical Credit advice. **Analyses** counts mock detector calls started in this session. **Follow-ups** counts calls started for pending work after an earlier request finishes; it is part of Analyses, not an additional total. **Repeats ignored** counts repeated reports of the same file content that do not require another call. **Cache hits** means a valid result already exists for the current content and detector version; **Cache misses** means the scheduler must consider a new call. **Results stored** counts successful cache writes.

“For each file, **Running** is the snapshot currently being analysed. **Waiting** is the newest pending snapshot. **Waiting for** shows the quiet period, cooldown, or running request that holds it back. **Latest result** says whether the result is current or stale, and whether it came from analysis or cache. A `v` number is the document version; the short hash identifies its content. Session counters reset after a restart, but the cache persists.”

### Demo A — visible workflow

First scenario: Open a file that haven't opened before. Cache miss & Analyses ++
Second scenario: Open a file that have opened before. Cache hit++
Third Scenario: Edit a file. Cache miss & Analyses ++
Last Scenario: Edit a file and undo. Cache hit++



1. **Do:** In the Extension Development Host, press `Ctrl+Shift+P` and run **Technical Credit: Show Background Status**. **Say:** “This read-only tab opens beside the Java editor. Opening it does not start an analysis.”
2. **Do:** Create and open a new Java file in the workspace, for example `SprintDemo.java` with `public class SprintDemo { private int count = 1; }`. **Say:** “Opening or editing a Java file gives the scheduler a snapshot. It waits for a quiet period before a cache miss becomes a mock call.”
3. **Do:** Stop editing and point to `Waiting`, then `Running`, `Analyses`, and `Latest result` as they change. **Say:** “The mock call starts after the quiet period and returns a sample finding. The editor stays responsive. This finding is test data and is not inserted as an annotation.”
4. **Do:** Change `count` to `2`, save, and point to the new waiting version and its reason. Undo back to `1`, save, then point to `Cache hits` and the unchanged `Analyses` count after the quiet period. **Say:** “The scheduler keeps the latest content. Returning to an already analysed version lets it reuse the cached result without another detector call.” If you can edit while `Running` is visible, show Running and Waiting together; the automated test proves this case even if the two-second mock window is missed.
5. **Do:** Run **Technical Credit: Show Background Status** again. **Say:** “The command reveals the same status tab rather than creating another one.”

### Automated verification (say this; no terminal demo)

“We also have offline functional tests for the behavior that is hard to demonstrate precisely by hand. A fake clock and fake detector let us check Auto Save, debounce, cooldown, and active/pending deduplication without waiting for real timers or calling Claude. 

## Slide 9 — Completion path

We still need to keep working in Sprint 2 to deliver this feature. BA-12 through BA-14 come first because the manual command starts at the cursor, while a background job has no cursor. Tree-sitter must find the file’s top-level constructs, and we must separate detection from the manual command’s editor and UI code so the background adapter can reuse the same core. BA-15 and BA-16 make automatic Claude calls safe: users explicitly enable them, call limits control cost, and a stale-result cache policy avoids unnecessary repeat calls. BA-17 then sends only current findings, whether fresh or cached, to the existing CodeLens preview and Accept or Dismiss flow. BA-18 tests that full path and checks that the original manual command still works.

## Slide 10 — Stretch goal

Our selected stretch goal is one hop of import context. If A imports B, we analyze A while supplying a bounded structural summary of B. Findings still belong to A. Tree-sitter can parse each Java file, but our code must build the workspace index and resolve imports. A result's identity then includes A's content, the selected dependency hashes, and the detector version. If B changes, we enqueue a new analysis for each open A that depends on it, using A's own debounce and cooldown. MFTC-19 through 24 cover that work. We are keeping the boundary narrow so it remains a stretch goal rather than a whole-codebase architecture analyzer.

## Slide 11 — Blockers and decisions

The board has two blocker or decision cards. The first is access to Claude. Without it, we can still implement and test the integration with an injected fake client, but we cannot claim that a real response was verified. The second decision is about caching. Right now, the cache keeps just one result per file and detector version. So if an old result for A finishes late and gets stored, it can replace a useful result for C. If the file then goes back to C, we have to make another request when we could have used the cache. We need to decide whether to skip stale results or keep a small history. That matters before we make paid calls more widely, and before we add MFTC's dependency-aware cache. If either blocker is still open at the final demo.

## Slide 12 — Next steps

[show task board] In Sprint 2 we will resolve the cache choice, reuse the existing detector, and deliver results through the existing annotation UI. The one-hop import multi file context follows once that single-file interactive path is stable. Thank you. 

