---
theme: default
title: Technical Credit — Background Analysis Agent
info: Requirements and Sprint 1 plan for the existing VS Code Technical Credit extension.
author: Xiaoyu & Yezhen
class: dark
transition: fade
aspectRatio: 16/9
canvasWidth: 980
drawings:
  persist: false
fonts:
  sans: Segoe UI
  mono: Consolas
  provider: none
download: false
---

<div class="eyebrow" style="margin-top:38px">CS6510 · Requirements & Sprint 1 Plan</div>

<h1 style="font-size:61px;line-height:1.05;max-width:790px;margin-top:30px">Technical Credit.<br><span style="color:#78d9ce">In the background.</span></h1>

<p style="font-size:24px;max-width:720px;color:#c6d8d8">An efficient, asynchronous analysis agent<br>for the existing VS Code extension.</p>

<div style="margin-top:36px;color:#afc5c9;font-size:15px">Xiaoyu & Yezhen <span style="padding:0 15px">/</span> Project requirements presentation</div>


---

<div class="eyebrow">01 / Vision</div>

# Make TC analysis part of the coding workflow

<p class="lede">Deliver a background agent that reuses the shared TC detector and labeling UI, analyzes opened files asynchronously, and reuses results for unchanged files.</p>

<div class="grid3" style="margin-top:18px">
  <div v-click class="card accent"><div class="number">01</div><h2>Automatic</h2><p>React to supported file activity without repeated manual commands.</p></div>
  <div v-click class="card accent"><div class="number">02</div><h2>Responsive</h2><p>Schedule asynchronous work while the developer continues editing.</p></div>
  <div v-click class="card accent"><div class="number">03</div><h2>Efficient</h2><p>Reuse valid results across VS Code sessions to reduce AI calls.</p></div>
</div>

<div class="callout roadmap-note"><strong>By project end:</strong> include selected import-based multi-file analysis and/or ADR support. Final scope will follow the Sprint 1 review.</div>

<!--
最终项目愿景不止核心后台分析：计划包含部分基于imports的多文件分析stretch goal和/或ADR支持，但不预先承诺两者全部完成。尚未拿到现有extension repo，无法查看已有ADR内容或评估扩展工作量。Sprint1结束后的presentation会根据仓库调研和Sprint1完成情况，细讲相关epic和user stories，再定后续开发范围。
-->

---

<div class="eyebrow">02 / Scope & requirement status</div>

# Build on the existing extension

<div class="grid2">
<div class="card">
<span class="tag">Confirmed by Prof. Gorton</span>
<h2 style="margin-top:17px">Collaboration & scope</h2>
<p>Existing repo, separate branches.</p>
<p>Both manual and automatic agents share TC detection logic and the existing labeling UI.</p>
<p>Our team: automatic triggers, async scheduling, persistent caching and AI call optimization.</p>
</div>
<div class="card">
<span class="tag amber">Team decision / open items</span>
<h2 style="margin-top:17px">Integration details</h2>
<strong>Decided:</strong> <p> manual requests bypass our background cache.</p>
<strong>Open:</strong> <p> Tune debounce and cooldown intervals.</p>
<p> Tasks allocation</p>
</div>
</div>

<!-- <div class="callout"><strong>Other team:</strong> manual agent and detection modules.<br><span class="small muted">Our agent reuses detection and the existing labeling UI.</span></div> -->


---

<div class="eyebrow">03 / System overview</div>

# Two triggers. Shared detection and presentation.

<div class="grid2" style="gap:30px">
<div>
  <SystemDiagram />
</div>
<div class="card" style="font-size:17px">
<h2>Confirmed shared modules</h2>
<p><strong>Manual path:</strong> command → shared detector → UI.</p>
<p><strong>Background path:</strong> events → our agent → shared detector → UI.</p>
<p class="muted">Shared detection and labeling are confirmed. The diagram shows conceptual routing; detailed interfaces remain to be agreed.</p>
<!-- <div style="margin-top:22px"><span class="tag">Team decision</span><p>Manual requests bypass our cache. Sharing the scheduler remains open.</p></div> -->
</div>
</div>


