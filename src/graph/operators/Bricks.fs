precision mediump float;

uniform vec4 uColor;
varying highp vec2 vTextureCoord;

const float rows = 6.0;
const float cols = 3.0;

void main() {
  float y = vTextureCoord.y * rows;
  float yr = floor(y);
  float yi = floor(y + 0.5);
  float yf = smoothstep(0.05, 0.2, abs(y - yi));
  float x = vTextureCoord.x * cols + (floor(yr * 0.5) * 2.0 == yr ? 0.5 : 0.0);
  float xi = floor(x + 0.5);
  float xf = smoothstep(0.05, 0.1, abs(x - xi));
  gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * min(xf, yf), 1);
}

// class BrickPatternGenerator extends Generator {
//   val countX = new IntProperty("Count X", 2, minVal = 1, maxVal = 16)
//   val countY = new IntProperty("Count Y", 4, minVal = 1, maxVal = 16)
//   val spacingX = new FloatProperty("Spacing X", .025f, minVal = 0f, maxVal = .5f)
//   val spacingY = new FloatProperty("Spacing Y", .05f, minVal = 0f, maxVal = .5f)
//   val blurX = new FloatProperty("Blur X", 0.1f, minVal = 0f, maxVal = .5f)
//   val blurY = new FloatProperty("Blur Y", 0.2f, minVal = 0f, maxVal = .5f)
//   val offsetX = new FloatProperty("Offset X", 0, minVal = 0f, maxVal = .5f)
//   val offsetY = new FloatProperty("Offset Y", 0, minVal = 0f, maxVal = .5f)
//   val stagger = new FloatProperty("Stagger", .5f, minVal = 0f, maxVal = 1f)
//   val corner = new EnumerationProperty("Corner Shape", CornerShape, CornerShape.Square)
//
//   def fillRaster(rs:RasterSource, r:WritableRaster):Unit = {
//     val du = 1.0f / r.getWidth()
//     val dv = 1.0f / r.getHeight()
//     for (y <- 0 to r.getHeight() - 1) {
//       val v = dv * y
//       val yb = v * countY.value + offsetY.value
//       val yi = math.round(yb)
//       val yf = smoothStep(math.abs(yb - yi), spacingY.value, spacingY.value + blurY.value)
//       val xOffset = if ((floor(yb) & 1) == 0) offsetX.value + stagger.value else offsetX.value
//       for (x <- 0 to r.getWidth() - 1) {
//         val u = du * x
//         val xb = u * countX.value + xOffset
//         val xi = math.round(xb).toFloat
//         val xf = smoothStep(math.abs(xb - xi), spacingX.value, spacingX.value + blurX.value)
//         val value = corner.value match {
//           case CornerShape.Square => math.min(yf, xf)
//           case CornerShape.Mitered => math.min(yf, xf)
//           case CornerShape.Rounded => math.max(0, 1 - math.sqrt((1-xf) * (1-xf) + (1-yf) * (1-yf)))
//         }
//         r.setSample(x, y, 0, value)
//         r.setSample(x, y, 1, value)
//         r.setSample(x, y, 2, value)
//       }
//     }
//   }
// }
