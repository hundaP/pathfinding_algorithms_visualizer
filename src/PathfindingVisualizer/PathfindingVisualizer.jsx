import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
import Switch from '@material-ui/core/Switch';

// Algorithms
import { dijkstra } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';
import { bfs } from '../Algorithms/bfs';
import { dfs } from '../Algorithms/dfs';
import { wallFollower } from '../Algorithms/wall_follower';
import { generateMaze } from '../Algorithms/mazeGenerator';
const algorithms = {
    dijkstra,
    astar,
    bfs,
    dfs,
    wallFollower
};

export default class PathfindingVisualizer extends Component {
    NUM_OF_ROWS = 30;
    NUM_OF_COLS = 30;

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
            isSolving: false
        };
    }

    componentDidMount() {
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
    handleSinglePathChange() {
        this.setState(prevState => ({
            singlePath: !prevState.singlePath
        }), this.generateNewMaze);
    }
    generateNewMaze() {

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

        //also clear the css
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

    /*
     *  Animating algorithms
     */
    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-shortest-path';
            }, 3 * i);
        }
    }
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
        return new Promise(resolve => {
            for (let i = 0; i <= visitedNodesInOrder.length; i++) {
                if (i === visitedNodesInOrder.length) {
                    setTimeout(() => {
                        this.animateShortestPath(nodesInShortestPathOrder);
                        resolve();
                    }, 30 * i);
                    return;
                }
                setTimeout(() => {
                    const node = visitedNodesInOrder[i];
                    document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-visited';
                }, 30 * i);
            }
        });
    }

    /*
    *   Visualizing algorithms
    */
    visualizeAlgorithm = async (algorithmName) => {
        const algorithm = algorithms[algorithmName];
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
        const startTime = performance.now();
        const visitedNodesInOrder = algorithm(grid, startNode, endNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = this.getNodesInShortestPathOrder(endNode);
        const totalNodes = grid.length * grid[0].length;
        const wallNodes = grid.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            [timeKey]: endTime - startTime,
            [visitedNodesKey]: visitedNodesInOrder.length,
            [visitedPercentageKey]: (visitedNodesInOrder.length / nonWallNodes) * 100,
            [pathLengthKey]: nodesInShortestPathOrder.length
        });
        await this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
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

    solve() {
        this.setState({ isSolving: true });
        const algorithmNames = Object.keys(algorithms);
        const promises = algorithmNames.map(name => this.visualizeAlgorithm(name));
        Promise.all(promises).then(() => this.setState({ isSolving: false }));
    }

    render() {
        const algorithmNames = Object.keys(algorithms);
        return (
            <>
                <button onClick={() => this.solve()} disabled={this.state.isSolving}>
                    Solve
                </button>
                <button onClick={() => this.generateNewMaze()}>
                    Generate Maze
                </button>
                <Switch
                    checked={this.state.singlePath}
                    onChange={this.handleSinglePathChange.bind(this)}
                    color="primary"
                />
                <label>Single Path</label>
                <div className="grid-container">
                    {algorithmNames.map((algorithmName) => {
                        const gridKey = `grid${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;
                        const timeKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}Time`;
                        const visitedNodesKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedNodes`;
                        const visitedPercentageKey = `${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}VisitedPercentage`;
                        const pathLengthKey = `pathLength${algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1)}`;

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
