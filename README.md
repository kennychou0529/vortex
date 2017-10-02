Vortex
======

Vortex is a texture generator application. It's intent is to make it easy to create tileable textures for use in 3D models.

The actual computation of the images is performed via WebGL.

## Screenshot

![screenshot](./images/screenshot.png "Vortex UI")

## Starting the application

    npm install
    npm start

Then navigate to http://localhost:9001

## Using the application

* To create new nodes, drag from the operator table (on the left side panel) into the workspace area.
* To get a detailed description of an operator, select that row in the operator table.
* To delete a node, select a node and then hit the delete key.
* Nodes can be connected via i/o terminals located on the left and right edges of the node.
  * Input terminals are on the left, output terminals are on the right.
  * Create connections by dragging between terminals.
  * You cannot connect an output to an output or an input to an input. Inputs must be connected to outputs.
  * Output nodes can have any number of connections.
  * Input nodes can only have one connection. Attempting to add another connection will replace the previous connection.
* When a node is selected, the node's property list will appear on the right panel.
* Node properties are shown as 'combo sliders' which are a combination of slider and text input, very
  similar to the controls in Blender. You can click the arrows, drag left and right, or double-click to type in a numeric value directly.
* Editing gradients: Double-click to add or remove a color stop.
* Select the 'Shader' button on the left panel to view the text of the generated OpenGL shader.
* Select the 'Export' button to see a high-res version of the generated image for the current selected node.

## Credits

Vortex was written by Talin.

Vortex is heavily inspired by Holger Dammertz's NeoTextureEdit application. There are a number of
significant differences between the two programs, the biggest of which is the fact that Vortex has
been entirely rewritten in JavaScript and runs entirely in the browser.
