# TODO:

* Type conversions for node outputs
  * UV not fully supported
  * See if we can remove some of the params
* Limit operator dragging to document size
* Quantize initial placement.
* Gradient: Delete color stops
* Finish up blend filter
  - normalize output
* Editing existing connectors
* Deleting connectors
* Finish compass rose - center button should center the diagram
* Upload diagrams
* Undo / Redo
* Save to cloud (url)
  * Generate unique url - server component
* Export image
* Log scale controls
* Unify DataType and ParameterType
* Standardize 'Resources' across all operators
* Move 'render' to Operator class
* Output type conversion - currently assumes all outputs are vec4.
* Make brick edges smoother - possibly implement our own smootherstep? ('steps' library);
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
    * Modulus
    * Bump Map
  * Generators:
    * Bitmap
    * Cellular
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
