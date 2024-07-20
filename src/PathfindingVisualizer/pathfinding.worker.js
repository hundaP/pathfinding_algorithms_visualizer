/* eslint no-restricted-globals: ["error", "never"] */

import { dijkstra } from '../Algorithms/dijkstra.js';
import { astar } from '../Algorithms/astar.js';
import { bfs } from '../Algorithms/bfs.js';
import { dfs } from '../Algorithms/dfs.js';
import { wallFollower } from '../Algorithms/wall_follower.js';

self.addEventListener('message', (event) => {
  const { algorithmName, grid, startNode, endNode } = event.data;
  let algorithm;
  switch (algorithmName) {
    case 'dijkstra':
      algorithm = dijkstra;
      break;
    case 'astar':
      algorithm = astar;
      break;
    case 'bfs':
      algorithm = bfs;
      break;
    case 'dfs':
      algorithm = dfs;
      break;
    case 'wallFollower':
      algorithm = wallFollower;
      break;
  }
  const startTime = performance.now();
  const visitedNodesInOrder = algorithm(grid, startNode, endNode);
  const endTime = performance.now();
  const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);

  self.postMessage({ visitedNodesInOrder, nodesInShortestPathOrder, startTime, endTime });
});

function getNodesInShortestPathOrder(endNode) {
  // Implement this function based on your Node class and how you're storing the path
  // This is just a placeholder implementation
  const nodesInShortestPathOrder = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
