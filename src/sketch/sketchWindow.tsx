import React from 'react';

interface SketchWindowProps {
}

const SketchWindow: React.FC<SketchWindowProps> = (props: SketchWindowProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
    }, 
    [canvasRef]
  )

  return (
    <canvas style={{width: '100%', height: '100%', position: 'absolute'}} ref={canvasRef} />
  );
};

export default SketchWindow;
