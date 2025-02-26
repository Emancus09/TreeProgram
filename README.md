# Vention Challenge
Hello Vention team!
This is my submission to your programming challenge.

## Mandate
The original mandate of this project was to render a tree like structure. Branches of the tree should emerge from their parent's at 60 degree angles and be scattered around in random directions and users should be able to control, the size of the tree from a user interface.

Moreover, it was suggested as an additional feature that the tree be animated and that users be able to add children to a branch by selecting the parent.

## Approach
One way to go about this problem would be to create a mesh for the tree using lines or some other geomtry and render that to the user. I did not like this approach for three reasons:
1. Unless we were using simple lines to draw the branches, I would need to upload a lot of vertex data. Most of which would be redundant and a waste of precious memory!
2. Animating this kind of representation would be terrible for performance since I would have to recreate the mesh on every frame.
3. It didn't feel very interesting! I wanted to implement something a bit more unique.
Another way would have been to store the branches as separate object3D in the scene graph and render them all as instances of the same branch mesh. This would have solved the first of my problems but animtions would still have been very slow. This is because I would need to update the entire hierarchy of transforms on every frame. Furthermore, I would have needed to update and resend those transforms to the gpu. For a large tree, this could be a bottleneck.
In the end, I chose an approach inspired by the particular structure of the tree. From the start, the way that branches of the structure only every split in two got me thinking that I could model it as a binary tree where each node describes a branch length and rotation. Then, I could flatten that tree data into an array and send it to the gpu as a texture. From there, I could define a shader that renders branch each branch as an instance of the same mesh and transforms that mesh using the tree data in the texture. It took a bit of number magic to work out, but in the end, we have a much more interesting result:
- We are able to render many branches without the framerate suffering (the demo is limited to 2 ** 20 but this is an arbitrary limit)
- We are able to animate those branches growing and swaying in the wind
- We are able to add/remove branches without compromising any performance
Selecting the branches to grow is a separate issue. Selecting from a million branches using bounding boxes would drained precious compute resources for nothing. Instead, I opted to assign each branch a unique id (it's index in the tree) and convert that unique id to a unique color which i could draw to a render buffer covering the pixel being hovered over by the user. I could then map this color back to an id to figure out which branch is being selected.