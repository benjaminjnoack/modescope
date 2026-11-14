// Make an SVG group rotatable by dragging around the wheel's center.
// On release the rotation snaps to the nearest multiple of `step`.
// `canDrag()` (optional) can return false to ignore drags, e.g. when locked.
// `onTap(target)` (optional) is called for a press that didn't move, with the
// element that was pressed.

import { eventAngle } from "./svg.js";

// How far (in screen pixels) the pointer may move and still count as a tap.
const TAP_TOLERANCE = 4;

export function makeDraggable(svg, group, {
  getRotation, setRotation, step, onChange,
  canDrag = () => true,
  onTap = () => {},
}) {
  let press = null; // { target, x, y, moved, dragging, startAngle, startRotation }

  group.addEventListener("pointerdown", (event) => {
    press = {
      target: event.target,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      dragging: canDrag(),
      startAngle: eventAngle(svg, event),
      startRotation: getRotation(),
    };
    group.setPointerCapture(event.pointerId);
    if (press.dragging) group.classList.add("dragging");
  });

  group.addEventListener("pointermove", (event) => {
    if (!press) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > TAP_TOLERANCE) {
      press.moved = true;
    }
    if (!press.dragging) return;
    setRotation(press.startRotation + (eventAngle(svg, event) - press.startAngle));
    onChange();
  });

  group.addEventListener("pointerup", () => {
    if (!press) return;
    const { target, moved, dragging } = press;
    endPress(dragging);
    if (!moved) onTap(target);
  });

  group.addEventListener("pointercancel", () => {
    if (press) endPress(press.dragging);
  });

  function endPress(dragging) {
    press = null;
    group.classList.remove("dragging");
    if (dragging) {
      setRotation(Math.round(getRotation() / step) * step);
      onChange();
    }
  }
}
