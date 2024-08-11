package maze

import (
	"math"
	"math/rand"
	"time"
)

type Cell struct {
	X, Y    uint16
	IsWall  bool
	Visited bool
}

type Node struct {
	X                 uint16  `json:"col"`
	Y                 uint16  `json:"row"`
	IsStart           bool    `json:"isStart"`
	IsEnd             bool    `json:"isEnd"`
	Distance          uint32  `json:"distance"`
	IsVisited         bool    `json:"isVisited"`
	IsWall            bool    `json:"isWall"`
	PreviousNode      *Node   `json:"previousNode,omitempty"` // Keep as *Node for Go logic
	GridId            uint8   `json:"gridId"`
	NoOfVisits        uint8   `json:"noOfVisits"`
	H                 float32 `json:"h,omitempty"`
	F                 float32 `json:"f,omitempty"`
	Index             uint16  `json:"index"` // New field
	PreviousNodeIndex uint16  `json:"previousNodeIndex"`
}

type Maze struct {
	Width, Height int
	Grid          [][]Cell
	Stack         []*Cell
	CurrentCell   *Cell
	Start         *Cell
	End           *Cell
}

func NewMaze(width, height int) *Maze {
	// Increase dimensions by 1 if they're even
	if width%2 == 0 {
		width++
	}
	if height%2 == 0 {
		height++
	}

	m := &Maze{
		Width:  width,
		Height: height,
		Grid:   make([][]Cell, height),
		Stack:  make([]*Cell, 0, (width*height)/2), // Preallocate stack with estimated capacity
	}

	// Initialize the grid with walls and paths
	for y := 0; y < height; y++ {
		m.Grid[y] = make([]Cell, width)
		for x := 0; x < width; x++ {
			isWall := (x%2 == 0) || (y%2 == 0)
			m.Grid[y][x] = Cell{X: uint16(x), Y: uint16(y), IsWall: isWall}
		}
	}

	// Set start and end cells
	m.CurrentCell = &m.Grid[1][1]
	m.Start = &m.Grid[1][1]
	m.End = &m.Grid[height-2][width-2]

	// Ensure start and end cells are not walls
	m.Grid[1][1].IsWall = false
	m.Grid[height-2][width-2].IsWall = false

	return m
}

func (m *Maze) getCell(x, y int) *Cell {
	if x < 0 || y < 0 || x >= m.Width || y >= m.Height {
		return nil
	}
	return &m.Grid[y][x]
}

func (m *Maze) getNeighbors(cell *Cell) *Cell {
	var neighbors []*Cell

	top := m.getCell(int(cell.X), int(cell.Y)-2)
	right := m.getCell(int(cell.X)+2, int(cell.Y))
	bottom := m.getCell(int(cell.X), int(cell.Y)+2)
	left := m.getCell(int(cell.X)-2, int(cell.Y))

	if top != nil && !top.Visited {
		neighbors = append(neighbors, top)
	}
	if right != nil && !right.Visited {
		neighbors = append(neighbors, right)
	}
	if bottom != nil && !bottom.Visited {
		neighbors = append(neighbors, bottom)
	}
	if left != nil && !left.Visited {
		neighbors = append(neighbors, left)
	}

	if len(neighbors) > 0 {
		if rand.Float64() < 0.75 {
			return neighbors[rand.Intn(len(neighbors))]
		}

		var maxDistance float64
		var farthestCell *Cell

		for _, neighbor := range neighbors {
			distance := math.Hypot(float64(neighbor.X-m.Start.X), float64(neighbor.Y-m.Start.Y))
			if distance > maxDistance {
				maxDistance = distance
				farthestCell = neighbor
			}
		}

		return farthestCell
	}

	return nil
}

func (m *Maze) generateMazeNotGlobal() {
	m.CurrentCell.Visited = true
	nextCell := m.getNeighbors(m.CurrentCell)

	if nextCell != nil {
		nextCell.Visited = true
		m.Stack = append(m.Stack, m.CurrentCell)

		wallX := (m.CurrentCell.X + nextCell.X) / 2
		wallY := (m.CurrentCell.Y + nextCell.Y) / 2
		m.Grid[wallY][wallX].IsWall = false

		m.CurrentCell = nextCell
	} else if len(m.Stack) > 0 {
		if rand.Float64() < 0.4 {
			backtrackCell := m.Stack[rand.Intn(len(m.Stack))]
			m.CurrentCell = backtrackCell
		} else {
			m.CurrentCell = m.Stack[len(m.Stack)-1]
			m.Stack = m.Stack[:len(m.Stack)-1]
		}
	}
}

var nodeIndex uint16 = 1

func createNode(x, y uint16, isWall bool, start, end *Cell, gridId uint8) Node {
	node := Node{
		X:                 x,
		Y:                 y,
		IsStart:           start != nil && x == start.X && y == start.Y,
		IsEnd:             end != nil && x == end.X && y == end.Y,
		Distance:          math.MaxUint32,
		IsVisited:         false,
		IsWall:            isWall,
		PreviousNode:      nil,
		GridId:            gridId,
		Index:             nodeIndex,
		PreviousNodeIndex: 0,
	}
	nodeIndex++
	return node
}

func GenerateMaze(numRows, numCols int, singlePath bool) map[string]interface{} {
	s := rand.NewSource(time.Now().UnixNano())
	r := rand.New(s)
	maze := NewMaze(numRows, numCols)

	for len(maze.Stack) > 0 || !maze.CurrentCell.Visited {
		maze.generateMazeNotGlobal()
	}

	if !singlePath {
		for i := 0; i < numRows*numCols/10; i++ {
			x := r.Intn(numRows-2) + 1
			y := r.Intn(numCols-2) + 1
			maze.Grid[x][y].IsWall = false
		}
	}

	grids := make(map[int][][]Node, 5)
	for i := 1; i <= 5; i++ {
		grid := make([][]Node, len(maze.Grid))
		for y, row := range maze.Grid {
			grid[y] = make([]Node, len(row))
			for x, cell := range row {
				grid[y][x] = createNode(cell.X, cell.Y, cell.IsWall, maze.Start, maze.End, uint8(i))
			}
		}
		grids[i] = grid
	}

	return map[string]interface{}{
		"gridDijkstra":              grids[1],
		"gridAstar":                 grids[2],
		"gridBFS":                   grids[3],
		"gridDFS":                   grids[4],
		"gridWallFollower":          grids[5],
		"gridDijkstraStartNode":     grids[1][maze.Start.Y][maze.Start.X],
		"gridDijkstraEndNode":       grids[1][maze.End.Y][maze.End.X],
		"gridAstarStartNode":        grids[2][maze.Start.Y][maze.Start.X],
		"gridAstarEndNode":          grids[2][maze.End.Y][maze.End.X],
		"gridBFSStartNode":          grids[3][maze.Start.Y][maze.Start.X],
		"gridBFSEndNode":            grids[3][maze.End.Y][maze.End.X],
		"gridDFSStartNode":          grids[4][maze.Start.Y][maze.Start.X],
		"gridDFSEndNode":            grids[4][maze.End.Y][maze.End.X],
		"gridWallFollowerStartNode": grids[5][maze.Start.Y][maze.Start.X],
		"gridWallFollowerEndNode":   grids[5][maze.End.Y][maze.End.X],
	}
}
