package main

import (
	"errors"
	"fmt"
	"runtime"
	"server/algorithms"
	"server/maze"
	"strconv"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Metrics struct {
	Time              []float64 `json:"time"`
	VisitedNodes      []int     `json:"visited_nodes"`
	VisitedPercentage []float64 `json:"visited_percentage"`
	PathLength        []int     `json:"path_length"`
	MemoryUsed        []float64 `json:"memory_used"`
}

var (
	algorithmsMap = map[string]algorithms.Algorithm{
		"dijkstra":     algorithms.Dijkstra{},
		"astar":        algorithms.Astar{},
		"bfs":          algorithms.BFS{},
		"dfs":          algorithms.DFS{},
		"wallFollower": algorithms.WallFollower{},
	}
	metrics             = initializeMetrics()
	visitedNodesResults = make(map[string][]maze.Node)
)

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Replace with your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/api/mazeHandler", mazeHandler)

	r.Run(":5000")
}

func mazeHandler(c *gin.Context) {
	mazeSizeStr := c.DefaultQuery("size", "10")
	mazeSize, err := strconv.Atoi(mazeSizeStr)
	if err != nil || mazeSize <= 0 {
		c.JSON(400, gin.H{"error": "Invalid maze size"})
		return
	}

	singlePathStr := c.DefaultQuery("singlePath", "true")
	singlePath, err := stringToBool(singlePathStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid singlePath value"})
		return
	}

	mazeData := maze.GenerateMaze(mazeSize, mazeSize, singlePath)

	// Run algorithms on the generated maze
	runAlgorithms(mazeData)

	c.JSON(200, gin.H{
		"gridDijkstra":              mazeData["gridDijkstra"],
		"gridAstar":                 mazeData["gridAstar"],
		"gridBfs":                   mazeData["gridBFS"],
		"gridDfs":                   mazeData["gridDFS"],
		"gridWallFollower":          mazeData["gridWallFollower"],
		"gridDijkstraStartNode":     mazeData["gridDijkstraStartNode"],
		"gridAstarStartNode":        mazeData["gridAstarStartNode"],
		"gridBfsStartNode":          mazeData["gridBFSStartNode"],
		"gridDfsStartNode":          mazeData["gridDFSStartNode"],
		"gridWallFollowerStartNode": mazeData["gridWallFollowerStartNode"],
		"gridDijkstraEndNode":       mazeData["gridDijkstraEndNode"],
		"gridAstarEndNode":          mazeData["gridAstarEndNode"],
		"gridBfsEndNode":            mazeData["gridBFSEndNode"],
		"gridDfsEndNode":            mazeData["gridDFSEndNode"],
		"gridWallFollowerEndNode":   mazeData["gridWallFollowerEndNode"],
		"visitedNodesResults":       visitedNodesResults,
		"metrics":                   metrics,
		"nodesInShortestPathOrder":  getAllNodesInShortestPathOrder(),
	})
}

func stringToBool(s string) (bool, error) {
	switch s {
	case "true", "1":
		return true, nil
	case "false", "0":
		return false, nil
	default:
		return true, errors.New("invalid boolean value")
	}
}

func initializeMetrics() map[string]*Metrics {
	return map[string]*Metrics{
		"dijkstra":     {},
		"astar":        {},
		"bfs":          {},
		"dfs":          {},
		"wallFollower": {},
	}
}

