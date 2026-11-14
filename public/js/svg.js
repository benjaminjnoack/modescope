// SVG geometry and element helpers.

const SVG_NS = "http://www.w3.org/2000/svg";

export function createSvg(tag, attributes = {}, text) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  if (text !== undefined) element.textContent = text;
  return element;
}

// Convert a wheel angle (0 = straight up, clockwise, in degrees) to x/y.
export function point(radius, degrees) {
  const rad = (degrees - 90) * Math.PI / 180;
  return [Math.cos(rad) * radius, Math.sin(rad) * radius];
}

// Path for a ring segment between two angles.
export function segmentPath(inner, outer, start, end) {
  const [ox1, oy1] = point(outer, start);
  const [ox2, oy2] = point(outer, end);
  const [ix2, iy2] = point(inner, end);
  const [ix1, iy1] = point(inner, start);
  return [
    `M ${ox1} ${oy1}`,
    `A ${outer} ${outer} 0 0 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${inner} ${inner} 0 0 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

// Angle of a pointer event around the SVG's origin (0 = up, clockwise).
export function eventAngle(svg, event) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse());
  return Math.atan2(y, x) * 180 / Math.PI + 90;
}
