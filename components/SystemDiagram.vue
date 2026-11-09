<template>
  <svg viewBox="0 0 440 345" role="img" aria-label="Manual command and Background Agent both use the Shared TC Detector, which supplies the Shared Labeling UI" style="width:100%;height:345px">
    <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#087f8c" /></marker></defs>
    <rect x="5" y="12" width="155" height="85" rx="10" fill="white" stroke="#bfd2ce" />
    <text x="82" y="43" text-anchor="middle" style="font-size:17px" fill="#172b36">Manual command</text>
    <text x="82" y="69" text-anchor="middle" style="font-size:12px" fill="#667782">Detection team</text>
    <g>
      <rect x="178" y="12" width="255" height="85" rx="10" fill="#e0efea" stroke="#087f8c" stroke-width="2" />
      <text x="305" y="38" text-anchor="middle" style="font-size:17px" fill="#172b36">Background Agent · Our team</text>
      <text x="305" y="62" text-anchor="middle" style="font-size:13px" fill="#667782">File events → hash &amp; cache</text>
      <text x="305" y="81" text-anchor="middle" style="font-size:13px" fill="#667782">→ asynchronous queue</text>
    </g>
    <g>
      <path d="M82 97 V124 H220 V152 M305 97 V124 H220" fill="none" stroke="#087f8c" stroke-width="2" />
      <path d="M220 135 V154" stroke="#087f8c" stroke-width="2" marker-end="url(#arrowhead)" />
      <rect x="40" y="160" width="360" height="72" rx="10" fill="white" stroke="#bfd2ce" />
      <text x="220" y="187" text-anchor="middle" style="font-size:18px" fill="#172b36">Shared TC Detector → Claude</text>
      <text x="220" y="212" text-anchor="middle" style="font-size:13px" fill="#667782">Module interface within the existing extension</text>
    </g>
    <g>
      <path d="M220 232 V264" stroke="#087f8c" stroke-width="2" marker-end="url(#arrowhead)" />
      <rect x="40" y="270" width="360" height="65" rx="10" fill="white" stroke="#bfd2ce" />
      <text x="220" y="296" text-anchor="middle" style="font-size:18px" fill="#172b36">Shared Labeling UI</text>
      <text x="220" y="319" text-anchor="middle" style="font-size:13px" fill="#667782">Fresh findings or restored cached findings</text>
    </g>
  </svg>
</template>
