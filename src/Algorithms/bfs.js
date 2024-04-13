export function bfs(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    const queue = [];
    startNode.distance = 0;
    queue.push(startNode);
    while (queue.length !== 0) {
        const currentNode = queue.shift();
        if (currentNode.isWall) continue;
        if (currentNode.distance === Infinity) return visitedNodesInOrder;
        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        if (currentNode === endNode) return visitedNodesInOrder;
        const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
        if (unvisitedNeighbors.length === 0) break; // Add this line
        for (const neighbor of unvisitedNeighbors) {
            neighbor.distance = currentNode.distance + 1;
            neighbor.previousNode = currentNode;
            queue.push(neighbor);
        }
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const {col, row} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
}