---

<div class="eyebrow">04 / High-level user stories</div>

# Five core epics

| Epic | As a developer, I want… | Value |
| --- | --- | --- |
| **E1 · File monitoring** | supported file activity to trigger analysis automatically | Less manual work |
| **E2 · Efficient async scheduling** | handled frequent edits and Auto Save without interrupting my work | Fewer redundant AI calls |
| **E3 · Persistent caching** | no extra analysis after a restart | Fewer AI calls |
| **E4 · Detector integration** | automatic and manual paths to reuse the same detector | Consistent analysis |
| **E5 · Result delivery** | findings to appear in the existing labeling interface | Familiar review flow |


---
class: scheduling-slide
---

<div class="eyebrow">Epic 2 / Proposed scheduling policy</div>

# Auto Save events should not become AI calls

| Mechanism | Scheduling rule | Problem addressed |
| --- | --- | --- |
| **Per-file debounce** | Reset the timer after each content change; wait for a quiet period. | Continuous editing |
| **Per-file cooldown** | Wait after the last analysis completes; retain the latest pending change. | Repeated analysis bursts |
| **Content-hash cache** | Reuse a valid result immediately, without waiting for timers. | Unchanged content |
| **In-flight deduplication** | One active request per file; merge triggers into the latest pending version. | Overlapping AI calls |

<div class="callout"><strong>Earliest start = max(last change + debounce, last completion + cooldown)</strong><br><span class="small">For cache misses with no active request. Recheck the latest content before starting.</span></div>

<!-- <div class="small" style="margin-top:13px"><strong>Proposed starting values:</strong> debounce 3s · cooldown 30s. Tune with Auto Save simulations and call-cost measurements; these are not fixed product requirements.</div> -->

<!--
E2 的完整故事：As a developer, I want TC analysis to be scheduled intelligently in the background, so that frequent file edits and automatic saves do not trigger redundant AI requests or interrupt my workflow.
防抖等的是最后一次内容变化后的安静期；冷却等的是上次分析完成后的间隔。二者按文件独立维护，不应让 A 文件阻塞 B 文件。首次分析没有上次完成时间，不套冷却限制。
保存但内容未变不算新修改；有效缓存命中立即返回。冷却中保留最新待分析状态，定时器结束后重新检查，而不是丢弃修改。持续编辑时防抖可能持续延后，这是当前提案的预期行为。
仅当缓存未命中、无执行中任务且两个时间条件都满足时才启动。执行中若又修改，则合并成最新待分析版本；旧任务结束后重新执行调度判断。3 秒与 30 秒均为建议起点，未被教授确定，也未做成本实验。
-->

---
clicks: 4
---

<div class="eyebrow">05 / Sprint 1 storyboard</div>

# A file changes. The agent schedules the latest version.

<div class="grid2" style="gap:15px">
<div v-click="1" class="card story"><div class="number">01 <span style="font-size:18px">Observe</span></div><strong>Open or edit A.java</strong><p>Capture supported content; Auto Save events do not each become a detector call.</p></div>
<div v-click="2" class="card story"><div class="number">02 <span style="font-size:18px">Check</span></div><strong>Compute hash + look up cache</strong><p>Valid hit → restore results. New or changed content → schedule analysis.</p></div>
<div v-click="3" class="card story"><div class="number">03 <span style="font-size:18px">Schedule</span></div><strong>Wait, merge, then analyze</strong><p>Wait for debounce and cooldown; allow one active request per file. Retain the latest change.</p></div>
<div v-click="4" class="card story"><div class="number">04 <span style="font-size:18px">Remember</span></div><strong>Persist the completed snapshot</strong><p>Store its hash and detector version. Changes during analysis remain pending for a later run.</p></div>
</div>

