# TODO:

* Blur
* Blur requires buffered inputs
* Safari support
* Finish 'GLResources' tracking.
* Make brick edges smoother - gamma correction?
* For illuminate, don't show alpha sliders.
* Cached signals not working.
* Cloud storage:
  * List recent documents
  * Garbage collection for image references.
  * Make a local store option for images (probably regrid)
  * Don't require login for local storage
  * Admin panel for user count, resource usage
* Type conversions for node outputs
  * UV not fully supported
  * See if we can remove some of the type params that are passed in
* Limit operator dragging to document size
* Finish compass rose - center button should center the diagram
* Upload JSON files
* Undo / Redo
* Log scale controls - shininess is a good example
* Standardize 'Resources' across all operators
* Move 'render' to Operator class
* Output type conversion - clean up and make consistent.
* Enter key to close dialogs.
* Possibly unify code for creating and editing connections - former uses DnD, latter uses mouse
  events.

* https://github.com/Jam3/glsl-fast-gaussian-blur

# Operators to do:
  * Transforms:
    * Mirror
    * Stitch (used to blend images that aren't repeating)
  * Filters:
    * Blur
    * Color Correct
    * Color Adjust
    * Combine
    * Emboss - simpler than illuminate.
    * Math
    * Bump Map
  * Generators:
    * Checker
    * Function
    * Tartan
    * Waves

  * SVG filter types:
    * feColorMatrix
    * feComponentTransfer
    * feComposite
    * feConvolveMatrix
    * feDisplacementMap
    * feImage
    * feMerge
    * feMorphology
    * feOffset
    * feTurbulence
