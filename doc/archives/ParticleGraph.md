# ParticleGraph BluePrint

Overview
ParticleGraph is a cloud-native tool that analyzes JavaScript codebases, generates contextual graphs, matches functions to library definitions, and refines them into actionable SuperParticles via an AI-powered chat UI. It runs entirely on Cloudflare, integrates with GitHub for file access, uses MCP for AI context delivery, and leverages xAI for refinement.

Purpose
- Extract 95% of the application's narrative directly from the codebase
- Provide maximum context and relevancy for developers
- Optimize token usage efficiency for ai assistance
- Maintain up-to-date graph representation of code relationships


## CoudFlare 

## Cloudflare Worker:
Handles all graph operations: fetching files from GitHub, parsing files with Babel, matching functions to library definitions, generating particles (addParticle()), creating/updating the graph (createGraph(), updateGraph()), and refining with ParticleThis().

### Cloudflare Worker Tech 

Parsing: JavaScript Worker with Babel (babel_parser_core.js, metadata_extractor.js) for parsing JavaScript/JSX files.
Other logic : Python Worker for endpoints (/createGraph, /listGraph, /loadGraph, /updateGraph, /particleThis), library matching, and graph operations.

### Endpoints:
/createGraph: Fetches GitHub files, parses with Babel, matches library defs, creates graph.
/listGraph: list all graph available. 
/loadGraph: Serves graphs to MCP for IDE AI context (HTTP stateless).
/updateGraph: Updates graph post-commit with new matches
/particleThis: Refines matches into SuperParticles via xAI chat.
/getLibraryDefs: Retrieves library definitions from R2.

### Cloudflare R2:
#### Purpose: 
Stores graphs, particles, and library definitions.

#### Structure:
graphs/${projectId}.json: Full project graphs.
particles/${projectId}/${filePath}.json: Individual file metadata.
libraryDefs/${libraryName}.json: Preloaded defs (e.g., react.json with useState).
Size: ~1MB for library defs, scalable for graphs/particles.

### Cloudflare Pages: 
Purpose: Hosts the web app with advanced chat UI.
Features: Displays graph essential information, library insights, SuperParticle suggestions; allows refinement via chat.

#### Tech: 
Vite, Mantine, Unitsyles,  REST API calls to Worker.

## Model Context Protocol (MCP):
Purpose: Delivers graph context to IDE AI (e.g., Cursor).
Implementation: uses /listGraph /loadGraph with standardized MCP requests (e.g., ReadResourceRequest).
Transport: HTTP stateless (future-proofed for MCP’s upcoming support).

## Library Definition Matching: 
Matches codebase functions (e.g., useState) to R2-stored library defs, enhancing graph accuracy.

## xAI via AI Gateway:
Purpose: Powers the chat UI for SuperParticle refinement.
Integration: Called via Worker’s /particleThis, processes graph data and user input.

## SuperParticle Creation: 
Refines matches into intent-rich SuperParticles (e.g., “setUserAddress: Handles user-defined addresses using React’s useState”).

## GitHub Integration:
Purpose: Source of codebase files and change notifications.
Features: OAuth for repo access, webhooks for commit triggers.

## Lemon Squeezy:
Subscription management ($5/month/user, 1 project; free tier).

## User Flow
User signs up via the web app, grants GitHub access.

- Worker fetches files and parses them with Babel
- matches functions to library definitions,
- creates the graph.

IDE Usage with MCP:
MCP client in the IDE fetches the graph using ReadResourceRequest.

Graph Update:
Webhook triggers the Worker to update the graph on commit.

Refinement:
User refines the graph in the web app’s chat UI, creating SuperParticles.








Suggestions: 


Expose More Resources:
Beyond graphs, expose library definitions and SuperParticles as MCP resources. This allows the LLM to access more context about your codebase (e.g., “What does useState do in React?”).
- MCP Flexibility: Use MCP’s extensibility to expose particles as resources alongside graphs.
- MCP servers can support various capabilities, such as file operations, database access, or API integration. Your ParticleGraph server currently provides graph data, but you could extend it to:
Expose library definitions as resources (e.g., libraryDefs/react.json).

Leverage Cloudflare’s Ecosystem:
The X post (ID 0) suggests MCP works well with Cloudflare Durable Objects. You could use Durable Objects to store graph state persistently, ensuring consistency across requests, though this might not be necessary for your stateless use case.