import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
// Algorithms
import { dijkstra, getNodesInShortestPathOrder } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';

import { generateMaze } from '../Algorithms/mazeGenerator';

export default class PathfindingVisualizer extends Component {

    constructor() {
        super();
        this.state = {
            grid: [],
            mouseIsPressed: false,
        };
    }

    componentDidMount() {
        const { grid, startNode, endNode } = getInitialGrid();
        this.setState({ grid, startNode, endNode });
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
            }, 10 * i);
        }
    }
    visualizeDijkstra() {
        const { grid, startNode, endNode } = this.state;

        const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
        this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    // A* algorithm
    animateAStar(visitedNodesInOrder, nodesInShortestPathOrder) {
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

    visualizeAStar() {
        const { grid, startNode, endNode } = this.state;

        const visitedNodesInOrder = astar(grid, startNode, endNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
        this.animateAStar(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    clearGrid() {
        const { grid, startNode, endNode} = this.state;
        const newGrid = grid.map(row =>
            row.map(node => {
                const newNode = {
                    ...node,
                    distance: Infinity,
                    isVisited: false,
                    previousNode: null,
                };
    
                // If the node is a start or end node, reset its isVisited property and preserve its special status
                if (node.isStart || node.isEnd) {
                    newNode.isVisited = false;
                    newNode.isStart = node.isStart;
                    newNode.isEnd = node.isEnd;
                }
    
                // If the node is a wall, preserve its status
                if (node.isWall) {
                    newNode.isWall = true;
                }
    
                // Reset the CSS classes
                const element = document.getElementById(`node-${node.row}-${node.col}`);
                if (element) {
                    element.className = `node ${newNode.isStart ? 'node-start' : ''} ${newNode.isEnd ? 'node-end' : ''} ${newNode.isWall ? 'node-wall' : ''}`;
                }
    
                return newNode;
            })
        );
        this.setState({newGrid, startNode, endNode, visitedNodesInOrder: [], nodesInShortestPathOrder: []});
    }

    generateNewMaze() {
        const { grid, startNode, endNode } = generateMaze(40, 80);
        this.setState({
            grid,
            START_NODE_ROW: startNode.row,
            START_NODE_COL: startNode.col,
            END_NODE_ROW: endNode.row,
            END_NODE_COL: endNode.col
        });
    }


    render() {
        const { grid, mouseIsPressed } = this.state;
        console.log(grid);
        return (
            <>
                <button onClick={() => this.generateNewMaze()}>
                    Generate Maze
                </button>
                <button onClick={() => this.visualizeDijkstra()}>
                    Dijkstra's Algorithm
                </button>
                <button onClick={() => this.visualizeAStar()}>
                    A* Algorithm
                </button>
                <button onClick={() => this.clearGrid()}>
                    Clear Grid
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
    return generateMaze(100, 40);
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





