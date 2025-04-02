import { handleRestRequest } from "./rest.js";
import { handleMcpRequest } from "./mcp.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") {
      return await handleMcpRequest(request, env);
    }
    return await handleRestRequest(request, env);
  },
};