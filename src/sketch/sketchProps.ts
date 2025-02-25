export interface SketchProps {
  minTreeDepth: number,
  maxTreeDepth: number,
  treeDepth: number;
}

export function getDefaultSketchProps() {
  return {
    minTreeDepth: 1,
    maxTreeDepth: 16,
    treeDepth: 14,
  };
}