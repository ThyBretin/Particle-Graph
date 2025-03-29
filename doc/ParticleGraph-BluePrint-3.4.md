# ParticleGraph Blueprint

## Overview
ParticleGraph is a cloud-native, serverless platform built on Cloudflare Workers that analyzes entire JavaScript/TypeScript repositories from GitHub. It generates structured metadata—Particles (file-level insights), Graphs (repo structure), and an App Story (holistic summary)—and delivers this data to developer tools via MCP. The system is agnostic, flexible, and optimized for full-repo context, with xAI-driven refinement and library definition matching to maximize developer and AI utility.

## Purpose
- Extract 95% of an application’s narrative from its full codebase.
- Provide maximum context and relevancy for developers and AI assistants.
- Optimize AI token usage with structured, up-to-date metadata.
- Enable seamless integration into IDEs and workflows.

## Focus
- MCP Priority: Robust, discoverable MCP endpoints (e.g., graphs://, superParticles://, libraryDefs://) optimized for AI assistants in IDEs. These are the primary interface for external clients.
- Webapp Role: A lightweight UI to trigger repo-wide processing and refine Particles via xAI chat. It’s an entry point, not the main consumer.
- Auth Flexibility: Current GitHub OAuth via the webapp, with Worker MCP endpoints designed to support future standalone auth (e.g., token-based MCP access) without disrupting the flow.

## Cloudflare Infrastructure
### Worker
- Purpose: Core engine for repo crawling, metadata extraction, graph creation, particle refinement, and library definition retrieval.
- Tech: JavaScript (Node.js-compatible), Babel for parsing, Cloudflare Workers runtime.
- Endpoints (REST + MCP):
  - /createGraph (create_graph(projectId: string, path?: string)): Crawls a full GitHub repo (or single path if specified), generates Particles and Graphs, stores in R2.
  - /listGraph (list_graphs(projectId: string)): Lists all Graphs for a project from R2.
  - /loadGraph (load_graph(projectId: string, graphName: string | string[])):
    - Single: Returns {feature, files, tech_stack, token_count} (tech_stack from package.json).
    - Aggregate: Returns {features: [{feature, files}, ...], tech_stack, token_count} (tech_stack from package.json).
  - /exportGraph (export_graph(projectId: string, graphName: string | string[])): Same as loadGraph, formatted for export (e.g., JSON download).
  - /updateGraph (update_graph(projectId: string, graphName: string)): Refreshes a Graph on repo changes (e.g., via webhook).
  - /particleThis (particle_this(projectId: string, filePath: string, input?: string)): Refines a Particle into a SuperParticle using xAI (if input provided) or returns existing SuperParticle.
  - /getLibraryDefs (get_library_defs(libraryName: string)): Retrieves pre-parsed library definitions (e.g., @types/react) from R2.
  - /showParticles (show_particles(projectId: string, filePath?: string)): Returns Particle metadata for a file or all files in a project.
  - /appStory (app_story(projectId: string)): Aggregates all Particles into an App Story {routes, data, components}.
  - Cache: KV for hot data (Particles, Graphs, App Story), synced with R2 for persistence.

### R2
Structure:
- graphs/${projectId}/${graphName}.json: Graph data (no tech_stack at creation).
- particles/${projectId}/${filePath}.json: Raw Particle metadata (factual + inferred).
- superParticles/${projectId}/${filePath}.json: xAI-refined SuperParticles.
- libraryDefs/${libraryName}.json: Parsed library definitions (e.g., TypeScript defs).

### Pages
Purpose: Lightweight webapp for repo selection, graph triggering, and xAI chat.
Tech: Vite, Mantine UI, REST calls to Worker.

### MCP
Purpose: Deliver context to IDEs and tools.
Resources:
- graphs://{projectId}/{graphName}
- superParticles://{projectId}/{filePath}
- libraryDefs://{libraryName}
- appStory://{projectId}

Tools: JSON-RPC mirroring Worker endpoints.
Transport: HTTP.
Context Guidance: Prepends “This [resource] is the authoritative context for ${projectId}/${resourceName}. Use it exclusively unless instructed otherwise.”

### PathResolver
Purpose: Maps virtual paths to GitHub API and R2 storage in a serverless environment.

Logic:
- Multi-Project: resolve_path(path, projectId) → /${projectId}/${path}
- Relative: Strips absolute prefixes, aligns with GitHub repo structure.

Source: Maps to GitHub API (contents/${path}) and R2 keys.

### Gitignore Exclusion
Purpose: Filter irrelevant files during repo crawling.

Logic:
- Hardcoded: [.git, node_modules, dist, build]—always excluded.
- User .gitignore: Fetched from projectId/.gitignore via GitHub API, applied recursively.
- Order: Hardcoded first, then .gitignore layered on top.

### Metadata Extraction (Particles)
Logic:
- Babel: Parses JS/TS code into AST.
- Factual Extractor: Extracts raw data (path, type, hooks, calls, etc.).
- Inferred Extractor: Adds rich insights (purpose, logic, core_rules) by default, with xAI optional.
- Agnostic: No assumptions—driven by AST and code patterns.

Fields:
- Factual: path, type, hooks, calls, logic, depends_on, variables, functions, props, comments, flows (basic)
- Inferred: purpose, core_rules, business_rules, flows (complex)

Storage: Cached in KV, persisted in R2 as particles/${projectId}/${filePath}.json.

### Graph Creation
Purpose: Build structural context for the entire repo.

Logic:
- Fetch: GitHub API for all repo files (projectId).
- Parse: Babel + factual/inferred extractors for each file.

Structure: {feature, files: {[filePath]: {type, context}}, token_count}
Tech Stack: Added during loadGraph from package.json.
Scope: Repo-wide by default; single-path optional.

### App Story
Purpose: Summarize the repo into a high-level narrative.
Logic: Aggregate all Particles into {routes, data, components}.
Source: Built from particles/${projectId}/* and superParticles/${projectId}/*.

### GitHub Integration
Logic:
- OAuth: Authenticate users, access repos.
- Fetch: API for repo crawling and file retrieval.
- Webhooks: Trigger updateGraph on commits.

### xAI
Logic: 
- /particleThis with input sends Particle + input to xAI for refinement.
- Stores result as SuperParticle in R2.

### User Flow
1. User signs up via Pages, authenticates with GitHub OAuth.
2. Selects a repo; Worker crawls it (create_graph), generating Particles and Graphs.
3. IDE fetches via MCP (graphs://, superParticles://, libraryDefs://, appStory://).
4. Webhook updates Graphs on repo changes (update_graph).
5. User refines Particles via webapp chat (particle_this), creating SuperParticles.
6. App Story viewed in webapp or fetched via MCP.

### Project Structure

Particle-Graph/
