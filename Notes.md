# TODO:

* Garbage collection for image references.
* Finish 'GLResources' tracking.
* Make brick edges smoother - gamma correction?
* Cloud storage:
  * List recent documents
  * List all my documents
  * Save should prompt for name
  * Track user identity
  * Fork project
  * Nav bar with credits, docs, etc.
* Type conversions for node outputs
  * UV not fully supported
  * See if we can remove some of the type params that are passed in
* Limit operator dragging to document size
* Quantize initial placement.
* Editing existing connectors
* Deleting connectors
* Finish compass rose - center button should center the diagram
* Undo / Redo
* Export image
* Log scale controls
* Standardize 'Resources' across all operators
* Move 'render' to Operator class
* Output type conversion - currently assumes all outputs are vec4.
* Save to server - generate unique url - need accounts?
* Enter key to close dialogs.

* https://github.com/Jam3/glsl-fast-gaussian-blur
* https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
* https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image

# Schemas
  * graphs
    * id
    * creator
    * createdAt
    * updatedAt
    * name
    * data
  * images
    * id
    * graph
    * name
    * mimeType
    * data

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
    <feDisplacementMap>
    <feImage>
    <feMerge>
    <feMorphology>
    <feOffset>
    <feTurbulence>
