import { parseCode } from "../utils/parser.js";
import { extractFactualMetadata } from "./factual_extractor.js"; // Fix: "./" not "../utils/"
import { extractInferredMetadata } from "./inferred_extractor.js"; 

export async function processParticle(filePath, projectId, token, env) {
  const r2Key = `particles/${projectId}/${filePath}.json`;
  const existing = await env.R2.get(r2Key);
  if (existing) {
    const particle = JSON.parse(await existing.text());
    console.log("Loaded existing particle for", filePath);
    return particle;
  }
  try {
    const { particle: parsedParticle } = await parseCode({ filePath, projectId, token, env });
    const content = parsedParticle.content || "console.log('mock');";
    const factual = await extractFactualMetadata(content);
    const inferred = await extractInferredMetadata(content, filePath); // Pass filePath
    const particle = { ...parsedParticle, factual, inferred };
    await env.R2.put(r2Key, JSON.stringify(particle));
    console.log("Saved new particle for", filePath);
    return particle;
  } catch (e) {
    console.log("Particle creation error for", filePath, ":", e.message);
    return null;
  }
}

export async function particleThis(projectId, filePath, input, env) {
  try {
    const r2Key = `particles/${projectId}/${filePath}.json`;
    let particle = await env.R2.get(r2Key);
    console.log("Fetching particle from R2:", r2Key);

    if (!particle) {
      console.log("Particle not found, creating:", filePath);
      const githubToken = env.GITHUB_TOKEN || await env.KV.get("github:token");
      if (!githubToken) throw new Error("No GitHub token");
      particle = await processParticle(filePath, projectId, githubToken, env);
      if (!particle) throw new Error("Failed to create particle");
    } else {
      particle = JSON.parse(await particle.text());
      console.log("Loaded particle:", filePath);
    }

    if (input) {
      console.log("Refining particle with input:", input);
      const superParticle = { ...particle, refined: `Refined with: ${input}` };
      const superKey = `superParticles/${projectId}/${filePath}.json`;
      await env.R2.put(superKey, JSON.stringify(superParticle));
      console.log("Saved SuperParticle:", superKey);
      return superParticle;
    }
    console.log("Returning existing particle:", filePath);
    return particle;
  } catch (e) {
    console.log("particleThis error:", e.message);
    throw new Error(`Particle processing failed: ${e.message}`);
  }
}