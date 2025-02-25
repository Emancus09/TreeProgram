import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createTrees } from './tree/createTree';
import { SketchProps } from './sketchProps';
import { createPickHelper } from './pickHelper';
import { startSpinAnimation } from './spinAnimation';

const backgroundColor = 0x262244;

function initializeSketch(canvas: HTMLCanvasElement, maxTreeDepth: number) {
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
    renderer.setClearColor(backgroundColor, 1);
    resizeCanvasToDisplaySize();
    controls.update();
    const time = (new Date()).getTime() / 1000;
    const branchAngle = Math.PI / 6 + 0.03 * Math.sin(time);
    trees.updateMatrices(camera);
    trees.setBranchAngle(branchAngle);
    renderer.render(baseScene, camera);
  }
  renderer.setAnimationLoop(animate);
  startSpinAnimation(camera, controls, 4, 15, 0, 5, 5);

  const pick = createPickHelper();
  let hoveredId = 0;
  canvas.addEventListener('mousemove', (event) => {
    renderer.setClearColor(0, 1);
    const pickedId = pick(camera, renderer, pickScene, event.offsetX, event.offsetY);
    renderer.setClearColor(backgroundColor, 1);
    hoveredId = pickedId;
    trees.setSelectedId(pickedId);
  });
  canvas.addEventListener('click', () => {
    if (hoveredId === 0) return;
  });

  return { trees }
}

const SketchWindow: React.FC<SketchProps> = (props: SketchProps) => {
  const treesRef = React.useRef<ReturnType<typeof createTrees> | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const { trees } = initializeSketch(canvas, props.maxTreeDepth);
    treesRef.current = trees;
  },
    [canvasRef]
  );

  React.useEffect(() => {
    if (!treesRef.current) return;
    treesRef.current.animateGrowth(props.treeDepth, props.treeDepth / 5).then(() => {
      console.log('done');
    });
    console.log('start');
  }, [props.treeDepth]);

  return (
    <canvas style={{ width: '100%', height: '100%', position: 'absolute' }} ref={canvasRef} />
  );
};

export default SketchWindow;
