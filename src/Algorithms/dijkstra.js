import { PriorityQueue } from './priority_queue.js';

export function dijkstra(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = new PriorityQueue((a, b) => a.distance - b.distance);
    unvisitedNodes.enqueue(startNode);

    while (!unvisitedNodes.isEmpty()) {
        const closestNode = unvisitedNodes.dequeue();

        // If there is a wall, skip it
        if (closestNode.isWall) continue;
        // If distance is infinity, we are trapped and should stop
        if (closestNode.distance === Infinity) return visitedNodesInOrder;

        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        if (closestNode === endNode) return visitedNodesInOrder;
        updateUnvisitedNeighbors(closestNode, grid, unvisitedNodes);
    }
}
function updateUnvisitedNeighbors(node, grid, unvisitedNodes) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        if (neighbor.isVisited) continue; // Skip if the neighbor is visited

        const newDistance = node.distance + 1;
        if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance;
            neighbor.previousNode = node;
            if (!unvisitedNodes.contains(neighbor)) {
                unvisitedNodes.enqueue(neighbor);
            } else {
                unvisitedNodes.decreaseKey(neighbor, newDistance);
            }
        }
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
}

