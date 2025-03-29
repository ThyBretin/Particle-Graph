import { parseCode } from "../utils/parser.js";
import { encrypt, decrypt } from "../utils/crypto.js";

export async function particleThis(request, r2, headers) {
  const url = typeof request === "string" ? new URL(request) : new URL(request.url);
  const token = request.token || request.headers.get("Authorization");
  const projectId = url.searchParams.get("projectId") || request.projectId;
  const filePath = url.searchParams.get("filePath") || request.filePath;
  const input = url.searchParams.get("input") || request.input;

  let particle;
  const existing = await r2.get(`particles/${projectId}/${filePath}.json`);
  if (!existing) {
    const { particle: parsedParticle } = await parseCode({ filePath, projectId, token, env: request.env });
    particle = parsedParticle;
    await r2.put(`particles/${projectId}/${filePath}.json`, encrypt(JSON.stringify(particle), token));
  } else {
    particle = JSON.parse(decrypt(await existing.text(), token));
  }

  // Refine with xAI (placeholder)
  const refined = { ...particle, refinedBy: "xAI", input };
  await r2.put(`superParticles/${projectId}/${filePath}.json`, encrypt(JSON.stringify(refined), token));
  return refined;
}