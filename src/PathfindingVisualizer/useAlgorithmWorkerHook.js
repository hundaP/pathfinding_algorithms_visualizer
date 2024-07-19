import { useWorker, WORKER_STATUS } from "@koale/useworker";
// eslint-disable-next-line import/no-webpack-loader-syntax
import dijkstraWorker from 'workerize-loader!../Algorithms/dijkstra.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import astarWorker from 'workerize-loader!../Algorithms/astar.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import dfsWorker from 'workerize-loader!../Algorithms/dfs.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import bfsWorker from 'workerize-loader!../Algorithms/bfs.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import wallFollowerWorker from 'workerize-loader!../Algorithms/wall_follower.js';



export const useAlgorithmWorker = (algorithm, grid, startNode, endNode) => {

  const workers = {
    dijkstra: new dijkstraWorker(),
    astar: new astarWorker(),
    bfs: new bfsWorker(),
    dfs: new dfsWorker(),
    wallFollower: new wallFollowerWorker()
  };
  const [algorithmWorker, status, killWorker] = useWorker(workers[algorithm]);

  const runAlgorithm = async () => {
    if (status === WORKER_STATUS.RUNNING) {
      const startTime = performance.now();

      try {
        const result = await algorithmWorker(grid, startNode, endNode);
        const endTime = performance.now();
        const { visitedNodesInOrder } = result;

        // Call getNodesInShortestPathOrder directly
        const nodesInPath = getNodesInShortestPathOrder(endNode);

        const totalNodes = grid.length * grid[0].length;
        const wallNodes = grid.flat().filter(node => node.isWall).length;
        const nonWallNodes = totalNodes - wallNodes;

        return {
          [`${algorithm}Time`]: endTime - startTime,
          [`${algorithm}VisitedNodes`]: visitedNodesInOrder.length,
          [`${algorithm}VisitedPercentage`]: (visitedNodesInOrder.length / nonWallNodes) * 100,
          [`pathLength${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}`]: nodesInPath.length,
          visitedNodesInOrder,
          nodesInPath
        };
      } catch (error) {
        throw new Error(`Error in ${algorithm} worker: ${error.message}`);
      } finally {
        killWorker();
      }
    }
  };

  return runAlgorithm;
};


function getNodesInShortestPathOrder(endNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = endNode;
  while (currentNode !== null && currentNode !== undefined) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
