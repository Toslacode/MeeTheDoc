import { useLayoutEffect, useRef, useState } from "react";

interface IndicatorRect {
  insetInlineStart: number;
  width: number;
}

/**
 * Measures the currently-active item among a row of registered elements and
 * returns a position/width for an absolutely-positioned sliding indicator —
 * the moving "glass pill" behind a nav or tab bar's active item.
 *
 * Returns a logical `insetInlineStart`, not `left`/`right`, so the same
 * value is correct under `dir="rtl"` without any direction-specific branch
 * at the call site; the direction handling lives once, here.
 */
function useSlidingIndicator(activeKey: string) {
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const el = itemRefs.current.get(activeKey);
      const container = el?.offsetParent as HTMLElement | null;
      if (!el || !container) return;

      const rtl = getComputedStyle(container).direction === "rtl";
      const insetInlineStart = rtl
        ? container.clientWidth - el.offsetLeft - el.offsetWidth
        : el.offsetLeft;
      setRect({ insetInlineStart, width: el.offsetWidth });
    }

    measure();
    // Desktop vs. mobile use different layouts (equal-width vs. auto-width
    // items), so a breakpoint change needs a re-measure, not just a
    // doctorId/tab change.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeKey]);

  function registerItem(key: string) {
    return (node: HTMLElement | null) => {
      if (node) itemRefs.current.set(key, node);
      else itemRefs.current.delete(key);
    };
  }

  return { indicatorRect: rect, registerItem };
}

export { useSlidingIndicator };
