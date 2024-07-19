import { dijkstra } from '../Algorithms/dijkstra';
import { astar } from '../Algorithms/astar';
import { bfs } from '../Algorithms/bfs';
import { dfs } from '../Algorithms/dfs';
import { wallFollower } from '../Algorithms/wall_follower';

import { useWorker } from "@koale/useworker";

export const useVisualizeAlgorithm = (algorithm, state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower) => {
  const [worker] = useWorker({
    'dijkstra': dijkstra,
    'astar': astar,
    'bfs': bfs,
    'dfs': dfs,
    'wallFollower': wallFollower
  }[algorithm]);

  const visualizeAlgorithm = async () => {
    let gridKey, startNodeKey, endNodeKey;
    switch (algorithm) {
      case 'dijkstra':
      case 'astar':
        gridKey = `grid${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}`;
        startNodeKey = `${gridKey}StartNode`;
        endNodeKey = `${gridKey}EndNode`;
        break;
      case 'bfs':
      case 'dfs':
        gridKey = `grid${algorithm.toUpperCase()}`;
        startNodeKey = `${gridKey}StartNode`;
        endNodeKey = `${gridKey}EndNode`;
        break;
      case 'wallFollower':
        gridKey = 'gridWallFollower';
        startNodeKey = `${gridKey}StartNode`;
        endNodeKey = `${gridKey}EndNode`;
        break;
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }

    const grid = state[gridKey];
    const startNode = state[startNodeKey];
    console.log('endNodeKey:', endNodeKey);
    const endNode = state[endNodeKey];
    console.log('endNode:', endNode);

    if (!grid || !startNode || !endNode) {
      throw new Error(`Missing grid or start/end node for ${algorithm}`);
    }

    const startTime = performance.now();
    const workerResult = worker(grid, startNode, endNode);
    let nodesInPath;

    try {
      const visitedNodesInOrder = await workerResult;

      if (visitedNodesInOrder) {
        const endTime = performance.now();

        console.log(endNode);
        nodesInPath = getNodesInShortestPathOrder(state[endNodeKey]);
        console.log(nodesInPath);
        const totalNodes = grid.length * grid[0].length;
        const wallNodes = grid.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;

        setState({
          [`${algorithm}Time`]: endTime - startTime,
          [`${algorithm}VisitedNodes`]: visitedNodesInOrder.length,
          [`${algorithm}VisitedPercentage`]: (visitedNodesInOrder.length / nonWallNodes) * 100,
          [`pathLength${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}`]: nodesInPath.length,
        });
      }
    } catch (error) {
      console.error(`Error in ${algorithm} worker:`, error);
    } finally {
      // Animate the algorithm
      switch (algorithm) {
        case 'dijkstra':
          animateDijkstra(state.dijkstraVisitedNodes, nodesInPath);
          break;
        case 'astar':
          animateAStar(state.astarVisitedNodes, nodesInPath);
          break;
        case 'bfs':
          animateBFS(state.bfsVisitedNodes, nodesInPath);
          break;
        case 'dfs':
          animateDFS(state.dfsVisitedNodes, nodesInPath);
          break;
        case 'wallFollower':
          animateWallFollower(state.wallFollowerVisitedNodes, nodesInPath);
          break;
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }
    }
  };

  return visualizeAlgorithm;
}
