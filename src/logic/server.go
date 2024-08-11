package main

import (
	"net/http"
	"path/filepath"
	"runtime"
	"time"

	"visualization_logic/algorithms"
	"visualization_logic/maze"

	"github.com/gin-gonic/gin"
)

type Metrics struct {
	Time              []float64
	VisitedNodes      []int
	VisitedPercentage []float64
	PathLength        []int
	MemoryUsed        []float64
}

var algorithmsMap = map[string]algorithms.Algorithm{
	"dijkstra":     algorithms.Dijkstra{},
	"astar":        algorithms.Astar{},
	"bfs":          algorithms.BFS{},
	"dfs":          algorithms.DFS{},
	"wallFollower": algorithms.WallFollower{},
}

// Initialize metrics for all algorithms
func initializeMetrics() map[string]*Metrics {
	return map[string]*Metrics{
		"dijkstra":     {},
		"astar":        {},
		"bfs":          {},
		"dfs":          {},
		"wallFollower": {},
	}
}

// Run the specified algorithm and update metrics
func runAlgorithm(
	algorithm string,
	grid [][]maze.Node,
	startNode *maze.Node,
	endNode *maze.Node,
	metrics map[string]*Metrics,
) {
	startTime := time.Now()
	var initialMemoryUsage runtime.MemStats
	runtime.ReadMemStats(&initialMemoryUsage)

	visitedNodesInOrder := algorithmsMap[algorithm].FindPath(grid, startNode, endNode)

	var midMemoryUsage runtime.MemStats
	runtime.ReadMemStats(&midMemoryUsage)

	nodesInShortestPathOrder := getNodesInShortestPathOrder(endNode)

	var finalMemoryUsage runtime.MemStats
	runtime.ReadMemStats(&finalMemoryUsage)

	endTime := time.Now()
	timeTaken := endTime.Sub(startTime).Seconds() // Convert to seconds

	// Calculate memory usage
	var memoryUsed float64
	if finalMemoryUsage.HeapAlloc >= initialMemoryUsage.HeapAlloc {
		memoryUsed = float64(finalMemoryUsage.HeapAlloc-initialMemoryUsage.HeapAlloc) / (1024 * 1024) // Convert to MB
	} else {
		memoryUsed = 0
	}

	totalNodes := len(grid) * len(grid[0])
	wallNodes := countWallNodes(grid)
	nonWallNodes := totalNodes - wallNodes
	visitedPercentage := (float64(len(visitedNodesInOrder)) / float64(nonWallNodes)) * 100

	metrics[algorithm].Time = append(metrics[algorithm].Time, timeTaken)
	metrics[algorithm].VisitedNodes = append(
		metrics[algorithm].VisitedNodes,
		len(visitedNodesInOrder),
	)
	metrics[algorithm].VisitedPercentage = append(
		metrics[algorithm].VisitedPercentage,
		visitedPercentage,
	)
	metrics[algorithm].PathLength = append(
		metrics[algorithm].PathLength,
		len(nodesInShortestPathOrder),
	)
	metrics[algorithm].MemoryUsed = append(metrics[algorithm].MemoryUsed, memoryUsed)
}

// Get the nodes in the shortest path order
func getNodesInShortestPathOrder(endNode *maze.Node) []*maze.Node {
	var nodesInShortestPathOrder []*maze.Node
	currentNode := endNode
	for currentNode != nil {
		nodesInShortestPathOrder = append(nodesInShortestPathOrder, currentNode)
		currentNode = currentNode.PreviousNode
	}

	// Reverse the slice
	for i, j := 0, len(nodesInShortestPathOrder)-1; i < j; i, j = i+1, j-1 {
		nodesInShortestPathOrder[i], nodesInShortestPathOrder[j] = nodesInShortestPathOrder[j], nodesInShortestPathOrder[i]
	}

	return nodesInShortestPathOrder
}

// Count the number of wall nodes in the grid
func countWallNodes(grid [][]maze.Node) int {
	count := 0
	for _, row := range grid {
		for _, node := range row {
			if node.IsWall {
				count++
			}
		}
	}
	return count
}

