# Instructional videos

Senior Angular interview preparation with narrated foundations, code walkthroughs, questions and answers, practice pauses, and selectable English captions.

| Topic | Runtime | Lesson |
| --- | --- | --- |
| Signals | 59:20 | [Open lesson](signals/README.md) |
| Design Tokens: Themes, Accessibility, and Public Contracts | 47:46 | [Open lesson](design-tokens/README.md) |
| Accessible Angular Components: Names, Focus, and Interaction | 1:18:52 | [Open lesson](accessibility/README.md) |
| Angular Component APIs: Native Semantics and Consumer Contracts | 47:54 | [Open lesson](component-api/README.md) |
| Versioning Angular Libraries: Compatibility and Safe Migration | 38:24 | [Open lesson](versioning/README.md) |
| Testing Angular Libraries Through Consumer Behavior | 19:20 | [Open lesson](testing/README.md) |
| Angular Performance: Zoneless Rendering and Resource Lifetimes | 21:17 | [Open lesson](performance/README.md) |

## Regeneration

Prerequisites: the repository's Node/npm dependencies, .NET 10, Edge, and FFmpeg with libx264 and libmp3lame. Set FFMPEG_PATH and optionally EDGE_PATH. Install browser QA dependencies in the ignored cache:

```powershell
npm ci
npm install --prefix tools/instructional-video/.cache/browser playwright esbuild
npm run instructional:build
node tools/instructional-content/supplements.mjs
npm run instructional:check
node tools/instructional-content/remaining-browser-check.mjs
node tools/instructional-content/consumer-check.mjs
dotnet run tools/instructional-audio/generate.cs -- design-tokens accessibility component-api versioning testing performance --dry-run
```

Generate selected audio using the existing resource, keeping its key only in the process environment:

```powershell
try {
  $env:AZURE_SPEECH_KEY = az cognitiveservices account keys list --name sd-ai-uofnt2 --resource-group saturdaze-rg --query key1 -o tsv
  $env:AZURE_SPEECH_REGION = 'eastus2'
  dotnet run tools/instructional-audio/generate.cs -- design-tokens accessibility component-api versioning testing performance
} finally {
  Remove-Item Env:/AZURE_SPEECH_KEY -ErrorAction SilentlyContinue
}
$topics = 'design-tokens','accessibility','component-api','versioning','testing','performance'
foreach ($topic in $topics) { node tools/instructional-audio/retime.mjs $topic }
dotnet run tools/instructional-video/build.cs -- design-tokens accessibility component-api versioning testing performance --check
dotnet run tools/instructional-video/build.cs -- design-tokens accessibility component-api versioning testing performance
node tools/instructional-content/media-check.mjs
node tools/instructional-content/finish.mjs
```

The audio generator takes an exclusive run lock and retains the request ledger. tools/instructional-audio/budget.json records the approved US$10 additional cap above prior signals reservations. Preflight and each retry enforce the cap. Do not delete the ledger to bypass it. Only unchanged cached chunks are free to reuse; narration changes require synthesis.

Retiming is local, pitch-preserving at 1.2× for speech, and preserves detected practice pauses. QA screenshots are reused only when their content fingerprint matches the slides and shared assets. Caption positions within synthesis sections are approximate. Generated media is tracked with Git LFS.

The signals lesson retains its original sources and media. Use instructional:build -- signals and its dedicated browser check if changing that lesson; new-topic builds leave it untouched.
