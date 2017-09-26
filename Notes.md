# TODO:

* Keyboard shortcuts for modals.
* Limit operator dragging to document size
* Quantize initial placement.
* Gradient: Delete color stops
* Normal map.
* Finish up blend filter
  - normalize
* Type conversions for node outputs
* Editing existing connectors
* Deleting connectors
* Finish compass rose
* Edit color parameters
* Import / Export diagrams
* Undo / Redo
* Export image
* Log scale controls
* Output type conversion - currently assumes all outputs are vec4.

* https://github.com/Jam3/glsl-fast-gaussian-blur
* https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
* https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image

# Operators to do:
  * Filters:
    * Blur
    * Color Correct
    * Colorize
    * Combine
    * Emboss
    * Math
    * Modulus
    * NormalMap
    * Transform
    * Warp
    * Bump Map
    * Lighting
    * Repeat
  * Generators:
    * Bitmap
    * Cellular
    * Checker
    * Constant Color
    * Function

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

vec3 dx = dFdx(vec3(vTextureCoord.xy, h));
vec3 dy = dFdy(vec3(vTextureCoord.xy, h));
vec3 normal = normalize(cross(dx, dy));
out = vec4(normal * 0.5 + 0.5, 1.0)
