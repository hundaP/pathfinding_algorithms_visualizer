import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

// Algorithms
import { dijkstra } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';
import { bfs } from '../Algorithms/bfs';
import { dfs } from '../Algorithms/dfs';
import { wallFollower } from '../Algorithms/wall_follower';
import { generateMaze } from '../Algorithms/mazeGenerator';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./pathfinding.worker.js';

const algorithms = {
  dijkstra,
  astar,
  bfs,
  dfs,
  wallFollower
};

const MAX_WORKERS = navigator.hardwareConcurrency || 4;

let activeWorkers = 0;

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
      mazeSize: 31, // Default size
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
    };
  }

  componentDidMount() {
    this.generateNewMaze();
  }

  componentDidUpdate(prevProps, prevState) {
    const algorithmNames = Object.keys(algorithms);
    algorithmNames.forEach(name => {
      const timeKey = `${name}Time`;
      const visitedNodesKey = `${name}VisitedNodes`;
      const visitedPercentageKey = `${name}VisitedPercentage`;
      const pathLengthKey = `pathLength${name.charAt(0).toUpperCase() + name.slice(1)}`;
  
      if (
        this.state[timeKey] !== prevState[timeKey] ||
        this.state[visitedNodesKey] !== prevState[visitedNodesKey] ||
        this.state[visitedPercentageKey] !== prevState[visitedPercentageKey] ||
        this.state[pathLengthKey] !== prevState[pathLengthKey]
      ) {
        console.log(`${name} metrics updated:`, {
          time: this.state[timeKey],
          visitedNodes: this.state[visitedNodesKey],
          visitedPercentage: this.state[visitedPercentageKey],
          pathLength: this.state[pathLengthKey]
        });
      }
    });
  }

  getInitialGrid(numOfRows, numOfCols, singlePath) {
    const { gridDijsktra, gridAstar, gridBfs, gridDfs, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBfsStartNode, gridBfsEndNode, gridDfsStartNode, gridDfsEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = generateMaze(numOfRows, numOfCols, singlePath);
    return {
      gridDijkstra: gridDijsktra,
      gridAstar: gridAstar,
      gridBfs: gridBfs,
      gridDfs: gridDfs,
      gridWallFollower,
      gridDijkstraStartNode: gridDijkstraStartNode,
      gridDijkstraEndNode: gridDijkstraEndNode,
      gridAstarStartNode: gridAstarStartNode,
      gridAstarEndNode: gridAstarEndNode,
      gridBfsStartNode: gridBfsStartNode,
      gridBfsEndNode: gridBfsEndNode,
      gridDfsStartNode: gridDfsStartNode,
      gridDfsEndNode: gridDfsEndNode,
      gridWallFollowerStartNode: gridWallFollowerStartNode,
      gridWallFollowerEndNode: gridWallFollowerEndNode,
    };
  }

  handleSinglePathChange = () => {
    this.setState(prevState => ({
      singlePath: !prevState.singlePath
    }), this.generateNewMaze);
  }

  handleMazeSizeChange = (event, newValue) => {
    this.setState({ mazeSize: newValue }, this.generateNewMaze);
  }

  resetState = () => {
    this.setState({
      gridDijkstra: [],
      gridAstar: [],
      gridBfs: [],
      gridDfs: [],
      gridWallFollower: [],
      startNode: null,
      endNode: null,
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
    });
  };

  generateNewMaze = () => {
    this.resetState(); // Reset state before generating new maze
    const initialGrid = this.getInitialGrid(this.state.mazeSize, this.state.mazeSize, this.state.singlePath); // Regenerate maze data
    this.setState(initialGrid); // Update state with the new grid and nodes
  };

  animateShortestPath(nodesInShortestPathOrder) {
    let i = 0;
    const animate = () => {
      if (i < nodesInShortestPathOrder.length) {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-shortest-path';
        i++;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    return new Promise(resolve => {
      let i = 0;
      const animate = () => {
        if (i < visitedNodesInOrder.length) {
          const node = visitedNodesInOrder[i];
          const nodeElement = document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`);
          nodeElement.classList.add('node', 'node-visited');
          if (node.noOfVisits > 1 && visitedNodesInOrder[i + 1] === node.previousNode) {
            const hue = 174 + (node.noOfVisits - 1) * 10;
            const lightness = 30 - (node.noOfVisits - 1) * 5;
            nodeElement.style.backgroundColor = `hsl(${hue}, 50%, ${lightness}%)`;
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

  waitForWorkerSpot() {
    return new Promise(resolve => {
      if (activeWorkers >= MAX_WORKERS) {
        console.log('Reached maximum limit of active workers. Waiting for a worker spot to be freed...');
      }
      const intervalId = setInterval(() => {
        if (activeWorkers < MAX_WORKERS) {
          clearInterval(intervalId);
          console.log('A worker spot has been freed. Resuming execution...');
          resolve();
        }
      }, 10);
    });
  }

  visualizeAlgorithm = async (algorithmName) => {
    await this.waitForWorkerSpot();
  
    const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
    const startNodeKey = `${gridKey}StartNode`;
    const endNodeKey = `${gridKey}EndNode`;
    const timeKey = `${algorithmName}Time`;
    const visitedNodesKey = `${algorithmName}VisitedNodes`;
    const visitedPercentageKey = `${algorithmName}VisitedPercentage`;
    const pathLengthKey = `pathLength${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
  
    const grid = this.state[gridKey];
    const startNode = this.state[startNodeKey];
    const endNode = this.state[endNodeKey];
  
    if (!grid || !startNode || !endNode) {
      console.error(`Grid, start node, or end node is not defined for ${algorithmName}`);
      return;
    }
  
    const worker = new Worker();
    activeWorkers++;
  
    worker.postMessage({ algorithmName, grid, startNode, endNode });
  
    return new Promise((resolve) => {
      worker.onmessage = (event) => {
        const { visitedNodesInOrder, nodesInShortestPathOrder, startTime, endTime } = event.data;
      
        const totalNodes = grid.length * grid[0].length;
        const wallNodes = grid.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        const newState = {
          [timeKey]: endTime - startTime,
          [visitedNodesKey]: visitedNodesInOrder.length,
          [visitedPercentageKey]: (visitedNodesInOrder.length / nonWallNodes) * 100,
          [pathLengthKey]: nodesInShortestPathOrder.length,
          [`${algorithmName}VisitedNodesInOrder`]: visitedNodesInOrder,
          [`${algorithmName}NodesInShortestPathOrder`]: nodesInShortestPathOrder
        };
      
        this.setState(newState, () => {
          console.log(`State updated for ${algorithmName}:`, this.state);
          activeWorkers--;
          resolve();
        });
      };
    });
  };

  getNodesInShortestPathOrder(endNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = endNode;
    while (currentNode !== null && currentNode !== undefined) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }

  solve = async () => {
    this.setState({ isSolving: true });
    const algorithmNames = Object.keys(algorithms);
    await Promise.all(algorithmNames.map(name => this.visualizeAlgorithm(name)));
    this.setState({ isSolving: false }, () => {
      algorithmNames.forEach(name => {
        const visitedNodesInOrder = this.state[`${name}VisitedNodesInOrder`];
        const nodesInShortestPathOrder = this.state[`${name}NodesInShortestPathOrder`];
        if (visitedNodesInOrder && nodesInShortestPathOrder) {
          this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
        }
      });
    });
  }

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
            min={11}
            max={101}
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
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dijkstra</td>
              <td>{this.state.dijkstraTime.toFixed(2)}</td>
              <td>{this.state.dijkstraVisitedNodes}</td>
              <td>{this.state.dijkstraVisitedPercentage.toFixed(2)}</td>
              <td>{this.state.pathLengthDijkstra}</td>
            </tr>
            <tr>
              <td>A*</td>
              <td>{this.state.astarTime.toFixed(2)}</td>
              <td>{this.state.astarVisitedNodes}</td>
              <td>{this.state.astarVisitedPercentage.toFixed(2)}</td>
              <td>{this.state.pathLengthAstar}</td>
            </tr>
            <tr>
              <td>BFS</td>
              <td>{this.state.bfsTime.toFixed(2)}</td>
              <td>{this.state.bfsVisitedNodes}</td>
              <td>{this.state.bfsVisitedPercentage.toFixed(2)}</td>
              <td>{this.state.pathLengthBfs}</td>
            </tr>
            <tr>
              <td>DFS</td>
              <td>{this.state.dfsTime.toFixed(2)}</td>
              <td>{this.state.dfsVisitedNodes}</td>
              <td>{this.state.dfsVisitedPercentage.toFixed(2)}</td>
              <td>{this.state.pathLengthDfs}</td>
            </tr>
            <tr>
              <td>Wall Follower</td>
              <td>{this.state.wallFollowerTime.toFixed(2)}</td>
              <td>{this.state.wallFollowerVisitedNodes}</td>
              <td>{this.state.wallFollowerVisitedPercentage.toFixed(2)}</td>
              <td>{this.state.pathLengthWallFollower}</td>
            </tr>
          </tbody>
        </table>
  
        <div className="grid-container">
          {algorithmNames.map((algorithmName) => {
            const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
            const grid = this.state[gridKey];
            if (!grid) {
              return <div key={algorithmName}>Loading...</div>;
            }
  
            return (
              <div className="grid" key={algorithmName}>
                <h1>{algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)} Algorithm</h1>
  
                {grid.map((row, rowIndex) => {
                  return (
                    <div key={rowIndex}>
                      {row.map((node, nodeIndex) => {
                        const { row, col, isEnd, isStart, isWall, gridId } = node;
                        return (
                          <Node
                            key={nodeIndex}
                            col={col}
                            isEnd={isEnd}
                            isStart={isStart}
                            isWall={isWall}
                            row={row}
                            gridId={gridId}></Node>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }  
}
