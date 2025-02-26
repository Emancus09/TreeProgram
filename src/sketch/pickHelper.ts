import * as THREE from 'three';

export function createPickHelper() {
  const pickingTexture = new THREE.WebGLRenderTarget(1, 1);
  const pixelBuffer = new Uint8Array(4);

  function getPick(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, scene: THREE.Scene, positionX: number, positionY: number) {
    const pixelRatio = renderer.getPixelRatio();
    camera.setViewOffset(
      renderer.getContext().drawingBufferWidth, // full width
      renderer.getContext().drawingBufferHeight, // full top
      positionX * pixelRatio, // rect x
      positionY * pixelRatio, // rect y
      1, // rect width
      1, // rect height
    );
    renderer.setRenderTarget(pickingTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    camera.clearViewOffset();
    renderer.readRenderTargetPixels(
      pickingTexture,
      0, // x
      0, // y
      1, // width
      1, // height
      pixelBuffer);

    return (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
  }

  return getPick;
}
