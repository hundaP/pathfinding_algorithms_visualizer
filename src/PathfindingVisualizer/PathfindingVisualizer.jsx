import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css'
// Algorithms
import { dijkstra, getNodesInShortestPathOrder } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';
import { bfs } from '../Algorithms/bfs';
import { dfs } from '../Algorithms/dfs';
import { wallFollower } from '../Algorithms/wall_follower';

import { generateMaze } from '../Algorithms/mazeGenerator';

import Switch from '@material-ui/core/Switch';

export default class PathfindingVisualizer extends Component {
    NUM_OF_ROWS = 25;
    NUM_OF_COLS = 25;

    constructor() {
        super();
        this.state = {
            gridDijkstra: [],
            gridAstar: [],
            gridBFS: [],
            gridDFS: [],
            gridWallFollower: [],
            startNode: null,
            endNode: null,
            singlePath: true
        };
    }

    componentDidMount() {
        const { gridDijkstra, gridAstar, gridBFS, gridDFS, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBFSStartNode, gridBFSEndNode, gridDFSStartNode, gridDFSEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = getInitialGrid(this.NUM_OF_ROWS, this.NUM_OF_COLS, this.state.singlePath);
        this.setState({
            gridDijkstra,
            gridAstar,
            gridBFS,
            gridDFS,
            gridWallFollower,
            gridDijkstraStartNode,
            gridDijkstraEndNode,
            gridAstarStartNode,
            gridAstarEndNode,
            gridBFSStartNode,
            gridBFSEndNode,
            gridDFSStartNode,
            gridDFSEndNode,
            gridWallFollowerStartNode,
            gridWallFollowerEndNode
        });
    }
    handleSinglePathChange() {
        this.setState(prevState => ({
            singlePath: !prevState.singlePath
        }), this.generateNewMaze);
    }
    generateNewMaze() {

        const { gridDijkstra, gridAstar, gridBFS, gridDFS, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBFSStartNode, gridBFSEndNode, gridDFSStartNode, gridDFSEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = getInitialGrid(this.NUM_OF_ROWS, this.NUM_OF_COLS, this.state.singlePath);




        this.setState({
            gridDijkstra,
            gridAstar,
            gridBFS,
            gridDFS,
            gridWallFollower,
            gridDijkstraStartNode,
            gridDijkstraEndNode,
            gridAstarStartNode,
            gridAstarEndNode,
            gridBFSStartNode,
            gridBFSEndNode,
            gridDFSStartNode,
            gridDFSEndNode,
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
            dijkstraVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100,
            pathLengthDijkstra: nodesInShortestPathOrder.length
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
            aStarVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100,
            pathLengthAStar: nodesInShortestPathOrder.length
            
        });
        this.animateAStar(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    // BFS algorithm
    animateBFS(visitedNodesInOrder, nodesInShortestPathOrder) {
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
    visualizeBFS() {
        const { gridBFS, gridBFSStartNode, gridBFSEndNode } = this.state;
        const startTime = performance.now();
        const visitedNodesInOrder = bfs(gridBFS, gridBFSStartNode, gridBFSEndNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridBFSEndNode);
        const totalNodes = gridBFS.length * gridBFS[0].length;
        const wallNodes = gridBFS.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            BFSTime: endTime - startTime,
            BFSVisitedNodes: visitedNodesInOrder.length,
            BFSVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100,
            pathLengthBFS: nodesInShortestPathOrder.length
        });
        this.animateBFS(visitedNodesInOrder, nodesInShortestPathOrder);
    }
    // DFS algorithm
    animateDFS(visitedNodesInOrder, nodesInShortestPathOrder) {
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

    visualizeDFS() {
        const { gridDFS, gridDFSStartNode, gridDFSEndNode } = this.state;
        const startTime = performance.now();
        const visitedNodesInOrder = dfs(gridDFS, gridDFSStartNode, gridDFSEndNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridDFSEndNode);
        const totalNodes = gridDFS.length * gridDFS[0].length;
        const wallNodes = gridDFS.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            DFSTime: endTime - startTime,
            DFSVisitedNodes: visitedNodesInOrder.length,
            DFSVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100,
            pathLengthDFS: nodesInShortestPathOrder.length
        });
        this.animateDFS(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    // Wall Follower algorithm
    animateWallFollower(visitedNodesInOrder, nodesInShortestPathOrder) {
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

    visualizeWallFollower() {
        const { gridWallFollower, gridWallFollowerStartNode, gridWallFollowerEndNode } = this.state;
        const startTime = performance.now();
        const visitedNodesInOrder = wallFollower(gridWallFollower, gridWallFollowerStartNode, gridWallFollowerEndNode);
        const endTime = performance.now();
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(gridWallFollowerEndNode);
        const totalNodes = gridWallFollower.length * gridWallFollower[0].length;
        const wallNodes = gridWallFollower.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;
        this.setState({
            wallFollowerTime: endTime - startTime,
            wallFollowerVisitedNodes: visitedNodesInOrder.length,
            wallFollowerVisitedPercentage: (visitedNodesInOrder.length / nonWallNodes) * 100,
            pathLengthWallFollower: nodesInShortestPathOrder.length
        });
        this.animateWallFollower(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    solve() {
        Promise.all([this.visualizeDijkstra(), this.visualizeAStar(), this.visualizeBFS(), this.visualizeDFS(), this.visualizeWallFollower()]);
    }

    render() {
        const { gridDijkstra, gridAstar, gridBFS, gridDFS, gridWallFollower } = this.state;
        if (!gridDijkstra || !gridAstar || !gridBFS || !gridDFS || !gridWallFollower) {
            return <div>Loading...</div>; // Or some other placeholder
        }
        return (
            <>
                <button onClick={() => this.solve()}>
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
                <div className='grid-container'>
                    <div className="grid">
                        <h1>Dijkstra's Algorithm</h1>
                        <p>Execution Time: {typeof this.state.dijkstraTime === 'number' ? this.state.dijkstraTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.dijkstraVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.dijkstraVisitedPercentage === 'number' ? this.state.dijkstraVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        <p>Dijkstra's Algorithm Path Length: {this.state.pathLengthDijkstra}</p>
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
                        <p>A* Algorithm Path Length: {this.state.pathLengthAStar}</p>
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
                <div className='grid-container'>
                    <div className="grid">
                        <h1>Breadth-First Search Algorithm</h1>
                        <p>Execution Time: {typeof this.state.BFSTime === 'number' ? this.state.BFSTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.BFSVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.BFSVisitedPercentage === 'number' ? this.state.BFSVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        <p>BFS Algorithm Path Length: {this.state.pathLengthBFS}</p>
                        {Array.isArray(gridBFS) && gridBFS.map((row, rowIndex) => {
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
                        <h1>Depth-First Search Algorithm</h1>
                        <p>Execution Time: {typeof this.state.DFSTime === 'number' ? this.state.DFSTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.DFSVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.DFSVisitedPercentage === 'number' ? this.state.DFSVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        <p>DFS Algorithm Path Length: {this.state.pathLengthDFS}</p>
                        {Array.isArray(gridDFS) && gridDFS.map((row, rowIndex) => {
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
                <div className='grid-container'>
                    <div className="grid">
                        <h1>Wall Follower Algorithm</h1>
                        <p>Execution Time: {typeof this.state.wallFollowerTime === 'number' ? this.state.wallFollowerTime.toFixed(2) : 'N/A'} ms</p>
                        <p>Visited Cells: {this.state.wallFollowerVisitedNodes}</p>
                        <p>Visited Percentage: {typeof this.state.wallFollowerVisitedPercentage === 'number' ? this.state.wallFollowerVisitedPercentage.toFixed(2) : 'N/A'}%</p>
                        <p>Wall Follower Algorithm Path Length: {this.state.pathLengthWallFollower}</p>
                        {Array.isArray(gridWallFollower) && gridWallFollower.map((row, rowIndex) => {
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

const getInitialGrid = (numOfRows, numOfCols, singlePath) => {
    const { gridDijsktra, gridAstar, gridBFS, gridDFS, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBFSStartNode, gridBFSEndNode, gridDFSStartNode, gridDFSEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = generateMaze(numOfRows, numOfCols, singlePath);
    return {
        gridDijkstra: gridDijsktra,
        gridAstar: gridAstar,
        gridBFS: gridBFS,
        gridDFS: gridDFS,
        gridWallFollower,
        gridDijkstraStartNode: gridDijkstraStartNode,
        gridDijkstraEndNode: gridDijkstraEndNode,
        gridAstarStartNode: gridAstarStartNode,
        gridAstarEndNode: gridAstarEndNode,
        gridBFSStartNode: gridBFSStartNode,
        gridBFSEndNode: gridBFSEndNode,
        gridDFSStartNode: gridDFSStartNode,
        gridDFSEndNode: gridDFSEndNode,
        gridWallFollowerStartNode: gridWallFollowerStartNode,
        gridWallFollowerEndNode: gridWallFollowerEndNode
    };
};