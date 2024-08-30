import React, { Component } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import axios from "axios";
import pako from "pako";

const algorithms = {
    dijkstra: "dijkstra",
    astar: "astar",
    bfs: "bfs",
    dfs: "dfs",
    wallFollower: "wallFollower",
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

            // Ensure grid structure and node IDs are consistent
            this.setState({
                gridDijkstra: this.addNodeIds(response.data.grids.dijkstra, "dijkstra"),
                gridAstar: this.addNodeIds(response.data.grids.astar, "astar"),
                gridBfs: this.addNodeIds(response.data.grids.bfs, "bfs"),
                gridDfs: this.addNodeIds(response.data.grids.dfs, "dfs"),
                gridWallFollower: this.addNodeIds(
                    response.data.grids.wallFollower,
                    "wallFollower",
                ),
                // Start and end nodes
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
                id: `grid${algorithmName}-node-${node.y}-${node.x}`,
            })),
        );
    };

    handleSinglePathChange = () => {
        if (!this.state.isSolving) {
            this.setState(
                (prevState) => ({
                    singlePath: !prevState.singlePath,
                }),
                this.generateNewMaze,
            );
        }
    };

    handleMazeSizeChange = (event, newValue) => {
        if (!this.state.isSolving) {
            this.setState({ mazeSize: newValue }, this.generateNewMaze);
        }
    };

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
            dijkstraMemoryUsed: 0,
            astarMemoryUsed: 0,
            bfsMemoryUsed: 0,
            dfsMemoryUsed: 0,
            wallFollowerMemoryUsed: 0,
        });
    };

    generateNewMaze = () => {
        this.resetState(); // Reset state before generating new maze
        this.fetchMazeData(); // Regenerate maze data
    };

    animateShortestPath(nodesInShortestPathOrder) {
        return new Promise((resolve) => {
            let i = 0;
            const animate = () => {
                if (i < nodesInShortestPathOrder.length) {
                    const node = nodesInShortestPathOrder[i];
                    document.getElementById(
                        `grid${node.gridId}-node-${node.y}-${node.x}`,
                    ).className = "node node-shortest-path";
                    i++;
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, grid) {
        return new Promise((resolve) => {
            let i = 0;
            const animate = () => {
                if (i < visitedNodesInOrder.length) {
                    const node = visitedNodesInOrder[i];
                    const nodeElement = document.getElementById(
                        `grid${node.gridId}-node-${node.y}-${node.x}`,
                    );

                    if (nodeElement) {
                        // Use setTimeout to control animation speed
                        setTimeout(() => {
                            nodeElement.classList.add("node", "node-visited");

                            // Optional: Set background color based on visit count
                            if (node.noOfVisits > 1) {
                                const hue = 174 + (node.noOfVisits - 1) * 10;
                                const lightness = 30 - (node.noOfVisits - 1) * 5;
                                nodeElement.style.backgroundColor = `hsl(${hue}, 50%, ${lightness}%)`;
                            }

                            i++;
                            animate(); // Continue to the next node
                        }, 10); // Adjust delay as needed
                    } else {
                        console.log(
                            `Node not found: grid${node.gridId}-node-${node.y}-${node.x}`,
                        );
                        i++;
                        animate(); // Continue to the next node
                    }
                } else {
                    this.animateShortestPath(nodesInShortestPathOrder).then(resolve);
                }
            };
            animate();
        });
    }

    visualizeAlgorithms = async () => {
        try {
            console.log("Fetching solution data...");
            const response = await fetch(`http://localhost:5000/api/solution`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { compressedData } = await response.json();
            console.log("Compressed data received, length:", compressedData.length);

            const decompressedData = this.decompressData(compressedData);
            console.log("Data decompressed successfully");

            const results = JSON.parse(decompressedData);
            console.log("JSON parsed successfully");

            // Prepare state updates for all algorithms
            const stateUpdates = {};
            const animationPromises = [];

            for (const [algorithmName, algorithmResult] of Object.entries(results)) {
                if (!algorithmResult) {
                    console.error(`No result for algorithm: ${algorithmName}`);
                    continue;
                }

                const { visitedNodesInOrder, nodesInShortestPathOrder, metrics } =
                    algorithmResult;
                const capitalizedAlgName =
                    algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1);

                console.log(`Preparing updates for ${algorithmName}:`, metrics);

                // Safely access metric values
                const getMetricValue = (metricName) => {
                    const value = metrics[metricName];
                    return Array.isArray(value) ? value[0] : value;
                };

                stateUpdates[`${algorithmName}Time`] =
                    getMetricValue("time") / 1_000_000;
                stateUpdates[`${algorithmName}VisitedNodes`] =
                    getMetricValue("visitedNodes");
                stateUpdates[`${algorithmName}VisitedPercentage`] =
                    getMetricValue("visitedPercentage");
                stateUpdates[`pathLength${capitalizedAlgName}`] =
                    getMetricValue("pathLength");
                stateUpdates[`${algorithmName}MemoryUsed`] = parseFloat(
                    getMetricValue("memoryUsed"),
                ).toFixed(2);

                // Prepare animation promise
                animationPromises.push(
                    this.animateAlgorithm(
                        this.decompressNodeList(
                            visitedNodesInOrder,
                            this.state[`grid${capitalizedAlgName}`],
                        ),
                        this.decompressNodeList(
                            nodesInShortestPathOrder,
                            this.state[`grid${capitalizedAlgName}`],
                        ),
                        this.state[`grid${capitalizedAlgName}`],
                    ),
                );
            }

            // Update state for all algorithms at once
            this.setState(stateUpdates);

            // Start all animations simultaneously
            console.log("Starting animations for all algorithms");
            await Promise.all(animationPromises);
            console.log("All animations completed");
        } catch (error) {
            console.error("Error in visualizeAlgorithms:", error);
            console.error("Error details:", error.message);
        }
    };

    decompressData = (compressedData) => {
        const binaryString = atob(compressedData);
        const charData = binaryString.split("").map((x) => x.charCodeAt(0));
        const binData = new Uint8Array(charData);
        const data = pako.inflate(binData);
        return new TextDecoder().decode(data);
    };

    decompressNodeList = (compressedList, grid) => {
        return compressedList.map(([x, y, noOfVisits]) => {
            const node = grid[y][x];
            return { ...node, noOfVisits: noOfVisits || 1 };
        });
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
                <button onClick={this.generateNewMaze} disabled={this.state.isSolving}>
                    Generate Maze
                </button>

                <Switch
                    checked={this.state.singlePath}
                    onChange={this.handleSinglePathChange}
                    color="primary"
                    disabled={this.state.isSolving}
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
                        disabled={this.state.isSolving}
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
                        <th>Path Length Delta</th>
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
                        <td>0</td>
                        <td>{this.state.dijkstraMemoryUsed}</td>
                    </tr>
                    <tr>
                        <td>A*</td>
                        <td>{this.state.astarTime}</td>
                        <td>{this.state.astarVisitedNodes}</td>
                        <td>{this.state.astarVisitedPercentage.toFixed(2)}</td>
                        <td>{this.state.pathLengthAstar}</td>
                        <td>{this.state.pathLengthAstar - this.state.pathLengthDijkstra}</td>
                        <td>{this.state.astarMemoryUsed}</td>
                    </tr>
                    <tr>
                        <td>BFS</td>
                        <td>{this.state.bfsTime}</td>
                        <td>{this.state.bfsVisitedNodes}</td>
                        <td>{this.state.bfsVisitedPercentage.toFixed(2)}</td>
                        <td>{this.state.pathLengthBfs}</td>
                        <td>{this.state.pathLengthBfs - this.state.pathLengthDijkstra}</td>
                        <td>{this.state.bfsMemoryUsed}</td>
                    </tr>
                    <tr>
                        <td>DFS</td>
                        <td>{this.state.dfsTime}</td>
                        <td>{this.state.dfsVisitedNodes}</td>
                        <td>{this.state.dfsVisitedPercentage.toFixed(2)}</td>
                        <td>{this.state.pathLengthDfs}</td>
                        <td>{this.state.pathLengthDfs - this.state.pathLengthDijkstra}</td>
                        <td>{this.state.dfsMemoryUsed}</td>
                    </tr>
                    <tr>
                        <td>Wall Follower</td>
                        <td>{this.state.wallFollowerTime}</td>
                        <td>{this.state.wallFollowerVisitedNodes}</td>
                        <td>{this.state.wallFollowerVisitedPercentage.toFixed(2)}</td>
                        <td>{this.state.pathLengthWallFollower}</td>
                        <td>{this.state.pathLengthWallFollower - this.state.pathLengthDijkstra}</td>
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
                                <h1>{algorithms[algorithmName]} algorithm</h1>
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
