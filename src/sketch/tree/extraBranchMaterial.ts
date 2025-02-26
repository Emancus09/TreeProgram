import * as THREE from 'three';

const vertexShader = `
  precision mediump float;

  in vec3 position;
  in mat4 worldMatrix;
  in float branchId;

  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;

  out vec3 v_color;

  vec3 getColorFromID(int id) {
    int r = id / 0x010000;
    int g = (id - r * 0x010000) / 0x000100;
    int b = id - r * 0x010000 - g * 0x000100;
    return vec3(float(r) / 255., float(g) / 255., float(b) / 255.);
  }   

  void main() {
    vec4 viewSpacePos = u_projectionMatrix * u_viewMatrix * worldMatrix * vec4(position, 1.);
    gl_Position = viewSpacePos;

    v_color = getColorFromID(int(branchId));
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

export function createExtraBranchMaterial(renderId: boolean) {
  return new THREE.RawShaderMaterial({
    uniforms: {
      'u_viewMatrix': { value: new THREE.Matrix4() },
      'u_projectionMatrix': { value: new THREE.Matrix4() },
      'u_branchId': { value: 0 },
    },
    defines: {
      'RENDER_ID': renderId,
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    glslVersion: THREE.GLSL3,
  });
}
