// A ring of labeled segments that can be laid out at any rotation.

import { createSvg, point, segmentPath } from "./svg.js";

export function createRing(group, labels, { inner, outer }) {
  const step = 360 / labels.length;
  const segments = labels.map((label) => {
    const path = createSvg("path", { class: "segment" });
    const text = createSvg("text", {}, label);
    group.append(path, text);
    return { path, text };
  });

  // Position every segment for `rotation`. `classesFor(i)` returns the
  // CSS classes (e.g. "selected") for segment i. Labels stay upright.
  function layout(rotation, classesFor) {
    segments.forEach(({ path, text }, i) => {
      const center = i * step + rotation;
      path.setAttribute("d", segmentPath(inner, outer, center - step / 2, center + step / 2));
      path.setAttribute("class", ["segment", ...classesFor(i)].join(" "));
      const [x, y] = point((inner + outer) / 2, center);
      text.setAttribute("x", x);
      text.setAttribute("y", y);
    });
  }

  // Index of the segment that `element` (a path or label) belongs to, or -1.
  function indexOf(element) {
    return segments.findIndex(({ path, text }) => path === element || text === element);
  }

  return { layout, indexOf };
}
