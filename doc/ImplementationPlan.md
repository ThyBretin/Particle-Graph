# Detailed Implementation Plan
## Phase 1: Worker Setup & Core Endpoints (Week 1)
### Setup Environment:
- Configure wrangler.toml with R2 (particlegraph-data) and KV bindings.
- Add dependencies: @babel/parser, axios.

### Main Entry (index.js):
- Route REST and MCP requests to /createGraph, /loadGraph, /particleThis, etc.
- Add token validation via auth.js.

### Auth (api/auth.js):
- Implement GitHub OAuth token check using KV.

### PathResolver (utils/path.js):
- Build resolve_path for GitHub API and R2 key mapping.

## Phase 2: Metadata Extraction (Week 2)
### Factual Extractor (utils/factual_extractor.js):
- Parse JS/TS with Babel, extract raw fields (hooks, calls, etc.).

### Inferred Extractor (utils/inferred_extractor.js):
- Enhance factual data with purpose, logic, core_rules (default behavior).

### Particle Logic (api/particle.js):
- Implement /particleThis and /showParticles using both extractors.
- Store Particles and SuperParticles in R2.

## Phase 3: Graph Creation & Crawling (Week 3)
### Graph Logic (api/graph.js):
- Implement /createGraph to crawl repo via GitHub API, generate Particles, and build Graphs.
- Add /listGraph, /loadGraph, /exportGraph, /updateGraph.

### Gitignore Handling:
- Fetch .gitignore from GitHub, apply exclusions in createGraph.

## Phase 4: App Story & Library Defs (Week 4)
### Aggregator (utils/aggregator.js):
- Build /appStory to summarize Particles into routes, data, components.

### Library Defs (api/graph.js):
- Implement /getLibraryDefs to fetch from libraryDefs/${libraryName}.json in R2.

### Pre-populate R2 with sample defs (e.g., @types/react).

## Phase 5: Webapp & MCP Polish (Week 5)
### Webapp (pages/src/):
- Update Home.jsx for repo selection and chat UI. (That's is now UserPage)
- Add REST calls to trigger Worker endpoints.

### MCP:
- Finalize JSON-RPC handlers in index.js for all resources.
- Test with mcp-remote.

## Phase 6: Testing & Docs (Week 6)
### Tests: Add unit tests for extractors, endpoints, and MCP.
### Docs: Update README.md with setup, MCP usage, and examples.

