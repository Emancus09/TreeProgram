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
      scene.add( tree );

      const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      const controls = new OrbitControls( camera, canvas );
      camera.position.set( 0, 20, 20 );
      controls.update();

      function animate() {
        resizeCanvasToDisplaySize();
        controls.update();
        renderer.render( scene, camera );
      }

      const renderer = new THREE.WebGLRenderer({
        antialias:true,
        canvas
      });
      renderer.setSize(canvas.width , canvas.height , false)
      renderer.setClearColor( 0x000000, 1 );
      renderer.render( scene, camera );
      renderer.setAnimationLoop( animate );

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
  )

  return (
    <canvas style={{width: '100%', height: '100%', position: 'absolute'}} ref={canvasRef} />
  );
};

export default SketchWindow;
