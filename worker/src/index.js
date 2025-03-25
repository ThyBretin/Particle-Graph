export default {
    async fetch(request, env) {
      const url = new URL(request.url);
  
      if (url.pathname === "/createGraph") {
        const path = url.searchParams.get("path") || "all";
        const manifest = await createGraph(path, env.R2);
        return new Response(JSON.stringify(manifest), {
          headers: { "Content-Type": "application/json" },
        });
      }
  
      if (url.pathname === "/loadGraph") {
        const path = url.searchParams.get("path");
        if (!path) return new Response("Missing path", { status: 400 });
        const obj = await env.R2.get(`${path}_graph.json`);
        if (!obj) return new Response("Graph not found", { status: 404 });
        const data = await obj.text();
        return new Response(data, {
          headers: { "Content-Type": "application/json" },
        });
      }
  
      return new Response("Not found", { status: 404 });
    },
  };
  
  async function createGraph(path, r2) {
    // Mock graph creation—replace with Babel parsing later
    const files = [{ path: "mock/file.js", type: "file" }];
    const manifest = {
      feature: path,
      files: { primary: files, shared: [] },
      tech_stack: { react: "18.3.1" },
      file_count: files.length,
    };
    await r2.put(`${path}_graph.json`, JSON.stringify(manifest));
    return manifest;
  }