# TODO:

* How to serialize images with the document?
  * Easier if we have an online database
* Upload diagrams
* Type conversions for node outputs
  * UV not fully supported
  * See if we can remove some of the type params that are passed in
* Limit operator dragging to document size
* Quantize initial placement.
* Editing existing connectors
* Deleting connectors
* Finish compass rose - center button should center the diagram
* Undo / Redo
* Save to cloud (url)
  * Generate unique url - server component
* Export image
* Log scale controls
* Standardize 'Resources' across all operators
* Move 'render' to Operator class
* Output type conversion - currently assumes all outputs are vec4.
* Make brick edges smoother
* Save to server - generate unique url - need accounts?
* Enter key to close dialogs.

* https://github.com/Jam3/glsl-fast-gaussian-blur
* https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
* https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image

# Operators to do:
  * Transforms:
    * Mirror
    * Rotate
    * Stitch (used to blend images that aren't repeating)
  * Filters:
    * Blur
    * Color Correct
    * Color Adjust
    * Combine
    * Emboss
    * Math
    * Bump Map
  * Generators:
    * Bitmap
    * Cellular / Worley
    * Checker
    * Function
    * Tartan
    * Waves

  * SVG filter types:
    <feColorMatrix>
    <feComponentTransfer>
    <feComposite>
    <feConvolveMatrix>
    <feDiffuseLighting>
    <feDisplacementMap>
    <feImage>
    <feMerge>
    <feMorphology>
    <feOffset>
    <feSpecularLighting>
    <feTile>
    <feTurbulence>
