import { useState, useEffect } from "react";
import axios from "axios";
import { Code, Text } from "@mantine/core";

function App() {
  const [graph, setGraph] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    axios
      .get("https://particlegraph-worker.thy-bretin.workers.dev/loadGraph?path=demo", {
        headers: { Authorization: "Bearer test-token" },
      })
      .then((response) => setGraph(response.data))
      .catch((err) => console.error("Error:", err));

    axios
      .post(
        "https://particlegraph-worker.thy-bretin.workers.dev/extractMetadata?path=home.jsx",
        null,
        { headers: { Authorization: "Bearer test-token" } }
      )
      .then((response) => setMetadata(response.data))
      .catch((err) => console.error("Metadata error:", err));
  }, []);

  return (
    <div>
      <Text size="xl" ta="center">ParticleGraph</Text>
      {graph ? <Code block>{graph}</Code> : <Text>Loading graph...</Text>}
      {metadata ? (
        <Code block>{JSON.stringify(metadata, null, 2)}</Code>
      ) : (
        <Text>Loading metadata...</Text>
      )}
    </div>
  );
}

export default App;