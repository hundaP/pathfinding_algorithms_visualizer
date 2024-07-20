import React, { useEffect, useState, useRef } from 'react';
import PathfindingVisualizer from './PathfindingVisualizer/PathfindingVisualizer';
import { parse } from 'papaparse';

function App() {
  const [mazeSize, setMazeSize] = useState(0);
  const [numTests, setNumTests] = useState(0);
  const [output, setOutput] = useState('');
  const [csvData, setCsvData] = useState([]);
  const ws = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (ws.current) {
      ws.current.send(JSON.stringify({ mazeSize, numTests }));
    }
  };

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.data) {
          // This is the CSV data
          const results = parse(message.data, { header: true });
          setCsvData(results.data);
        } else {
          // This is the console output
          setOutput(prevOutput => prevOutput + '\n' + message);
        }
      } catch (error) {
        // If the message is not valid JSON, treat it as a string
        setOutput(prevOutput => prevOutput + '\n' + event.data);
      }
    };

    return () => ws.current.close();
  }, []);

  return (
    <div className="testRunner">
      <form onSubmit={handleSubmit}>
        <label>
          Maze Size:
          <input type="range" min="10" max="1000" step="5" value={mazeSize} onChange={e => setMazeSize(e.target.value)} onInput={e => e.target.nextSibling.value = e.target.value} />
          <output>{mazeSize}</output>
          <p>Current size: {mazeSize}</p>
        </label>
        <label>
          Number of Tests:
          <input type="number" value={numTests} onChange={e => setNumTests(e.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
      <textarea readOnly value={output} />
      <table>
        <thead>
          <tr>
            {csvData[0] && Object.keys(csvData[0]).map((heading, index) => <th key={index}>{heading}</th>)}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((cell, index) => <td key={index}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="App">
        <PathfindingVisualizer></PathfindingVisualizer>
      </div>
    </div >
  );
}

export default App;
