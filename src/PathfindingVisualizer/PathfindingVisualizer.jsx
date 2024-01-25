import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
// Algorithms
import { dijkstra, getNodesInShortestPathOrder } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';


const START_NODE_ROW = 0;
const START_NODE_COL = 0;
const END_NODE_ROW = 19;
const END_NODE_COL = 19;


export default class PathfindingVisualizer extends Component {

    constructor() {
        super();
        this.state = {
            grid: [],
            mouseIsPressed: false,
        };
    }

    componentDidMount() {
        const grid = getInitialGrid();
        this.setState({ grid });
    }

    handleMouseDown(row, col) {
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid, mouseIsPressed: true });
    }
    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid });
    }
    handleMouseUp() {
        this.setState({ mouseIsPressed: false });
    }

    /*
    *   Visualizing algorithms
    */

    // Dijkstra's algorithm
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
            }, 10 * i);
        }
    }
    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
            }, 50 * i);
        }
    }
    visualizeDijkstra() {
        const { grid } = this.state;
        const startNode = grid[START_NODE_ROW][START_NODE_COL];
        const endNode = grid[END_NODE_ROW][END_NODE_COL];

        const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
        this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    // A* algorithm
    animateAStar(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === nodesInShortestPathOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
            }, 10 * i);
        }
    }

    visualizeAStar() {
        const { grid } = this.state;
        const startNode = grid[START_NODE_ROW][START_NODE_COL];
        const endNode = grid[END_NODE_ROW][END_NODE_COL];

        const visitedNodesInOrder = astar(grid, startNode, endNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
        this.animateAStar(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    render() {
        const { grid, mouseIsPressed } = this.state;
        console.log(grid);
        return (
            <>
                <button onClick={() => this.generateMaze(this.state.grid)}>
                    Generate Maze
                </button>
                <button onClick={() => this.visualizeDijkstra()}>
                    Dijkstra's Algorithm
                </button>
                <button onClick={() => this.visualizeAStar()}>
                    A* Algorithm
                </button>
                <div className="grid">
                    {grid.map((row, rowIndex) => {
                        return (
                            <div key={rowIndex}>
                                {row.map((node, nodeIndex) => {
                                    const { row, col, isEnd, isStart, isWall } = node;
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
                                            row={row}></Node>
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

const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
        const currentRow = [];
        for (let col = 0; col < 20; col++) {
            currentRow.push(createNode(col, row));
        }
        grid.push(currentRow);
    }
    return grid;
};

const createNode = (col, row) => {
    return {
        col,
        row,
        isStart: row === START_NODE_ROW && col === START_NODE_COL,
        isEnd: row === END_NODE_ROW && col === END_NODE_COL,
        distance: Infinity,
        isVisited: false,
        isWall: false,
        previousNode: null,
    };
};

const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
        ...node,
        isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
};


