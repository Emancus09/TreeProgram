import * as THREE from 'three';

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

export function createTree() {
  const numNodes = 1000;
  const maxDepth = Math.ceil(Math.log2(numNodes + 1));
  const lengths = Array.from({ length: numNodes }, (_, i) => 0.3 * gaussianRandom(1 + (maxDepth - Math.ceil(Math.log2(i + 1)))));
  const angles = Array.from({ length: numNodes }, () => 2 * 3.145 * Math.random());
  const index = Array.from({ length: numNodes }, (_, i) => i + 1);

  console.log(lengths);

  const vertexShader = `
    precision mediump float;

    uniform float u_length[${numNodes}]; 
    uniform float u_angle[${numNodes}];
    attribute float index;

    varying float v_depth;

    void main() {
      vec3 lastPos = vec3(0., 0., 0.);
      vec3 crrtPos = vec3(0.01, 1., 0.);
      float nodeDepth = floor(log2(index));
      float depth = 0.;
      // We need to iterate over each level from root to tip
      while (depth < nodeDepth + 0.5) {
        float crrtIndex = floor(index / pow(2., nodeDepth - depth)) - 1.;
        float parity = mod(crrtIndex, 2.);

        float length = u_length[int(crrtIndex)];
        float angleA = u_angle[int(crrtIndex)];
        float angleB = parity * 3.145 / 6.;
        vec3 direction = normalize(crrtPos - lastPos);
        vec3 orthoA = normalize(cross(direction, vec3(0.,1.,0.)));
        vec3 orthoB = normalize(cross(vec3(0.,1.,0.), orthoA));
        lastPos = crrtPos;
        //crrtPos = crrtPos + length * vec3(sin(angleB), cos(angleB), 0.);
        crrtPos = crrtPos + length * (sin(angleB) * (cos(angleA) * orthoA + sin(angleA) * orthoB) + cos(angleB) * direction);
        
        depth = depth + 1.;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(lastPos, crrtPos, position.y), 1.);
      v_depth = floor(log2(index));
    }
    `

  const fragmentShader = `
    precision mediump float;

    varying float v_depth;

    void main() {
      vec3 colorA = vec3(0.,0.,1.);
      vec3 colorB = vec3(0.75, 0.75, 1.);
      gl_FragColor = vec4(mix(colorA, colorB, v_depth / ${maxDepth}.), 1.);
    }
    `

  const material = new THREE.ShaderMaterial({
    uniforms: {
      'u_length': { value: lengths },
      'u_angle': { value: angles },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute('index', new THREE.InstancedBufferAttribute(new Float32Array(index), 1, undefined, 1));
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 1, 0]), 3));
  geometry.instanceCount = index.length;
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.);
  const line = new THREE.LineSegments(geometry, material);

  return line;
}