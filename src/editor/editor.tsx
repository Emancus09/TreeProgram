import { Divider, Flex, Heading, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react';
import React from 'react';
import { SketchProps } from '../sketch/sketchProps';

type EditorProps = SketchProps & {
  onPropsChanged: (newProps: SketchProps) => void;
}

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
  function handleDepthChanged(_, newValue: number) {
    props.onPropsChanged({ ...props, treeDepth: newValue });
  }

  return (
    <Flex height='100%' flexDirection='column' p={4}>
      <Heading>Hello Vention,</Heading>
      <Text>My name is Emanuel and this is my submission to your programming challenge!</Text>
      <Divider my={4} />
      <Text>Tree Depth:</Text>
      <NumberInput allowMouseWheel value={props.treeDepth} min={0} max={20} onChange={handleDepthChanged}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  );
};

export default Editor;