func runAlgorithms(mazeData map[string]interface{}) {
	visitedNodesResults = make(map[string][]maze.Node)
	var requestData struct {
		Grids      map[string][][]maze.Node `json:"grids"`
		StartNodes map[string]maze.Node     `json:"start_nodes"`
		EndNodes   map[string]maze.Node     `json:"end_nodes"`
	}

	// Map mazeData to requestData
	requestData.Grids = map[string][][]maze.Node{
		"gridDijkstra":     mazeData["gridDijkstra"].([][]maze.Node),
		"gridAstar":        mazeData["gridAstar"].([][]maze.Node),
		"gridBfs":          mazeData["gridBFS"].([][]maze.Node),
		"gridDfs":          mazeData["gridDFS"].([][]maze.Node),
		"gridWallFollower": mazeData["gridWallFollower"].([][]maze.Node),
	}
	requestData.StartNodes = map[string]maze.Node{
		"gridDijkstraStartNode":     mazeData["gridDijkstraStartNode"].(maze.Node),
		"gridAstarStartNode":        mazeData["gridAstarStartNode"].(maze.Node),
		"gridBfsStartNode":          mazeData["gridBFSStartNode"].(maze.Node),
		"gridDfsStartNode":          mazeData["gridDFSStartNode"].(maze.Node),
		"gridWallFollowerStartNode": mazeData["gridWallFollowerStartNode"].(maze.Node),
	}
	requestData.EndNodes = map[string]maze.Node{
		"gridDijkstraEndNode":     mazeData["gridDijkstraEndNode"].(maze.Node),
		"gridAstarEndNode":        mazeData["gridAstarEndNode"].(maze.Node),
		"gridBfsEndNode":          mazeData["gridBFSEndNode"].(maze.Node),
		"gridDfsEndNode":          mazeData["gridDFSEndNode"].(maze.Node),
		"gridWallFollowerEndNode": mazeData["gridWallFollowerEndNode"].(maze.Node),
	}

	var wg sync.WaitGroup
	for algorithm, algoData := range algorithmsMap {
		wg.Add(1)
		go func(algorithm string, algoData algorithms.Algorithm) {
			defer wg.Done()

			gridKey := ""
			if algorithm == "wallFollower" {
				gridKey = "gridWallFollower"
			} else {
				gridKey = "grid" + cases.Title(language.English).String(algorithm)
			}

			startNodeKey := gridKey + "StartNode"
			endNodeKey := gridKey + "EndNode"

			grid, gridExists := requestData.Grids[gridKey]
			startNode, startNodeExists := requestData.StartNodes[startNodeKey]
			endNode, endNodeExists := requestData.EndNodes[endNodeKey]

			if gridExists && startNodeExists && endNodeExists {
				fmt.Printf("Running algorithm: %s\n", algorithm)
				visitedNodes := runAlgorithm(algorithm, grid, &startNode, &endNode, metrics)
				visitedNodesResults[algorithm] = visitedNodes
			} else {
				fmt.Printf("Missing data for algorithm: %s\n", algorithm)
				if !gridExists {
					fmt.Printf("Missing grid data for %s\n", gridKey)
				}
				if !startNodeExists {
					fmt.Printf("Missing start node data for %s\n", startNodeKey)
				}
				if !endNodeExists {
					fmt.Printf("Missing end node data for %s\n", endNodeKey)
				}
			}
		}(algorithm, algoData)
	}
	wg.Wait()
}
func runAlgorithm(
	algorithm string,
	grid [][]maze.Node,
	startNode *maze.Node,
	endNode *maze.Node,
	metrics map[string]*Metrics,
) []maze.Node {
	fmt.Printf("Starting algorithm: %s\n", algorithm)

	// Remove the following line
	// convertPreviousNodesToIndex(grid, nodeIndexMap)

	startTime := time.Now()
	var initialMemoryUsage runtime.MemStats
	runtime.ReadMemStats(&initialMemoryUsage)

	// Run the algorithm and get the shortest path nodes
	visitedNodesInOrder := algorithmsMap[algorithm].FindPath(grid, startNode, endNode)
	// convertPreviousNodesToPointer(grid) // Optional based on algorithm needs

	endTime := time.Now()
	var finalMemoryUsage runtime.MemStats
	runtime.ReadMemStats(&finalMemoryUsage)

	metrics[algorithm].Time = append(metrics[algorithm].Time, endTime.Sub(startTime).Seconds())
	metrics[algorithm].MemoryUsed = append(metrics[algorithm].MemoryUsed, float64(finalMemoryUsage.Alloc-initialMemoryUsage.Alloc)/1024/1024)
	metrics[algorithm].VisitedNodes = append(metrics[algorithm].VisitedNodes, len(visitedNodesInOrder))

	// Assuming grid size is square
	totalNodes := len(grid) * len(grid)
	visitedPercentage := (float64(len(visitedNodesInOrder)) / float64(totalNodes)) * 100
	metrics[algorithm].VisitedPercentage = append(metrics[algorithm].VisitedPercentage, visitedPercentage)
	metrics[algorithm].PathLength = append(metrics[algorithm].PathLength, len(visitedNodesInOrder))

	return visitedNodesInOrder
}

func getNodesInShortestPathOrder(endNode *maze.Node) []*maze.Node {
	var nodesInShortestPathOrder []*maze.Node
	currentNode := endNode
	for currentNode != nil {
		nodesInShortestPathOrder = append(nodesInShortestPathOrder, currentNode)
		currentNode = currentNode.PreviousNode
	}

	// Reverse the path
	for i, j := 0, len(nodesInShortestPathOrder)-1; i < j; i, j = i+1, j-1 {
		nodesInShortestPathOrder[i], nodesInShortestPathOrder[j] = nodesInShortestPathOrder[j], nodesInShortestPathOrder[i]
	}

	return nodesInShortestPathOrder
}

// Assuming nodeIndexMap is accessible globally or passed as needed
var nodeIndexMap = make(map[*maze.Node]uint16)

func getAllNodesInShortestPathOrder() map[string][]uint16 {
	nodesInShortestPathOrder := make(map[string][]uint16)
	for algorithm, endNode := range getEndNodes() {
		indices := []uint16{}
		for _, node := range getNodesInShortestPathOrder(endNode) {
			indices = append(indices, nodeIndexMap[node])
		}
		nodesInShortestPathOrder[algorithm] = indices
	}
	return nodesInShortestPathOrder
}

func getEndNodes() map[string]*maze.Node {
	endNodes := make(map[string]*maze.Node)

	for algorithm, nodes := range visitedNodesResults {
		if len(nodes) > 0 {
			endNodes[getEndNodeKey(algorithm)] = &nodes[len(nodes)-1] // Last node as end node
		}
	}
	return endNodes
}

func getEndNodeKey(algorithm string) string {
	switch algorithm {
	case "dijkstra":
		return "gridDijkstraEndNode"
	case "astar":
		return "gridAstarEndNode"
	case "bfs":
		return "gridBfsEndNode"
	case "dfs":
		return "gridDfsEndNode"
	case "wallFollower":
		return "gridWallFollowerEndNode"
	default:
		return ""
	}
}
