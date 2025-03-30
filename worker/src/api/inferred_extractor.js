export async function extractInferredMetadata(content) {
    const metadata = {
      imports: [],
      functions: [],
      potentialPurpose: "unknown",
    };
  
    // Extract imports (e.g., `import ... from ...`)
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      metadata.imports.push(match[1]);
    }
  
    // Extract function calls (e.g., `foo()`)
    const functionRegex = /\b(\w+)\s*\(/g;
    while ((match = functionRegex.exec(content)) !== null) {
      if (!metadata.functions.includes(match[1])) {
        metadata.functions.push(match[1]);
      }
    }
  
    // Guess purpose based on keywords
    if (content.includes("axios") || content.includes("fetch")) {
      metadata.potentialPurpose = "HTTP request handler";
    } else if (content.includes("useState") || content.includes("useEffect")) {
      metadata.potentialPurpose = "React component";
    }
  
    console.log("Inferred metadata extracted:", metadata);
    return metadata;
  }