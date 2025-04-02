import { createGraph } from "./api/graph.js";
import { verifyToken } from "./api/auth.js";

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

export async function handleMcpRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResponse = await authenticate(request, env);
  if (authResponse) return authResponse;

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