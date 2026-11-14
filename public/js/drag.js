// Make an SVG group rotatable by dragging around the wheel's center.
// On release the rotation snaps to the nearest multiple of `step`.

import { eventAngle } from "./svg.js";

export function makeDraggable(svg, group, { getRotation, setRotation, step, onChange }) {
  let startAngle = null;
  let startRotation = 0;

  group.addEventListener("pointerdown", (event) => {
    startAngle = eventAngle(svg, event);
    startRotation = getRotation();
    group.setPointerCapture(event.pointerId);
    group.classList.add("dragging");
  });

  group.addEventListener("pointermove", (event) => {
    if (startAngle === null) return;
    setRotation(startRotation + (eventAngle(svg, event) - startAngle));
    onChange();
  });

  function endDrag() {
    if (startAngle === null) return;
    startAngle = null;
    group.classList.remove("dragging");
    setRotation(Math.round(getRotation() / step) * step);
    onChange();
  }
  group.addEventListener("pointerup", endDrag);
  group.addEventListener("pointercancel", endDrag);
}
