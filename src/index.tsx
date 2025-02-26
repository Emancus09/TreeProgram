import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SketchWindow from './sketch/sketchWindow';
import { Box, Card, Text, ChakraProvider, extendTheme, ColorModeScript, Stack, Fade } from '@chakra-ui/react';
import Editor from './editor/editor';
import { getDefaultSketchProps } from './sketch/sketchProps';
import Description from './editor/description';

const App: React.FC = () => {
  const [sketchProps, setSketchProps] = useState(getDefaultSketchProps());
  const [isReady, setIsReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
          <SketchWindow {...sketchProps} onIsReady={() => setIsReady(true)} onIsAnimatingChanged={setIsAnimating} />
          <Fade in={isReady} transition={{ enter: { delay: 1, duration: 1 } }}>
            <Stack position="absolute" maxWidth='30%' maxHeight='100%' right='0' top='0'>
              <Card variant='outline' overflowY='auto' flex={1} p={4}>
                <Description />
              </Card>
              <Card variant='outline'>
                <Editor {...sketchProps} onPropsChanged={setSketchProps} disabled={isAnimating} />
              </Card>
            </Stack>
          </Fade>
        </Box>
      </Box>
    </ChakraProvider>);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<App />);
