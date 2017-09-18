
* https://github.com/Jam3/glsl-fast-gaussian-blur
* https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
* https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image

<aside id="tool-palette">
</aside>
<aside id="inspector">
  <section class="property-editor"></section>
  <section class="preview">&nbsp;</section>
</aside>
<section id="graph">
  <div class="nodes">
    <div class="node">
      <div class="body">
        <header>Simplex Noise</header>
        <section class="preview">
          <section class="content"></section>
        </section>
      </div>
      <div class="connectors input left">
      </div>
      <div class="connectors output right">
        <div class="connector">Out</div>
      </div>
    </div>
  </div>
  <div class="arcs">
    <svg
        className="connector"
        ref="overlay"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style="position: absolute; left: 110px; top: 10px;">
        <defs>
          <filter id="highlight">
            <feGaussianBlur in="SourceGraphic" stdDeviation=".5" />
            <feOffset dx="0" dy="-1.5" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6"/>
            </feComponentTransfer>
          </filter>
          <filter id="dropShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4"/>
            </feComponentTransfer>
            <feOffset dx="0" dy="2" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path stroke-width="9" stroke="black" d="M0 10 H20 C70 10 140 160 180 160 H 200" fill="transparent" filter="url(#dropShadow)" />
        <path stroke-width="6" stroke="#00aa00" d="M0 10 H20 C70 10 140 160 180 160 H 200" fill="transparent"  />
        <path stroke-width="2" stroke="#ffffff" d="M0 10 H20 C70 10 140 160 180 160 H 200" fill="transparent" filter="url(#highlight)"  />
      </svg>
    </div>
  <canvas id="glCanvas" width="640" height="480"></canvas>
</section>
