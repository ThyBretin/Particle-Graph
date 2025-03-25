import { useState, useEffect } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    fetch("<worker-url>/loadGraph?path=test") // Replace with your Worker URL after deploy
      .then((res) => res.json())
      .then((data) => setGraph(data))
      .catch((err) => console.error("Graph fetch failed:", err));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Graph: {graph ? graph.feature : "Loading..."}</p>
        <p>
          Edit <code>src/screens/Home.jsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;