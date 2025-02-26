import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SketchWindow from './sketch/sketchWindow';
import { Box, Card, Text, ChakraProvider, extendTheme, ColorModeScript, Stack, Heading, Fade, SlideFade } from '@chakra-ui/react';
import Editor from './editor/editor';
import { getDefaultSketchProps } from './sketch/sketchProps';

const App: React.FC = () => {
  const [sketchProps, setSketchProps] = useState(getDefaultSketchProps());
  const [isReady, setIsReady] = useState(false);

  const theme = extendTheme({
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    }
  });

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Box h='100%' width='100%' p={4}>
        <Box h='100%' width='100%' position="relative" boxSizing='border-box'>
          <SketchWindow {...sketchProps} onIsReady={() => setIsReady(true)} />
          <SlideFade in={isReady} offsetY='50px' transition={{ enter: { delay: 1, duration: 1 } }}>
            <Stack position="absolute" right='0' top='0'>
              <Card variant='outline' p={4}>
                <Heading mb={4}>Hello Vention,</Heading>
                <Text>My name is Emanuel and this is my submission to your programming challenge!</Text>
                <Text>[MORE TEXT DESCRIBING ALGORITHM]</Text>
              </Card>
              <Card variant='outline'>
                <Editor {...sketchProps} onPropsChanged={setSketchProps} onIsReady={() => { }} />
              </Card>
            </Stack>
          </SlideFade>
        </Box>
      </Box>
    </ChakraProvider>);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<App />);
