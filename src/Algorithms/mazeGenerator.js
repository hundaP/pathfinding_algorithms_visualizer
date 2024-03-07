export function generateMaze(numRows, numCols) {
    let grid = [];
    let startNodeCol = Math.floor(Math.random() * numCols);
    let endNodeCol = Math.floor(Math.random() * numCols);
    for (let row = 0; row < numRows; row++) {
        let currentRow = [];
        for (let col = 0; col < numCols; col++) {
            let isWall = Math.random() < 0.3; // Adjust this value to change the density of walls
            let isStart = row === 0 && col === startNodeCol;
            let isEnd = row === numRows - 1 && col === endNodeCol;
            currentRow.push(createNode(col, row, isWall, isStart, isEnd));
        }
        grid.push(currentRow);
    }

    let stack = [];
    let startNode = grid[0][startNodeCol];
    let endNode = grid[numRows - 1][endNodeCol];

    startNode.isWall = false;
    endNode.isWall = false;
    stack.push(startNode);

    // DFS - recursive backtracker to carve paths
    while (stack.length) {
        let currentNode = stack.pop();
        let neighbors = getUnvisitedNeighbors(currentNode, grid);

        if (neighbors.length) {
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            randomNeighbor.isWall = false;
            stack.push(randomNeighbor);
        }
    }
    return {
        grid: grid,
        startNode: startNode,
        endNode: endNode,
    };
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => neighbor.isWall);
}

const createNode = (col, row, isWall, isStart, isEnd) => {
    return {
        col,
        row,
        isStart,
        isEnd,
        distance: Infinity,
        isVisited: false,
        isWall,
        previousNode: null,
    };
};