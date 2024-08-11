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
            mazeSize: 50, // Default size
        };
    }

    componentDidMount() {
        this.generateNewMaze();
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
            gridWallFollowerEndNode: gridWallFollowerEndNode
        };
    };

    handleSinglePathChange = () => {
        this.setState(prevState => ({
            singlePath: !prevState.singlePath
        }), this.generateNewMaze);
    }

    handleMazeSizeChange = (event, newValue) => {
        this.setState({ mazeSize: newValue }, this.generateNewMaze);
    }

    generateNewMaze = () => {
        const { gridDijkstra, gridAstar, gridBfs, gridDfs, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBfsStartNode, gridBfsEndNode, gridDfsStartNode, gridDfsEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = this.getInitialGrid(this.state.mazeSize, this.state.mazeSize, this.state.singlePath);

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
    }

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
        const timeKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}Time`;
        const visitedNodesKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedNodes`;
        const visitedPercentageKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedPercentage`;
        const pathLengthKey = `pathLength${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;

        const grid = this.state[gridKey];
        const startNode = this.state[startNodeKey];
        const endNode = this.state[endNodeKey];

        const worker = new Worker();
        activeWorkers++;

        worker.postMessage({ algorithmName, grid, startNode, endNode });

        worker.onmessage = (event) => {
            const { visitedNodesInOrder, nodesInShortestPathOrder, startTime, endTime } = event.data;

            const totalNodes = grid.length * grid[0].length;
            const wallNodes = grid.flat().filter(node => node.isWall).length;
            const nonWallNodes = totalNodes - wallNodes;
            this.setState({
                [timeKey]: endTime - startTime,
                [visitedNodesKey]: visitedNodesInOrder.length,
                [visitedPercentageKey]: (visitedNodesInOrder.length / nonWallNodes) * 100,
                [pathLengthKey]: nodesInShortestPathOrder.length
            });
            activeWorkers--;
            this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
        };
    }

    getNodesInShortestPathOrder(endNode) {
        const nodesInShortestPathOrder = [];
        let currentNode = endNode;
        while (currentNode !== null && currentNode !== undefined) {
            nodesInShortestPathOrder.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        return nodesInShortestPathOrder;
    }

    solve = () => {
        this.setState({ isSolving: true });
        const algorithmNames = Object.keys(algorithms);
        const promises = algorithmNames.map(name => this.visualizeAlgorithm(name));
        Promise.all(promises).then(() => this.setState({ isSolving: false }));
    }

    render() {
        const algorithmNames = Object.keys(algorithms);
        return (
            <>
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

                <div style={{ width: '300px', margin: '20px auto' }}>
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

                <div className="grid-container">
                    {algorithmNames.map((algorithmName) => {
                        const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
                        const timeKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}Time`;
                        const visitedNodesKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedNodes`;
                        const visitedPercentageKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedPercentage`;
                        const pathLengthKey = `pathLength${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;

                        const grid = this.state[gridKey];
                        if (!grid) {
                            return <div key={algorithmName}>Loading...</div>;
                        }

                        return (
                            <div className="grid" key={algorithmName}>
                                <h1>{algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)} Algorithm</h1>
                                <p>Execution Time: {typeof this.state[timeKey] === 'number' ? this.state[timeKey].toFixed(2) : 'N/A'} ms</p>
                                <p>Visited Cells: {this.state[visitedNodesKey]}</p>
                                <p>Visited Percentage: {typeof this.state[visitedPercentageKey] === 'number' ? this.state[visitedPercentageKey].toFixed(2) : 'N/A'}%</p>
                                <p>{algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)} Algorithm Path Length: {this.state[pathLengthKey]}</p>
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