import * as THREE from 'three';

const vertexShader = `
  precision mediump float;

  in vec3 position;

  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
  
  uniform sampler2D u_nodeData;
  uniform float u_nodeDataSizeX;
  uniform float u_nodeDataSizeY;
  uniform float u_treeDepth;
  
  uniform float u_branchAngle;
  uniform float u_age;
  uniform int u_selectedID;

  out vec3 v_color;

  vec3 addLevel(float length, float angleY, float angleZ, vec3 crrtPos, vec3 lastPos) {
    vec3 direction = normalize(crrtPos - lastPos);
    vec3 orthoA = normalize(cross(direction, vec3(0.0001,1.,0.))); // We can't use (0,1,0) or we risk running into issues when the branch is pointed upward
    vec3 orthoB = normalize(cross(vec3(0.0001,1.,0.), orthoA));
    return crrtPos + length * (sin(angleZ) * (cos(angleY) * orthoA + sin(angleY) * orthoB) + cos(angleZ) * direction);
  } 

  vec3 getColorFromID(int id) {
    int r = id / 0x010000;
    int g = (id - r * 0x010000) / 0x000100;
    int b = id - r * 0x010000 - g * 0x000100;
    return vec3(float(r) / 255., float(g) / 255., float(b) / 255.);
  }   

  void main() {
    float index = float(gl_InstanceID + 1);
    float nodeDepth = floor(log2(index));

    vec3 lastPos = vec3(0., -1., 0.);
    vec3 crrtPos = vec3(0., 0., 0.);
    float depth = 0.;
    float lengthMaturity = clamp(0., 1., u_age - nodeDepth);
    while (depth <= nodeDepth) {
      float crrtIndex = floor(index / pow(2., nodeDepth - depth)) - 1.;
      float angleMaturity = clamp(0., 1., .5 * (u_age - depth));
      float isLeaf = step(-0.5, depth - nodeDepth);

      float lookUpX = mod(crrtIndex + 0.5, u_nodeDataSizeX) / u_nodeDataSizeX;
      float lookUpY = floor(crrtIndex / u_nodeDataSizeX) / u_nodeDataSizeY;
      vec2 nodeData = texture(u_nodeData, vec2(lookUpX, lookUpY)).xy;
      float length = nodeData.x;
      float angleY = 6.19 * nodeData.y;
      float angleZ = angleMaturity * u_branchAngle * mod(crrtIndex, 2.);

      vec3 tempPos = addLevel(length, angleY, angleZ, crrtPos, lastPos);
      lastPos = crrtPos;
      crrtPos = tempPos;
      depth = depth + 1.;
    }

    float normalizedDistanceFromRoot = (nodeDepth + lengthMaturity * position.y) / u_treeDepth;
    vec3 basisY = crrtPos - lastPos;
    vec3 basisZ = -normalize(cross(vec3(0.0001,1.,0.), basisY));
    vec3 basisX = normalize(cross(basisY, basisZ));
    float radius = step(0.01, lengthMaturity) * (1. - 0.8 * normalizedDistanceFromRoot);
    vec3 localPos = lastPos + radius * (position.x * basisX + position.z * basisZ) + lengthMaturity * (position.y * basisY);
    vec4 viewSpacePos = u_projectionMatrix * u_modelViewMatrix * vec4(localPos, 1.);
    gl_Position = viewSpacePos;

    #if defined(RENDER_ID)
      v_color = getColorFromID(gl_InstanceID + 1);
    #else
      vec3 baseColor = mix(vec3(0.4,0.2,0.3), vec3(0.5,0.8,0.3), normalizedDistanceFromRoot);
      v_color = mix(vec3(1.), baseColor, step(0.5, abs(float(u_selectedID - gl_InstanceID - 1))));
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

export function createTreeMaterial(nodeDataTexture: THREE.Texture, treeDepth: number, renderId: boolean) {
  return new THREE.RawShaderMaterial({
    uniforms: {
      'u_nodeData': { value: nodeDataTexture },
      'u_treeDepth': { value: treeDepth },
      'u_branchAngle': { value: Math.PI / 6 },
      'u_nodeDataSizeX': { value: nodeDataTexture.image.width },
      'u_nodeDataSizeY': { value: nodeDataTexture.image.height },
      'u_age': { value: 100 },
      'u_modelViewMatrix': { value: new THREE.Matrix4() },
      'u_projectionMatrix': { value: new THREE.Matrix4() },
      'u_selectedID': { value: 0 },
    },
    defines: {
      'RENDER_ID': renderId,
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    glslVersion: THREE.GLSL3,
  });
}
