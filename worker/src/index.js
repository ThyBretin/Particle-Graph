import { createGraph, loadGraph } from "./api/graph.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/createGraph") {
      return await createGraph(request, env.R2);
    }
    if (url.pathname === "/loadGraph") {
      return await loadGraph(request, env.R2);
    }
    return new Response("Not found", { status: 404 });
  },
};