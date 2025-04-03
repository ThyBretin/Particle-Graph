import { fetchFiles } from "./crawler.js";
import { processParticle } from "./particle.js";

export async function createGraph(projectId, path, env) {
  const githubToken = env.GITHUB_TOKEN || await env.KV.get("github:token");
  console.log("Fetched GitHub token:", githubToken ? "present" : "null");
  if (!githubToken) throw new Error("GitHub token not configured");

  const files = await fetchFiles(projectId, githubToken, 50);
  const graph = { feature: "Repo Graph", files: {}, token_count: 0 };
  let processed = 0;

  for (const filePath of files) {
    const particle = await processParticle(filePath, projectId, githubToken, env);
    if (particle) {
      graph.files[filePath] = { type: particle.type, context: particle.inferred.potentialPurpose };
      graph.token_count += particle.factual?.length || 0;
      processed++;
      console.log(`Progress: ${processed}/${files.length} files processed`);
    }
  }

  const graphKey = `graphs/${projectId}/${path || "full_repo"}.json`;
  await env.R2.put(graphKey, JSON.stringify(graph));
  console.log("Graph created:", graph);
  return graph;
}

export async function loadGraph(projectId, graphName, env) {
  const graphKey = `graphs/${projectId}/${graphName || "full_repo"}.json`;
  const graphObj = await env.R2.get(graphKey);
  if (!graphObj) {
    console.log("Graph not found:", graphKey);
    throw new Error("Graph not found");
  }
  const graph = JSON.parse(await graphObj.text());
  console.log("Loaded graph:", graph);
  return graph;
}