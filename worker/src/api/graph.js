// worker/src/api/graph.js
import { parseCode } from "../utils/parser.js";
import { extractFactualMetadata } from "./factual_extractor.js";
import { extractInferredMetadata } from "./inferred_extractor.js";
import axios from "axios";

export async function createGraph(projectId, path, env) {
  if (!projectId) throw new Error("Missing projectId");

  const githubToken = env.GITHUB_TOKEN || await env.KV.get("github:token");
  console.log("Fetched GitHub token:", githubToken ? "present" : "null");
  if (!githubToken) throw new Error("GitHub token not configured");

  const repoUrl = `${env.GITHUB_API}/repos/${projectId}/contents${path ? `/${path}` : ""}`;
  let files;
  try {
    const response = await axios.get(repoUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "ParticleGraph-Worker/1.0",
      },
    });
    console.log("GitHub API response:", response.data);
    files = Array.isArray(response.data) ? response.data.filter(f => f.type === "file").map(f => f.path) : [path];
  } catch (e) {
    console.log("GitHub API error:", e.response?.status, e.response?.data || e.message);
    throw new Error(`Failed to fetch repo contents: ${e.message}`);
  }

  const graph = { feature: "Repo Graph", files: {}, token_count: 0 };

  for (const filePath of files) {
    const r2Key = `particles/${projectId}/${filePath}.json`;
    const existing = await env.R2.get(r2Key);

    let particle;
    if (existing) {
      particle = JSON.parse(await existing.text());
    } else {
      try {
        const { particle: parsedParticle } = await parseCode({ filePath, projectId, token: githubToken, env });
        console.log("Parsed particle for", filePath, ":", parsedParticle); // Debug particle
        const content = parsedParticle.content || "console.log('mock');";
        console.log("Content passed to extractors:", content.slice(0, 100)); // Debug content
        const factual = await extractFactualMetadata(content);
        const inferred = await extractInferredMetadata(content);
        particle = { ...parsedParticle, factual, inferred };
        await env.R2.put(r2Key, JSON.stringify(particle));
      } catch (e) {
        console.log("Particle creation error for", filePath, ":", e.message);
        continue;
      }
    }

    graph.files[filePath] = { type: particle.type, context: particle.inferred.potentialPurpose };
    graph.token_count += particle.factual?.length || 0;
  }

  const graphKey = `graphs/${projectId}/${path || "full_repo"}.json`;
  await env.R2.put(graphKey, JSON.stringify(graph));

  console.log("Graph created:", graph);
  return graph;
}

export async function loadGraph(request, r2, headers) {
  return new Response("Graph load TBD", { headers });
}