import { parse } from "@babel/parser";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (or specific like "http://localhost:4173")
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function createGraph(request, r2) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "all";
  const code = `function example() { console.log("Hello, ${path}!"); }`;
  const ast = parse(code, { sourceType: "module" });
  const files = { [`src/${path}.js`]: { type: "file", ast: ast.program.body } };
  const manifest = {
    feature: path,
    files,
    tech_stack: { react: "18.3.1" },
    token_count: code.length,
  };
  await r2.put(`${path}_graph.json`, JSON.stringify(manifest));
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export async function loadGraph(request, r2) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) return new Response("Missing path", { status: 400, headers: corsHeaders });
  const obj = await r2.get(`${path}_graph.json`);
  if (!obj) return new Response("Graph not found", { status: 404, headers: corsHeaders });
  const data = await obj.text();
  return new Response(data, {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}