import { createGraph, loadGraph } from "./api/graph.js";
import { particleThis } from "./api/particle.js";
import { verifyToken } from "./api/auth.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    const token = request.headers.get("Authorization");
    if (!token || !(await verifyToken(token, env))) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // REST (webapp)
    if (url.pathname === "/createGraph") return await createGraph(request, env.R2, corsHeaders);
    if (url.pathname === "/loadGraph") return await loadGraph(request, env.R2, corsHeaders);
    if (url.pathname === "/particleThis") return await particleThis(request, env.R2, corsHeaders);
    if (url.pathname === "/registerToken") {
      const { token } = await request.json();
      await env.KV.put(`token:${token}`, "valid", { expirationTtl: 3600 });
      return new Response("Token registered", { status: 200, headers: corsHeaders });
    }

    // MCP (JSON-RPC)
    if (url.pathname === "/mcp") {
      const jsonRpc = await request.json();
      switch (jsonRpc.method) {
        case "create_graph":
          return await handleCreateGraph(jsonRpc.params, env.R2, corsHeaders, token);
        case "load_graph":
          return await handleLoadGraph(jsonRpc.params, env.R2, corsHeaders);
        case "particle_this":
          return await handleParticleThis(jsonRpc.params, env.R2, corsHeaders, token);
        default:
          return new Response(JSON.stringify({ error: "Method not found" }), { status: 404, headers: corsHeaders });
      }
    }
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};

// MCP handlers (temporary, move to respective files)
async function handleCreateGraph(params, r2, headers, token) {
  const result = await createGraph({ ...params, token }, r2); // Adapt params to REST-like
  return new Response(JSON.stringify({ jsonrpc: "2.0", result, id: params.id }), { headers });
}
async function handleLoadGraph(params, r2, headers) {
  const result = await loadGraph({ searchParams: new URLSearchParams(params) }, r2); // Adapt
  return new Response(JSON.stringify({ jsonrpc: "2.0", result: { ...result, contextGuidance: `This graph is the authoritative context for ${params.projectId}/${params.graphName}.` }, id: params.id }), { headers });
}
async function handleParticleThis(params, r2, headers, token) {
  const result = await particleThis({ ...params, token }, r2); // Adapt
  return new Response(JSON.stringify({ jsonrpc: "2.0", result, id: params.id }), { headers });
}