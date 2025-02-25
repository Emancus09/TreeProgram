import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SketchWindow from './sketch/sketchWindow';
import { Box, Card, Flex, ChakraProvider } from '@chakra-ui/react';
import Editor from './editor/editor';
import { getDefaultSketchProps } from './sketch/sketchProps';

const App: React.FC = () => {
  const [sketchProps, setSketchProps] = useState(getDefaultSketchProps());

  return (
    <ChakraProvider>
      <Flex h='100%' gap={4} p={4} boxSizing='border-box'>
        <Card flex='1' overflow='hidden' variant='outline'>
          <SketchWindow {...sketchProps} />
        </Card>
        <Card flex='0.5' variant='outline'>
          <Editor {...sketchProps} onPropsChanged={setSketchProps} />
        </Card>
      </Flex>
    </ChakraProvider>);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<App />);
