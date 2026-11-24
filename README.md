# Technical Credit Background Agent — Sprint 1 progress presentation

The Slidev source is `slides.md`. Full English narration is in `speaker-script.md`; the same text is embedded as Slidev presenter notes. `sprint1-progress.pdf` is the Canvas submission copy.

## Run or export

Use Node.js 20.19+ or 22.12+ and install dependencies once:

```powershell
npm install
npm run dev
```

On Windows x64, the project includes the matching `oxc-parser` native package because npm 10 may omit that optional dependency. `npm install` restores it automatically when needed. If an earlier install left `node_modules` incomplete, run `npm run repair:windows` and then `npm run dev`.

For a new PDF after editing:

```powershell
npm run build
npm run export
```

In Slidev, press `P` for presenter mode. The presentation is designed for roughly 9–11 minutes of narration, with additional time for a live Extension Development Host demonstration if available.

## Evidence and scope

- The Trello board snapshot was read again on 23 November 2026: all 10 Sprint 1 cards (BA-01–10) are Done, 0 Sprint 1 To Do, 14 Backlog, and 2 Blocker / Need a Decision cards. No cards were In Progress or Under Review. [Task board](https://trello.com/b/5c1ZvcoP/technicalcredit-task-board-sprint-1).
- The local `../TechnicalCredit` checkout is on the BA-08 branch, so it does not contain the later BA-05–07 and BA-09 work. Use the latest integrated branch for the live Sprint 1 demonstration.
- On the local BA-08 checkout, `npx jest src/test/background --runInBand` passed 143 tests in 6 suites and `npm run compile` passed. Those results are earlier foundation evidence, not verification of the team's completed Sprint 1 integration.
- BA-09's status page should be demonstrated using the latest integrated branch. Summarize the fake-clock functional tests aloud; the call sequence is 0 → 1 → 1 → 2 → 2, and restart/cache reuse is a separate test.
- The real detector, existing annotation UI integration, and one-hop import context remain in Backlog. A Claude credential is needed only for the bounded live smoke test; the default automated suite should remain offline.

## Live demonstration, if time permits

Open the latest integrated TechnicalCredit checkout in VS Code, press F5, and open a Java fixture in the Extension Development Host. Place the BA-09 read-only Background Status tab beside the file and show state, call counts, and cache outcomes while editing. Describe the BA-09 automated tests and what they verify; do not run them during the presentation. The local `../TechnicalCredit` BA-08 branch has only the earlier Background output channel. Do not invoke the manual **Analyse for TC** command without a valid API credential and permission for live calls.

The PDF has no Slidev presenter notes. Use `speaker-script.md` while rehearsing or Slidev presenter mode when presenting from the source.
