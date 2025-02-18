import React from 'react';
import ReactDOM from 'react-dom/client';
import SketchWindow from './sketch/sketchWindow';

const App: React.FC = () => {
  return <SketchWindow />;
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<App />);
