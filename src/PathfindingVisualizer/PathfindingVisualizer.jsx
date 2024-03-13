import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
// Algorithms
import { dijkstra, getNodesInShortestPathOrder } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';

import { generateMaze } from '../Algorithms/mazeGenerator';

export default class PathfindingVisualizer extends Component {
    NUM_OF_ROWS = 40;
    NUM_OF_COLS = 40;

    constructor() {
        super();
        this.state = {
            gridDijkstra: [],
            gridAstar: [],
            startNode: null,
            endNode: null,
        };
    }

    componentDidMount() {
        const { gridDijkstra, gridAstar, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode } = getInitialGrid(this.NUM_OF_ROWS, this.NUM_OF_COLS);
        this.setState({
            gridDijkstra,
            gridAstar,
            gridDijkstraStartNode,
            gridDijkstraEndNode,
            gridAstarStartNode,
            gridAstarEndNode
        });
    }

    /*
    *   Visualizing algorithms
    */

    // Shortest path
    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-shortest-path';
            }, 3 * i);
        }
    }

    // Dijkstra's algorithm
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 5 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-visited';
            }, 5 * i);
        }
    }

    visualizeDijkstra() {
        const { gridDijkstra, gridDijkstraStartNode, gridDijkstraEndNode } = this.state;
        const startTime = performance.now();
        const visitedNodesInOrder = dijkstra(gridDijkstra, gridDijkstraStartNode, gridDijkstraEndNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridDijkstraEndNode);
        const totalNodes = gridDijkstra.length * gridDijkstra[0].length;
        const wallNodes = gridDijkstra.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            dijkstraTime: endTime - startTime,
            dijkstraVisitedNodes: visitedNodesInOrder.length,
            dijkstraVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100
        });
        this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    // A* algorithm
    animateAStar(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 5 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                document.getElementById(`grid${node.gridId}-node-${node.row}-${node.col}`).className = 'node node-visited';
            }, 5 * i);
        }
    }

    visualizeAStar() {
        const { gridAstar, gridAstarStartNode, gridAstarEndNode } = this.state;
        const startTime = performance.now();
        const visitedNodesInOrder = astar(gridAstar, gridAstarStartNode, gridAstarEndNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridAstarEndNode);
        const totalNodes = gridAstar.length * gridAstar[0].length;
        const wallNodes = gridAstar.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            aStarTime: endTime - startTime,
            aStarVisitedNodes: visitedNodesInOrder.length,
            aStarVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100
        });
        this.animateAStar(visitedNodesInOrder, nodesInShortestPathOrder);
    }


    solve() {
        Promise.all([this.visualizeDijkstra(), this.visualizeAStar()]);
    }

    render() {
        const { gridDijkstra, gridAstar } = this.state;
        if (!gridDijkstra || !gridAstar) {
            return <div>Loading...</div>; // Or some other placeholder
        }
        return (
            <>
                <button onClick={() => this.solve()}>
                    Solve
                </button>
                <button onClick={() => window.location.reload()}>
                    Generate Maze
                </button>
                <div className='grid-container'>
                    <div className="grid">
                        <h1>Dijkstra's Algorithm</h1>
                        <p>Execution Time: {typeof this.state.dijkstraTime === 'number' ? this.state.dijkstraTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.dijkstraVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.dijkstraVisitedPercentage === 'number' ? this.state.dijkstraVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        {gridDijkstra.map((row, rowIndex) => {
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
                    <div className="grid">
                        <h1>A* Algorithm</h1>
                        <p>Execution Time: {typeof this.state.aStarTime === 'number' ? this.state.aStarTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.aStarVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.aStarVisitedPercentage === 'number' ? this.state.aStarVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        {gridAstar.map((row, rowIndex) => {
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
                </div>
            </>
        );

    }
}

const getInitialGrid = (numOfRows, numOfCols) => {
    const { gridDijsktra, gridAstar, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode } = generateMaze(numOfRows, numOfCols);
    return {
        gridDijkstra: gridDijsktra,
        gridAstar: gridAstar,
        gridDijkstraStartNode: gridDijkstraStartNode,
        gridDijkstraEndNode: gridDijkstraEndNode,
        gridAstarStartNode: gridAstarStartNode,
        gridAstarEndNode: gridAstarEndNode
    };
};








