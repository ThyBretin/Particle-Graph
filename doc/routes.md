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
  return null; // Proceed
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.pathname === "/testKV" && request.method === "GET") {
    const kvValue = await env.KV.get("token:test-token");
    console.log("testKV - KV value:", kvValue);
    return new Response(kvValue || "KV not found", { headers: corsHeaders });
  }

  const authResponse = await authenticate(request, env);
  if (authResponse) return authResponse;

  // REST Endpoints
  if (url.pathname === "/createGraph" && request.method === "POST") {
    try {
      const { projectId, path } = await request.json();
      if (!projectId) {
        return new Response("Missing projectId", { status: 400, headers: corsHeaders });
      }
      const graphData = await createGraph(projectId, path, env);
      return new Response(JSON.stringify(graphData, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.log("createGraph error:", e.message);
      return new Response("Failed to create graph", { status: 500, headers: corsHeaders });
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

  if (url.pathname === "/loadGraph" && request.method === "GET") {
    return await loadGraph(request, env.R2, corsHeaders);
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
    return await particleThis(request, env.R2, corsHeaders);
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

  // MCP Endpoint
  if (url.pathname === "/mcp" && request.method === "POST") {
    try {
      const jsonRpc = await request.json();
      console.log("MCP request:", jsonRpc);
      switch (jsonRpc.method) {
        case "create_graph":
          const { projectId, path } = jsonRpc.params || {};
          if (!projectId) {
            return new Response(
              JSON.stringify({ jsonrpc: "2.0", error: { code: -32602, message: "Missing projectId" }, id: jsonRpc.id }),
              { status: 400, headers: corsHeaders }
            );
          }
          const graphData = await createGraph(projectId, path, env);
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", result: graphData, id: jsonRpc.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        case "list_graphs":
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }),
            { headers: corsHeaders }
          );
        case "load_graph":
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }),
            { headers: corsHeaders }
          );
        default:
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", error: { code: -32601, message: "Method not found" }, id: jsonRpc.id }),
            { status: 404, headers: corsHeaders }
          );
      }
    } catch (e) {
      console.log("MCP error:", e.message);
      return new Response(
        JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }),
        { status: 400, headers: corsHeaders }
      );
    }
  }

  console.log("Route not found:", url.pathname);
  return new Response("Not found", { status: 404, headers: corsHeaders });
}