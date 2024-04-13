import { generateMaze } from './mazeGenerator';
import { dijkstra, getNodesInShortestPathOrder} from './dijkstra';
import { astar } from './astar';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { wallFollower } from './wall_follower';

export function runTest(numMazes) {
    const numRows = 100;
    const numCols = 100;
    const metrics = {
        dijkstra: { time: [], visitedNodes: [], visitedPercentage: [], pathLength: [] },
        aStar: { time: [], visitedNodes: [], visitedPercentage: [], pathLength: [] },
        bfs: { time: [], visitedNodes: [], visitedPercentage: [], pathLength: [] },
        dfs: { time: [], visitedNodes: [], visitedPercentage: [], pathLength: [] },
        wallFollower: { time: [], visitedNodes: [], visitedPercentage: [], pathLength: [] }
    };

    // Test mazes with a single path
    for (let i = 0; i < numMazes; i++) {
        const { gridDijkstra, gridAstar, gridBFS, gridDFS, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBFSStartNode, gridBFSEndNode, gridDFSStartNode, gridDFSEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = getInitialGrid(numRows, numCols, true);

        // Dijkstra
        const startTimeDijkstra = performance.now();
        const visitedNodesInOrderDijkstra = dijkstra(gridDijkstra, gridDijkstraStartNode, gridDijkstraEndNode);
        const endTimeDijkstra = performance.now();
        const nodesInShortestPathOrderDijkstra = getNodesInShortestPathOrder(gridDijkstraEndNode);
        metrics.dijkstra.time.push(endTimeDijkstra - startTimeDijkstra);
        metrics.dijkstra.visitedNodes.push(visitedNodesInOrderDijkstra.length);
        metrics.dijkstra.visitedPercentage.push(visitedNodesInOrderDijkstra.length / (numRows * numCols) * 100);
        metrics.dijkstra.pathLength.push(nodesInShortestPathOrderDijkstra.length);

        // A*
        const startTimeAStar = performance.now();
        const visitedNodesInOrderAStar = astar(gridAstar, gridAstarStartNode, gridAstarEndNode);
        const endTimeAStar = performance.now();
        const nodesInShortestPathOrderAStar = getNodesInShortestPathOrder(gridAstarEndNode);
        metrics.aStar.time.push(endTimeAStar- startTimeAStar);
        metrics.aStar.visitedNodes.push(visitedNodesInOrderAStar.length);
        metrics.aStar.visitedPercentage.push(visitedNodesInOrderAStar.length / (numRows * numCols) * 100);
        metrics.aStar.pathLength.push(nodesInShortestPathOrderAStar.length);

        // BFS
        const startTimeBFS = performance.now();
        const visitedNodesInOrderBFS = bfs(gridBFS, gridBFSStartNode, gridBFSEndNode);
        const endTimeBFS = performance.now();
        const nodesInShortestPathOrderBFS = getNodesInShortestPathOrder(gridBFSEndNode);
        metrics.bfs.time.push(endTimeBFS - startTimeBFS);
        metrics.bfs.visitedNodes.push(visitedNodesInOrderBFS.length);
        metrics.bfs.visitedPercentage.push(visitedNodesInOrderBFS.length / (numRows * numCols) * 100);
        metrics.bfs.pathLength.push(nodesInShortestPathOrderBFS.length);

        // DFS
        const startTimeDFS = performance.now();
        const visitedNodesInOrderDFS = dfs(gridDFS, gridDFSStartNode, gridDFSEndNode);
        const endTimeDFS = performance.now();
        const nodesInShortestPathOrderDFS = getNodesInShortestPathOrder(gridDFSEndNode);
        metrics.dfs.time.push(endTimeDFS - startTimeDFS);
        metrics.dfs.visitedNodes.push(visitedNodesInOrderDFS.length);
        metrics.dfs.visitedPercentage.push(visitedNodesInOrderDFS.length / (numRows * numCols) * 100);
        metrics.dfs.pathLength.push(nodesInShortestPathOrderDFS.length);

        // Wall Follower
        const startTimeWallFollower = performance.now();
        const visitedNodesInOrderWallFollower = wallFollower(gridWallFollower, gridWallFollowerStartNode, gridWallFollowerEndNode);
        const endTimeWallFollower = performance.now();
        const nodesInShortestPathOrderWallFollower = getNodesInShortestPathOrder(gridWallFollowerEndNode);
        metrics.wallFollower.time.push(endTimeWallFollower - startTimeWallFollower);
        metrics.wallFollower.visitedNodes.push(visitedNodesInOrderWallFollower.length);
        metrics.wallFollower.visitedPercentage.push(visitedNodesInOrderWallFollower.length / (numRows * numCols) * 100);
        metrics.wallFollower.pathLength.push(nodesInShortestPathOrderWallFollower.length);

    }

    // Test mazes with multiple paths
    for (let i = 0; i < numMazes; i++) {
        const { gridDijkstra, gridAstar, gridBFS, gridDFS, gridWallFollower, gridDijkstraStartNode, gridDijkstraEndNode, gridAstarStartNode, gridAstarEndNode, gridBFSStartNode, gridBFSEndNode, gridDFSStartNode, gridDFSEndNode, gridWallFollowerStartNode, gridWallFollowerEndNode } = getInitialGrid(numRows, numCols, false);

        // Dijkstra
        const startTimeDijkstra = performance.now();
        const visitedNodesInOrderDijkstra = dijkstra(gridDijkstra, gridDijkstraStartNode, gridDijkstraEndNode);
        const endTimeDijkstra = performance.now();
        const nodesInShortestPathOrderDijkstra = getNodesInShortestPathOrder(gridDijkstraEndNode);
        metrics.dijkstra.time.push(endTimeDijkstra - startTimeDijkstra);
        metrics.dijkstra.visitedNodes.push(visitedNodesInOrderDijkstra.length);
        metrics.dijkstra.visitedPercentage.push(visitedNodesInOrderDijkstra.length / (numRows * numCols) * 100);
        metrics.dijkstra.pathLength.push(nodesInShortestPathOrderDijkstra.length);

        // A*
        const startTimeAStar = performance.now();
        const visitedNodesInOrderAStar = astar(gridAstar, gridAstarStartNode, gridAstarEndNode);
        const endTimeAStar = performance.now();
        const nodesInShortestPathOrderAStar = getNodesInShortestPathOrder(gridAstarEndNode);
        metrics.aStar.time.push(endTimeAStar- startTimeAStar);
        metrics.aStar.visitedNodes.push(visitedNodesInOrderAStar.length);
        metrics.aStar.visitedPercentage.push(visitedNodesInOrderAStar.length / (numRows * numCols) * 100);
        metrics.aStar.pathLength.push(nodesInShortestPathOrderAStar.length);

        // BFS
        const startTimeBFS = performance.now();
        const visitedNodesInOrderBFS = bfs(gridBFS, gridBFSStartNode, gridBFSEndNode);
        const endTimeBFS = performance.now();
        const nodesInShortestPathOrderBFS = getNodesInShortestPathOrder(gridBFSEndNode);
        metrics.bfs.time.push(endTimeBFS - startTimeBFS);
        metrics.bfs.visitedNodes.push(visitedNodesInOrderBFS.length);
        metrics.bfs.visitedPercentage.push(visitedNodesInOrderBFS.length / (numRows * numCols) * 100);
        metrics.bfs.pathLength.push(nodesInShortestPathOrderBFS.length);

        // DFS
        const startTimeDFS = performance.now();
        const visitedNodesInOrderDFS = dfs(gridDFS, gridDFSStartNode, gridDFSEndNode);
        const endTimeDFS = performance.now();
        const nodesInShortestPathOrderDFS = getNodesInShortestPathOrder(gridDFSEndNode);
        metrics.dfs.time.push(endTimeDFS - startTimeDFS);
        metrics.dfs.visitedNodes.push(visitedNodesInOrderDFS.length);
        metrics.dfs.visitedPercentage.push(visitedNodesInOrderDFS.length / (numRows * numCols) * 100);
        metrics.dfs.pathLength.push(nodesInShortestPathOrderDFS.length);

        // Wall Follower
        const startTimeWallFollower = performance.now();
        const visitedNodesInOrderWallFollower = wallFollower(gridWallFollower, gridWallFollowerStartNode, gridWallFollowerEndNode);
        const endTimeWallFollower = performance.now();
        const nodesInShortestPathOrderWallFollower = getNodesInShortestPathOrder(gridWallFollowerEndNode);
        metrics.wallFollower.time.push(endTimeWallFollower - startTimeWallFollower);
        metrics.wallFollower.visitedNodes.push(visitedNodesInOrderWallFollower.length);
        metrics.wallFollower.visitedPercentage.push(visitedNodesInOrderWallFollower.length / (numRows * numCols) * 100);
        metrics.wallFollower.pathLength.push(nodesInShortestPathOrderWallFollower.length);
    }

    // Calculate averages and log results
    const averages = calculateAverages(metrics);
    console.log(averages);

    // Write results to a .csv file
    writeResultsToCsv('./averages.csv', averages);
}

function calculateAverages(metrics) {
    const averages = {
        dijkstra: { time: 0, visitedNodes: 0, visitedPercentage: 0, pathLength: 0 },
        aStar: { time: 0, visitedNodes: 0, visitedPercentage: 0, pathLength: 0 },
        bfs: { time: 0, visitedNodes: 0, visitedPercentage: 0, pathLength: 0 },
        dfs: { time: 0, visitedNodes: 0, visitedPercentage: 0, pathLength: 0 },
        wallFollower: { time: 0, visitedNodes: 0, visitedPercentage: 0, pathLength: 0 }
    };

    for (const algorithm in metrics) {
        const numTests = metrics[algorithm].time.length;
        for (const metric in metrics[algorithm]) {
            const sum = metrics[algorithm][metric].reduce((a, b) => a + b, 0);
            averages[algorithm][metric] = sum / numTests;
        }
    }

    return averages;
}

function writeResultsToCsv(filename, averages) {
    const header = ['Algorithm', 'Time', 'VisitedNodes', 'VisitedPercentage', 'PathLength'];
    const rows = [];

    for (const algorithm in averages) {
        const row = [
            algorithm,
            averages[algorithm].time,
            averages[algorithm].visitedNodes,
            averages[algorithm].visitedPercentage,
            averages[algorithm].pathLength
        ];
        rows.push(row.join(','));
    }

    const csv = [header.join(','), ...rows].join('\n');
    downloadCsv(filename, csv);
}

function downloadCsv(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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