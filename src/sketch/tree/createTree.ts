import * as THREE from 'three';
import { createTreeMaterial } from './treeMaterial';

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function createTreeDataTexture(maxDepth: number = 4) {
  const sizeX = 2 ** Math.min(maxDepth, 10);
  const sizeY = 2 ** Math.max(maxDepth - 10, 0);
  const nodeData = Array.from({ length: sizeX * sizeY }, (_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const length = 255 * Math.max(0, Math.min(1, gaussianRandom(2 + maxDepth - level) / (maxDepth + 2)));
    const angle = 255 * Math.random();
    return [length, angle];
  }).flat();
  const nodeDataTexture = new THREE.DataTexture(new Uint8Array(nodeData), sizeX, sizeY, THREE.RGFormat, THREE.UnsignedByteType);
  nodeDataTexture.needsUpdate = true;
  return [nodeData, nodeDataTexture] as [number[], THREE.DataTexture];
}

export function createTrees(maxDepth: number = 4) {
  const [treeData, treeDataTexture] = createTreeDataTexture(maxDepth);
  const baseMaterial = createTreeMaterial(treeDataTexture, maxDepth, false);
  const pickMaterial = createTreeMaterial(treeDataTexture, maxDepth, true);
  const boxGeometry = new THREE.BoxGeometry(2 / maxDepth, 1, 2 / maxDepth);
  boxGeometry.translate(0, 0.5, 0);
  const baseTree = new THREE.InstancedMesh(boxGeometry, baseMaterial, 2 ** maxDepth - 1);
  const pickTree = new THREE.InstancedMesh(boxGeometry, pickMaterial, 2 ** maxDepth - 1);
  pickTree.frustumCulled = baseTree.frustumCulled = false;

  function setSelectedId(number: number) {
    baseMaterial.uniforms['u_selectedID'].value = pickMaterial.uniforms['u_selectedID'].value = number;
  }
  function setBranchAngle(angle: number) {
    baseMaterial.uniforms['u_branchAngle'].value = pickMaterial.uniforms['u_branchAngle'].value = angle;
  }
  function setAge(age: number) {
    baseMaterial.uniforms['u_age'].value = pickMaterial.uniforms['u_age'].value = age;
  }
  function setDepth(depth: number) {
    baseMaterial.uniforms['u_treeDepth'].value = pickMaterial.uniforms['u_treeDepth'].value = depth;
  }
  setAge(0);
  function updateMatrices(camera: THREE.Camera) {
    baseMaterial.uniforms['u_modelViewMatrix'].value = pickMaterial.uniforms['u_modelViewMatrix'].value = camera.matrixWorldInverse;
    baseMaterial.uniforms['u_projectionMatrix'].value = pickMaterial.uniforms['u_projectionMatrix'].value = camera.projectionMatrix;
  }
  let isAnimationOngoing = false;
  function animateGrowth(targetAge: number, speed: number): Promise<void> {
    return new Promise((res, rej) => {
      if (isAnimationOngoing) {
        rej("Must wait for animation to complete");
      }
      isAnimationOngoing = true;
      let lastTime = (new Date()).getTime() / 1000;
      let crrtAge = baseMaterial.uniforms['u_age'].value;
      const direction = targetAge - crrtAge > 0 ? 1 : -1;
      pickTree.count = baseTree.count = 2 ** Math.max(targetAge, crrtAge) - 1;
      function animate() {
        const crrtTime = (new Date()).getTime() / 1000;
        const dt = crrtTime - lastTime;
        lastTime = crrtTime;
        crrtAge += direction * dt * speed;
        setAge(crrtAge);
        setDepth(crrtAge);
        if (direction * (crrtAge - targetAge) > 0) {
          isAnimationOngoing = false;
          pickTree.count = baseTree.count = 2 ** targetAge - 1;
          res();
        } else {
          window.requestAnimationFrame(animate);
        }
      }
      animate();
    });
  }
  function getBranchInfo(branchId: number) {
    return {
      length: treeData[2 * branchId + 0] / 255,
      angle: treeData[2 * branchId + 1] / 255,
    }
  }

  return { baseTree, pickTree, updateMatrices, setBranchAngle, setSelectedId, animateGrowth, getBranchInfo };
}