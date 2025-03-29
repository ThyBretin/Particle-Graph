import { parseCode } from "../utils/parser.js";
import { encrypt, decrypt } from "../utils/crypto.js";

export async function createGraph(request, r2, headers) {
  const url = typeof request === "string" ? new URL(request) : new URL(request.url);
  const token = request.token || request.headers.get("Authorization");
  const path = url.searchParams.get("path") || request.path;
  const projectId = url.searchParams.get("projectId") || request.projectId;

  const { ast } = await parseCode({ filePath: path, projectId, token, env: request.env });
  const manifest = {
    feature: path,
    files: { [path]: { type: path.endsWith(".jsx") || path.endsWith(".tsx") ? "component" : "file", ast: ast.program.body } },
    token_count: ast.tokens.length,
  };
  const encrypted = encrypt(JSON.stringify(manifest), token);
  await r2.put(`graphs/${projectId}/${path}.json`, encrypted);
  return manifest;
}

export async function loadGraph(request, r2, headers) {
  const url = typeof request === "string" ? new URL(request) : new URL(request.url);
  const token = request.token || request.headers.get("Authorization");
  const projectId = url.searchParams.get("projectId") || request.projectId;
  const graphName = url.searchParams.get("graphName") || request.graphName;
  const obj = await r2.get(`graphs/${projectId}/${graphName}.json`);
  const encrypted = obj ? await obj.text() : null;
  const data = encrypted ? decrypt(encrypted, token) : null;
  return data ? JSON.parse(data) : null;
}