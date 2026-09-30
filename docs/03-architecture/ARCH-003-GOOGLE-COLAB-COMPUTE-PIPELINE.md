# ARCH-003: Google Colab Heavy-Compute Pipeline

**Document ID:** ARCH-003  
**Status:** Approved & Active  
**Author:** Antigravity / BukieBrainJobs Core Team  
**Governing Skill:** `mr-solomon-nine-command-engineering-loop`  

---

## 1. Architectural Boundary & Purpose

Google Colab provides on-demand, accelerated cloud computing (NVIDIA GPUs such as T4, L4, A100, and Google TPUs) through Google AI Pro allocations. 

Colab is strictly an **isolated, ephemeral heavy-compute sandbox**. It does not host web servers, databases, or client-side runtimes.

* **What Colab Is NOT**:
  * Not a development server for `pnpm web:dev` or Next.js App Router.
  * Not a persistent database or socket server host.
  * Not a replacement for the Cloud Codespace or local Termux code editing.
* **What Colab IS**:
  * An off-device compute engine for heavy AI prompt tuning, synthetic dataset generation, batch image transformation, and mathematical model validation.
  * An ephemeral task runner that executes a script on cloud hardware, writes artifacts back to the repository, and shuts down immediately to conserve compute units.

---

## 2. The Four Approved BukieBrainJobs Use Cases

All Colab workloads for BukieBrainJobs must fall strictly into one of four functional domains:

### A. Gemini Prompt Stress-Testing & Schema Benchmarking
* **Capability:** `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`
* **Workflow:** Before writing server-side API routes for automated fault diagnosis (generator symptoms, AC cooling failures, plumbing leaks) or quote drafting, test the prompts in an isolated Colab session.
* **Objective:** Benchmark system instructions against realistic Nigerian phrasing and slang (for example: *"the gen just dey kick but no fire"*). Confirm that responses strictly adhere to the expected Zod schemas in `packages/validation` before committing code to Next.js routes.

### B. Deterministic Synthetic Seeding for Nigerian Marketplace Workflows
* **Workflow:** Generating realistic mock profiles for artisans, service areas, and booking histories across Nigerian urban hubs (Lagos, Abuja, Port Harcourt).
* **Objective:** Run batch LLM generation scripts in Colab to produce deterministic JSON or SQL fixtures with realistic artisan names, trade certifications, address clusters, and verified ratings. Output fixtures are saved directly into `packages/db/prisma/seeds/`.

### C. Batch Media & Asset Optimization
* **Workflow:** Resizing, converting, and compressing high-resolution category icons, banner graphics, and trade verification sample images.
* **Objective:** Prevent local phone memory exhaustion. Running heavy image manipulation (Pillow, OpenCV, WebP conversion) on Termux risks triggering Android's Low Memory Killer (LMK). Running these transformations in Colab processes all assets in seconds without device strain.

### D. Algorithmic Dispatch & Dynamic Pricing Math Prototyping
* **Workflow:** Prototyping multi-factor artisan matching (distance, rating, urgency, machine capacity) and quote range estimation algorithms.
* **Objective:** Test mathematical formulas and distribution curves against simulated dataframes in Colab before translating the verified formulas into TypeScript utility functions in `packages/utils`.

---

## 3. Execution Standard via the Universal `colab` CLI

All interactions with Colab are executed from Termux using the global `colab` command bridge.

### Ephemeral Runner (Default)
To run a batch job without leaving compute units burning:
```bash
colab run --gpu L4 scripts/colab/generate_seeds.py
```
This allocates an L4 GPU instance, executes the script, writes outputs, and immediately releases the VM upon completion.

### Session Management
For multi-step prototyping:
```bash
# 1. Allocate session
colab new -s bbj-work --gpu T4

# 2. Execute script or code snippet
cat scripts/colab/test_prompt.py | colab exec -s bbj-work

# 3. Terminate immediately when finished
colab stop -s bbj-work
```

### Resource Hygiene
* Always run `colab status` or `colab sessions` after completing work to guarantee zero dangling VM allocations.
* Track compute unit consumption regularly with `colab usage`.

---

## 4. Integration with the 9-Command Engineering Loop

Colab integrates directly into the Mr. Solomon 9-Command Engineering Loop:

| Phase | Action |
| :--- | :--- |
| **/scope** | Identify if the active slice requires heavy compute, synthetic datasets, or new prompt schemas. |
| **/audit** | Inspect existing TypeScript contracts in `packages/types` and Prisma schema in `packages/db`. |
| **/architect** | Define prompt inputs, output JSON schema, and mock dataset shape. |
| **/develop** | Write the Python runner in `scripts/colab/` and execute via `colab run`. Save output artifacts directly to repository packages. |
| **/check** | Verify database migrations and TypeScript compilation on the cloud build VM (`pnpm db:generate`, `pnpm type-check`). |
| **/test** | Run Vitest test suites against the newly seeded data or prompt handlers on the build VM (`pnpm test`). |
| **/document** | Record prompt benchmarks, test scores, or seed generation parameters in specs. |
| **/sync** | Commit clean code and generated artifacts to Git. |
