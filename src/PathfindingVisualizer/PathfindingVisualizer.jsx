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
            mouseIsPressed: false,
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

    handleMouseDown(row, col) {
        const newGrid = getNewGridWithWallToggled(this.state.gridDijkstra, this.state.gridAstar, row, col);
        this.setState({ gridDijkstra: newGrid, gridAstar: newGrid, mouseIsPressed: true });
    }
    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        const newGrid = getNewGridWithWallToggled(this.state.gridDijkstra, this.state.gridAstar, row, col);
        this.setState({ gridDijkstra: newGrid, gridAstar: newGrid });
    }
    handleMouseUp() {
        this.setState({ mouseIsPressed: false });
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
        const visitedNodesInOrder = dijkstra(gridDijkstra, gridDijkstraStartNode, gridDijkstraEndNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridDijkstraEndNode);
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
        const visitedNodesInOrder = astar(gridAstar, gridAstarStartNode, gridAstarEndNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridAstarEndNode);
        this.animateAStar(visitedNodesInOrder, nodesInShortestPathOrder);
    }


    solve() {
        Promise.all([this.visualizeDijkstra(), this.visualizeAStar()]);
    }

    render() {
        const { gridDijkstra, gridAstar, mouseIsPressed } = this.state;
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
                        <h1>Dijkstra</h1>
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
                                                mouseIsPressed={mouseIsPressed}
                                                onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                                                onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                                                onMouseUp={() => this.handleMouseUp()}
                                                row={row}
                                                gridId={gridId}></Node>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid">
                        <h1>A*</h1>
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
                                                mouseIsPressed={mouseIsPressed}
                                                onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                                                onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                                                onMouseUp={() => this.handleMouseUp()}
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


const getNewGridWithWallToggled = (gridDijkstra, gridAstar, row, col) => {
    const newGridDijkstra = gridDijkstra.slice();
    const newGridAstar = gridAstar.slice();
    const nodeDijkstra = newGridDijkstra[row][col];
    const nodeAstar = newGridAstar[row][col];
    const newNodeDijkstra = {
        ...nodeDijkstra,
        isWall: !nodeDijkstra.isWall,
    };
    const newNodeAstar = {
        ...nodeAstar,
        isWall: !nodeAstar.isWall,
    };
    newGridDijkstra[row][col] = newNodeDijkstra;
    newGridAstar[row][col] = newNodeAstar;
    return { gridDijkstra: newGridDijkstra, gridAstar: newGridAstar };
};





