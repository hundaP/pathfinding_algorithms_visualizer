class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.walls = { top: true, right: true, bottom: true, left: true };
      this.visited = false;
    }
  }
  
  class Maze {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.grid = [];
      this.stack = [];
  
      for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
          row.push(new Cell(x, y));
        }
        this.grid.push(row);
      }
  
      this.currentCell = this.grid[0][0];
    }
  
    getCell(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return undefined;
      }
      return this.grid[y][x];
    }
  
    getNeighbors(cell) {
      let neighbors = [];
  
      let top = this.getCell(cell.x, cell.y - 1);
      let right = this.getCell(cell.x + 1, cell.y);
      let bottom = this.getCell(cell.x, cell.y + 1);
      let left = this.getCell(cell.x - 1, cell.y);
  
      if (top && !top.visited) neighbors.push(top);
      if (right && !right.visited) neighbors.push(right);
      if (bottom && !bottom.visited) neighbors.push(bottom);
      if (left && !left.visited) neighbors.push(left);
  
      if (neighbors.length > 0) {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
      } else {
        return undefined;
      }
    }
  
    removeWalls(cell1, cell2) {
      let x = cell1.x - cell2.x;
      if (x === 1) {
        cell1.walls.left = false;
        cell2.walls.right = false;
      } else if (x === -1) {
        cell1.walls.right = false;
        cell2.walls.left = false;
      }
  
      let y = cell1.y - cell2.y;
      if (y === 1) {
        cell1.walls.top = false;
        cell2.walls.bottom = false;
      } else if (y === -1) {
        cell1.walls.bottom = false;
        cell2.walls.top = false;
      }
    }
  
    generateMaze() {
      this.currentCell.visited = true;
      let nextCell = this.getNeighbors(this.currentCell);
  
      if (nextCell) {
        nextCell.visited = true;
  
        this.stack.push(this.currentCell);
  
        this.removeWalls(this.currentCell, nextCell);
  
        this.currentCell = nextCell;
      } else if (this.stack.length > 0) {
        this.currentCell = this.stack.pop();
      }
      this.start = this.grid[0][0]; // Top-left corner
      this.end = this.grid[this.height - 1][this.width - 1]; // Bottom-right corner
    }
  }
  // Create a new Maze instance
  let maze = new Maze(20, 10);
  
  // Generate the maze
  while (maze.stack.length > 0 || !maze.currentCell.visited) {
    maze.generateMaze();
  }
  
  // Output the maze
  for (let y = 0; y < maze.height; y++) {
    let rowTop = "";
    let rowMid = "";
    for (let x = 0; x < maze.width; x++) {
      let cell = maze.grid[y][x];
      rowTop += cell.walls.top ? "+---" : "+   ";
      rowMid += cell.walls.left ? "|   " : "    ";
      if (cell === maze.start) {
        rowMid = rowMid.slice(0, -3) + " S ";
      } else if (cell === maze.end) {
        rowMid = rowMid.slice(0, -3) + " E ";
      }
    }
    console.log(rowTop + "+");
    console.log(rowMid + "|");
  }
  console.log("+---".repeat(maze.width) + "+");