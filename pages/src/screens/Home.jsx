import { useState, useEffect } from "react";
import axios from "axios";
import { Code, Text } from "@mantine/core";

function App() {
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8787/loadGraph?path=demo", {
        headers: { Authorization: "Bearer test-token" },
      })
      .then((response) => {
        setGraph(response.data);
        console.log("Set graph:", response.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <div>
      <Text size="xl" ta="center">ParticleGraph</Text>
      {graph ? (
        <Code block>{JSON.stringify(graph, null, 2)}</Code>
      ) : (
        <Text>Loading...</Text>
      )}
    </div>
  );
}

export default App;