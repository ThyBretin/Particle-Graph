var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/api/auth.js
async function verifyToken(token, env) {
  const valid = await env.KV.get(`token:${token}`);
  return valid === "valid";
}
__name(verifyToken, "verifyToken");

// src/index.js
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || !await verifyToken(token, env)) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
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
            headers: corsHeaders
          });
      }
    }
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-76zFZu/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-76zFZu/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
