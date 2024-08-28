export function wallFollower(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    let currentNode = startNode;
    let previousNode = null;
    let currentDirection = 2; // Right (matching Go implementation)

    while (currentNode !== endNode) {
        currentNode.isVisited = true;
        currentNode.noOfVisits = (currentNode.noOfVisits || 0) + 1;
        visitedNodesInOrder.push(currentNode);

        const neighbors = getPrioritizedNeighbors(currentNode, grid, currentDirection);
        let nextNode = null;

        for (const neighbor of neighbors) {
            if (!neighbor.isWall && !neighbor.isVisited) {
                nextNode = neighbor;
                break;
            }
        }

        if (nextNode) {
            nextNode.distance = currentNode.distance + 1;
            nextNode.previousNode = currentNode;
            previousNode = currentNode;
            currentDirection = getDirection(currentNode, nextNode);
            currentNode = nextNode;
        } else {
            if (previousNode) {
                currentNode = previousNode;
                previousNode = currentNode.previousNode;
                currentDirection = (currentDirection + 3) % 4; // Turn right when backtracking
            } else {
                break;
            }
        }
    }
    return visitedNodesInOrder;
}

function getPrioritizedNeighbors(node, grid, direction) {
    const neighbors = [];
    const { col, row } = node;

    const Left = 0, Up = 1, Right = 2, Down = 3;

    switch (direction) {
        case Left:
            // Prioritize Down, Left, Up, Right
            if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
            if (col > 0) neighbors.push(grid[row][col - 1]); // Left
            if (row > 0) neighbors.push(grid[row - 1][col]); // Up
            if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
            break;
        case Up:
            // Prioritize Left, Up, Right, Down
            if (col > 0) neighbors.push(grid[row][col - 1]); // Left
            if (row > 0) neighbors.push(grid[row - 1][col]); // Up
            if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
            if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
            break;
        case Right:
            // Prioritize Up, Right, Down, Left
            if (row > 0) neighbors.push(grid[row - 1][col]); // Up
            if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
            if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
            if (col > 0) neighbors.push(grid[row][col - 1]); // Left
            break;
        case Down:
            // Prioritize Right, Down, Left, Up
            if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]); // Right
            if (row < grid.length - 1) neighbors.push(grid[row + 1][col]); // Down
            if (col > 0) neighbors.push(grid[row][col - 1]); // Left
            if (row > 0) neighbors.push(grid[row - 1][col]); // Up
            break;
    }

    return neighbors;
}

function getDirection(currentNode, nextNode) {
    if (nextNode.col === currentNode.col) {
        return nextNode.row < currentNode.row ? 1 : 3; // Up : Down
    }
    return nextNode.col < currentNode.col ? 0 : 2; // Left : Right
}