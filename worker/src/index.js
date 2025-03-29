import { verifyToken } from "./api/auth.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Extract token from Authorization header
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || !(await verifyToken(token, env))) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // REST Endpoints (placeholders for now)
    if (url.pathname === "/createGraph" && request.method === "POST") {
      return new Response("Graph creation TBD", { headers: corsHeaders });
    }
    if (url.pathname === "/listGraph" && request.method === "GET") {
      return new Response("Graph list TBD", { headers: corsHeaders });
    }
    if (url.pathname === "/loadGraph" && request.method === "GET") {
      return new Response("Graph load TBD", { headers: corsHeaders });
    }
    if (url.pathname === "/exportGraph" && request.method === "GET") {
      return new Response("Graph export TBD", { headers: corsHeaders });
    }
    if (url.pathname === "/updateGraph" && request.method === "POST") {
      return new Response("Graph update TBD", { headers: corsHeaders });
    }
    if (url.pathname === "/particleThis" && request.method === "POST") {
      return new Response("Particle refinement TBD", { headers: corsHeaders });
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

    // MCP (JSON-RPC)
    if (url.pathname === "/mcp" && request.method === "POST") {
      const jsonRpc = await request.json();
      switch (jsonRpc.method) {
        case "create_graph":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "list_graphs":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "load_graph":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "export_graph":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "update_graph":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "particle_this":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "get_library_defs":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "show_particles":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        case "app_story":
          return new Response(JSON.stringify({ jsonrpc: "2.0", result: "TBD", id: jsonRpc.id }), { headers: corsHeaders });
        default:
          return new Response(JSON.stringify({ jsonrpc: "2.0", error: "Method not found", id: jsonRpc.id }), {
            status: 404,
            headers: corsHeaders,
          });
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};