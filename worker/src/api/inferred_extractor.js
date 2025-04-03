// worker/src/api/inferred_extractor.js
export async function extractInferredMetadata(content) {
  console.log("Inferred content snippet:", content.slice(0, 100)); // Debug content
  const metadata = {
    imports: [],
    functions: [],
    potentialPurpose: "unknown",
  };

  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    metadata.imports.push(match[1]);
  }

  const functionRegex = /\b(\w+)\s*\(/g;
  while ((match = functionRegex.exec(content)) !== null) {
    if (!metadata.functions.includes(match[1])) {
      metadata.functions.push(match[1]);
    }
  }

  console.log("Checking keywords..."); // Debug checks
  if (content.includes("axios") || content.includes("fetch")) {
    console.log("Detected HTTP keywords");
    metadata.potentialPurpose = "HTTP request handler";
  } else if (
    content.includes("useState") ||
    content.includes("useEffect") ||
    content.includes("useRouter") ||
    content.includes("React") ||
    content.includes("<View")
  ) {
    console.log("Detected React keywords");
    metadata.potentialPurpose = "React component";
  } else if (content.includes("function") || content.includes("=>")) {
    console.log("Detected function keywords");
    metadata.potentialPurpose = "Utility script";
  }

  console.log("Inferred metadata extracted:", metadata);
  return metadata;
}