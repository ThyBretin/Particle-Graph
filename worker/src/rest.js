// src/rest.js
import { createGraph, loadGraph } from "./api/graph.js";
import { particleThis } from "./api/particle.js";
import { verifyToken } from "./api/auth.js";
import { extractFactualMetadata } from "./api/factual_extractor.js";
import { extractInferredMetadata } from "./api/inferred_extractor.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function authenticate(request, env) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  console.log("Raw Authorization header:", authHeader);
  console.log("Extracted token:", token);

  const kvKey = `token:${token}`;
  const kvValue = await env.KV.get(kvKey);
  console.log("KV key checked:", kvKey);
  console.log("KV value retrieved:", kvValue);

  const isValid = await verifyToken(token, env);
  console.log("verifyToken result:", isValid);

  if (!token || !isValid) {
    console.log("Auth failed - Token present:", !!token, "Valid:", isValid);
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }
  console.log("Token verified, proceeding...");
  return null;
}

export async function handleRestRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.pathname === "/testKV" && request.method === "GET") {
    const kvValue = await env.KV.get("token:test-token");
    console.log("testKV - KV value:", kvValue);
    return new Response(kvValue || "KV not found", { headers: corsHeaders });
  }
  if (url.pathname === "/testGithubToken" && request.method === "GET") {
    const githubToken = await env.KV.get("github:token");
    console.log("Test GitHub token fetch:", githubToken ? "present" : "null");
    return new Response(githubToken || "No token found", { headers: corsHeaders });
  }
  if (url.pathname === "/listKV" && request.method === "GET") {
    const kvList = await env.KV.list();
    console.log("KV keys:", kvList.keys);
    return new Response(JSON.stringify(kvList.keys), { headers: corsHeaders });
  }

  const authResponse = await authenticate(request, env);
  if (authResponse) return authResponse;

  if (url.pathname === "/createGraph" && request.method === "POST") {
    try {
      const body = await request.json();
      console.log("createGraph request body:", body);
      const { projectId, path, start = 0, limit = 50 } = body; // Add start, limit
      if (!projectId) {
        return new Response("Missing projectId", { status: 400, headers: corsHeaders });
      }
      const graphData = await createGraph(projectId, path, env, start, limit); // Pass them
      return new Response(JSON.stringify(graphData, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.log("createGraph error:", e.message);
      return new Response(`Failed to create graph: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  }

  if (url.pathname === "/extractMetadata" && request.method === "POST") {
    try {
      const path = url.searchParams.get("path") || "home.jsx";
      const r2Object = await env.R2.get(path);
      if (!r2Object) {
        return new Response("File not found in R2", { status: 404, headers: corsHeaders });
      }
      const content = await r2Object.text();
      const factual = await extractFactualMetadata(content);
      const inferred = await extractInferredMetadata(content);
      const metadata = { factual, inferred };
      return new Response(JSON.stringify(metadata, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.log("Metadata extraction error:", e.message);
      return new Response("Invalid content", { status: 400, headers: corsHeaders });
    }
  }

  if (url.pathname === "/loadGraph" && request.method === "POST") { // Change to POST
    try {
      const body = await request.json();
      console.log("loadGraph request body:", body);
      const { projectId, graphName } = body;
      if (!projectId) {
        return new Response("Missing projectId", { status: 400, headers: corsHeaders });
      }
      const graph = await loadGraph(projectId, graphName, env);
      return new Response(JSON.stringify(graph, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.log("loadGraph error:", e.message);
      return new Response(`Graph not found: ${e.message}`, { status: 404, headers: corsHeaders });
    }
  }

  if (url.pathname === "/listGraph" && request.method === "GET") {
    return new Response("Graph list TBD", { headers: corsHeaders });
  }

  if (url.pathname === "/exportGraph" && request.method === "GET") {
    return new Response("Graph export TBD", { headers: corsHeaders });
  }

  if (url.pathname === "/updateGraph" && request.method === "POST") {
    return new Response("Graph update TBD", { headers: corsHeaders });
  }

  if (url.pathname === "/particleThis" && request.method === "POST") {
    try {
      const body = await request.json();
      console.log("particleThis request body:", body);
      const { projectId, filePath, input } = body;
      if (!projectId || !filePath) {
        return new Response("Missing projectId or filePath", { status: 400, headers: corsHeaders });
      }
      const result = await particleThis(projectId, filePath, input, env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.log("particleThis error:", e.message);
      return new Response(`Error: ${e.message}`, { status: 500, headers: corsHeaders });
    }
  }

  if (url.pathname === "/getLibraryDefs" && request.method === "GET") {
    return new Response("Library defs TBD", { headers: corsHeaders });
  }

  if (url.pathname === "/showParticles" && request.method === "GET") {
    return new Response("Particles show TBD", { headers: corsHeaders });
  }

  if (url.pathname === "/appStory" && request.method === "GET") {
    return new Response("App story TBD", { headers: corsHeaders });
  }

  console.log("Route not found:", url.pathname);
  return new Response("Not found", { status: 404, headers: corsHeaders });
}