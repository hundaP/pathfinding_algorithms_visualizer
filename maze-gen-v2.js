class Cell {
    constructor(x, y, isWall = false) {
      this.x = x;
      this.y = y;
      this.isWall = isWall;
      this.visited = false;
    }
  }
  
  class Maze {
    constructor(width, height) {
      this.width = width * 2 + 1; // Adjust for walls
      this.height = height * 2 + 1; // Adjust for walls
      this.grid = [];
      this.stack = [];
  
      for (let y = 0; y < this.height; y++) {
        let row = [];
        for (let x = 0; x < this.width; x++) {
          let isWall = x % 2 === 0 || y % 2 === 0; // All cells at even indices are walls
          row.push(new Cell(x, y, isWall));
        }
        this.grid.push(row);
      }
  
      this.currentCell = this.grid[1][1]; // Start at the top-left corner
      this.start = this.grid[1][1]; // Top-left corner
      this.end = this.grid[this.height - 2][this.width - 2]; // Bottom-right corner
    }
  
    getCell(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
        return undefined;
      }
      return this.grid[y][x];
    }
  
    getNeighbors(cell) {
      let neighbors = [];
  
      let top = this.getCell(cell.x, cell.y - 2);
      let right = this.getCell(cell.x + 2, cell.y);
      let bottom = this.getCell(cell.x, cell.y + 2);
      let left = this.getCell(cell.x - 2, cell.y);
  
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
  
    generateMaze() {
      this.currentCell.visited = true;
      let nextCell = this.getNeighbors(this.currentCell);
  
      if (nextCell) {
        nextCell.visited = true;
  
        this.stack.push(this.currentCell);
  
        // Remove the wall between the current cell and the next cell
        let wallX = (this.currentCell.x + nextCell.x) / 2;
        let wallY = (this.currentCell.y + nextCell.y) / 2;
        this.grid[wallY][wallX].isWall = false;
  
        this.currentCell = nextCell;
      } else if (this.stack.length > 0) {
        this.currentCell = this.stack.pop();
      }
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
    let row = "";
    for (let x = 0; x < maze.width; x++) {
      let cell = maze.grid[y][x];
      if (cell === maze.start) {
        row += "S";
      } else if (cell === maze.end) {
        row += "E";
      } else {
        row += cell.isWall ? "#" : " ";
      }
    }
    console.log(row);
  }