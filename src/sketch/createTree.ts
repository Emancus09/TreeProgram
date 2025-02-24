import * as THREE from 'three';

const vertexShader = `
  precision mediump float;

  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform sampler2D u_nodeData;
  uniform float u_branchAngle;
  uniform float u_nodeDataSize;
  uniform float u_age;

  out float f;

  vec3 addLevel(float length, float angleA, float angleB, vec3 crrtPos, vec3 lastPos) {
    vec3 direction = normalize(crrtPos - lastPos);
    vec3 orthoA = normalize(cross(direction, vec3(0.0001,1.,0.)));
    vec3 orthoB = normalize(cross(vec3(0.0001,1.,0.), orthoA));
    return crrtPos + length * (sin(angleB) * (cos(angleA) * orthoA + sin(angleA) * orthoB) + cos(angleB) * direction);
  }   

  void main() {
    float index = float(gl_InstanceID + 1);
    float nodeDepth = floor(log2(index));

    vec3 lastPos = vec3(0.1, -1., 0.);
    vec3 crrtPos = vec3(0., 0., 0.);
    float depth = 0.;
    float branchMaturity = clamp(0., u_age - nodeDepth, 1.);
    while (depth <= nodeDepth) {
      float branchMaturity2 = clamp(0., .5 * (u_age - depth), 1.);
      float crrtIndex = floor(index / pow(2., nodeDepth - depth)) - 1.;
      float isLeaf = step(-0.5, depth - nodeDepth);
      vec2 nodeData = texture(u_nodeData, vec2((crrtIndex + 0.5) / u_nodeDataSize, 0.5)).xy;
      vec3 tempPos = addLevel(nodeData.x, 6.19 * nodeData.y, branchMaturity2 * u_branchAngle * mod(crrtIndex, 2.), crrtPos, lastPos);
      lastPos = crrtPos;
      crrtPos = tempPos;
      depth = depth + 1.;
    }

    float vertex = branchMaturity * float(gl_VertexID);
    vec3 localPos = mix(lastPos, crrtPos, vertex);
    vec4 viewSpacePos = u_projectionMatrix * u_modelViewMatrix * vec4(localPos, 1.);
    gl_Position = viewSpacePos;
    f = nodeDepth + vertex;
  }
  `

const fragmentShader = `
  precision mediump float;
  
  uniform sampler2D u_nodeData;
  uniform float u_treeDepth;

  in float f;

  out vec4 color;

  void main() {
    color = vec4(0.6, 0.5 +  0.3 * f / u_treeDepth, 0.4, 1.);
  }
  `

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export function createTree() {
  const depth = 14;
  const numNodes = 2 ** depth - 1;
  const nodeData = Array.from({ length: numNodes + 1 }, (_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const length = 255 * Math.max(0, Math.min(1, gaussianRandom(2 + depth - level) / (depth + 2)));
    const angle = 255 * Math.random();
    return [length, angle];
  }).flat();
  const nodeDataTexture = new THREE.DataTexture(new Uint8Array(nodeData), numNodes + 1, 1, THREE.RGFormat, THREE.UnsignedByteType);
  nodeDataTexture.needsUpdate = true;

  const material = new THREE.RawShaderMaterial({
    uniforms: {
      'u_nodeData': { value: nodeDataTexture },
      'u_treeDepth': { value: depth },
      'u_branchAngle': { value: Math.PI / 6 },
      'u_nodeDataSize': { value: numNodes + 1 },
      'u_age': { value: 100 },
      'u_modelViewMatrix': { value: new THREE.Matrix4() },
      'u_projectionMatrix': { value: new THREE.Matrix4() },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    glslVersion: THREE.GLSL3,
  });
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 1]), 1));
  geometry.boundingSphere = new THREE.Sphere(undefined, 10);
  geometry.instanceCount = numNodes;
  const line = new THREE.LineSegments(geometry, material);

  return line;
}