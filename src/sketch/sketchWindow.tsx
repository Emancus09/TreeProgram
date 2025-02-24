import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createTree } from './createTree';

interface SketchWindowProps {
}

const SketchWindow: React.FC<SketchWindowProps> = (props: SketchWindowProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const scene = new THREE.Scene();
    const tree = createTree();
    scene.add(tree);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, canvas);
    camera.position.set(20, 5, 20);
    controls.update();

    const startTime = (new Date()).getTime() / 1000;
    function animate() {
      resizeCanvasToDisplaySize();
      controls.update();
      const time = (new Date()).getTime() / 1000;
      tree.material.uniforms['u_branchAngle'].value = Math.PI / 6 + 0.03 * Math.sin(time);
      tree.material.uniforms['u_age'].value = 4 * (time - startTime);
      const modelViewMatrix = tree.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, tree.matrixWorld);
      tree.material.uniforms['u_modelViewMatrix'].value = modelViewMatrix;
      tree.material.uniforms['u_projectionMatrix'].value = camera.projectionMatrix;
      renderer.render(scene, camera);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas
    });
    renderer.setSize(canvas.width, canvas.height, false)
    renderer.setClearColor(0x262244, 1);
    renderer.render(scene, camera);
    renderer.setAnimationLoop(animate);

    function resizeCanvasToDisplaySize() {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  },
    [canvasRef]
  );

  return (
    <canvas style={{ width: '100%', height: '100%', position: 'absolute' }} ref={canvasRef} />
  );
};

export default SketchWindow;
