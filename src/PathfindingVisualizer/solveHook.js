import { useVisualizeAlgorithm } from './visualizeAlgorithmHook'; // adjust the path as needed

export const useSolve = (state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower) => {
  const visualizeDijkstra = useVisualizeAlgorithm('dijkstra', state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower);
  const visualizeAStar = useVisualizeAlgorithm('astar', state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower);
  const visualizeBFS = useVisualizeAlgorithm('bfs', state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower);
  const visualizeDFS = useVisualizeAlgorithm('dfs', state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower);
  const visualizeWallFollower = useVisualizeAlgorithm('wallFollower', state, setState, getNodesInShortestPathOrder, animateDijkstra, animateAStar, animateBFS, animateDFS, animateWallFollower);

  const solve = () => {
    const algorithmPromises = [
      visualizeDijkstra(),
      visualizeAStar(),
      visualizeBFS(),
      visualizeDFS(),
      visualizeWallFollower()
    ];

    Promise.all(algorithmPromises)
      .then(() => {
        console.log('All algorithms visualized');
        // Optionally, do something after all algorithms have completed
      })
      .catch(error => {
        console.error('Error visualizing algorithms:', error);
      });
  };

  return solve;
};
