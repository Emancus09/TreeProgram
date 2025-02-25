export interface SketchProps {
  treeDepth: number;
}

export function getDefaultSketchProps() {
  return {
    treeDepth: 16,
  };
}