// Calculate the average metrics for all algorithms
func calculateAverages(metrics map[string]*Metrics) map[string]map[string]float64 {
	averages := make(map[string]map[string]float64)
	for algorithm, metric := range metrics {
		averages[algorithm] = make(map[string]float64)
		numTests := float64(len(metric.Time))
		if numTests == 0 {
			continue
		}
		for _, time := range metric.Time {
			averages[algorithm]["time"] += time
		}
		for _, visitedNodes := range metric.VisitedNodes {
			averages[algorithm]["visitedNodes"] += float64(visitedNodes)
		}
		for _, visitedPercentage := range metric.VisitedPercentage {
			averages[algorithm]["visitedPercentage"] += visitedPercentage
		}
		for _, pathLength := range metric.PathLength {
			averages[algorithm]["pathLength"] += float64(pathLength)
		}
		for _, memoryUsed := range metric.MemoryUsed {
			averages[algorithm]["memoryUsed"] += memoryUsed
		}
		for key := range averages[algorithm] {
			averages[algorithm][key] /= numTests
		}
	}
	return averages
}

// Serve the React app
func serveReactApp(c *gin.Context) {
	path := c.Param("path")
	if path == "" {
		path = "index.html"
	}
	fullPath := filepath.Join("../../build", path)
	c.File(fullPath)
}

func main() {
	router := gin.Default()
	metrics := initializeMetrics()

	// Serve static files from the React build directory
	router.Static("/static", "./build/static")

	// Initialize grids and nodes
	numRows, numCols := 10, 10 // Example values
	singlePath := true         // Example value
	grids, startNodes, endNodes := getInitialGrid(numRows, numCols, singlePath)

	// API endpoint to run the algorithm
	router.POST("/api/run", func(c *gin.Context) {
		var requestData struct {
			Algorithm string `json:"algorithm"`
		}

		if err := c.ShouldBindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		algorithm := requestData.Algorithm
		grid, ok1 := grids[algorithm]
		startNode, ok2 := startNodes[algorithm]
		endNode, ok3 := endNodes[algorithm]

		if !ok1 || !ok2 || !ok3 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid algorithm"})
			return
		}

		runAlgorithm(algorithm, grid, startNode, endNode, metrics)
		c.JSON(http.StatusOK, gin.H{"message": "Algorithm executed successfully"})
	})

	// API endpoint to get the averages
	router.GET("/api/averages", func(c *gin.Context) {
		averages := calculateAverages(metrics)
		c.JSON(http.StatusOK, averages)
	})

	// Serve the React app
	router.NoRoute(serveReactApp)

	router.Run(":8080")
}

func getInitialGrid(
	numRows, numCols int,
	singlePath bool,
) (map[string][][]maze.Node, map[string]*maze.Node, map[string]*maze.Node) {
	grids := make(map[string][][]maze.Node)
	startNodes := make(map[string]*maze.Node)
	endNodes := make(map[string]*maze.Node)

	mazeData := maze.GenerateMaze(numRows, numCols, singlePath)

	grids["dijkstra"] = mazeData["gridDijkstra"].([][]maze.Node)
	grids["astar"] = mazeData["gridAstar"].([][]maze.Node)
	grids["bfs"] = mazeData["gridBFS"].([][]maze.Node)
	grids["dfs"] = mazeData["gridDFS"].([][]maze.Node)
	grids["wallFollower"] = mazeData["gridWallFollower"].([][]maze.Node)

	startNodes["dijkstra"] = mazeData["gridDijkstraStartNode"].(*maze.Node)
	startNodes["astar"] = mazeData["gridAstarStartNode"].(*maze.Node)
	startNodes["bfs"] = mazeData["gridBFSStartNode"].(*maze.Node)
	startNodes["dfs"] = mazeData["gridDFSStartNode"].(*maze.Node)
	startNodes["wallFollower"] = mazeData["gridWallFollowerStartNode"].(*maze.Node)

	endNodes["dijkstra"] = mazeData["gridDijkstraEndNode"].(*maze.Node)
	endNodes["astar"] = mazeData["gridAstarEndNode"].(*maze.Node)
	endNodes["bfs"] = mazeData["gridBFSEndNode"].(*maze.Node)
	endNodes["dfs"] = mazeData["gridDFSEndNode"].(*maze.Node)
	endNodes["wallFollower"] = mazeData["gridWallFollowerEndNode"].(*maze.Node)

	return grids, startNodes, endNodes
}
