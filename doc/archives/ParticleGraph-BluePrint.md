# ParticleGraph BluePrint

## Overview
ParticleGraph is a cloud-native tool that analyzes JavaScript codebases, generates contextual graphs, matches functions to library definitions, and refines them into actionable SuperParticles via an AI-powered chat UI. It runs on Cloudflare, integrates with GitHub, uses MCP for AI context delivery, and leverages xAI for refinement.

## Purpose
- Extract 95% of the application's narrative from the codebase.
- Provide maximum context and relevancy for developers.
- Optimize token usage for AI assistance.
- Maintain up-to-date graph representations.

## Cloudflare

### Cloudflare Worker:
Handles all graph operations: fetching GitHub files, parsing with Babel, matching functions to library defs, generating particles (addParticle()), creating/updating graphs (createGraph(), updateGraph()), and refining with ParticleThis().
#### Tech:
- JavaScript Worker with Babel (babel_parser_core.js, metadata_extractor.js) for parsing JS/JSX and endpoints (/createGraph, /listGraph, /loadGraph, /updateGraph, /particleThis).
- Library matching and graph ops in JS for Cloudflare compatibility.
#### Cache:
- Cloudflare KV caches hot graphs/particles for low-latency MCP/UI responses, synced with R2.
#### Endpoints:
/createGraph: Fetches GitHub files, parses, matches defs, creates graph.
/listGraph: Lists available graphs.
/loadGraph: Serves graphs to MCP (stateless).
/updateGraph: Updates graph post-commit.
/particleThis: Refines into SuperParticles via xAI.
/getLibraryDefs: Retrieves library defs from R2.

### Cloudflare R2:
#### Purpose: 
Stores graphs, particles, SuperParticles, and library defs.
#### Structure:
- graphs/${projectId}.json: Full graphs.
- particles/${projectId}/${filePath}.json: File metadata.
- superParticles/${projectId}/${filePath}.json: Refined SuperParticles.
- libraryDefs/${libraryName}.json: Parsed @types data (e.g., react.json from @types/react), enriched with intent where needed.

### Cloudflare Pages:
#### Purpose: 
Hosts the web app with chat UI.
#### Features: 
Displays graph info, library insights, SuperParticle suggestions; refines via chat.
#### Tech: 
Vite, Mantine, Unitsyles, REST API to Worker.

## Model Context Protocol (MCP):
#### Purpose: 
Delivers rich context to IDE AI and chat UI, optimizing token usage.
#### Implementation: 
- Resources (via ReadResourceRequest):
  - graphs://{projectId}/{graphName}: Full graphs.
  - libraryDefs://{libraryName}: Library defs.
  - superParticles://{projectId}/{filePath}: SuperParticles.
- Tools (via JSON-RPC):
  - create_graph(path: string): Fetches GitHub files, creates graph (mirrors /createGraph).
  - list_graphs(): Lists available graphs (mirrors /listGraph).
  - particle_this(filePath: string): Refines SuperParticles (mirrors /particleThis).
  - update_graph(projectId: string, graphName: string): Updates graph (mirrors /updateGraph).
  - get_library_defs(libraryName: string): Retrieves defs (mirrors /getLibraryDefs).
#### Transport: 
Stateless HTTP—REST endpoints for flexibility, JSON-RPC for MCP tools.
#### User Setup: 
IDE clients configure via https://your-worker.workers.dev; REST available for manual calls.

## Library Definition Matching:
Matches codebase functions (e.g., useState) to R2-stored defs, enhancing graph accuracy.
#### Source:
- TypeScript type definitions from DefinitelyTyped (@types packages) parsed into JSON (e.g., libraryDefs/react.json from @types/react).
- Fallback: Custom crawling or manual defs for untyped libraries.

## xAI via AI Gateway:
#### Purpose: 
Powers chat UI for SuperParticle refinement.
#### Integration: 
Called via /particleThis with graph data and user input.

## SuperParticle Creation:
Refines matches into intent-rich SuperParticles (e.g., “setUserAddress: Handles addresses with useState”).
SuperParticles always supersede Particles.

## GitHub Integration:
#### Purpose: 
Source of codebase files and change notifications.
#### Features: 
OAuth for repo access, webhooks parse commit paths to trigger /updateGraph.

## Lemon Squeezy:
Subscription management ($5/month/user, 1 project; free tier: 1 project, 15 graph loads/month).

## User Flow
1. User signs up via web app, grants GitHub access.
2. Worker fetches files, parses with Babel, matches defs, creates graph.
3. IDE MCP client fetches graph via ReadResourceRequest.
4. Webhook updates graph on commit.
5. User refines graph in chat UI, creating SuperParticles.

## Critical Implementation logic
### Path_Resolver:
Path resolver should be able to resolve paths to files in the codebase.
The user might have multiple projects, each with its own set of files.
No absolute paths should be used. 

### gitignore exclusion
We have to make sure that gitignore is properly configured to exclude files that should not be included graphs or Particules creation. 
We may have to make our own exlusion list based on common exlusion patterns and make sure that the codebase gitignore is also included. 

###  Graphs 
Can be created by user or automatically by the worker. 
Graphs can be from the entire codebase or from a specific folder.
Graphs can be aggregated from multiple paths. 
If aggregated from multiple, tech_stack should appear in the graph only once. 
Active folder should be used to resolve paths to graph creation. 

### Particles
Particles are created from the codebase files.
Active files should be used to resolve paths to particles creation. 


