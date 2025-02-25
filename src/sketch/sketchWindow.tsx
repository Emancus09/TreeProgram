import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createTree } from './createTree';
import { SketchProps } from './sketchProps';
import { createPickHelper } from './pickHelper';


function initializeSketch(canvas: HTMLCanvasElement) {

}

const SketchWindow: React.FC<SketchProps> = (props: SketchProps) => {
  const [prevProps, setPrevProps] = React.useState<SketchProps>({ treeDepth: 0 });
  const treesRef = React.useRef<ReturnType<typeof createTree> | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const backgroundColor = 0x262244;
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const scene = new THREE.Scene();
    const trees = createTree();
    const tree = trees.tree;
    treesRef.current = trees;
    scene.add(tree);
    const sceneId = new THREE.Scene();
    sceneId.add(trees.idTree);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, canvas);
    camera.position.set(20, 5, 20);
    controls.update();

    let j = 0;
    function animate() {
      j += 1;
      resizeCanvasToDisplaySize();
      controls.update();
      const time = (new Date()).getTime() / 1000;
      trees.idTree.material.uniforms['u_branchAngle'].value = tree.material.uniforms['u_branchAngle'].value = Math.PI / 6 + 0.03 * Math.sin(time);

      branchList.forEach(({ object, path, angle: angleA, index }, i) => {
        if (path.length > 0) {
          const parent = branchMap.get(path.at(-1)!)!;
          //console.log(parent.object.name);
          object.parent = parent.object;
        }
        object.setRotationFromEuler(new THREE.Euler(0, Math.PI / 2 + 6.16 * angleA, (index % 2 === 1) ? Math.PI / 6 : 0));
        object.updateMatrix();
        const pos = new THREE.Vector3();
        //console.log(path);
        object.getWorldPosition(pos);
        //if (j % 100 === 0) console.log('self: ', object.name, pos);
        object.parent?.getWorldPosition(pos);
        //console.log('parent: ', object.parent?.name, pos);
      })
      //@ts-ignore
      cubeObjects.forEach(c => {
        c.updateMatrix();
        const pos = new THREE.Vector3();
        //console.log(path);
        c.getWorldPosition(pos);
        console.log(pos);
      });
      console.log(cubeObjects);

      const modelViewMatrix = tree.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, tree.matrixWorld);
      trees.idTree.material.uniforms['u_modelViewMatrix'].value = tree.material.uniforms['u_modelViewMatrix'].value = modelViewMatrix;
      trees.idTree.material.uniforms['u_projectionMatrix'].value = tree.material.uniforms['u_projectionMatrix'].value = camera.projectionMatrix;
      renderer.render(scene, camera);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas
    });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.setClearColor(backgroundColor, 1);
    renderer.render(scene, camera);
    renderer.setAnimationLoop(animate);

    const pick = createPickHelper();
    let hoveredId = 0;
    canvasRef.current?.addEventListener('mousemove', (event) => {
      renderer.setClearColor(0, 1);
      const pickedId = pick(camera, renderer, sceneId, event.offsetX, event.offsetY);
      renderer.setClearColor(backgroundColor, 1);
      tree.material.uniforms['u_selectedID'].value = hoveredId = pickedId;
    });
    let newBranchId = 0xffffff;
    interface branch {
      length: number;
      angle: number;
      path: number[],
      object: THREE.Object3D,
      index: number
    }
    const branchMap = new Map<number, branch>();
    const branchList = new Array<branch>();
    const box = new THREE.BoxGeometry();
    const cubeObjects = new Array<THREE.Mesh>();
    box.translate(0, 0.5, 0);
    const material = new THREE.MeshBasicMaterial();
    canvasRef.current?.addEventListener('click', (event) => {
      console.log('select', hoveredId);
      if (hoveredId === 0) return;
      const nodeDepth = Math.floor(Math.log2(hoveredId));
      const path = Array.from({ length: nodeDepth + 1 }, (_, i) => {
        return Math.floor(hoveredId / (2 ** (nodeDepth - i))) - 1;
      });
      path.forEach((index, i) => {
        if (branchMap.has(index)) return;
        const object = new THREE.Object3D();
        object.name = index.toString();
        const branch = {
          length: trees.nodeData[2 * index] / 255,
          angle: trees.nodeData[2 * index + 1] / 255,
          path: path.slice(0, i),
          object,
          index: index,
        }
        //console.log(branchMap, path);
        if (i > 0) {
          const parentBranch = branchMap.get(path.at(i - 1)!)!;
          console.log('parent', parentBranch);
          object.parent = parentBranch.object;
          object.position.set(0, parentBranch.length, 0);
        } else {
          object.parent = null;
          object.position.set(0, 0, 0);
        }
        object.setRotationFromEuler(new THREE.Euler(0, 6.16 * branch.angle, index % 2 ? Math.PI / 6 : 0));
        branchMap.set(index, branch);
        branchList.push(branch);
        const cubeObj = new THREE.Mesh(box, material);
        cubeObj.parent = object;
        cubeObj.position.set(0, 0, 0);
        cubeObj.scale.set(0.1, 1, 0.1);
        cubeObj.updateMatrix();
        cubeObj.updateMatrixWorld(true);
        cubeObj.updateWorldMatrix(true, true);
        const pos = new THREE.Vector3();
        cubeObj.getWorldPosition(pos);
        console.log(index, pos);
        scene.add(cubeObj);
        cubeObjects.push(cubeObj);
      })
      const object = new THREE.Mesh(box, material);
      const branch = {
        length: 1,
        angle: 0,
        path,
        object,
        index: path.at(-1)! + 1,
      };
      const parentIndex = path.at(-1)!;
      const parentBranch = branchMap.get(parentIndex)!;
      console.log('parent', parentBranch);
      object.parent = parentBranch.object;
      object.position.set(0, 0.5 * parentBranch.length, 0);
      object.scale.set(0.1, 0.5, 0.1);
      const pos = new THREE.Vector3();
      object.getWorldPosition(pos);
      console.log('self', pos);
      object.name = newBranchId.toString();
      console.log(path);
      object.setRotationFromEuler(new THREE.Euler(0, 6.16 * branch.angle, Math.PI / 6));
      branchMap.set(newBranchId, branch);
      branchList.push(branch);
      scene.add(object);
      newBranchId -= 2;
    });

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

  const [isAnimationOngoing, setIsAnimationOngoing] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (!treesRef.current) return;
    const tree = treesRef.current.tree;
    const treeId = treesRef.current.idTree;
    let lastTime = (new Date()).getTime() / 1000;
    const targetDepth = props.treeDepth;
    const crrtDepth = prevProps.treeDepth;
    const direction = targetDepth > crrtDepth ? 1 : -1;
    function advanceAnimation() {
      const crrtTime = (new Date()).getTime() / 1000;
      const dt = crrtTime - lastTime;
      lastTime = crrtTime;

      treeId.material.uniforms['u_age'].value = tree.material.uniforms['u_age'].value += direction * dt;
      const isDone = direction * (tree.material.uniforms['u_age'].value - targetDepth) > 0;
      if (!isDone) {
        requestAnimationFrame(advanceAnimation);
      } else {
        setIsAnimationOngoing(false);
        setPrevProps(props);
      }
    }
    console.log('hi', isAnimationOngoing);
    if (!isAnimationOngoing) {
      setIsAnimationOngoing(true);
      requestAnimationFrame(advanceAnimation);
    }
  }, [props.treeDepth]);

  return (
    <canvas style={{ width: '100%', height: '100%', position: 'absolute' }} ref={canvasRef} />
  );
};

export default SketchWindow;
