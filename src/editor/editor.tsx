import { Divider, Flex, Heading, InputGroup, InputLeftAddon, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { SketchProps } from '../sketch/sketchProps';

type EditorProps = SketchProps & {
  onPropsChanged: (newProps: SketchProps) => void;
  disabled: boolean;
}

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
  function handleDepthChanged(_, newValue: number) {
    props.onPropsChanged({ ...props, treeDepth: newValue });
  }

  return (
    <Flex height='100%' flexDirection='column' p={4}>
      <InputGroup>
        <InputLeftAddon>Tree Depth</InputLeftAddon>
        <NumberInput allowMouseWheel value={props.treeDepth} min={props.minTreeDepth} max={props.maxTreeDepth} onChange={handleDepthChanged} isDisabled={props.disabled}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
    </Flex>
  );
};

export default Editor;
