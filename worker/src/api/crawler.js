import axios from "axios";

async function loadGitignore(projectId, token) {
  try {
    const url = `https://api.github.com/repos/${projectId}/contents/.gitignore`;
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}`, "User-Agent": "ParticleGraph-Worker/1.0" } });
    console.log("Gitignore fetch status:", response.status);
    const decoded = atob(response.data.content.replace(/\n/g, ""));
    return decoded.split("\n").filter(line => line && !line.startsWith("#"));
  } catch (e) {
    console.log("Gitignore fetch failed:", e.response?.status, e.message);
    return [".git", "node_modules", "dist", "build"];
  }
}

export async function fetchFiles(projectId, token, limit = 50) {
  const url = `https://api.github.com/repos/${projectId}/git/trees/master?recursive=1`;
  const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}`, "User-Agent": "ParticleGraph-Worker/1.0" } });
  console.log("Fetched repo tree:", response.data.truncated ? "Truncated" : "Full", response.data.tree.length, "items");
  const allFiles = response.data.tree
    .filter(item => item.type === "blob" && (item.path.endsWith(".js") || item.path.endsWith(".jsx")))
    .map(item => item.path);
  const gitignorePatterns = await loadGitignore(projectId, token);
  const files = allFiles.filter(filePath => {
    const parts = filePath.split("/");
    return !gitignorePatterns.some(pattern => parts.some(part => part === pattern || filePath.includes(pattern)));
  }).slice(0, limit);
  console.log("Filtered files to process:", files.length, "files");
  return files;
}