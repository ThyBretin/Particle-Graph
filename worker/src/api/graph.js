import { parseCode } from "../utils/parser.js";
import { encrypt, decrypt } from "../utils/crypto.js";

export async function createGraph(request, r2, headers) {
  return new Response("Graph creation TBD", { headers });
}

export async function loadGraph(request, r2, headers) {
  return new Response("Graph load TBD", { headers });
}