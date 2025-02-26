import { createExtraBranchMaterial } from "./extraBranchMaterial";
import * as THREE from 'three';

interface Branch {
  index: number,
  level: number,
  length: number,
  angle: number,
  object: THREE.Object3D,
}

export function createExtraBranchInterfaces(getBranchInfo: (branchId: number) => { length: number, angle: number }) {
  const boxGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
  boxGeometry.translate(0, 0.5, 0);
  const baseMaterial = createExtraBranchMaterial(false);
  const pickMaterial = createExtraBranchMaterial(true);
  const baseTree = new THREE.InstancedMesh(boxGeometry, baseMaterial, 2 ** 8);
  const pickTree = new THREE.InstancedMesh(boxGeometry, pickMaterial, 2 ** 8);
  pickTree.frustumCulled = baseTree.frustumCulled = false;

  const branchMap = new Map<number, Branch>();
  const branchArray = new Array<Branch>();
  function addBranch(parentId: number) {
    const branchLevel = Math.floor(Math.log2(parentId));
    const path = Array.from({ length: branchLevel + 1 }, (_, i) => {
      const crrtIndex = Math.floor(parentId / 2 ** (branchLevel - i)) - 1;
      if (branchMap.has(crrtIndex)) return branchMap.get(crrtIndex)!;
      return {
        index: crrtIndex,
        level: i,
        object: new THREE.Object3D(),
        ...getBranchInfo(crrtIndex),
      }
    });
    path.reduce((prevBranchObject: null | THREE.Object3D, crrtBranch: Branch) => {
      crrtBranch.object.parent = prevBranchObject;
      crrtBranch.object.position.set(0, prevBranchObject ? 1 : 0, 0);
      crrtBranch.object.rotation.setFromVector3(new THREE.Vector3(0, 2 * Math.PI * crrtBranch.angle, (crrtBranch.index % 2) * Math.PI / 6));
      return crrtBranch.object;
    }, null);
    branchArray.push(...path);
    const indexBuffer = new THREE.InstancedBufferAttribute(new Float32Array(branchArray.map(branch => branch.index)), 1, undefined, 1);
    boxGeometry.setAttribute('index', indexBuffer);
    console.log(branchArray.map(branch => branch.index));
  }
  function updateMatrices(camera: THREE.Camera) {
    const worldMatrices = branchArray.map((branch) => {
      branch.object.updateMatrixWorld(false);
      return branch.object.matrixWorld.elements;
    }).flat();
    const worldMatrixBuffer = new THREE.InstancedBufferAttribute(new Float32Array(worldMatrices), 16, undefined, 1);
    boxGeometry.setAttribute('worldMatrix', worldMatrixBuffer);
    baseMaterial.uniforms['u_viewMatrix'].value = pickMaterial.uniforms['u_viewMatrix'].value = camera.matrixWorldInverse;
    baseMaterial.uniforms['u_projectionMatrix'].value = pickMaterial.uniforms['u_projectionMatrix'].value = camera.projectionMatrix;
  }

  return {
    updateMatrices,
    addBranch,
    baseTree,
    pickTree
  }
}