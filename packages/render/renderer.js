import { Segments } from './passes/segments.js'
import { Anisotropy } from './passes/anisotropy.js'
import { Curve } from './passes/curve.js'
import { Spline } from './passes/spline.js'
import { Render } from './passes/render.js'


export class Renderer {
  constructor({ anisotropy = 0.11 } = {}) {
    this.passes = [
      new Segments(),
      new Anisotropy(anisotropy),
      new Curve(),
      new Spline(),
      new Render()
    ]
  }

  render(glyph) {
    for (const pass of this.passes) {
      glyph = pass.run(glyph)
    }

    return glyph
  }
}
