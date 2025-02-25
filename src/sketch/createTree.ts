import * as THREE from 'three';

const vertexShader = `
  precision mediump float;

  in vec3 position;

  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform sampler2D u_nodeData;
  uniform float u_branchAngle;
  uniform float u_nodeDataSizeX;
  uniform float u_nodeDataSizeY;
  uniform float u_treeDepth;
  uniform float u_age;
  uniform int u_selectedID;

  out vec3 v_color;

  vec3 addLevel(float length, float angleA, float angleB, vec3 crrtPos, vec3 lastPos) {
    vec3 direction = normalize(crrtPos - lastPos);
    vec3 orthoA = normalize(cross(direction, vec3(0.0001,1.,0.)));
    vec3 orthoB = normalize(cross(vec3(0.0001,1.,0.), orthoA));
    return crrtPos + length * (sin(angleB) * (cos(angleA) * orthoA + sin(angleA) * orthoB) + cos(angleB) * direction);
  }   

  void main() {
    float index = float(gl_InstanceID + 1);
    float nodeDepth = floor(log2(index));

    vec3 lastPos = vec3(0., -1., 0.);
    vec3 crrtPos = vec3(0., 0., 0.);
    float depth = 0.;
    float branchMaturity = clamp(0., u_age - nodeDepth, 1.);
    while (depth <= nodeDepth) {
      float branchMaturity2 = clamp(0., .5 * (u_age - depth), 1.);
      float crrtIndex = floor(index / pow(2., nodeDepth - depth)) - 1.;
      float isLeaf = step(-0.5, depth - nodeDepth);
      vec2 nodeData = texture(u_nodeData, vec2(mod(crrtIndex + 0.5, u_nodeDataSizeX) / u_nodeDataSizeX, floor(crrtIndex / u_nodeDataSizeX) / u_nodeDataSizeY)).xy;
      vec3 tempPos = addLevel(nodeData.x, 6.19 * nodeData.y, branchMaturity2 * u_branchAngle * mod(crrtIndex, 2.), crrtPos, lastPos);
      lastPos = crrtPos;
      crrtPos = tempPos;
      depth = depth + 1.;
    }

    float vertex = branchMaturity * position.y;
    vec3 basisY = crrtPos - lastPos;
    vec3 basisZ = -normalize(cross(vec3(0.0001,1.,0.), basisY));
    vec3 basisX = normalize(cross(basisY, basisZ));
    vec3 localPos = lastPos + step(0.01, branchMaturity) * (position.x * basisX + position.z * basisZ) + branchMaturity * position.y * basisY;
    //vec3 localPos = mix(lastPos, crrtPos, vertex);
    vec4 viewSpacePos = u_projectionMatrix * u_modelViewMatrix * vec4(localPos, 1.);
    gl_Position = viewSpacePos;

    #if defined(RENDER_ID)
    int intIndex = gl_InstanceID + 1;
    int r = intIndex / 0x010000;
    int g = (intIndex - r * 0x010000) / 0x000100;
    int b = intIndex - r * 0x010000 - g * 0x000100;
    v_color = mix(vec3(1.), vec3(float(r) / 255., float(g) / 255., float(b) / 255.), step(0.5, abs(index - float(u_selectedID - 1))));
    #else
    v_color = mix(vec3(1.), mix(vec3(0.4,0.2,0.3), vec3(0.5,0.8,0.3), (nodeDepth + vertex) / u_treeDepth), step(0.5, abs(index - float(u_selectedID))));
    #endif
  }
  `

const fragmentShader = `
  precision mediump float;
  
  in vec3 v_color;

  out vec4 color;

  void main() {
    color = vec4(v_color, 1.);
  }
  `

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export function createTree(maxDepth: number = 4) {
  const depth = maxDepth;
  const sizeX = 2 ** Math.min(maxDepth, 10);
  const sizeY = 2 ** Math.max(maxDepth - 10, 0);
  const numNodes = 2 ** depth - 1;
  console.log(numNodes);
  const nodeData = Array.from({ length: sizeX * sizeY }, (_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const length = 255 * Math.max(0, Math.min(1, gaussianRandom(2 + depth - level) / (depth + 2)));
    const angle = 255 * Math.random();
    return [length, angle];
  }).flat();
  const nodeDataTexture = new THREE.DataTexture(new Uint8Array(nodeData), sizeX, sizeY, THREE.RGFormat, THREE.UnsignedByteType);
  nodeDataTexture.needsUpdate = true;

  const material = new THREE.RawShaderMaterial({
    uniforms: {
      'u_nodeData': { value: nodeDataTexture },
      'u_treeDepth': { value: depth },
      'u_branchAngle': { value: Math.PI / 6 },
      'u_nodeDataSizeX': { value: sizeX },
      'u_nodeDataSizeY': { value: sizeY },
      'u_age': { value: 0 },
      'u_modelViewMatrix': { value: new THREE.Matrix4() },
      'u_projectionMatrix': { value: new THREE.Matrix4() },
      'u_selectedID': { value: 0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    glslVersion: THREE.GLSL3,
  });
  const boxGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
  boxGeometry.translate(0, 0.5, 0);
  const tree = new THREE.InstancedMesh(boxGeometry, material, numNodes);
  tree.frustumCulled = false;
  const idMaterial = new THREE.RawShaderMaterial().copy(material);
  idMaterial.defines['RENDER_ID'] = true;
  const idTree = new THREE.InstancedMesh(boxGeometry, idMaterial, numNodes);
  idTree.frustumCulled = false;
  return { tree, idTree, nodeData };
}