import React, { Component } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import axios from "axios";

import { dijkstra } from "../Algorithms/dijkstra";
import { astar } from "../Algorithms/astar";
import { bfs } from "../Algorithms/bfs";
import { dfs } from "../Algorithms/dfs";
import { wallFollower } from "../Algorithms/wall_follower";

const algorithms = {
  dijkstra,
  astar,
  bfs,
  dfs,
  wallFollower,
};

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      gridDijkstra: [],
      gridAstar: [],
      gridBfs: [],
      gridDfs: [],
      gridWallFollower: [],
      startNode: null,
      endNode: null,
      singlePath: true,
      isSolving: false,
      mazeSize: 10, // Default size
      dijkstraTime: 0,
      dijkstraVisitedNodes: 0,
      dijkstraVisitedPercentage: 0,
      pathLengthDijkstra: 0,
      astarTime: 0,
      astarVisitedNodes: 0,
      astarVisitedPercentage: 0,
      pathLengthAstar: 0,
      bfsTime: 0,
      bfsVisitedNodes: 0,
      bfsVisitedPercentage: 0,
      pathLengthBfs: 0,
      dfsTime: 0,
      dfsVisitedNodes: 0,
      dfsVisitedPercentage: 0,
      pathLengthDfs: 0,
      wallFollowerTime: 0,
      wallFollowerVisitedNodes: 0,
      wallFollowerVisitedPercentage: 0,
      pathLengthWallFollower: 0,
      dijkstraMemoryUsed: 0,
      astarMemoryUsed: 0,
      bfsMemoryUsed: 0,
      dfsMemoryUsed: 0,
      wallFollowerMemoryUsed: 0,
    };
  }

  componentDidMount() {
    this.fetchMazeData();
  }

  fetchMazeData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/maze", {
        params: {
          mazeSize: this.state.mazeSize,
          singlePath: this.state.singlePath,
        },
      });

      this.setState({
        gridDijkstra: this.addNodeIds(response.data.grids.dijkstra, "dijkstra"),
        gridAstar: this.addNodeIds(response.data.grids.astar, "astar"),
        gridBfs: this.addNodeIds(response.data.grids.bfs, "bfs"),
        gridDfs: this.addNodeIds(response.data.grids.dfs, "dfs"),
        gridWallFollower: this.addNodeIds(
          response.data.grids.wallFollower,
          "wallFollower",
        ),
        gridDijkstraStartNode: response.data.startNodes.dijkstra || {},
        gridDijkstraEndNode: response.data.endNodes.dijkstra || {},
        gridAstarStartNode: response.data.startNodes.astar || {},
        gridAstarEndNode: response.data.endNodes.astar || {},
        gridBfsStartNode: response.data.startNodes.bfs || {},
        gridBfsEndNode: response.data.endNodes.bfs || {},
        gridDfsStartNode: response.data.startNodes.dfs || {},
        gridDfsEndNode: response.data.endNodes.dfs || {},
        gridWallFollowerStartNode: response.data.startNodes.wallFollower || {},
        gridWallFollowerEndNode: response.data.endNodes.wallFollower || {},
      });
    } catch (error) {
      console.error("Error fetching maze data:", error);
    }
  };

  addNodeIds = (grid, algorithmName) => {
    return grid.map((row) =>
      row.map((node) => ({
        ...node,
        id: `grid${algorithmName}-node-${node.x}-${node.y}`,
      })),
    );
  };

  handleSinglePathChange = () => {
    this.setState(
      (prevState) => ({
        singlePath: !prevState.singlePath,
      }),
      this.generateNewMaze,
    );
  };

  handleMazeSizeChange = (event, newValue) => {
    this.setState({ mazeSize: newValue }, this.generateNewMaze);
  };

  generateNewMaze = () => {
    this.fetchMazeData(); // Regenerate maze data
  };

  animateShortestPath(nodesInShortestPathOrder) {
    let i = 0;
    const animate = () => {
      if (i < nodesInShortestPathOrder.length) {
        const node = nodesInShortestPathOrder[i];
        const nodeId = `grid${node.gridId}-node-${node.x}-${node.y}`;
        const nodeElement = document.getElementById(nodeId);

        if (nodeElement) {
          nodeElement.className = "node node-shortest-path";
        } else {
          console.error(`Node element not found for id: ${nodeId}`);
        }

        i++;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, grid) {
    return new Promise((resolve) => {
      let i = 0;
      const animate = () => {
        if (i < visitedNodesInOrder.length) {
          const node = visitedNodesInOrder[i];
          const nodeId = `grid${node.gridId}-node-${node.x}-${node.y}`;
          const nodeElement = document.getElementById(nodeId);

          if (nodeElement) {
            nodeElement.classList.add("node-visited");

            if (
              node.noOfVisits > 1 &&
              visitedNodesInOrder[i + 1] &&
              visitedNodesInOrder[i + 1].PreviousID &&
              this.findNodeByID(grid, visitedNodesInOrder[i + 1].PreviousID)
                .x === node.x &&
              this.findNodeByID(grid, visitedNodesInOrder[i + 1].PreviousID)
                .y === node.y
            ) {
              const hue = 174 + (node.noOfVisits - 1) * 10;
              const lightness = 30 - (node.noOfVisits - 1) * 5;
              nodeElement.style.backgroundColor = `hsl(${hue}, 50%, ${lightness}%)`;
            }
          } else {
            console.error(`Node element not found for id: ${nodeId}`);
          }

          i++;
          requestAnimationFrame(animate);
        } else {
          this.animateShortestPath(nodesInShortestPathOrder);
          resolve();
        }
      };
      animate();
    });
  }

  findNodeByID(grid, id) {
    for (const row of grid) {
      for (const node of row) {
        if (node.id === id) {
          return node;
        }
      }
    }
    return null;
  }

  getNodesInShortestPathOrder(finishNode, grid) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      if (currentNode.PreviousID === 0) {
        break;
      }
      currentNode = this.findNodeByID(
        grid,
        `grid${currentNode.gridId}-node-${currentNode.PreviousID.x}-${currentNode.PreviousID.y}`,
      );
    }
    return nodesInShortestPathOrder;
  }

  visualizeAlgorithms = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/solution", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const results = await response.json();

        const algorithmPromises = Object.keys(results).map((algorithmName) => {
            const algorithmResult = results[algorithmName];
            if (!algorithmResult) {
                console.error(`No result for algorithm: ${algorithmName}`);
                return Promise.resolve();
            }

            const { visitedNodesInOrder, nodesInShortestPathOrder, metrics } = algorithmResult;
            const capitalizedAlgName = algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1);

            // Extract and convert time value
            const rawTimeNs = metrics?.time?.[0];
            let timeInMilliseconds = '0.00';

            if (typeof rawTimeNs === 'number') {
                timeInMilliseconds = (rawTimeNs / 1_000_000).toFixed(2);
            }

            // Extract and convert memoryUsed value
            const rawMemoryUsed = metrics?.memoryUsed?.[0]; // Assuming metrics.memoryUsed is an array with one value
            let memoryUsedInMB = '0.00';

            if (typeof rawMemoryUsed === 'number') {
                memoryUsedInMB = (rawMemoryUsed).toFixed(2); // Directly use rawMemoryUsed if it's in MB already
            }

            // Debugging info
            console.log(`Algorithm: ${algorithmName}`);
            console.log(`Raw time (ns): ${rawTimeNs}`);
            console.log(`Converted time (ms): ${timeInMilliseconds}`);
            console.log(`Raw memory used: ${rawMemoryUsed}`);
            console.log(`Converted memory used (MB): ${memoryUsedInMB}`);

            this.setState({
                [`${algorithmName}Time`]: timeInMilliseconds,
                [`${algorithmName}VisitedNodes`]: visitedNodesInOrder.length,
                [`${algorithmName}VisitedPercentage`]:
                    (visitedNodesInOrder.length /
                      this.countNonWallNodes(this.state[`grid${capitalizedAlgName}`])) *
                    100,
                [`pathLength${capitalizedAlgName}`]: nodesInShortestPathOrder.length,
                [`${algorithmName}MemoryUsed`]: memoryUsedInMB,
            });

            return this.animateAlgorithm(
                visitedNodesInOrder,
                nodesInShortestPathOrder,
                this.state[`grid${capitalizedAlgName}`]
            );
        });

        await Promise.all(algorithmPromises);
    } catch (error) {
        console.error("Error fetching algorithm solution:", error);
    }
};


  countNonWallNodes(grid) {
    const totalNodes = grid.length * grid[0].length;
    const wallNodes = grid.flat().filter((node) => node.isWall).length;
    return totalNodes - wallNodes;
  }

  solve = () => {
    this.setState({ isSolving: true }, () => {
      this.visualizeAlgorithms().then(() => {
        this.setState({ isSolving: false });
      });
    });
  };

  render() {
    const algorithmNames = Object.keys(algorithms);

    return (
      <>
        <button onClick={this.solve} disabled={this.state.isSolving}>
          Solve
        </button>
        <button onClick={this.generateNewMaze}>Generate Maze</button>

        <Switch
          checked={this.state.singlePath}
          onChange={this.handleSinglePathChange}
          color="primary"
        />
        <label>Single Path</label>

        <div style={{ width: "300px", margin: "20px auto" }}>
          <Typography id="maze-size-slider" gutterBottom>
            Maze Size: {this.state.mazeSize}x{this.state.mazeSize}
          </Typography>
          <Slider
            value={this.state.mazeSize}
            onChange={this.handleMazeSizeChange}
            aria-labelledby="maze-size-slider"
            valueLabelDisplay="auto"
            step={10}
            marks
            min={10}
            max={100}
          />
        </div>

        <table className="metrics-table">
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>Time (ms)</th>
      <th>Visited Cells</th>
      <th>Visited Percentage (%)</th>
      <th>Path Length</th>
      <th>Memory Used (MB)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dijkstra</td>
      <td>{this.state.dijkstraTime}</td>
      <td>{this.state.dijkstraVisitedNodes}</td>
      <td>{this.state.dijkstraVisitedPercentage.toFixed(2)}</td>
      <td>{this.state.pathLengthDijkstra}</td>
      <td>{this.state.dijkstraMemoryUsed}</td>
    </tr>
    <tr>
      <td>A*</td>
      <td>{this.state.astarTime}</td>
      <td>{this.state.astarVisitedNodes}</td>
      <td>{this.state.astarVisitedPercentage.toFixed(2)}</td>
      <td>{this.state.pathLengthAstar}</td>
      <td>{this.state.astarMemoryUsed}</td>
    </tr>
    <tr>
      <td>BFS</td>
      <td>{this.state.bfsTime}</td>
      <td>{this.state.bfsVisitedNodes}</td>
      <td>{this.state.bfsVisitedPercentage.toFixed(2)}</td>
      <td>{this.state.pathLengthBfs}</td>
      <td>{this.state.bfsMemoryUsed}</td>
    </tr>
    <tr>
      <td>DFS</td>
      <td>{this.state.dfsTime}</td>
      <td>{this.state.dfsVisitedNodes}</td>
      <td>{this.state.dfsVisitedPercentage.toFixed(2)}</td>
      <td>{this.state.pathLengthDfs}</td>
      <td>{this.state.dfsMemoryUsed}</td>
    </tr>
    <tr>
      <td>Wall Follower</td>
      <td>{this.state.wallFollowerTime}</td>
      <td>{this.state.wallFollowerVisitedNodes}</td>
      <td>{this.state.wallFollowerVisitedPercentage.toFixed(2)}</td>
      <td>{this.state.pathLengthWallFollower}</td>
      <td>{this.state.wallFollowerMemoryUsed}</td>
    </tr>
  </tbody>
</table>

        <div className="grid-container">
          {algorithmNames.map((algorithmName) => {
            const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
            const grid = this.state[gridKey];
            if (!grid || grid.length === 0) {
              return <div key={algorithmName}>Loading...</div>;
            }

            return (
              <div className="grid" key={algorithmName}>
                <h1>{algorithms[algorithmName].name} algorithm</h1>
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.map((node, nodeIndex) => {
                      const { x, y, isEnd, isStart, isWall, gridId } = node;
                      return (
                        <Node
                          key={nodeIndex}
                          col={x}
                          row={y}
                          isEnd={isEnd}
                          isStart={isStart}
                          isWall={isWall}
                          gridId={gridId}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}