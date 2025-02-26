import React from 'react';
import { Heading, Spacer, Text, UnorderedList, ListItem } from "@chakra-ui/react";

const Description: React.FC = () => {
  return (
    <>
      <Heading mb={4}>Hello Vention,</Heading>
      <Text>This is my submission to your programming challenge!</Text>
      <Spacer my={2} />
      <Text>The original mandate for this project was to render a tree like structure. Branches of the tree should emerge from their parent at 60 degree angles and be scattered in random directions. Users should be able to control, the size of the tree from a user interface.</Text>
      <Text>Moreover, it was suggested as an additional feature that the tree be animated and that users be able to add children to a branch by selecting the parent.</Text>
      <Spacer my={2} />
      <Text>One way to go about this problem would have been to create a mesh for the tree using lines or some other geomtry and render that to the user. I did not like this approach for three reasons:</Text>
      <UnorderedList>
        <ListItem>Unless we were using simple lines to draw the branches, I would need to upload a lot of vertex data. Most of which would be redundant and a waste of precious memory!</ListItem>
        <ListItem>Animating this kind of representation would be terrible for performance since I would have to recreate the mesh on every frame.</ListItem>
        <ListItem>It didn't feel very interesting! I wanted to implement something a bit more unique.</ListItem>
      </UnorderedList>
      <Spacer my={2} />
      <Text>Another way would have been to store the branches as separate object3D in the scene graph and render them all as instances of the same branch mesh. This would have solved the first of my problems but animtions would still have been very slow. This is because I would need to update the entire hierarchy of transforms on every frame. Furthermore, I would have needed to update and resend those transforms to the gpu. For a large tree, this could be a bottleneck.</Text>
      <Spacer my={2} />
      <Text>In the end, I chose an approach inspired by the particular structure of the tree. From the start, the way that branches of the structure only every split in two got me thinking that I could model it as a binary tree where each node describes a branch length and rotation. Then, I could flatten that tree data into an array and send it to the gpu as a texture. From there, I could define a shader that renders branch each branch as an instance of the same mesh and transforms that mesh using the tree data in the texture. It took a bit of number magic to work out, but in the end, we have a much more interesting result:</Text>
      <UnorderedList>
        <ListItem>We are able to render many branches without the framerate suffering (the demo is limited to 2 ** 20 but this is an arbitrary limit)</ListItem>
        <ListItem>We are able to animate those branches growing and swaying in the wind</ListItem>
        <ListItem>We are able to add/remove branches without compromising any performance</ListItem>
      </UnorderedList>
      <Spacer my={2} />
      <Text>Selecting the branches to grow is a separate issue. Selecting from a million branches using bounding boxes would have drained precious compute resources for nothing. Instead, I opted to assign each branch a unique id (it's index in the tree) and convert that unique id to a unique color which i could draw to a render buffer covering the pixel being hovered over by the user. I could then map this color back to an id to figure out which branch is being selected.</Text>
      <Spacer my={2} />
      <Text>I did start working on the code to grow these extra branches but it was made complicated by the way I implemented the tree shader and so I couldn't figure out the trigonometry of it in time. I can explain the issue during our interview.</Text>
      <Spacer my={2} />
      <Text>Hope you enjoy!</Text>
      <Text>- Emanuel</Text>
    </>);
}

export default Description;
