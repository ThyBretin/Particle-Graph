## Overview
ParticleGraph: A cloud-native tool analyzing JS codebases, generating contextual graphs, matching library defs, and refining SuperParticles via AI chat UI. Built on Cloudflare, integrates GitHub, uses MCP, and leverages xAI.

## Purpose
- Extract 95% app narrative from codebases.
- Maximize context/relevancy for devs.
- Optimize AI token usage.
- Keep graphs up-to-date.

## Cloudflare

### Worker
Handles all graph operations: fetching GitHub files, parsing with Babel, matching functions to library defs, generating particles (addParticle()), creating/updating graphs (createGraph(), updateGraph()), and refining with ParticleThis().
#### Purpose: 
Core engine for graph/particle ops.
#### Tech
- JavaScript Worker with Babel (babel_parser_core.js, metadata_extractor.js) for parsing JS/JSX and endpoints (/createGraph, /listGraph, /loadGraph, /updateGraph, /particleThis).
- Library matching and graph ops in JS for Cloudflare compatibility.
#### Endpoints (REST + MCP):
- /createGraph (create_graph(path: string)): Fetches GitHub files, parses with Babel, matches defs, caches graph.
- /listGraph (list_graphs()): Lists cached graphs.
- /loadGraph (load_graph(projectId: string, graphName: string)): Serves graphs to MCP.
- /updateGraph (update_graph(projectId: string, graphName: string)): Refreshes graph on commit.
- /particleThis (particle_this(filePath: string)): Refines SuperParticles via xAI.
- /getLibraryDefs (get_library_defs(libraryName: string)): Retrieves defs from R2.
#### Cache: 
- Cloudflare KV caches hot graphs/particles for low-latency MCP/UI responses, synced with R2.


### R2
#### Structure:
- graphs/${projectId}/${graphName}.json: Full graphs.
- particles/${projectId}/${filePath}.json: File metadata.
- superParticles/${projectId}/${filePath}.json: Refined SuperParticles.
- libraryDefs/${libraryName}.json: Parsed @types data, enriched.

### Pages
#### Purpose: Web app + chat UI.
#### Tech: Vite, Mantine, REST to Worker.

## MCP
#### Purpose: Context delivery to IDEs/chat UI.
#### Resources:
- graphs://{projectId}/{graphName}
- libraryDefs://{libraryName}
- superParticles://{projectId}/{filePath}
#### Tools: See Worker endpoints (JSON-RPC).
#### Transport: HTTP (REST + JSON-RPC).

## PathResolver
#### Purpose: 
Resolves virtual paths for projects, graphs, and particles in a serverless Cloudflare environment.

#### Logic:
- **Base**: No filesystem root; paths are virtual, scoped to `projectId`.
- **Multi-Project**: 
  - resolve_path(path, projectId) → `/${projectId}/${path}`.
  - Maps to R2: `graphs/${projectId}/${graphName}.json`, `particles/${projectId}/${filePath}.json`.
- **Active Folder**: 
  - resolve_path(path, projectId, activeFolder) → `/${projectId}/${activeFolder}/${path}`.
  - Contextualizes paths within a project’s folder (e.g., `Events` in a repo).
- **Relative**: 
  - Strips absolute prefixes (e.g., `/Users/Thy/` or `/src/`) from user input.
  - Normalizes to `/${projectId}/${relativePath}`.
- **Source**: 
  - GitHub API paths (e.g., `repo/branch/${path}`) for fetching source files.
  - R2 keys for storage/retrieval.

#### Usage:
- **create_graph(path: "Events", projectId: "123")**: Fetches from GitHub (`repo/branch/Events`), stores in R2 (`graphs/123/Events.json`).
- **particle_this(filePath: "components/Event.js", projectId: "123", activeFolder: "Events")**: Refines from R2 (`particles/123/Events/components/Event.json`).



## Gitignore Exclusion
#### Purpose: Filters unwanted files from graphs/particles.
#### Logic:
- CustomExclusions: Static list (.git, node_modules, dist, etc.).
- Codebase: Parses .gitignore per projectId (recursive support).
- Merge: Combines custom + codebase patterns, applied in createGraph().

## Metadata Extraction (Particles)
#### Purpose: Extracts rich file metadata.
#### Logic:
- Babel: Parses JS/JSX (babel_parser_core.js → AST).
- Extractor: Metadata (hooks, props, calls, logic) via metadata_extractor.js.
- Rich Mode: Toggled via ?rich=true in /createGraph, /particleThis.
- Cache: Stored in particles/${projectId}/${filePath}.json.

## Graph Creation
#### Purpose: Builds contextual graphs.
#### Logic:
- Fetch: GitHub API (OAuth) pulls files per projectId/path.
- Parse: Babel extracts metadata per file.
- Match: Links to libraryDefs/${libraryName}.json.
- Structure: {feature, tech_stack, files: {primary, shared}, token_count}.
- Aggregate: Multi-path graphs merge tech_stack once.

## GitHub Integration
#### Purpose: Source files + updates.
#### Logic:
- OAuth: User authorizes repo access.
- Fetch: API pulls files for createGraph().
- Webhooks: Triggers updateGraph() on commits.

## xAI
#### Purpose: Refines SuperParticles.
#### Logic: /particleThis sends graph + user input to xAI via AI Gateway.

## User Flow
1. Sign up (Pages), auth GitHub (OAuth).
2. Worker fetches repo, creates graph (create_graph).
3. IDE fetches via MCP (graphs://).
4. Webhook updates graph.
5. Chat UI refines SuperParticles (particle_this).