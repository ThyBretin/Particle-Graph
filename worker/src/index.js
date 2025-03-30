import { createGraph, loadGraph } from "./api/graph.js";
import { particleThis } from "./api/particle.js";
import { verifyToken } from "./api/auth.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Test KV endpoint (no auth required)
    if (url.pathname === "/testKV" && request.method === "GET") {
      const kvValue = await env.KV.get("token:test-token");
      console.log("testKV - KV value:", kvValue);
      return new Response(kvValue || "KV not found", { headers: corsHeaders });
    }

    // Auth check for all other endpoints
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

    // REST Endpoints
    if (url.pathname === "/createGraph" && request.method === "POST") {
      return await createGraph(request, env.R2, corsHeaders);
    }

    if (url.pathname === "/listGraph" && request.method === "GET") {
      return new Response("Graph list TBD", { headers: corsHeaders });
    }

    if (url.pathname === "/loadGraph" && request.method === "GET") {
      return await loadGraph(request, env.R2, corsHeaders);
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

    // MCP (JSON-RPC) Endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
      try {
        const jsonRpc = await request.json();
        console.log("MCP request:", jsonRpc);
        switch (jsonRpc.method) {
          case "create_graph":
            return new Response(
              JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }),
              { headers: corsHeaders }
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
              JSON.stringify({
                jsonrpc: "2.0",
                error: { code: -32601, message: "Method not found" },
                id: jsonRpc.id,
              }),
              { status: 404, headers: corsHeaders }
            );
        }
      } catch (e) {
        console.log("MCP error:", e.message);
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32700, message: "Parse error" },
            id: null,
          }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    console.log("Route not found:", url.pathname);
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};