<div class="small muted" style="margin-top:14px">Conceptual workflow · Planned Sprint 1 behavior · Mock results, not a completed plugin</div>

<!--
这页四次点击：观察事件、查缓存、等待并合并、保存快照。执行期间发生的新修改保留为 latest pending。发布旧版本结果的防护由 US-09 在接入真实 detector 前完成；不要把过期结果当成当前建议。Mock 能让调度缓存开发不被另一组进度阻塞。
-->

---

<div class="eyebrow">06 / Sprint 1 acceptance criteria</div>

# Stories with observable outcomes

| ID | Developer story | Acceptance evidence |
| --- | --- | --- |
| **US-01** | Detect supported files automatically | Opening Java creates an event; unsupported files are ignored. |
| **US-02** | Keep editing during analysis | An intentionally delayed request does not block editing. |
| **US-03** | Skip unchanged content | Reopening the same content produces zero additional calls. |
| **US-04** | Merge queued events | Same-version events produce one pending queue entry. |
| **US-05** | Remember completed analysis | Restarting the Extension Host restores a valid cached result. |

<div class="callout"><strong>Sprint slice:</strong> E1–E3 + a mock detector.
<!-- <br><span class="small muted">Open/save events are the proposed trigger policy; exact hooks will be verified in the existing extension.</span> -->
</div>

---
class: scheduling-stories
---

<div class="eyebrow">Epic 2 / Detailed stories & delivery order</div>

# Make scheduling behavior observable

| ID | Developer story | Acceptance criteria |
| --- | --- | --- |
| **US-06** | Debounced analysis | Frequent edits reset the timer; start only after the configured quiet period. |
| **US-07** | Per-file cooldown | No new analysis for that file during cooldown; reconsider its latest pending changes afterward. |
| **US-08** | In-flight deduplication | At most one active request per file; merge new triggers and retain the latest pending version. |
| **US-09** | Stale result handling | Compare the analyzed hash with current content; suppress outdated findings and reschedule the latest version. |
| **US-10** | Configurable scheduling | Debounce and cooldown intervals can be configured and tuned. |

<div class="callout"><strong>Sprint 1:</strong> US-06–08 with the mock detector.<br><span class="small"><strong>Before real detector integration:</strong> US-09. <strong>Later sprint:</strong> US-10 configuration UI/settings.</span></div>

<!--
US04 验收排队时的同版本合并，US08 验收任务已运行时的互斥与最新版本保留。US07 必须通过可控时钟证明冷却结束后仍会分析最新版本，不能仅检查“没有调用”。US06 模拟每秒修改保存，证明防抖重置；US08 用延迟 mock 验证同文件并发峰值为1。
US09 是真实异步检测接入前的必备条件，测试旧快照运行时再次修改，确认旧结果不会发布为当前发现，最新版本按调度规则处理。US10 的用户配置入口放后续 sprint；Sprint1 使用可注入的时间参数便于测试，不把3秒和30秒写成产品硬要求。
-->

---
clicks: 6
class: demo-slide
---

<div class="eyebrow">07 / Planned classroom demo</div>

# Auto Save bursts. Two analysis calls.

<div class="small muted" style="margin-bottom:14px">Planned mock demo · One file · Empty cache · Fixed detector version · Proposed 3s debounce / 30s cooldown</div>

<table>
<thead><tr><th>Action</th><th>New calls</th><th>Total</th><th>What it proves</th></tr></thead>
<tbody>
<tr v-click="1"><td>Edit / Auto Save every 1s</td><td>+0</td><td>0</td><td>Debounce keeps resetting</td></tr>
<tr v-click="2"><td>Stop editing; wait 3s</td><td>+1</td><td>1</td><td>Analyze the latest version</td></tr>
<tr v-click="3"><td>Trigger editing while it runs</td><td>+0</td><td>1</td><td>No duplicate active request</td></tr>
<tr v-click="4"><td>After completion, edit in cooldown</td><td>+0</td><td>1</td><td>Retain the latest pending change</td></tr>
<tr v-click="5"><td>Cooldown ends + file quiet ≥ 3s</td><td>+1</td><td>2</td><td>Deferred change is analyzed</td></tr>
<tr v-click="6"><td>Finish; restart; reopen unchanged</td><td>+0</td><td>2</td><td>Persistent cache hit</td></tr>
</tbody>
</table>

