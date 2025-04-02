// worker/src/api/graph.js
import { parseCode } from "../utils/parser.js";
import { extractFactualMetadata } from "./factual_extractor.js";
import { extractInferredMetadata } from "./inferred_extractor.js";

export async function createGraph(projectId, path, env) {
  if (!projectId) throw new Error("Missing projectId");

  // Mock GitHub repo files (replace with real API later)
  const files = path ? [path] : ["src/screens/Home.jsx", "src/index.js"];
  const graph = { feature: "Initial Graph", files: {}, token_count: 0 };

  for (const filePath of files) {
    let content;
    const r2Key = `particles/${projectId}/${filePath}.json`;
    const existing = await env.R2.get(r2Key);

    if (existing) {
      content = JSON.parse(await existing.text()).factual.content || "console.log('mock');";
    } else {
      // Mock content fetch (later: GitHub API via parser.js)
      content = filePath === "src/screens/Home.jsx" ? await env.R2.get("home.jsx").then(r => r.text()) : "console.log('mock');";
    }

    const factual = await extractFactualMetadata(content);
    const inferred = await extractInferredMetadata(content);
    const particle = { factual, inferred };

    // Store Particle in R2
    await env.R2.put(r2Key, JSON.stringify(particle));

    // Add to graph
    graph.files[filePath] = { type: filePath.endsWith(".jsx") ? "component" : "script", context: inferred.potentialPurpose };
    graph.token_count += content.length; // Rough token estimate
  }

  // Store Graph in R2
  const graphKey = `graphs/${projectId}/${path || "full_repo"}.json`;
  await env.R2.put(graphKey, JSON.stringify(graph));

  console.log("Graph created:", graph);
  return graph;
}

export async function loadGraph(request, r2, headers) {
  return new Response("Graph load TBD", { headers });
}