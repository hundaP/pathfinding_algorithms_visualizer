package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "runtime"
    "strconv"
    "sync"
    "time"

    "server/algorithms"
    "server/maze"
)

type Metrics struct {
    Time              float64 `json:"time"`
    VisitedNodes      int     `json:"visitedNodes"`
    VisitedPercentage float64 `json:"visitedPercentage"`
    PathLength        int     `json:"pathLength"`
    MemoryUsed        float64 `json:"memoryUsed"`
}

var algorithmsMap = map[string]algorithms.Algorithm{
    "dijkstra":     algorithms.Dijkstra{},
    "astar":        algorithms.Astar{},
    "bfs":          algorithms.BFS{},
    "dfs":          algorithms.DFS{},
    "wallFollower": algorithms.WallFollower{},
}

func main() {
    http.HandleFunc("/run", runHandler)
    log.Fatal(http.ListenAndServe(":5000", nil))
}

func runHandler(w http.ResponseWriter, r *http.Request) {
    mazeSize, _ := strconv.Atoi(r.URL.Query().Get("size"))
    singlePath, _ := strconv.ParseBool(r.URL.Query().Get("singlePath"))

    grids, startNodes, endNodes := getInitialGrid(mazeSize, mazeSize, singlePath)
    var wg sync.WaitGroup
    results := make(map[string]Metrics)

    for algorithm := range algorithmsMap {
        wg.Add(1)
        go func(algorithm string) {
            defer wg.Done()
            results[algorithm] = runAlgorithm(
                algorithm,
                grids[algorithm],
                startNodes[algorithm],
                endNodes[algorithm],
            )
        }(algorithm)
    }
    wg.Wait()

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(results)
}

func runAlgorithm(
    algorithm string,
    grid [][]maze.Node,
    startNode *maze.Node,
    endNode *maze.Node,
) Metrics {
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
    timeTaken := endTime.Sub(startTime).Nanoseconds() // Convert to nanoseconds

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

    return Metrics{
        Time:              float64(timeTaken),
        VisitedNodes:      len(visitedNodesInOrder),
        VisitedPercentage: visitedPercentage,
        PathLength:        len(nodesInShortestPathOrder),
        MemoryUsed:        memoryUsed,
    }
}

func getNodesInShortestPathOrder(endNode *maze.Node) []*maze.Node {
    var nodesInShortestPathOrder []*maze.Node
    currentNode := endNode
    for currentNode != nil {
        nodesInShortestPathOrder = append(nodesInShortestPathOrder, currentNode)
        currentNode = currentNode.PreviousNode
    }

    for i, j := 0, len(nodesInShortestPathOrder)-1; i < j; i, j = i+1, j-1 {
        nodesInShortestPathOrder[i], nodesInShortestPathOrder[j] = nodesInShortestPathOrder[j], nodesInShortestPathOrder[i]
    }

    return nodesInShortestPathOrder
}

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