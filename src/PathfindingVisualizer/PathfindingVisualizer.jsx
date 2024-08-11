import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css';
import Switch from '@mui/material/Switch';
import axios from 'axios';

// Algorithms
import { dijkstra } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';
import { bfs } from '../Algorithms/bfs';
import { dfs } from '../Algorithms/dfs';
import { wallFollower } from '../Algorithms/wall_follower';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./pathfinding.worker.js';

const algorithms = {
    dijkstra,
    astar,
    bfs,
    dfs,
    wallFollower
};

const MAX_WORKERS = navigator.hardwareConcurrency || 4; // Use the number of logical processors or a default value

let activeWorkers = 0;

export default class PathfindingVisualizer extends Component {
    NUM_OF_ROWS = 15;
    NUM_OF_COLS = 15;

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
            dijkstraTime: null,
            astarTime: null,
            bfsTime: null,
            dfsTime: null,
            wallFollowerTime: null,
            dijkstraVisitedNodes: null,
            astarVisitedNodes: null,
            bfsVisitedNodes: null,
            dfsVisitedNodes: null,
            wallFollowerVisitedNodes: null,
            dijkstraVisitedPercentage: null,
            astarVisitedPercentage: null,
            bfsVisitedPercentage: null,
            dfsVisitedPercentage: null,
            wallFollowerVisitedPercentage: null,
            dijkstraPathLength: null,
            astarPathLength: null,
            bfsPathLength: null,
            dfsPathLength: null,
            wallFollowerPathLength: null
        };
    }

    componentDidMount() {
        this.fetchMazeData();
    }

    fetchMazeData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/mazeHandler', {
                params: {
                    size: this.NUM_OF_ROWS,
                    singlePath: this.state.singlePath
                }
            });

            console.log("API Data:", response.data);

            this.setState({
                gridDijkstra: response.data.gridDijkstra || [],
                gridAstar: response.data.gridAstar || [],
                gridBfs: response.data.gridBfs || [],
                gridDfs: response.data.gridDfs || [],
                gridWallFollower: response.data.gridWallFollower || [],
                gridDijkstraStartNode: response.data.gridDijkstraStartNode || {},
                gridDijkstraEndNode: response.data.gridDijkstraEndNode || {},
                gridAstarStartNode: response.data.gridAstarStartNode || {},
                gridAstarEndNode: response.data.gridAstarEndNode || {},
                gridBfsStartNode: response.data.gridBfsStartNode || {},
                gridBfsEndNode: response.data.gridBfsEndNode || {},
                gridDfsStartNode: response.data.gridDfsStartNode || {},
                gridDfsEndNode: response.data.gridDfsEndNode || {},
                gridWallFollowerStartNode: response.data.gridWallFollowerStartNode || {},
                gridWallFollowerEndNode: response.data.gridWallFollowerEndNode || {}
            });
        } catch (error) {
            console.error('Error fetching maze data:', error);
        }
    };

    handleSinglePathChange = () => {
        this.setState(prevState => ({
            singlePath: !prevState.singlePath
        }), this.generateNewMaze);
    };

    generateNewMaze = () => {
        const { gridDijkstra, gridAstar, gridBfs, gridDfs, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBfsStartNode, gridBfsEndNode, gridDfsStartNode, gridDfsEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = this.getInitialGrid(this.NUM_OF_ROWS, this.NUM_OF_COLS, this.state.singlePath);

        this.setState({
            gridDijkstra,
            gridAstar,
            gridBfs,
            gridDfs,
            gridWallFollower,
            gridDijkstraStartNode,
            gridDijkstraEndNode,
            gridAstarStartNode,
            gridAstarEndNode,
            gridBfsStartNode,
            gridBfsEndNode,
            gridDfsStartNode,
            gridDfsEndNode,
            gridWallFollowerStartNode,
            gridWallFollowerEndNode
        });

        console.log("Generated Maze Data:", { gridDijkstra, gridAstar, gridBfs, gridDfs, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBfsStartNode, gridBfsEndNode, gridDfsStartNode, gridDfsEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode });

        // Clear the CSS
        const nodes = document.getElementsByClassName('node');
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const isStartNode = node.id === `grid${gridDijkstraStartNode.gridId}-node-${gridDijkstraStartNode.row}-${gridDijkstraStartNode.col}`;
            const isEndNode = node.id === `grid${gridDijkstraEndNode.gridId}-node-${gridDijkstraEndNode.row}-${gridDijkstraEndNode.col}`;
            const isWallNode = node.className.includes('node-wall');
            if (!isStartNode && !isEndNode && !isWallNode) {
                node.className = 'node';
            }
        }
    };
    /*waitForWorkerSpot = () => {
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
            }, 10); // Check every 10ms
        });
    };*/
    animateShortestPath = (nodesInShortestPathOrder) => {
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
    };
    

    animateAlgorithm = (algorithmName, visitedNodesInOrder, nodesInShortestPathOrder) => {
        return new Promise(resolve => {
            let i = 0;
            const animate = () => {
                if (i < visitedNodesInOrder.length) {
                    const node = visitedNodesInOrder[i];
                    const nodeElement = document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`);
                    nodeElement.classList.add('node', 'node-visited');
    
                    // Handle color gradient for nodes visited multiple times
                    if (node.noOfVisits > 1) {
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
    };
    
    
    visualizeAlgorithm = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/mazeHandler', {
                params: {
                    size: this.NUM_OF_ROWS,
                    singlePath: this.state.singlePath
                }
            });
    
            const data = response.data;
            
            console.log("Algorithm Results:", data);
    
            const algorithmNames = ['dijkstra', 'astar', 'bfs', 'dfs', 'wallFollower'];
    
            const animationPromises = algorithmNames.map(async algorithmName => {
                const visitedNodesInOrderData = data.visitedNodesResults[algorithmName] || [];
                const nodesInShortestPathOrderData = data.nodesInShortestPathOrder[algorithmName] || [];
    
                // Create node instances and map by index
                const nodeIndexMap = new Map();
                visitedNodesInOrderData.forEach((nodeData, index) => {
                    const node = this.createNode(
                        nodeData.col,
                        nodeData.row,
                        nodeData.isWall,
                        nodeData.isStart,
                        nodeData.isEnd,
                        nodeData.gridId,
                        nodeData.previousNodeIndex // Use previousNodeIndex
                    );
                    nodeIndexMap.set(index, node);
                });
    
                // Update nodes with their previousNode based on previousNodeIndex
                nodeIndexMap.forEach((node, index) => {
                    const previousNodeIndex = node.previousNodeIndex;
                    if (previousNodeIndex !== null && nodeIndexMap.has(previousNodeIndex)) {
                        node.previousNode = nodeIndexMap.get(previousNodeIndex);
                    } else {
                        node.previousNode = null;
                    }
                });
    
                const nodesArray = Array.from(nodeIndexMap.values());
    
                return this.animateAlgorithm(algorithmName, nodesArray, nodesInShortestPathOrderData);
            });
    
            await Promise.all(animationPromises);
    
        } catch (error) {
            console.error('Error visualizing algorithms:', error);
        }
    };

    createNode = (col, row, isWall, isStart, isEnd, gridId, previousNodeIndex) => {
        return {
            col: col,
            row: row,
            isWall: isWall,
            isStart: isStart,
            isEnd: isEnd,
            gridId: gridId,
            previousNodeIndex: previousNodeIndex, // Store the index of the previous node
            previousNode: null, // Will be set later based on previousNodeIndex
            distance: Infinity, // Initialize distance (for algorithms like Dijkstra)
            noOfVisits: 0 // Initialize number of visits (for WallFollower algorithm)
        };
    };
    
        
    
    solve = async () => {
        this.setState({ isSolving: true });
    
        // Call visualizeAlgorithm and wait for it to complete
        await this.visualizeAlgorithm();
    
        this.setState({ isSolving: false });
    };
    


    render() {
        const algorithmNames = Object.keys(algorithms);
        return (
            <div className="pathfinding-visualizer">
                <div className="controls">
                    <button onClick={this.solve} disabled={this.state.isSolving}>
                        Solve
                    </button>
                    <button onClick={this.generateNewMaze}>
                        Generate Maze
                    </button>
                    <Switch
                        checked={this.state.singlePath}
                        onChange={this.handleSinglePathChange}
                        color="primary"
                    />
                    <label>Single Path</label>
                </div>
                <div className="grid-container">
                    {algorithmNames.map((algorithmName) => {
                        const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
                        const timeKey = `${algorithmName}Time`;
                        const visitedNodesKey = `${algorithmName}VisitedNodes`;
                        const visitedPercentageKey = `${algorithmName}VisitedPercentage`;
                        const pathLengthKey = `${algorithmName}PathLength`;

                        const grid = this.state[gridKey];
                        if (!grid) {
                            return <div>Loading...</div>; // Or some other placeholder
                        }

                        return (
                            <div className="grid" key={algorithmName}>
                                <h1>{algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)} Algorithm</h1>
                                <p>Execution Time: {typeof this.state[timeKey] === 'number' ? this.state[timeKey].toFixed(2) : 'N/A'} ms</p>
                                <p>Visited Cells: {this.state[visitedNodesKey]}</p>
                                <p>Visited Percentage: {typeof this.state[visitedPercentageKey] === 'number' ? this.state[visitedPercentageKey].toFixed(2) : 'N/A'}%</p>
                                <p>{algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)} Algorithm Path Length: {this.state[pathLengthKey]}</p>
                                {grid.map((row, rowIndex) => (
                                    <div key={rowIndex}>
                                        {row.map((node, nodeIndex) => (
                                            <Node
                                                key={nodeIndex}
                                                col={node.col}
                                                isEnd={node.isEnd}
                                                isStart={node.isStart}
                                                isWall={node.isWall}
                                                row={node.row}
                                                gridId={node.gridId}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
