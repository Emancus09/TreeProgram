import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function easeInOutBack(x: number): number {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function startSpinAnimation(camera: three.Camera, orbit: OrbitControls, startDistance: number, endDistance: number, startHeight: number, endHeight: number, duration: number): Promise<void> {
  return new Promise<void>((res, rej) => {
    const startTime = (new Date()).getTime() / 1000;
    orbit.enabled = false;
    function animate() {
      const crrtTime = (new Date()).getTime() / 1000;
      const t = (crrtTime - startTime) / duration;
      const t2 = easeInOutBack(t);
      const crrtDistance = startDistance + (endDistance - startDistance) * t2;
      const x = crrtDistance * Math.cos(2 * Math.PI * t2);
      const z = crrtDistance * Math.sin(2 * Math.PI * t2);
      const y = startHeight + (endHeight - startHeight) * t2;
      camera.position.set(x, y, z);
      if (t < 1) {
        window.requestAnimationFrame(animate);
      } else {
        orbit.enabled = true;
        res();
      }
    }
    animate();
  });
}
