import React, { useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createTrees } from './tree/createTree';
import { SketchProps } from './sketchProps';
import { createPickHelper } from './pickHelper';
import { startSpinAnimation } from './spinAnimation';
import { createExtraBranchInterfaces } from './tree/createExtraBranchInterfaces';

function initializeSketch(canvas: HTMLCanvasElement, maxTreeDepth: number, onIsReady: () => void) {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 4, 0);

  const baseScene = new THREE.Scene();
  const pickScene = new THREE.Scene();
  const trees = createTrees(maxTreeDepth);
  baseScene.add(trees.baseTree);
  pickScene.add(trees.pickTree);

  function resizeCanvasToDisplaySize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas
  });
  function animate() {
    resizeCanvasToDisplaySize();
    controls.update();
    const time = (new Date()).getTime() / 1000;
    const branchAngle = Math.PI / 6 + 0.03 * Math.sin(time);
    trees.updateMatrices(camera);
    trees.setBranchAngle(branchAngle);
    renderer.render(baseScene, camera);
  }
  renderer.setClearColor(0, 0);
  renderer.setAnimationLoop(animate);
  startSpinAnimation(camera, controls, 4, 15, 0, 5, 5).then(onIsReady);

  const pick = createPickHelper();
  let hoveredId = 0;
  canvas.addEventListener('mousemove', (event) => {
    const pickedId = pick(camera, renderer, pickScene, event.offsetX, event.offsetY);
    hoveredId = pickedId;
    trees.setSelectedId(pickedId);
  });
  canvas.addEventListener('click', () => {
    if (hoveredId === 0) return;
  });

  return { trees }
}

type SketchWindowProps = SketchProps & {
  onIsReady: () => void;
  onIsAnimatingChanged: (isAnimating: boolean) => void;
}

const SketchWindow: React.FC<SketchWindowProps> = (props: SketchWindowProps) => {
  const treesRef = React.useRef<ReturnType<typeof createTrees> | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const { trees } = initializeSketch(canvas, props.maxTreeDepth, props.onIsReady);
    trees.animateGrowth(props.treeDepth, props.treeDepth / 2).then(() => {
      props.onIsAnimatingChanged(false);
    });
    props.onIsAnimatingChanged(true);
    treesRef.current = trees;
  },
    [canvasRef]
  );

  const [lastDepth, setLastDepth] = useState(props.treeDepth);
  React.useEffect(() => {
    if (!treesRef.current) return;
    if (props.treeDepth === lastDepth) return;
    treesRef.current.animateGrowth(props.treeDepth, Math.abs(props.treeDepth - lastDepth) / 1).then(() => {
      setLastDepth(props.treeDepth);
      props.onIsAnimatingChanged(false);
    });
    props.onIsAnimatingChanged(true);
  }, [props.treeDepth]);

  return (
    <canvas style={{ width: '100%', height: '100%', position: 'absolute' }} ref={canvasRef} />
  );
};

export default SketchWindow;
