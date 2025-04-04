// worker/src/api/inferred_extractor.js
export async function extractInferredMetadata(content, filePath) { // Add filePath param
  console.log("Inferred content snippet:", content.slice(0, 100));
  const metadata = { imports: [], functions: [], potentialPurpose: "unknown" };

  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    metadata.imports.push(match[1]);
  }

  const functionRegex = /\b(\w+)\s*\(/g;
  while ((match = functionRegex.exec(content)) !== null) {
    if (!metadata.functions.includes(match[1])) metadata.functions.push(match[1]);
  }

  console.log("Checking keywords...");
  if (content.includes("axios") || content.includes("fetch")) {
    metadata.potentialPurpose = "HTTP request handler";
  } else if (filePath && filePath.includes("_layout.jsx")) {
    console.log("Detected Expo layout");
    metadata.potentialPurpose = "Expo route";
  } else if (
    content.includes("useState") ||
    content.includes("useEffect") ||
    content.includes("useRouter") ||
    content.includes("React") ||
    content.includes("<View") ||
    content.includes("react-native") ||
    content.includes("StyleSheet")
  ) {
    console.log("Detected React keywords");
    metadata.potentialPurpose = "React component";
  } else if (content.includes("function") || content.includes("=>")) {
    console.log("Detected function keywords");
    metadata.potentialPurpose = "Utility script";
  } else if (filePath && filePath.includes("unistyles.js")) {
    console.log("Detected Unistyles config");
    metadata.potentialPurpose = "Styling config";
  }
  console.log("Inferred metadata extracted:", metadata);
  return metadata;
}