<div v-click="6" class="callout">Inspect the call counter, pending hash and timer log.
<!-- <br><span class="small muted">Use a controllable clock for the demo. Expected behavior only; no measured API savings claim.</span> -->
</div>

<!--
六次点击。最初每秒修改保存，停止后3秒才首次分析。执行中重复相同版本事件不增加调用；完成后才开始30秒冷却。冷却期间做新修改，保留最新hash。冷却到期且最后修改已过去3秒时才进行第二次分析。第二次完成后重启并重新打开相同内容，通过持久缓存立即恢复，不需等待冷却。
冷却和防抖时钟并行计算，取max，不是固定相加33秒。模拟时钟加速演示；真实调用数和节省成本尚未测量。接入真实detector前另用US09测试分析旧版本时修改，避免过期结果展示。
-->

---

<div class="eyebrow">08 / Development approach</div>

# A small extension feature with clear boundaries

<div class="grid2">
<div>
<h2>Proposed stack</h2>
<table style="font-size:15px">
<tbody>
<tr><td>Platform</td><td>VS Code Extension API</td></tr>
<tr><td>Language / runtime</td><td>TypeScript / Node.js Extension Host</td></tr>
<tr><td>Cache</td><td>SHA-256 + workspace extension storage</td></tr>
<tr><td>Analysis / UI</td><td>Existing shared modules</td></tr>
<tr><td>Tests</td><td>Existing framework + fake clock + VS Code integration runner</td></tr>
</tbody>
</table>
</div>
<div class="card">
<h2>Proposed logical organization</h2>
To be determined after researching existing repo
<!-- <p><code>src/background-agent/</code><br><span class="small muted">FileMonitor · AnalysisScheduler · AnalysisCache · BackgroundAgent</span></p>
<p><code>src/detection/</code><br><span class="small muted">Shared detector contract and implementation</span></p>
<p><code>src/labeling/</code><br><span class="small muted">Existing result presentation</span></p>
<p><code>src/test/</code><br><span class="small muted">Unit tests, mock detector and lifecycle tests</span></p> -->
</div>
</div>

<div class="small muted" style="margin-top:19px">Adapt to the existing repository; package names, directories and build scripts remain subject to inspection.</div>

<!--
技术栈是建议，不凭空声称老仓库使用 Jest。缓存使用 workspace storage，文件保存位置遵循 extension context。第一轮优先贴合已有依赖。
-->

---

<div class="eyebrow">09 / Build, collaborate, review</div>

# Integrate through a shared contract

<div class="grid2">
<div class="card">
<h2>Proposed build & PR workflow</h2>
<p>1. Clone the existing repo; install  dependencies.</p>
<p>2. Run its TypeScript build script.</p>
<p>3. Launch Extension Development Host.</p>
<p>4. Run unit and integration tests.</p>
<p>5. Review PRs into the integration branch.</p>
<!-- <div class="small muted" style="margin-top:15px"><strong>Confirmed:</strong> both teams work in the existing extension repo on separate branches. Build and PR steps remain proposed.</div> -->
</div>
<div>
<h2>Team roles & ownership</h2>
<p class="small muted" style="font-size:14px">Xiaoyu & Yezhen will discuss individual roles privately later.</p>
<table style="font-size:15px">
<thead><tr><th>Owner</th><th>Responsibility</th></tr></thead>
<tbody>
<tr><td>Our team</td><td>Triggers; scheduling; caching; call optimization</td></tr>
<tr><td>Both</td><td>Integration tests; review; documentation</td></tr>
<tr><td>Other team</td><td>Manual agent; shared detection modules</td></tr>
</tbody>
</table>
<!-- <div class="callout small">Agree first: input snapshot, finding schema, detector version, errors and result delivery.</div> -->
</div>
</div>

