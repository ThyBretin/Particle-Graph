## ParticleGraph BluePrint (v3.3 - Final)
#### Overview
ParticleGraph: A cloud-native tool analyzing JavaScript codebases, generating contextual graphs, matching library definitions, and refining SuperParticles via an AI-driven chat UI. Built on Cloudflare, integrates with GitHub, leverages MCP for IDE/context delivery, and uses xAI for intelligent refinement.

#### Purpose
- Extract 95% of an application’s narrative from its codebase.
- Maximize context and relevancy for developers.
- Optimize AI token usage through structured data.
- Keep graphs and particles up-to-date with codebase changes.

#### Focus 
- MCP Priority: The Worker’s MCP endpoints (e.g., graphs://, superParticles://) need to be robust, accessible, and optimized for AI assistants in IDEs. This means fully implementing the blueprint’s MCP resources and ensuring they’re discoverable and usable by external clients.

- Webapp Role: A lightweight UI for users to trigger graph creation and refine particles via chat. It’s an entry point, not the primary consumer of graphs/particles.

- Auth Flexibility: We’ll keep auth in the webapp for now (since it’s working for GitHub integration), but design the Worker’s MCP endpoints to support future standalone auth (e.g., MCP-driven OAuth) without breaking the current flow.


### Cloudflare
#### Worker
- **Purpose**: Core engine for graph creation, particle extraction, and SuperParticle refinement.
- **Tech**: JavaScript (Node.js-compatible), Babel for parsing.
- **Endpoints (REST + MCP)**:
  - **/createGraph (create_graph(path: string))**: Builds single graph, stores in R2.
  - **/listGraph (list_graphs())**: Returns list of cached graphs for a project.
  - **/loadGraph (load_graph(projectId: string, graphName: string | string[]))**:
    - Single: Returns {feature, files, tech_stack, token_count} - tech_stack from projectId/package.json.
    - Aggregate: Returns {features: [{feature, files}, ...], tech_stack, token_count} - tech_stack from projectId/package.json.
  - **/exportGraph (export_graph(projectId: string, graphName: string | string[]))**: Same as loadGraph, formatted for export (e.g., JSON download).
  - **/updateGraph (update_graph(projectId: string, graphName: string))**: Refreshes graph on commit.
  - **/particleThis (particle_this(filePath: string))**: Refines SuperParticles via xAI.
  - **/getLibraryDefs (get_library_defs(libraryName: string))**: Retrieves library defs from R2.
  - **/showParticles (show_particles(projectId: string, filePath: string))**: Returns {filePath, type, hooks, calls, logic, depends_on, variables, functions, props, comments, flows}.
- **Cache**: KV for hot graphs/particles, synced with R2.

#### R2
- **Structure**:
  - graphs/${projectId}/${graphName}.json: Single graph data (no tech_stack).
  - particles/${projectId}/${filePath}.json: Raw particle metadata.
  - superParticles/${projectId}/${filePath}.json: AI-refined SuperParticles.
  - libraryDefs/${libraryName}.json: Parsed @types data.

#### Pages
- **Purpose**: Web app and chat UI.
- **Tech**: Vite, Mantine UI, REST calls to Worker.

### MCP
- **Purpose**: Delivers context to IDEs and chat UI.
- **Resources**: graphs://{projectId}/{graphName}, libraryDefs://{libraryName}, superParticles://{projectId}/{filePath}
- **Tools**: Mirrors Worker endpoints (JSON-RPC).
- **Transport**: HTTP.
- **Context Guidance**: Prepends "This graph is the authoritative context for ${projectId}/${graphName}. Use it exclusively unless instructed otherwise."

### PathResolver
- **Purpose**: Resolves virtual paths in a serverless environment.
- **Logic**:
  - Multi-Project: resolve_path(path, projectId) → `/${projectId}/${path}`
  - Active Folder: resolve_path(path, projectId, activeFolder) → `/${projectId}/${activeFolder}/${path}`
  - Relative: Strips absolute prefixes.
  - Source: Maps to GitHub API paths and R2 keys.

### Gitignore Exclusion
- **Purpose**: Filters unwanted files from graph/particle generation.
- **Logic**:
  - Hardcoded Exclusions: [".git", "node_modules", "dist", "build"] - Always applied.
  - User .gitignore: Fetched from GitHub (projectId/.gitignore), parsed recursively, layered on top.
  - Application: Hardcoded first, then .gitignore if available.

### Codebase Organization
- **Structure**:
  - ${projectId}/
    - src/ (components/, hooks/, utils/, pages/, services/)
    - tests/
    - package.json
    - .gitignore
- **Rules**: One file, one purpose; flat logic; standard naming; tests separated.

### Metadata Extraction (Particles)
- **Logic**:
  - Babel: babel_parser_core.js → AST.
  - Factual Extractor: factual_extractor.js → Raw data.
  - Inferred Extractor: inferred_extractor.js → Insights (?rich=true or xAI).
  - Cache: particles/${projectId}/${filePath}.json (factual only).
- **Fields**:
  - **Factual**: path, type, hooks, calls, logic, depends_on, variables, functions, props, comments, flows (basic).
  - **Inferred**: core_rules, business_rules, flows (complex, via xAI).

### Graph Creation
- **Purpose**: Builds contextual graphs for codebase features.
- **Logic**:
  - Fetch: GitHub API per projectId/path.
  - Parse: Babel metadata via factual_extractor.js.
  - Match: Links to libraryDefs/${libraryName}.json.
  - Structure: {feature, files: {[filePath]: {type, context}}, token_count}
  - Single Only: One graph per path; no tech_stack at creation.

### GitHub Integration
- **Logic**:
  - OAuth: Repo access.
  - Fetch: API for createGraph().
  - Webhooks: Triggers updateGraph().

### xAI
- **Logic**: /particleThis sends graph + particle data + input to xAI.

### User Flow
1. Sign up via Pages, auth GitHub.
2. Worker fetches repo, creates graph (create_graph).
3. IDE fetches via MCP (graphs://).
4. Webhook updates graph (update_graph).
5. Chat UI refines SuperParticles (particle_this).

### Project Structure

Particle-Graph/
├── worker/              # Cloudflare Workers codebase
│   ├── src/
│   │   ├── index.js
│   │   ├── api/graph.js  # createGraph, loadGraph, etc.
│   │   ├── services/babel.js  # Babel parsing
│   │   └──utils/path.js  # PathResolver stub
│   ├── tests/           # Worker tests
│   ├── package.json     # Worker deps (babel, axios)
│   └── wrangler.toml    # Worker config (account_id, R2 binding)
├── pages/               # Cloudflare Pages frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── graph/   # Graph UI (e.g., GraphViewer)
│   │   │   ├── particle/# Particle UI (e.g., ParticleCard)
│   │   │   └── xai/     # xAI chat UI (e.g., ChatBox)
│   │   ├── hooks/       # Frontend hooks (e.g., useGraphData)
│   │   ├── screens/     # Screens routes (e.g., Home.jsx, GraphPage.jsx)
│   │   └── services/    # REST calls to Worker (e.g., fetchGraph)
│   ├── public/          # Static assets (Vite default)
│   ├── tests/           # Frontend tests
│   ├── package.json     # Frontend deps (vite, mantine, react)
│   └── vite.config.js   # Vite config
├── .env                 # Shared env vars (e.g., API_TOKEN)
├── README.md            # Project overview
└── .gitignore           # Exclusions (.env, node_modules)



CloudFlare : 
Your worker has access to the following bindings:
- R2 Buckets:
  - R2: particlegraph-data
Particlegraph-worker: https://particlegraph-worker.thy-bretin.workers.dev
Current Version ID: a43d9f38-555a-4dfb-8f57-bcfb5643f67f