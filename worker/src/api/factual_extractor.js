// worker/src/api/factual_extractor.js
export async function extractFactualMetadata(content) {
    const metadata = {
      strings: [],
      numbers: [],
      dates: [],
      length: content.length,
    };
  
    // Extract strings (e.g., quoted text)
    const stringRegex = /"([^"]*)"/g;
    let match;
    while ((match = stringRegex.exec(content)) !== null) {
      metadata.strings.push(match[1]);
    }
  
    // Extract numbers
    const numberRegex = /\b\d+\b/g;
    while ((match = numberRegex.exec(content)) !== null) {
      metadata.numbers.push(parseInt(match[0], 10));
    }
  
    // Extract dates (basic ISO-like format: YYYY-MM-DD)
    const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
    while ((match = dateRegex.exec(content)) !== null) {
      metadata.dates.push(match[0]);
    }
  
    console.log("Factual metadata extracted:", metadata);
    return metadata;
  }