<!--
教授已认可团队间职责、共用现有repo与独立分支。个人分工尚未分配，即将由Xiaoyu和Yezhen私下讨论确认，因此不再展示预先指定的个人任务。具体build/PR步骤和npm脚本仍需看实际repo。双方优先定接口，再独立开发。
-->

---

<div class="eyebrow">10 / Deliverables & next decisions</div>

# Prove the workflow before connecting real AI

<div class="grid2">
<div class="card accent">
<span class="tag">Planned Sprint 1 deliverables</span>
<p>File monitoring prototype</p>
<p>Per-file debounce, cooldown and deduplication</p>
<p>Persistent content-hash cache</p>
<p>Mock detector + Auto Save / restart tests</p>
<p>Detector integration interface contract</p>
</div>
<div class="card">
<span class="tag amber">Planning after Sprint 1</span>
<h2 style="margin-top:17px">Extend the project scope</h2>
<p>Aim to include selected multi-file analysis and/or ADR support by project end.</p>
<p>We do not yet have the existing repo, so we cannot review its ADR content or estimate stretch work.</p>
<p>At the post–Sprint 1 presentation, define the related epics and user stories based on repo review and Sprint 1 completion.</p>
</div>
<!-- <div class="card">
<span class="tag amber">Decision & next steps</span>
<p><strong>Decided:</strong> no shared cache for the manual agent. Scheduler sharing remains open.</p>
<p><strong>Both teams:</strong> agree module APIs, finding schema and detector versioning.</p>
<p><strong>Next:</strong> add stale-result protection before real detector integration; tune intervals with measurements.</p>
</div> -->
</div>

<!-- <div v-click class="callout"><strong>Success evidence:</strong> detector calls avoided, valid cache-hit rate, queue/analysis latency and editor responsiveness.<br><span class="small muted">Current presentation delivers requirements, architecture and a storyboard. Implementation items above are planned.</span></div> -->

<!--
最后明确当前交付是需求设计，代码原型是后续sprint交付。Manual Agent不共用缓存已由团队决定；调度服务是否共享仍待确认。性能指标需在真实接入后测量。
项目结束时计划纳入部分stretch或ADR工作，具体选择和工作量暂不承诺。现有extension repo尚未取得，需查看其中已有ADR相关内容并估算基于imports的多文件分析工作量。Sprint1结束后根据完成度与仓库调研结果确定后续开发内容，并在下一轮presentation详细展示对应epics和US。
-->

---

<div class="eyebrow">Appendix / Reference & safeguards</div>

# Source and implementation considerations

<div class="card">
<h2>Source of this requirements proposal</h2>
<p style="font-size:16px">Project discussion — requirements, professor clarifications and proposed sprint plan</p>
<p class="small muted" style="font-size:14px">Prof. Gorton confirmed repo, branches, shared detection/UI and team scope. We decided against sharing our cache with the manual agent. Individual roles will be agreed privately.</p>
</div>

<div class="grid3" style="margin-top:19px">
<div class="card"><h2 style="font-size:18px">Cache identity</h2><p class="small">Workspace + file URI + content hash + detector/config version. Store findings, including empty results.</p></div>
<div class="card"><h2 style="font-size:18px">Result freshness</h2><p class="small">Before publishing, compare the current file version with the analyzed snapshot. Discard outdated results.</p></div>
<div class="card"><h2 style="font-size:18px">Failure handling</h2><p class="small">A failed request shouldn't be cached. Handle retries without duplicate work.</p></div>
</div>

<!--
备用页：后三项是实现层的建议防护，不是教授已明确要求。若被问到文件分析途中又被修改，说明 snapshot 与发布前检查机制。缓存也要存无 finding 的成功结果。
-->
