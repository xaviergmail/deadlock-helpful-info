import { r as registerInstance, h, a as createEvent, d as getElement } from './index-Dtt5iJ3u.js';
import { L as Language, s as state, o as onChange, b as fetchItem, f as fetchItems, c as fetchGenericData } from './client-CPIywbzY.js';

const CDN_BASE = 'https://assets-bucket.deadlock-api.com/assets-api-res';
function cdn(path) {
    return `${CDN_BASE}/${path}`;
}
function cardBackground(slot, tier) {
    return cdn(`images/shop/catalog/cards/card_backer_${slot}_t${tier}.png`);
}
function tooltipHeaderBg(slot) {
    return cdn(`images/shop/catalog/catalog_tooltip_header_${slot}.png`);
}
function tooltipBodyBg(slot) {
    return cdn(`images/shop/catalog/catalog_tooltip_bg_${slot}.png`);
}
function shopBackground(slot) {
    const mapped = slot === 'tech' ? 'spirit' : slot;
    return cdn(`images/shop/catalog/catalog_shop_bg_${mapped}.webp`);
}
function shopTabShape() {
    return cdn('images/shop/catalog/catalog_shop_tab_shape.png');
}
function shopTabIcon(slot) {
    return cdn(`images/shop/catalog/catalog_shop_tab_icon_${slot}.png`);
}
function shopTabEdgeOverlay() {
    return cdn('images/shop/catalog/catalog_shop_tab_edge_overlay.png');
}
function soulIcon() {
    return cdn('images/shop/catalog/price_currency.png');
}
function fontUrl(name) {
    return cdn(`fonts/${name}.otf`);
}

/**
 * Runtime @font-face injection for Shadow DOM compatibility.
 *
 * Browsers only load fonts when a matching @font-face rule exists in the
 * document scope (light DOM). CSS declared inside a Shadow DOM tree can
 * reference a font-family, but the browser won't know where to fetch the
 * font files from unless the @font-face is also registered at the document
 * level.
 *
 * Because our components use `shadow: true`, we can't rely on the global
 * stylesheet alone — consumers would need to manually import it, which
 * breaks the plug-and-play contract of a web component library.
 *
 * Instead, `injectFonts()` programmatically appends a <style> element with
 * all @font-face declarations to document.head the first time a component
 * connects. This way, consumers only need the <script> tag — no extra CSS
 * import required.
 */
const STYLE_ID = 'dl-fonts';
const fonts = [
    { file: 'retaildemo-regular', weight: 400, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Regular', 'RetailDemo-Regular'] },
    { file: 'retaildemo-italic', weight: 400, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Italic', 'RetailDemo-Italic'] },
    { file: 'retaildemo-semibold', weight: 600, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Semibold', 'RetailDemo-Semibold'] },
    { file: 'retaildemo-semibolditalic', weight: 600, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Semibold Italic', 'RetailDemo-SemiboldItalic'] },
    { file: 'retaildemo-bold', weight: 700, style: 'normal', family: 'Retail Demo', local: ['Retail Demo Bold', 'RetailDemo-Bold'] },
    { file: 'retaildemo-bolditalic', weight: 700, style: 'italic', family: 'Retail Demo', local: ['Retail Demo Bold Italic', 'RetailDemo-BoldItalic'] },
    { file: 'tetsubingothic', weight: 400, style: 'normal', family: 'Tetsubingothic', local: ['Tetsubin Gothic', 'Tetsubingothic'] },
];
function injectFonts() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
        return;
    }
    const css = fonts
        .map(f => {
        const localSources = f.local.map(name => `local('${name}')`);
        const sources = [...localSources, `url('${fontUrl(f.file)}') format('opentype')`].join(', ');
        return `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  src: ${sources};
}`;
    })
        .join('\n');
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
}

const DlProvider = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /** Language for item data (e.g. `"english"`, `"brazilian"`, `"japanese"`). */
        this.language = Language.EN;
        /** How the item tooltip is triggered: `"hover"` on mouse over, `"click"` on click, or `"none"` to disable. */
        this.tooltipTrigger = 'hover';
        /** Preferred tooltip position. `"auto"` picks the side with the most space. */
        this.tooltipPlacement = 'auto';
        /** When `true`, the tooltip follows the cursor instead of anchoring to the card. Only applies when `tooltip-trigger` is `"hover"`. */
        this.tooltipFollowCursor = false;
        /** Delay in milliseconds before showing the tooltip on hover. */
        this.tooltipDelay = 100;
        /** Show tier badge on item cards globally. Individual cards can override this. */
        this.showTierBadge = true;
        /** Show numeric scaling multipliers in item tooltips. When false, only scaling icons and strength arrows are shown. */
        this.showScalingValues = false;
    }
    connectedCallback() {
        injectFonts();
        state.language = this.language;
        state.tooltipTrigger = this.tooltipTrigger;
        state.tooltipPlacement = this.tooltipPlacement;
        state.tooltipFollowCursor = this.tooltipFollowCursor;
        state.tooltipDelay = this.tooltipDelay;
        state.showTierBadge = this.showTierBadge;
        state.showScalingValues = this.showScalingValues;
    }
    languageChanged(newVal) {
        state.language = newVal;
    }
    tooltipTriggerChanged(newVal) {
        state.tooltipTrigger = newVal;
    }
    tooltipPlacementChanged(newVal) {
        state.tooltipPlacement = newVal;
    }
    tooltipFollowCursorChanged(newVal) {
        state.tooltipFollowCursor = newVal;
    }
    tooltipDelayChanged(newVal) {
        state.tooltipDelay = newVal;
    }
    showTierBadgeChanged(newVal) {
        state.showTierBadge = newVal;
    }
    showScalingValuesChanged(newVal) {
        state.showScalingValues = newVal;
    }
    render() {
        return h("slot", { key: '7f809295d1c340c4abce88200326bbc471565f66' });
    }
    static get watchers() { return {
        "language": [{
                "languageChanged": 0
            }],
        "tooltipTrigger": [{
                "tooltipTriggerChanged": 0
            }],
        "tooltipPlacement": [{
                "tooltipPlacementChanged": 0
            }],
        "tooltipFollowCursor": [{
                "tooltipFollowCursorChanged": 0
            }],
        "tooltipDelay": [{
                "tooltipDelayChanged": 0
            }],
        "showTierBadge": [{
                "showTierBadgeChanged": 0
            }],
        "showScalingValues": [{
                "showScalingValuesChanged": 0
            }]
    }; }
};

/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === 't' || firstChar === 'b' ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.includes('start') ? placement.replace('start', 'end') : placement.replace('end', 'start');
}
const lrPlacement = ['left', 'right'];
const rlPlacement = ['right', 'left'];
const tbPlacement = ['top', 'bottom'];
const btPlacement = ['bottom', 'top'];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case 'left':
    case 'right':
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

// Maximum number of resets that can occur before bailing to avoid infinite reset loops.
const MAX_RESET_COUNT = 50;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const platformWithDetectOverflow = platform.detectOverflow ? platform : {
    ...platform,
    detectOverflow
  };
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let resetCount = 0;
  const middlewareData = {};
  for (let i = 0; i < middleware.length; i++) {
    const currentMiddleware = middleware[i];
    if (!currentMiddleware) {
      continue;
    }
    const {
      name,
      fn
    } = currentMiddleware;
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platformWithDetectOverflow,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData[name] = {
      ...middlewareData[name],
      ...data
    };
    if (reset && resetCount < MAX_RESET_COUNT) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip$1 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);

      // If a reset by the arrow was caused due to an alignment offset being
      // added, we should skip any logic now since `flip()` has already done its
      // work.
      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await platform.detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === 'alignment' ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow ||
          // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every(d => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$filter2;
                const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis ||
                    // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === 'y';
                  }
                  return true;
                }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

const originSides = /*#__PURE__*/new Set(['left', 'top']);

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.

async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === 'y';
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset$1 = function (options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);

      // If the placement is the same and the arrow caused an alignment offset
      // then we don't need to change the positioning coordinates.
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift$1 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement,
        platform
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await platform.detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};

function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== 'inline' && display !== 'contents';
}
function isTableElement(element) {
  return /^(table|td|th)$/.test(getNodeName(element));
}
function isTopLayer(element) {
  try {
    if (element.matches(':popover-open')) {
      return true;
    }
  } catch (_e) {
    // no-op
  }
  try {
    return element.matches(':modal');
  } catch (_e) {
    return false;
  }
}
const willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
const containRe = /paint|layout|strict|content/;
const isNotNone = value => !!value && value !== 'none';
let isWebKitValue;
function isContainingBlock(elementOrCss) {
  const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || '') || containRe.test(css.contain || '');
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (isWebKitValue == null) {
    isWebKitValue = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('-webkit-backdrop-filter', 'none');
  }
  return isWebKitValue;
}
function isLastTraversableNode(node) {
  return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  } else {
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

function getCssDimensions(element) {
  const css = getComputedStyle$1(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

// If <html> has a CSS width greater than the viewport, then this will be
// incorrect for RTL.
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}

function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === 'fixed';
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle$1(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Safety check: ensure the scrollbar space is reasonable in case this
// calculation is affected by unusual styles.
// Most scrollbars leave 15-18px of space.
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  // <html> `overflow: hidden` + `scrollbar-gutter: stable` reduces the
  // visual width of the <html> but this is not considered in the size
  // of `html.clientWidth`.
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === 'CSS1Compat' ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    // If the <body> scrollbar is on the left, the width needs to be extended
    // by the scrollbar amount so there isn't extra space on the right.
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && (currentContainingBlockComputedStyle.position === 'absolute' || currentContainingBlockComputedStyle.position === 'fixed') || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
  let top = firstRect.top;
  let right = firstRect.right;
  let bottom = firstRect.bottom;
  let left = firstRect.left;
  for (let i = 1; i < clippingAncestors.length; i++) {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
    top = max(rect.top, top);
    right = min(rect.right, right);
    bottom = min(rect.bottom, bottom);
    left = max(rect.left, left);
  }
  return {
    width: right - left,
    height: bottom - top,
    x: left,
    y: top
  };
}

function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);

  // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
  // Firefox with layout.scrollbar.side = 3 in about:config to test this.
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}

function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === 'static';
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;

  // Firefox returns the <html> element as the offsetParent if it's non-static,
  // while Chrome and Safari return the <body> element. The <body> element must
  // be used to perform the correct calculations even if the <html> element is
  // non-static.
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}

const getElementRects = async function (data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};

function isRTL(element) {
  return getComputedStyle$1(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};

function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          // If the reference is clipped, the ratio is 0. Throttle the refresh
          // to prevent an infinite loop of updates.
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1000);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        // It's possible that even though the ratio is reported as 1, the
        // element is not actually fully within the IntersectionObserver's root
        // area anymore. This can happen under performance constraints. This may
        // be a bug in the browser's IntersectionObserver implementation. To
        // work around this, we compare the element's bounding rect now with
        // what it was at the time we created the IntersectionObserver. If they
        // are not equal then the element moved, so we refresh.
        refresh();
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...(floating ? getOverflowAncestors(floating) : [])] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    if (floating) {
      resizeObserver.observe(floating);
    }
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = offset$1;

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = shift$1;

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = flip$1;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

const dlItemCardCss = () => `:host{display:block;position:relative;width:73px;aspect-ratio:82 / 128;font-family:var(--dl-font-family);color:var(--dl-text-primary);line-height:1.4}:host(.custom-trigger),:host(.variant-auto-size){width:auto;height:auto;aspect-ratio:auto;display:inline-block}:host(.variant-square-size){width:var(--dl-item-icon-size, 48px);height:var(--dl-item-icon-size, 48px);aspect-ratio:1 / 1;display:inline-block}.trigger{display:block;width:100%;height:100%}:host(.custom-trigger) .trigger,:host(.variant-auto-size) .trigger{display:inline-block;width:auto;height:auto}*{box-sizing:border-box;margin:0;padding:0}.mod-box{aspect-ratio:82 / 128;border-radius:5px;box-sizing:border-box;cursor:default;display:flex;flex-direction:column;overflow:hidden;position:relative;transition:transform 0.15s ease}.mod-box.clickable,.icon-box.clickable,.item-image-only.clickable,.item-image-name.clickable,.item-inline-trigger.clickable{cursor:pointer}:host([hover-effect="scale"]) .mod-box:hover{transform:scale(1.15);z-index:10}.mod-box.loading{background:#1a1a2e;animation:shimmer 1.5s ease-in-out infinite}@keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:0.7}}.card-background{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;user-select:none;-webkit-user-drag:none}.mod-icon-container{align-items:center;border-radius:5px 5px 0 0;display:flex;aspect-ratio:1 / 1;flex:0 0 64.0625%;justify-content:center;min-height:0;overflow:hidden;padding:0px;position:relative;width:100%;box-sizing:border-box;z-index:3}.mod-icon{width:100%;height:100%;border-radius:5px 5px 0 0;object-fit:cover;user-select:none;-webkit-user-drag:none}.tier-badge{position:absolute;top:0;right:0;width:38%;padding-top:38%;height:0;overflow:hidden;z-index:9;clip-path:polygon(100% 0, 0 0, 100% 100%);opacity:0;transition:opacity 0.15s ease;user-select:none}.mod-box:hover .tier-badge{opacity:1}.tier-badge.weapon{background-color:#cc8932}.tier-badge.vitality{background-color:#6dc04b}.tier-badge.spirit{background-color:#c878f0}.tier-badge-number{position:absolute;top:2px;right:3px;font-size:9px;font-weight:800;color:#1a1510;z-index:10;width:12px;display:flex;align-items:center;justify-content:center;letter-spacing:0.5px}.active-tag{position:absolute;top:auto;bottom:33.8%;left:50%;transform:translateX(-50%);z-index:6;background-color:#181818;color:rgba(255, 239, 215, 0.9);font-size:9px;font-weight:700;min-width:60%;padding:1px 3px;text-align:center;text-transform:uppercase;border-radius:2px;letter-spacing:0.5px;user-select:none}.imbue-tag{position:absolute;top:auto;bottom:35.9375%;left:0;transform:none;z-index:6;background-color:#5a3a8a;color:#d4b8f0;font-size:8px;font-weight:600;width:100%;padding:1px 3px;text-align:center;text-transform:uppercase;letter-spacing:1px;border-radius:2px;user-select:none}.mod-name-container{border-radius:0 0 5px 5px;flex:0 0 35.9375%;height:35.9375%;padding:0 4%;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;position:relative;z-index:3}.mod-name{font-size:var(--dl-item-name-size, 13px);font-weight:700;letter-spacing:-0.02em;line-height:0.88;overflow-wrap:break-word;white-space:normal;color:#1a1510;font-family:'Retail Demo';padding:0 4px}.mod-name.name-size-md{font-size:12px}.mod-name.name-size-sm{font-size:11px}.mod-name.name-size-xs{font-size:10px}.mod-box.tier-4 .mod-name.weapon,.mod-box.tier-5 .mod-name.weapon{color:#e4c5a1}.mod-box.tier-4 .mod-name.vitality,.mod-box.tier-5 .mod-name.vitality{color:#c2e7cd}.mod-box.tier-4 .mod-name.spirit,.mod-box.tier-5 .mod-name.spirit{color:#e3d4f2}.mod-box.weapon .mod-name::selection{background-color:rgba(204, 137, 50, 0.4)}.mod-box.vitality .mod-name::selection{background-color:rgba(109, 192, 75, 0.4)}.mod-box.spirit .mod-name::selection{background-color:rgba(200, 120, 240, 0.4)}.icon-box{width:100%;height:100%;position:relative;border-radius:var(--dl-item-icon-border-radius, 0);overflow:hidden;box-sizing:border-box;transition:transform 0.15s ease;cursor:default}:host([hover-effect="scale"]) .icon-box:hover{transform:scale(1.15);z-index:10}.icon-image-container{width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}.icon-image{width:100%;height:100%;object-fit:cover;user-select:none;-webkit-user-drag:none}.icon-box .tier-badge{opacity:1;width:45%;padding-top:45%}.icon-box .tier-badge-number{top:1px;right:0;font-size:8px;width:10px;text-align:center;letter-spacing:0}.icon-box .active-tag,.icon-box .imbue-tag{top:auto;bottom:2px;font-size:7px;min-width:0;width:auto;padding:1px 4px}.item-image-only{cursor:default;display:block;height:100%;width:100%}.icon-box.loading,.item-image-only.loading,.item-image-name.loading,.item-inline-trigger.loading{background-color:#1a1a2e;animation:shimmer 1.5s ease-in-out infinite}.item-image-name.loading{min-height:var(--dl-item-image-name-size, 68px);min-width:var(--dl-item-image-name-loading-width, 160px)}.item-inline-trigger.loading{min-height:var(--dl-item-inline-loading-height, 1em);min-width:var(--dl-item-inline-loading-width, 6em)}.item-inline-trigger.loading.image-only{min-height:var(--dl-item-inline-image-only-size, 1.45em);min-width:var(--dl-item-inline-image-only-size, 1.45em)}.item-image-only-img{display:block;height:100%;object-fit:cover;width:100%;user-select:none;-webkit-user-drag:none}.item-image-name,.item-inline-trigger{--item-accent-color:var(--dl-item-accent-color, #8b9bae);align-items:center;color:var(--dl-item-name-color, var(--item-accent-color));display:inline-flex;font-family:var(--dl-font-family, 'Retail Demo', sans-serif);font-weight:700}.item-image-name{gap:var(--dl-item-image-name-gap, 10px);line-height:1.05}.item-image-name.weapon,.item-inline-trigger.weapon{--item-accent-color:var(--dl-item-accent-color, #d99a3a)}.item-image-name.vitality,.item-inline-trigger.vitality{--item-accent-color:var(--dl-item-accent-color, #a9d84a)}.item-image-name.spirit,.item-inline-trigger.spirit{--item-accent-color:var(--dl-item-accent-color, #c878f0)}.item-image-name-img{display:block;height:var(--dl-item-image-name-size, 68px);object-fit:cover;width:var(--dl-item-image-name-size, 68px);user-select:none;-webkit-user-drag:none}.item-image-name-text{color:inherit;font-size:var(--dl-item-image-name-font-size, 18px)}.item-inline-trigger{gap:var(--dl-item-inline-gap, 0.32em);line-height:1;vertical-align:baseline}.item-inline-trigger-img{display:inline-block;height:var(--dl-item-inline-image-size, 1.18em);object-fit:cover;width:var(--dl-item-inline-image-size, 1.18em);user-select:none;-webkit-user-drag:none}.item-inline-trigger.image-only .item-inline-trigger-img{height:var(--dl-item-inline-image-only-size, 1.45em);width:var(--dl-item-inline-image-only-size, 1.45em)}.item-inline-trigger-name{color:inherit;font-size:var(--dl-item-inline-font-size, 1em)}.icon-box.error,.item-image-only.error,.item-image-name.error,.item-inline-trigger.error{align-items:center;background-color:#2a1720;border:1px solid rgba(255, 128, 128, 0.5);color:#ffb8b8;display:inline-flex;font-family:var(--dl-font-family, sans-serif);font-weight:700;justify-content:center}.icon-box.error,.item-image-only.error{display:flex;height:100%;width:100%}.item-error-glyph{font-size:0.9em;line-height:1}.tooltip-wrapper{position:fixed;top:0;left:0;width:max-content;z-index:1000;visibility:hidden;pointer-events:none}.tooltip-wrapper.open{visibility:visible;pointer-events:auto}`;

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];
const AUTO_SIZE_VARIANTS = new Set(['image-name', 'inline', 'inline-text', 'inline-image']);
const SQUARE_SIZE_VARIANTS = new Set(['icon', 'image']);
const DlItemCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tooltipOpen = createEvent(this, "tooltipOpen", 7);
        this.tooltipClose = createEvent(this, "tooltipClose", 7);
        /** Hover effect on the card. `"none"` does nothing, `"scale"` enlarges on hover. */
        this.hoverEffect = 'none';
        /** Visual variant. `"card"` renders the full shop card; `"image"` renders only the square item image; inline variants render text/image triggers. */
        this.variant = 'card';
        this._loading = false;
        this._open = false;
        this._mouseX = 0;
        this._mouseY = 0;
        this._tooltipItemsResolved = false;
        /** Follow-cursor mode: position relative to cursor via virtual element */
        this.updatePositionFromMouse = () => {
            this.computeFloatingPosition(this.virtualRef);
        };
        /** Anchored mode: position relative to card element */
        this.updatePositionFromCard = () => {
            const card = this.cardEl;
            if (!card)
                return;
            this.computeFloatingPosition(card);
        };
        this.handleMouseMove = (e) => {
            this._mouseX = e.clientX;
            this._mouseY = e.clientY;
            if (this._rafId == null) {
                this._rafId = requestAnimationFrame(() => {
                    this._rafId = undefined;
                    this.updatePositionFromMouse();
                });
            }
        };
        this.handleMouseEnter = (e) => {
            if (this.resolvedTrigger !== 'hover')
                return;
            const delay = state.tooltipDelay;
            if (state.tooltipFollowCursor) {
                this._mouseX = e.clientX;
                this._mouseY = e.clientY;
                this.el.addEventListener('mousemove', this.handleMouseMove);
                if (delay > 0) {
                    this._hoverTimeout = setTimeout(() => this.showFollowCursorMode(), delay);
                }
                else {
                    this.showFollowCursorMode();
                }
            }
            else {
                if (delay > 0) {
                    this._hoverTimeout = setTimeout(() => this.showAnchoredMode(), delay);
                }
                else {
                    this.showAnchoredMode();
                }
            }
        };
        this.handleMouseLeave = () => {
            if (this.resolvedTrigger !== 'hover')
                return;
            if (state.tooltipFollowCursor) {
                this.el.removeEventListener('mousemove', this.handleMouseMove);
            }
            this.hideTooltip();
        };
        this.handleCardClick = () => {
            if (this.resolvedTrigger !== 'click')
                return;
            if (this._open) {
                this.hideTooltip();
                document.removeEventListener('click', this._onOutsideClick);
            }
            else {
                this.showAnchoredMode();
                requestAnimationFrame(() => {
                    document.addEventListener('click', this._onOutsideClick);
                });
            }
        };
        this._onOutsideClick = (e) => {
            if (!this.el.contains(e.target)) {
                this.hideTooltip();
                document.removeEventListener('click', this._onOutsideClick);
            }
        };
    }
    get item() {
        var _a;
        return (_a = this.itemData) !== null && _a !== void 0 ? _a : this._item;
    }
    get cardEl() {
        var _a;
        return (_a = this.el.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.trigger');
    }
    get floatingEl() {
        var _a;
        return (_a = this.el.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.tooltip-wrapper');
    }
    get virtualRef() {
        const x = this._mouseX;
        const y = this._mouseY;
        return {
            getBoundingClientRect: () => ({
                x,
                y,
                top: y,
                left: x,
                bottom: y,
                right: x,
                width: 0,
                height: 0,
            }),
        };
    }
    get resolvedPlacement() {
        const configured = state.tooltipPlacement;
        if (configured !== 'auto')
            return configured;
        const card = this.cardEl;
        if (!card)
            return 'right';
        const rect = card.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const spaceRight = vw - rect.right;
        const spaceLeft = rect.left;
        const spaceBottom = vh - rect.bottom;
        const spaceTop = rect.top;
        const maxH = Math.max(spaceRight, spaceLeft);
        const maxV = Math.max(spaceBottom, spaceTop);
        if (maxH >= maxV) {
            return spaceRight >= spaceLeft ? 'right' : 'left';
        }
        return spaceBottom >= spaceTop ? 'bottom' : 'top';
    }
    get itemKey() {
        var _a;
        return (_a = this.itemId) !== null && _a !== void 0 ? _a : this.itemClassName;
    }
    get resolvedTrigger() {
        var _a;
        return (_a = this.tooltipTrigger) !== null && _a !== void 0 ? _a : state.tooltipTrigger;
    }
    connectedCallback() {
        injectFonts();
        this.detectCustomTrigger();
        this.updateVariantClasses();
        if (this.itemKey && !this.itemData) {
            this.fetchItemData();
        }
        else if (this.itemData) {
            this.resolveNameOverride();
        }
        this._unsubLanguage = onChange('language', () => {
            if (this.itemKey && !this.itemData) {
                this.fetchItemData();
            }
        });
    }
    detectCustomTrigger() {
        const hasSlottedContent = this.el.childNodes.length > 0;
        this.el.classList.toggle('custom-trigger', hasSlottedContent);
    }
    updateVariantClasses() {
        this.el.classList.toggle('variant-auto-size', AUTO_SIZE_VARIANTS.has(this.variant));
        this.el.classList.toggle('variant-square-size', SQUARE_SIZE_VARIANTS.has(this.variant));
    }
    disconnectedCallback() {
        var _a;
        this.hideTooltip();
        this.el.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('click', this._onOutsideClick);
        (_a = this._unsubLanguage) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    itemKeyChanged() {
        if (this.itemKey && !this.itemData) {
            this.fetchItemData();
        }
    }
    onItemNameLanguageChange() {
        this._componentItems = undefined;
        this._parentItems = undefined;
        this._tooltipItemsResolved = false;
        this._tooltipItemsPromise = undefined;
        this.resolveNameOverride();
    }
    onVariantChange() {
        this.updateVariantClasses();
    }
    async fetchItemData() {
        const key = this.itemKey;
        if (!key)
            return;
        this._loading = true;
        this._error = undefined;
        this._componentItems = undefined;
        this._parentItems = undefined;
        this._tooltipItemsResolved = false;
        this._tooltipItemsPromise = undefined;
        try {
            this._item = await fetchItem(key, state.language);
            this.resolveNameOverride();
        }
        catch (e) {
            this._item = undefined;
            this._error = e instanceof Error ? e.message : 'Failed to load item';
        }
        finally {
            this._loading = false;
        }
    }
    async resolveComponentItems() {
        var _a, _b;
        const item = this.item;
        if (!((_a = item === null || item === void 0 ? void 0 : item.component_items) === null || _a === void 0 ? void 0 : _a.length) || this.componentItemsData)
            return;
        try {
            const allItems = await fetchItems(state.language);
            const byClassName = new Map(allItems.map(i => [i.class_name, i]));
            // Resolve name overrides for component items
            let nameOverrides;
            if (this.itemNameLanguage && this.itemNameLanguage !== state.language) {
                const nameItems = await fetchItems(this.itemNameLanguage);
                nameOverrides = new Map(nameItems.map(i => [i.class_name, i.name]));
            }
            const resolved = [];
            for (const cn of item.component_items) {
                const comp = byClassName.get(cn);
                if (!comp)
                    continue;
                resolved.push({
                    name: (_b = nameOverrides === null || nameOverrides === void 0 ? void 0 : nameOverrides.get(cn)) !== null && _b !== void 0 ? _b : comp.name,
                    image: this.getImageSrc(comp),
                });
            }
            this._componentItems = resolved;
        }
        catch (_c) {
            // silently fail
        }
    }
    async resolveParentItems() {
        var _a, _b;
        const item = this.item;
        if (!item || this.parentItemsData)
            return;
        try {
            const allItems = await fetchItems(state.language);
            let nameOverrides;
            if (this.itemNameLanguage && this.itemNameLanguage !== state.language) {
                const nameItems = await fetchItems(this.itemNameLanguage);
                nameOverrides = new Map(nameItems.map(i => [i.class_name, i.name]));
            }
            const parents = [];
            for (const other of allItems) {
                if ((_a = other.component_items) === null || _a === void 0 ? void 0 : _a.includes(item.class_name)) {
                    parents.push({
                        name: (_b = nameOverrides === null || nameOverrides === void 0 ? void 0 : nameOverrides.get(other.class_name)) !== null && _b !== void 0 ? _b : other.name,
                        image: this.getImageSrc(other),
                    });
                }
            }
            this._parentItems = parents.length > 0 ? parents : undefined;
        }
        catch (_c) {
            // silently fail
        }
    }
    async ensureTooltipItemsResolved() {
        if (this.resolvedTrigger === 'none' || this._tooltipItemsResolved || this._tooltipItemsPromise)
            return;
        if (!this.item)
            return;
        this._tooltipItemsPromise = Promise.all([
            this.resolveComponentItems(),
            this.resolveParentItems(),
        ]).then(() => {
            this._tooltipItemsResolved = true;
        }).finally(() => {
            this._tooltipItemsPromise = undefined;
        });
        await this._tooltipItemsPromise;
    }
    async resolveNameOverride() {
        const item = this.item;
        if (!item || !this.itemNameLanguage || this.itemNameLanguage === state.language) {
            this._nameOverride = undefined;
            return;
        }
        try {
            const items = await fetchItems(this.itemNameLanguage);
            const match = items.find(i => i.class_name === item.class_name);
            this._nameOverride = match === null || match === void 0 ? void 0 : match.name;
        }
        catch (_a) {
            // silently fail — fall back to default name
        }
    }
    get displayName() {
        var _a, _b, _c;
        return (_c = (_a = this._nameOverride) !== null && _a !== void 0 ? _a : (_b = this.item) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '';
    }
    computeFloatingPosition(reference) {
        const floating = this.floatingEl;
        if (!floating)
            return;
        const placement = this.resolvedPlacement;
        computePosition(reference, floating, {
            placement,
            strategy: 'fixed',
            middleware: [
                offset(8),
                flip({ fallbackStrategy: 'initialPlacement' }),
                shift({ padding: 8 }),
            ],
        }).then(({ x, y, placement: finalPlacement }) => {
            Object.assign(floating.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
            floating.setAttribute('data-placement', finalPlacement);
        });
    }
    showFollowCursorMode() {
        this._open = true;
        this.emitTooltipOpen();
        void this.ensureTooltipItemsResolved();
        requestAnimationFrame(() => this.updatePositionFromMouse());
    }
    showAnchoredMode() {
        this._open = true;
        this.emitTooltipOpen();
        void this.ensureTooltipItemsResolved();
        requestAnimationFrame(() => {
            const card = this.cardEl;
            const floating = this.floatingEl;
            if (!card || !floating || !this._open)
                return;
            this.updatePositionFromCard();
            this._cleanupAutoUpdate = autoUpdate(card, floating, this.updatePositionFromCard);
        });
    }
    hideTooltip() {
        var _a, _b;
        const wasOpen = this._open;
        this._open = false;
        clearTimeout(this._hoverTimeout);
        if (this._rafId != null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = undefined;
        }
        (_a = this._cleanupAutoUpdate) === null || _a === void 0 ? void 0 : _a.call(this);
        this._cleanupAutoUpdate = undefined;
        if (wasOpen) {
            this.tooltipClose.emit((_b = this.item) === null || _b === void 0 ? void 0 : _b.class_name);
        }
    }
    emitTooltipOpen() {
        const item = this.item;
        if (item) {
            this.tooltipOpen.emit(item.class_name);
        }
    }
    render() {
        var _a, _b;
        const item = this.item;
        const isClickMode = this.resolvedTrigger === 'click';
        const noTooltip = this.resolvedTrigger === 'none';
        const shouldRenderTooltip = !noTooltip && !!item && this._open;
        return [
            h("div", { key: 'b454380d5e8454c291c6422dcdb03e491cc27150', class: "trigger", onClick: this.handleCardClick, onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave }, h("slot", { key: '7ae3bf20e22e5c26e0a9820585fba63f738b00e8' }, this.renderVariant(item, isClickMode))),
            shouldRenderTooltip && item && (h("div", { key: '776314f36c830b75c4b21f05cc6157f62ff6718c', class: { 'tooltip-wrapper': true, 'open': this._open }, onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave }, h("dl-item-tooltip", { key: '3fd6052373460f556794c2d4545269f24d2b2414', itemData: item, nameOverride: this._nameOverride, componentItemsData: (_a = this.componentItemsData) !== null && _a !== void 0 ? _a : this._componentItems, parentItemsData: (_b = this.parentItemsData) !== null && _b !== void 0 ? _b : this._parentItems }))),
        ];
    }
    renderVariant(item, isClickMode) {
        switch (this.variant) {
            case 'icon':
                return this.renderIcon(item, isClickMode);
            case 'image':
                return this.renderImageOnly(item, isClickMode);
            case 'image-name':
                return this.renderImageName(item, isClickMode);
            case 'inline':
                return this.renderInlineItem(item, isClickMode, { image: true, name: true });
            case 'inline-text':
                return this.renderInlineItem(item, isClickMode, { image: false, name: true });
            case 'inline-image':
                return this.renderInlineItem(item, isClickMode, { image: true, name: false });
            case 'card':
            default:
                return this.renderDefaultCard(item, isClickMode);
        }
    }
    getImageSrc(item) {
        return item.shop_image_webp || item.shop_image || item.image_webp || item.image || undefined;
    }
    getSlotClass(item) {
        var _a;
        return (_a = item === null || item === void 0 ? void 0 : item.item_slot_type) !== null && _a !== void 0 ? _a : 'neutral';
    }
    getTriggerClasses(baseClass, item, isClickMode, extra = {}) {
        return Object.assign({ [baseClass]: true, 'clickable': isClickMode, [this.getSlotClass(item)]: true }, extra);
    }
    renderStateFallback(tag, baseClass, item, options = {}) {
        var _a;
        const className = Object.assign({ [baseClass]: true }, ((_a = options.extraClasses) !== null && _a !== void 0 ? _a : {}));
        if (this._loading || (!item && !this._error)) {
            return h(tag, { class: Object.assign(Object.assign({}, className), { 'loading': true }) });
        }
        if (this._error) {
            const content = options.showErrorText
                ? this._error
                : h("span", { class: "item-error-glyph", "aria-hidden": "true" }, "!");
            return h(tag, { class: Object.assign(Object.assign({}, className), { 'error': true }), title: this._error, 'aria-label': this._error }, content);
        }
    }
    renderImageOnly(item, isClickMode) {
        const fallback = this.renderStateFallback('div', 'item-image-only', item);
        if (fallback)
            return fallback;
        const imgSrc = this.getImageSrc(item);
        return (h("div", { class: this.getTriggerClasses('item-image-only', item, isClickMode) }, imgSrc && h("img", { class: "item-image-only-img", src: imgSrc, alt: this.displayName, loading: "lazy" })));
    }
    renderImageName(item, isClickMode) {
        const fallback = this.renderStateFallback('div', 'item-image-name', item, { showErrorText: true });
        if (fallback)
            return fallback;
        const imgSrc = this.getImageSrc(item);
        return (h("div", { class: this.getTriggerClasses('item-image-name', item, isClickMode) }, imgSrc && h("img", { class: "item-image-name-img", src: imgSrc, alt: "", loading: "lazy" }), h("span", { class: "item-image-name-text" }, this.displayName)));
    }
    renderInlineItem(item, isClickMode, parts) {
        const imageOnly = parts.image && !parts.name;
        const fallback = this.renderStateFallback('span', 'item-inline-trigger', item, {
            showErrorText: parts.name,
            extraClasses: { 'image-only': imageOnly },
        });
        if (fallback)
            return fallback;
        const imgSrc = this.getImageSrc(item);
        return (h("span", { class: this.getTriggerClasses('item-inline-trigger', item, isClickMode, { 'image-only': imageOnly }) }, parts.image && imgSrc && h("img", { class: "item-inline-trigger-img", src: imgSrc, alt: parts.name ? '' : this.displayName, loading: "lazy" }), parts.name && h("span", { class: "item-inline-trigger-name" }, this.displayName)));
    }
    renderIcon(item, isClickMode) {
        var _a, _b;
        const fallback = this.renderStateFallback('div', 'icon-box', item);
        if (fallback)
            return fallback;
        const slot = item.item_slot_type;
        const tier = item.item_tier;
        const imgSrc = this.getImageSrc(item);
        const isActive = item.is_active_item || (item.activation !== 'passive');
        const hasImbue = !!item.imbue;
        return (h("div", { class: {
                'icon-box': true,
                'clickable': isClickMode,
                [`tier-${tier}`]: true,
                [slot]: true,
            } }, ((_a = this.showTierBadge) !== null && _a !== void 0 ? _a : true) && (h("div", { class: { 'tier-badge': true, [slot]: true } }, h("span", { class: "tier-badge-number" }, (_b = ROMAN_NUMERALS[tier - 1]) !== null && _b !== void 0 ? _b : tier))), h("div", { class: "icon-image-container" }, imgSrc && h("img", { class: "icon-image", src: imgSrc, alt: this.displayName, loading: "lazy" })), isActive && !hasImbue && h("span", { class: "active-tag" }, "Active"), hasImbue && h("span", { class: "imbue-tag" }, "Imbue")));
    }
    getNameSizeClass(name) {
        const length = name.trim().length;
        if (length > 24)
            return 'name-size-xs';
        if (length > 19)
            return 'name-size-sm';
        if (length > 14)
            return 'name-size-md';
    }
    renderDefaultCard(item, isClickMode) {
        var _a, _b;
        if (this._loading || (!item && !this._error)) {
            return (h("div", { class: "mod-box loading" }, h("div", { class: "mod-icon-container" }), h("div", { class: "mod-name-container" })));
        }
        if (this._error) {
            return (h("div", { class: "mod-box" }, h("div", { class: "mod-icon-container" }), h("div", { class: "mod-name-container" }, h("span", { class: "mod-name" }, this._error))));
        }
        const resolvedItem = item;
        const slot = resolvedItem.item_slot_type;
        const tier = resolvedItem.item_tier;
        const imgSrc = this.getImageSrc(resolvedItem);
        const isActive = resolvedItem.is_active_item || (resolvedItem.activation !== 'passive');
        const hasImbue = !!resolvedItem.imbue;
        const cardBg = cardBackground(slot, tier);
        const name = this.displayName;
        const sizeClass = this.getNameSizeClass(name);
        return (h("div", { class: {
                'mod-box': true,
                'clickable': isClickMode,
                [`tier-${tier}`]: true,
                [slot]: true,
            } }, cardBg && h("img", { class: "card-background", src: cardBg, alt: "" }), ((_a = this.showTierBadge) !== null && _a !== void 0 ? _a : state.showTierBadge) && (h("div", { class: { 'tier-badge': true, [slot]: true } }, h("span", { class: "tier-badge-number" }, (_b = ROMAN_NUMERALS[tier - 1]) !== null && _b !== void 0 ? _b : tier))), h("div", { class: "mod-icon-container" }, imgSrc && h("img", { class: "mod-icon", src: imgSrc, alt: name, loading: "lazy" })), isActive && !hasImbue && h("span", { class: "active-tag" }, "Active"), hasImbue && h("span", { class: "imbue-tag" }, "Imbue"), h("div", { class: "mod-name-container" }, h("span", { class: Object.assign({ 'mod-name': true, [slot]: true }, (sizeClass ? { [sizeClass]: true } : {})) }, name))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "itemId": [{
                "itemKeyChanged": 0
            }],
        "itemClassName": [{
                "itemKeyChanged": 0
            }],
        "itemNameLanguage": [{
                "onItemNameLanguageChange": 0
            }],
        "variant": [{
                "onVariantChange": 0
            }]
    }; }
};
DlItemCard.style = dlItemCardCss();

function isPropertyVisible(prop) {
    if (prop.value === null || prop.value === undefined)
        return false;
    if (prop.disable_value !== undefined && prop.disable_value !== null) {
        return String(prop.value) !== String(prop.disable_value);
    }
    return String(prop.value) !== '0';
}
function getSlotColor(slotType) {
    var _a;
    const colors = {
        weapon: '#cc8932',
        vitality: '#6dc04b',
        spirit: '#c878f0',
    };
    return (_a = colors[slotType]) !== null && _a !== void 0 ? _a : '#8b9bae';
}

const dlItemTooltipCss = () => `:host{display:block;width:450px;font-family:var(--dl-font-family, 'Retail Demo', sans-serif);color:var(--dl-text-tooltip, #ffefd7);line-height:1.4;text-align:left}*{box-sizing:border-box;margin:0;padding:0}.tooltip{width:450px;font-size:18px;--tooltip-off-white:#ffefd7;--tooltip-muted:rgba(255, 255, 255, 0.5);--tooltip-black:#10130d;--courageBrightColor:#ec981a;--courageColor:#9e630c;--fortitudeBrightColor:#7cbb1e;--fortitudeColor:#659818;--spiritBrightColor:#ce91ff;--spiritColor:#8b56b4;--armorColor:#00ff9a;--offWhite:#ffefd7;--tooltip-courage-bright:var(--courageBrightColor);--tooltip-fortitude-bright:var(--fortitudeBrightColor);--tooltip-spirit-bright:var(--spiritBrightColor);--tooltip-armor:var(--armorColor);--tooltip-filter-courage:brightness(0) saturate(100%) invert(62%) sepia(82%) saturate(611%) hue-rotate(357deg) brightness(101%) contrast(91%);--tooltip-filter-fortitude:brightness(0) saturate(100%) invert(84%) sepia(52%) saturate(895%) hue-rotate(91deg) brightness(109%) contrast(102%);--tooltip-filter-spirit:brightness(0) saturate(100%) invert(74%) sepia(36%) saturate(1115%) hue-rotate(219deg) brightness(103%) contrast(97%);--tooltip-filter-off-white:brightness(0) saturate(100%) invert(97%) sepia(12%) saturate(600%) hue-rotate(0deg) brightness(107%);--tooltip-heal-text:#99f051;--tooltip-stamina-text:#a9f0a1;--tooltip-debuff:#9af052}.tooltip-shadow{display:flex;flex-direction:column;overflow:hidden;border-radius:8px;box-shadow:0 0 20px rgba(0, 0, 0, 0.66), inset 0 0 0 1px rgba(0, 0, 0, 0.66)}.tooltip-main{width:100%}.header-container{display:flex;align-items:center;width:100%;min-height:96px;padding:0 20px;background-size:cover;background-position:center;background-repeat:no-repeat;background-color:#1a1a2e}.mod-name-container{width:100%;min-width:0}.mod-name{display:block;max-width:100%;overflow:hidden;color:var(--tooltip-off-white);font-size:28px;font-weight:700;line-height:1.08;text-overflow:ellipsis;text-shadow:2px 2px 0 rgba(0, 0, 0, 0.12);white-space:nowrap}.mod-cost{display:flex;align-items:center;gap:5px;margin-top:3px;color:#99ffd6;font-size:20px;font-weight:700;line-height:1}.soul-icon{display:block;width:16px;height:22px;object-fit:contain;filter:brightness(0) saturate(100%) invert(92%) sepia(21%) saturate(695%) hue-rotate(84deg) brightness(100%) contrast(103%)}.properties-container{width:100%;margin-top:-1px;background-color:#0f0f1a;background-size:cover;background-position:center;background-repeat:no-repeat;padding:0}.section{width:100%;padding:8px 14px 12px}.section+.section{padding-top:0}.innate-section{padding-top:8px}.ability-type-label{display:flex;align-items:center;justify-content:space-between;width:calc(100% + 28px);height:32px;margin:0 -14px 8px;padding-left:20px;background-color:rgba(16, 19, 13, 0.48);color:var(--tooltip-off-white);font-size:18px;font-weight:700;line-height:32px;text-transform:capitalize}.ability-type-label.passive{background-color:rgba(16, 19, 13, 0.37)}.ability-type-label.passive .ability-type-text{font-style:italic;font-weight:600;opacity:0.7}.ability-timing-group{display:flex;align-items:stretch;height:100%;margin-left:auto}.ability-timing{display:flex;align-items:center;gap:5px;height:100%;padding:0 20px;background-color:rgba(0, 0, 0, 0.76);color:var(--tooltip-off-white);font-size:16px;font-style:normal;font-weight:700;line-height:32px}.ability-timing-icon{width:22px;height:22px;object-fit:contain;filter:none}.ability-timing.cooldown .ability-timing-icon,.ability-timing.charge-up .ability-timing-icon{filter:none}.mod-info-label{width:100%;color:#cdcdcd;font-size:18px;font-weight:400;line-height:135%}.applied-attributes-container+.applied-attributes-container{margin-top:12px}.has-description .stats-block{margin-top:15px}.innate-section .has-description .stats-block{margin-top:10px}.stats-block{display:flex;flex-direction:row;gap:4px;width:100%;min-height:80px;overflow:hidden}.stats-block-stacked{flex-direction:column}.stats-block-no-important{min-height:40px}.no-applied-stats .important-stats-wrapper{flex:1 1 100%;width:100%}.important-stats-wrapper{display:flex;flex:0 0 130px;flex-direction:row;gap:4px;min-height:80px}.stats-block-stacked .important-stats-wrapper{flex:none;width:100%;min-height:70px}.important-stats-wrapper.count-4,.important-stats-wrapper.count-5,.important-stats-wrapper.count-6{flex-wrap:wrap}.important-stat-box{position:relative;display:flex;flex:1 1 0;align-items:center;justify-content:center;min-width:0;min-height:80px;padding:5px;background-color:rgba(0, 0, 0, 0.25);text-align:center}.important-stats-wrapper.count-4 .important-stat-box,.important-stats-wrapper.count-5 .important-stat-box,.important-stats-wrapper.count-6 .important-stat-box{flex-basis:calc(50% - 2px);min-height:70px}.important-stat-content{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:100%;min-width:0;line-height:1.1}.important-stat-icon-value{display:flex;align-items:center;justify-content:center;width:100%;min-width:0;margin-top:-2px}.important-stat-icon-value.hide-important-stat-icon .important-stat-icon{display:none}.important-stat-icon{flex-shrink:0;width:20px;height:20px;margin-right:3px;object-fit:contain}.important-stat-value{min-width:0;color:var(--tooltip-off-white);font-size:22px;font-weight:700;white-space:nowrap}.important-stat-labels{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:100%;min-width:0}.important-stat-type{display:-webkit-box;width:100%;max-height:40px;overflow:hidden;color:var(--tooltip-off-white);font-size:16px;font-weight:500;line-height:1.15;text-align:center;-webkit-box-orient:vertical;-webkit-line-clamp:2}.important-stat-label{display:-webkit-box;width:100%;max-height:40px;overflow:hidden;color:var(--tooltip-off-white);font-size:16px;font-style:italic;font-weight:600;line-height:1.15;opacity:0.5;text-align:center;-webkit-box-orient:vertical;-webkit-line-clamp:2}.important-stat-box.status-effect .important-stat-value{color:#6dc04b;font-size:20px}.prop_bullet_damage .important-stat-type,.prop_damage .important-stat-type{color:#ec981a;font-weight:600}.prop_tech_damage .important-stat-type,.prop_tech_power .important-stat-type,.prop_spirit .important-stat-type{color:#ce91ff;font-weight:600}.prop_healing .important-stat-type,.prop_health .important-stat-type{color:#7bba1d;font-weight:600}.stats-block-props{display:flex;flex:1;flex-direction:column;justify-content:center;gap:1px;min-width:0;min-height:80px;padding:10px 15px;background-color:rgba(0, 0, 0, 0.25)}.stats-block-props.empty{display:none}.stats-block-no-important .stats-block-props{width:100%;min-height:0;gap:5px;padding:0;background-color:transparent}.stats-block-stacked .stats-block-props{flex-direction:row;flex-wrap:wrap;gap:1px 4px;width:100%;min-height:0}.stats-block-stacked .block-prop-item{width:calc(50% - 2px);padding:2px 0}.block-prop-item{display:block;min-width:0;color:var(--tooltip-off-white);font-size:18px;line-height:1.3;white-space:nowrap}.attribute-value{font-weight:700;white-space:nowrap}.attribute-name{margin-left:5px;color:#ffffff;font-size:18px;font-weight:500;opacity:0.7;white-space:nowrap}.attribute-name.elevated{color:#ffffff;font-weight:700;opacity:1}.full-property-value{color:var(--tooltip-off-white);font-weight:700;white-space:nowrap}.prefix-value,.postfix-value{color:rgba(255, 255, 255, 0.5);font-weight:700}.postfix-value.shrink,.stats-block-props .postfix-value{font-size:16px}.property-value{color:var(--tooltip-off-white);font-weight:700}.full-property-value.is-negative .prefix-value,.full-property-value.is-negative .postfix-value,.full-property-value.is-negative .property-value{color:#ff6a6a;opacity:1}.highlight,.mod-info-label .highlight{color:#f8f8f8;font-weight:600}.highlight_weapon,.highlight_courage,.mod-info-label .highlight_weapon,.mod-info-label .highlight_courage{color:var(--tooltip-courage-bright);font-weight:700}.highlight_spirit,.highlight_tech,.mod-info-label .highlight_spirit,.mod-info-label .highlight_tech{color:var(--tooltip-spirit-bright);font-weight:700}.highlight_armor,.highlight_fortitude,.mod-info-label .highlight_armor,.mod-info-label .highlight_fortitude{color:var(--tooltip-fortitude-bright);font-weight:700}.is-negative,.isNegative,.mod-info-label .is-negative,.mod-info-label .isNegative{color:#ff6a6a;font-weight:700}.diminish,.mod-info-label .diminish{color:rgba(191, 187, 176, 0.9);font-size:15px;font-style:italic;font-weight:600}.strike{color:rgba(200, 200, 210, 0.5);text-decoration:line-through}.bold{font-weight:700}.italic{font-style:italic}svg,.mod-info-label img,.section img:not(.important-stat-icon):not(.ability-timing-icon){position:relative;top:2px;display:inline-block;width:16px;height:16px;vertical-align:middle}svg{fill:currentColor}.inline-attribute-label{font-weight:700}.mod-info-label .InlineKey,.mod-info-label .keybind{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;margin:0 3px;padding:0 6px;background-color:#c6b6a2;color:var(--tooltip-black);font-size:17px;font-style:normal;font-weight:800;line-height:24px;text-transform:uppercase;vertical-align:-3px}.mod-info-label .inline-attribute-label.Spirit,.mod-info-label .inline-attribute-label.SpiritDamage,.mod-info-label .inline-attribute-label.BonusSpiritDamage,.mod-info-label .inline-attribute-label.SpiritDPS,.mod-info-label .inline-attribute-label.SpiritResist,.mod-info-label .InlineAttributeName.Spirit,.mod-info-label .InlineAttributeName.SpiritDamage,.mod-info-label .InlineAttributeName.BonusSpiritDamage,.mod-info-label .InlineAttributeName.SpiritDPS,.mod-info-label .InlineAttributeName.SpiritResist,.mod-info-label .Spirit,.mod-info-label .SpiritDamage,.mod-info-label .BonusSpiritDamage,.mod-info-label .SpiritDPS,.mod-info-label .SpiritResist,.mod-info-label [style*="spiritBrightColor"]{color:var(--tooltip-spirit-bright) !important}.mod-info-label .inline-attribute-label.Courage,.mod-info-label .inline-attribute-label.MeleeDamage,.mod-info-label .inline-attribute-label.WeaponDamage,.mod-info-label .inline-attribute-label.BonusWeaponDamage,.mod-info-label .inline-attribute-label.BulletDamage,.mod-info-label .inline-attribute-label.BulletResist,.mod-info-label .InlineAttributeName.Courage,.mod-info-label .InlineAttributeName.MeleeDamage,.mod-info-label .InlineAttributeName.WeaponDamage,.mod-info-label .InlineAttributeName.BonusWeaponDamage,.mod-info-label .InlineAttributeName.BulletDamage,.mod-info-label .InlineAttributeName.BulletResist,.mod-info-label .Courage,.mod-info-label .MeleeDamage,.mod-info-label .WeaponDamage,.mod-info-label .BonusWeaponDamage,.mod-info-label .BulletDamage,.mod-info-label .BulletResist,.mod-info-label [style*="courageBrightColor"]{color:var(--tooltip-courage-bright) !important}.mod-info-label .inline-attribute-label.Fortitude,.mod-info-label .inline-attribute-label.Heals,.mod-info-label .inline-attribute-label.Healing,.mod-info-label .inline-attribute-label.Heal,.mod-info-label .inline-attribute-label.Regen,.mod-info-label .inline-attribute-label.MaxHealth,.mod-info-label .InlineAttributeName.Fortitude,.mod-info-label .InlineAttributeName.Heals,.mod-info-label .InlineAttributeName.Healing,.mod-info-label .InlineAttributeName.Heal,.mod-info-label .InlineAttributeName.Regen,.mod-info-label .InlineAttributeName.MaxHealth,.mod-info-label .Fortitude,.mod-info-label .Heals,.mod-info-label .Healing,.mod-info-label .Heal,.mod-info-label .Regen,.mod-info-label .MaxHealth,.mod-info-label [style*="fortitudeBrightColor"]{color:var(--tooltip-fortitude-bright) !important}.mod-info-label .inline-attribute-label.Slow,.mod-info-label .inline-attribute-label.Slowing,.mod-info-label .inline-attribute-label.SlowResistance,.mod-info-label .inline-attribute-label.Debuff,.mod-info-label .inline-attribute-label.ReducedFireRate,.mod-info-label .inline-attribute-label.BonusMoveSpeed,.mod-info-label .inline-attribute-label.MoveSpeed,.mod-info-label .inline-attribute-label.FireRate,.mod-info-label .inline-attribute-label.BonusFireRate,.mod-info-label .inline-attribute-label.BonusSprintSpeed,.mod-info-label .InlineAttributeName.Slow,.mod-info-label .InlineAttributeName.Slowing,.mod-info-label .InlineAttributeName.SlowResistance,.mod-info-label .InlineAttributeName.Debuff,.mod-info-label .InlineAttributeName.ReducedFireRate,.mod-info-label .InlineAttributeName.BonusMoveSpeed,.mod-info-label .InlineAttributeName.MoveSpeed,.mod-info-label .InlineAttributeName.FireRate,.mod-info-label .InlineAttributeName.BonusFireRate,.mod-info-label .InlineAttributeName.BonusSprintSpeed{color:var(--tooltip-off-white) !important}.mod-info-label .inline-attribute-label.CombatBarrier,.mod-info-label .inline-attribute-label.DamageAmp,.mod-info-label .inline-attribute-label.Immobilize,.mod-info-label .inline-attribute-label.KnockBack,.mod-info-label .inline-attribute-label.KnockUp,.mod-info-label .inline-attribute-label.Pull,.mod-info-label .inline-attribute-label.Pulls,.mod-info-label .inline-attribute-label.Pulling,.mod-info-label .inline-attribute-label.Drag,.mod-info-label .inline-attribute-label.Stun,.mod-info-label .InlineAttributeName.CombatBarrier,.mod-info-label .InlineAttributeName.DamageAmp,.mod-info-label .InlineAttributeName.Immobilize,.mod-info-label .InlineAttributeName.KnockBack,.mod-info-label .InlineAttributeName.KnockUp,.mod-info-label .InlineAttributeName.Pull,.mod-info-label .InlineAttributeName.Pulls,.mod-info-label .InlineAttributeName.Pulling,.mod-info-label .InlineAttributeName.Drag,.mod-info-label .InlineAttributeName.Stun{color:var(--tooltip-off-white) !important}.mod-info-label .inline-attribute-label.Heals,.mod-info-label .inline-attribute-label.Healing,.mod-info-label .inline-attribute-label.Heal,.mod-info-label .inline-attribute-label.Regen,.mod-info-label .inline-attribute-label.MaxHealth,.mod-info-label .InlineAttributeName.Heals,.mod-info-label .InlineAttributeName.Healing,.mod-info-label .InlineAttributeName.Heal,.mod-info-label .InlineAttributeName.Regen,.mod-info-label .InlineAttributeName.MaxHealth{color:var(--tooltip-heal-text) !important}.mod-info-label .inline-attribute-label.StaminaRegenPerSecond,.mod-info-label .InlineAttributeName.StaminaRegenPerSecond{color:var(--tooltip-stamina-text) !important}.mod-info-label .inline-attribute-label.PureDamage,.mod-info-label .InlineAttributeName.PureDamage{color:#ffffff !important}.mod-info-label .inline-attribute-label.Silence,.mod-info-label .InlineAttributeName.Silence{color:var(--tooltip-spirit-bright) !important}.mod-info-label .InlineAttributeIcon,.mod-info-label .inline-attribute-icon{display:inline-block;width:20px;height:20px;vertical-align:sub;background-position:center;background-repeat:no-repeat;background-size:contain;mask-position:center;mask-repeat:no-repeat;mask-size:contain;-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:contain}.mod-info-label .InlineAttributeIcon.Spirit,.mod-info-label .InlineAttributeIcon.SpiritIcon,.mod-info-label .inline-attribute-icon.Spirit,.mod-info-label .inline-attribute-icon.SpiritIcon{background-color:var(--tooltip-spirit-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/spirit.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/spirit.svg")}.mod-info-label .InlineAttributeIcon.Courage,.mod-info-label .inline-attribute-icon.Courage{background-color:var(--tooltip-courage-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/core/icon_damage_melee_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/core/icon_damage_melee_psd.png")}.mod-info-label .InlineAttributeIcon.Fortitude,.mod-info-label .inline-attribute-icon.Fortitude{background-color:var(--tooltip-fortitude-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/health.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/health.svg")}.mod-info-label .InlineAttributeIcon.SpiritDamage,.mod-info-label .InlineAttributeIcon.BonusSpiritDamage,.mod-info-label .InlineAttributeIcon.SpiritDPS,.mod-info-label .inline-attribute-icon.SpiritDamage,.mod-info-label .inline-attribute-icon.BonusSpiritDamage,.mod-info-label .inline-attribute-icon.SpiritDPS{background-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/damage_magic_color.svg")}.mod-info-label .InlineAttributeIcon.BulletResist,.mod-info-label .inline-attribute-icon.BulletResist{background-color:var(--tooltip-courage-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_bullet_armor_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_bullet_armor_psd.png")}.mod-info-label .InlineAttributeIcon.SpiritResist,.mod-info-label .inline-attribute-icon.SpiritResist{background-color:var(--tooltip-spirit-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_tech_armor_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_tech_armor_psd.png")}.mod-info-label .InlineAttributeIcon.MeleeDamage,.mod-info-label .inline-attribute-icon.MeleeDamage{background-color:var(--tooltip-courage-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/core/icon_damage_melee_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/hud/core/icon_damage_melee_psd.png")}.mod-info-label .InlineAttributeIcon.Slow,.mod-info-label .InlineAttributeIcon.Slowing,.mod-info-label .InlineAttributeIcon.SlowResistance,.mod-info-label .inline-attribute-icon.Slow,.mod-info-label .inline-attribute-icon.Slowing,.mod-info-label .inline-attribute-icon.SlowResistance{background-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_slow_large_psd.png")}.mod-info-label .InlineAttributeIcon.WeaponDamage,.mod-info-label .InlineAttributeIcon.BonusWeaponDamage,.mod-info-label .InlineAttributeIcon.BulletDamage,.mod-info-label .inline-attribute-icon.WeaponDamage,.mod-info-label .inline-attribute-icon.BonusWeaponDamage,.mod-info-label .inline-attribute-icon.BulletDamage{background-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/damage_bullet_color.svg")}.mod-info-label .InlineAttributeIcon.ReducedFireRate,.mod-info-label .InlineAttributeIcon.BonusFireRate,.mod-info-label .InlineAttributeIcon.FireRate,.mod-info-label .inline-attribute-icon.ReducedFireRate,.mod-info-label .inline-attribute-icon.BonusFireRate,.mod-info-label .inline-attribute-icon.FireRate{background-color:var(--tooltip-courage-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/fire_rate.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/fire_rate.svg")}.mod-info-label .InlineAttributeIcon.BonusMoveSpeed,.mod-info-label .InlineAttributeIcon.MoveSpeed,.mod-info-label .InlineAttributeIcon.BonusSprintSpeed,.mod-info-label .inline-attribute-icon.BonusMoveSpeed,.mod-info-label .inline-attribute-icon.MoveSpeed,.mod-info-label .inline-attribute-icon.BonusSprintSpeed{background-color:var(--tooltip-armor);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/move_speed.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/move_speed.svg")}.mod-info-label .InlineAttributeIcon.Heals,.mod-info-label .InlineAttributeIcon.Healing,.mod-info-label .InlineAttributeIcon.Heal,.mod-info-label .InlineAttributeIcon.Regen,.mod-info-label .InlineAttributeIcon.MaxHealth,.mod-info-label .inline-attribute-icon.Heals,.mod-info-label .inline-attribute-icon.Healing,.mod-info-label .inline-attribute-icon.Heal,.mod-info-label .inline-attribute-icon.Regen,.mod-info-label .inline-attribute-icon.MaxHealth{background-color:var(--tooltip-armor);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/heal.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/heal.svg")}.mod-info-label .InlineAttributeIcon.CombatBarrier,.mod-info-label .inline-attribute-icon.CombatBarrier{background-color:var(--tooltip-off-white);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_bullet_armor_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/upgrades/property_bullet_armor_psd.png")}.mod-info-label .InlineAttributeIcon.DamageAmp,.mod-info-label .InlineAttributeIcon.PureDamage,.mod-info-label .inline-attribute-icon.DamageAmp,.mod-info-label .inline-attribute-icon.PureDamage{background-color:var(--tooltip-off-white);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/damage_psd.png");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/damage_psd.png")}.mod-info-label .InlineAttributeIcon.Debuff,.mod-info-label .inline-attribute-icon.Debuff{background-color:var(--tooltip-debuff);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_toxic.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_toxic.svg")}.mod-info-label .InlineAttributeIcon.Stun,.mod-info-label .inline-attribute-icon.Stun{background-color:var(--tooltip-off-white);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_stun.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_stun.svg")}.mod-info-label .InlineAttributeIcon.Immobilize,.mod-info-label .inline-attribute-icon.Immobilize{background-color:var(--tooltip-off-white);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_immobilize.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_immobilize.svg")}.mod-info-label .InlineAttributeIcon.KnockBack,.mod-info-label .InlineAttributeIcon.KnockUp,.mod-info-label .InlineAttributeIcon.Pull,.mod-info-label .InlineAttributeIcon.Pulls,.mod-info-label .InlineAttributeIcon.Pulling,.mod-info-label .InlineAttributeIcon.Drag,.mod-info-label .inline-attribute-icon.KnockBack,.mod-info-label .inline-attribute-icon.KnockUp,.mod-info-label .inline-attribute-icon.Pull,.mod-info-label .inline-attribute-icon.Pulls,.mod-info-label .inline-attribute-icon.Pulling,.mod-info-label .inline-attribute-icon.Drag{background-color:var(--tooltip-off-white);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_knockdown.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_knockdown.svg")}.mod-info-label .InlineAttributeIcon.Silence,.mod-info-label .inline-attribute-icon.Silence{background-color:var(--tooltip-spirit-bright);mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_silence.svg");-webkit-mask-image:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_silence.svg")}.mod-info-label svg[fill="spiritBrightColor"],.mod-info-label svg [fill="spiritBrightColor"]{fill:var(--tooltip-spirit-bright) !important}.mod-info-label svg[stroke="spiritBrightColor"],.mod-info-label svg [stroke="spiritBrightColor"]{stroke:var(--tooltip-spirit-bright) !important}.mod-info-label svg[fill="courageBrightColor"],.mod-info-label svg [fill="courageBrightColor"]{fill:var(--tooltip-courage-bright) !important}.mod-info-label svg[stroke="courageBrightColor"],.mod-info-label svg [stroke="courageBrightColor"]{stroke:var(--tooltip-courage-bright) !important}.mod-info-label svg[fill="fortitudeBrightColor"],.mod-info-label svg [fill="fortitudeBrightColor"]{fill:var(--tooltip-fortitude-bright) !important}.mod-info-label svg[stroke="fortitudeBrightColor"],.mod-info-label svg [stroke="fortitudeBrightColor"]{stroke:var(--tooltip-fortitude-bright) !important}.mod-info-label svg[fill="armorColor"],.mod-info-label svg [fill="armorColor"]{fill:var(--tooltip-armor) !important}.mod-info-label svg[stroke="armorColor"],.mod-info-label svg [stroke="armorColor"]{stroke:var(--tooltip-armor) !important}.mod-info-label svg[fill="offWhite"],.mod-info-label svg [fill="offWhite"]{fill:var(--tooltip-off-white) !important}.mod-info-label svg[stroke="offWhite"],.mod-info-label svg [stroke="offWhite"]{stroke:var(--tooltip-off-white) !important}.mod-info-label svg[fill="white"],.mod-info-label svg [fill="white"]{fill:#ffffff !important}.mod-info-label svg[stroke="white"],.mod-info-label svg [stroke="white"]{stroke:#ffffff !important}.inline-attribute{display:inline-block;width:20px;height:20px;margin-right:5px;vertical-align:middle}.mod-info-label img.inline-attribute{object-fit:contain;filter:var(--tooltip-filter-off-white)}.mod-info-label img.inline-attribute.Spirit,.mod-info-label img.inline-attribute.SpiritIcon,.mod-info-label img.inline-attribute.SpiritDamage,.mod-info-label img.inline-attribute.BonusSpiritDamage,.mod-info-label img.inline-attribute.SpiritDPS,.mod-info-label img.inline-attribute.SpiritResist,.mod-info-label img.inline-attribute.Silence{filter:var(--tooltip-filter-spirit)}.mod-info-label img.inline-attribute.Courage,.mod-info-label img.inline-attribute.MeleeDamage,.mod-info-label img.inline-attribute.WeaponDamage,.mod-info-label img.inline-attribute.BonusWeaponDamage,.mod-info-label img.inline-attribute.BulletDamage,.mod-info-label img.inline-attribute.BulletResist,.mod-info-label img.inline-attribute.ReducedFireRate,.mod-info-label img.inline-attribute.BonusFireRate,.mod-info-label img.inline-attribute.FireRate{filter:var(--tooltip-filter-courage)}.mod-info-label img.inline-attribute.Fortitude,.mod-info-label img.inline-attribute.Heals,.mod-info-label img.inline-attribute.Healing,.mod-info-label img.inline-attribute.Heal,.mod-info-label img.inline-attribute.Regen,.mod-info-label img.inline-attribute.MaxHealth,.mod-info-label img.inline-attribute.BonusMoveSpeed,.mod-info-label img.inline-attribute.MoveSpeed,.mod-info-label img.inline-attribute.BonusSprintSpeed,.mod-info-label img.inline-attribute.StaminaRegenPerSecond,.mod-info-label img.inline-attribute.Debuff{filter:var(--tooltip-filter-fortitude)}.mod-info-label img.inline-attribute.Slow,.mod-info-label img.inline-attribute.Slowing,.mod-info-label img.inline-attribute.SlowResistance,.mod-info-label img.inline-attribute.CombatBarrier,.mod-info-label img.inline-attribute.DamageAmp,.mod-info-label img.inline-attribute.Immobilize,.mod-info-label img.inline-attribute.KnockBack,.mod-info-label img.inline-attribute.KnockUp,.mod-info-label img.inline-attribute.Pull,.mod-info-label img.inline-attribute.Pulls,.mod-info-label img.inline-attribute.Pulling,.mod-info-label img.inline-attribute.Drag,.mod-info-label img.inline-attribute.Stun,.mod-info-label img.inline-attribute.PureDamage{filter:var(--tooltip-filter-off-white)}.mod-info-label img.inline-attribute.DamageAmp{content:url("https://assets-bucket.deadlock-api.com/assets-api-res/images/damage_psd.png")}.mod-info-label img.inline-attribute.Immobilize{content:url("https://assets-bucket.deadlock-api.com/assets-api-res/icons/condition_immobilize.svg")}.prop_duration .important-stat-icon,.prop_slow .important-stat-icon,.prop_stun .important-stat-icon,.prop_silence .important-stat-icon,.prop_tech_power .important-stat-icon,.prop_spirit .important-stat-icon{filter:var(--tooltip-filter-spirit)}.prop_cooldown .important-stat-icon,.prop_charge_cooldown .important-stat-icon{filter:none}.prop_fire_rate .important-stat-icon,.prop_clipsize .important-stat-icon,.prop_reload_speed .important-stat-icon,.prop_melee_damage .important-stat-icon{filter:var(--tooltip-filter-courage)}.prop_bullet_armor_up .important-stat-icon,.prop_bullet_armor_down .important-stat-icon,.prop_bullet_damage .important-stat-icon{filter:none}.prop_health .important-stat-icon,.prop_healing .important-stat-icon,.prop_move_speed .important-stat-icon,.prop_combat_barrier .important-stat-icon{filter:var(--tooltip-filter-fortitude)}.prop_damage .important-stat-icon{filter:brightness(0) saturate(100%) invert(41%) sepia(90%) saturate(1254%) hue-rotate(347deg) brightness(103%) contrast(107%)}.prop_souls .important-stat-icon{filter:brightness(0) saturate(100%) invert(94%) sepia(44%) saturate(481%) hue-rotate(88deg) brightness(104%) contrast(101%)}.prop_distance .important-stat-icon,.prop_cast .important-stat-icon{filter:brightness(0) saturate(100%) invert(97%) sepia(12%) saturate(600%) hue-rotate(0deg) brightness(107%)}.prop_range .important-stat-icon,.prop_tech_damage .important-stat-icon,.prop_tech_armor_up .important-stat-icon,.prop_tech_armor_down .important-stat-icon{filter:none}.component-items-shell{display:flex;flex-direction:column;width:100%;margin-top:-1px;background-color:#0f0f1a;background-size:cover;background-position:center;background-repeat:no-repeat}.component-items-section{display:flex;flex-direction:column;width:100%;background-color:rgba(0, 0, 0, 0.3)}.component-items-label{width:100%;padding:4px 10px 2px;color:rgba(255, 255, 255, 0.52);font-size:14px;font-weight:700;line-height:1.2;text-align:left;text-transform:uppercase}.component-items-grid{display:flex;flex-flow:row wrap;gap:5px 8px;width:100%;padding:0 5px 5px 10px}.component-item{display:flex;align-items:center;gap:6px;min-width:0}.component-item-icon{flex-shrink:0;width:30px;height:30px;object-fit:contain;opacity:0.9}.component-item-name{overflow:hidden;color:rgba(255, 239, 215, 0.75);font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}`;

const DlItemTooltip = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._loading = false;
    }
    // ─── Resolved item (prop takes precedence over fetched) ──────────────────
    get item() {
        var _a;
        return (_a = this.itemData) !== null && _a !== void 0 ? _a : this._item;
    }
    get itemKey() {
        var _a;
        return (_a = this.itemId) !== null && _a !== void 0 ? _a : this.itemClassName;
    }
    get displayName() {
        var _a, _b, _c, _d;
        // nameOverride prop (from dl-item-card) takes highest priority,
        // then internally resolved name override, then item name
        return (_d = (_b = (_a = this.nameOverride) !== null && _a !== void 0 ? _a : this._nameOverride) !== null && _b !== void 0 ? _b : (_c = this.item) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '';
    }
    // ─── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        injectFonts();
        if (this.itemKey && !this.itemData) {
            this.fetchItemData();
        }
        else if (this.itemData) {
            this.resolveComponentItems();
            this.resolveParentItems();
            this.resolveNameOverride();
        }
        this._unsubLanguage = onChange('language', () => {
            if (this.itemKey && !this.itemData) {
                this.fetchItemData();
            }
        });
    }
    disconnectedCallback() {
        var _a;
        (_a = this._unsubLanguage) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    itemKeyChanged() {
        if (this.itemKey && !this.itemData) {
            this.fetchItemData();
        }
    }
    onItemNameLanguageChange() {
        this.resolveNameOverride();
    }
    // ─── Data fetching ────────────────────────────────────────────────────────
    async fetchItemData() {
        const key = this.itemKey;
        if (!key)
            return;
        this._loading = true;
        this._error = undefined;
        try {
            this._item = await fetchItem(key, state.language);
            this.resolveComponentItems();
            this.resolveParentItems();
            this.resolveNameOverride();
        }
        catch (e) {
            this._error = e instanceof Error ? e.message : 'Failed to load item';
        }
        finally {
            this._loading = false;
        }
    }
    async resolveComponentItems() {
        var _a;
        const item = this.item;
        if (!((_a = item === null || item === void 0 ? void 0 : item.component_items) === null || _a === void 0 ? void 0 : _a.length) || this.componentItemsData)
            return;
        try {
            const allItems = await fetchItems(state.language);
            const byClassName = new Map(allItems.map(i => [i.class_name, i]));
            const resolved = [];
            for (const cn of item.component_items) {
                const comp = byClassName.get(cn);
                if (!comp)
                    continue;
                resolved.push({
                    name: comp.name,
                    image: comp.shop_image_webp || comp.shop_image || comp.image_webp || comp.image || undefined,
                });
            }
            this._componentItems = resolved;
        }
        catch (_b) {
            // silently fail
        }
    }
    async resolveParentItems() {
        var _a;
        const item = this.item;
        if (!item || this.parentItemsData)
            return;
        try {
            const allItems = await fetchItems(state.language);
            const parents = [];
            for (const other of allItems) {
                if ((_a = other.component_items) === null || _a === void 0 ? void 0 : _a.includes(item.class_name)) {
                    parents.push({
                        name: other.name,
                        image: other.shop_image_webp || other.shop_image || other.image_webp || other.image || undefined,
                    });
                }
            }
            this._parentItems = parents.length > 0 ? parents : undefined;
        }
        catch (_b) {
            // silently fail
        }
    }
    async resolveNameOverride() {
        const item = this.item;
        if (!item || !this.itemNameLanguage || this.itemNameLanguage === state.language) {
            this._nameOverride = undefined;
            return;
        }
        try {
            const items = await fetchItems(this.itemNameLanguage);
            const match = items.find(i => i.class_name === item.class_name);
            this._nameOverride = match === null || match === void 0 ? void 0 : match.name;
        }
        catch (_a) {
            // silently fail — fall back to default name
            this._nameOverride = undefined;
        }
    }
    getFormattedParts(prop) {
        var _a, _b, _c;
        const value = prop.value === null || prop.value === undefined ? '' : String(prop.value);
        const numericValue = Number.parseFloat(value);
        const sign = Number.isFinite(numericValue) && numericValue >= 0 ? '+' : '';
        const prefix = (_b = (_a = prop.prefix) === null || _a === void 0 ? void 0 : _a.replace('{s:sign}', sign)) !== null && _b !== void 0 ? _b : '';
        const postfix = (_c = prop.postfix) !== null && _c !== void 0 ? _c : '';
        const trimmedPostfix = postfix.trim();
        const suffix = trimmedPostfix && value.endsWith(trimmedPostfix) ? '' : postfix;
        return { prefix, value, suffix };
    }
    static escapeHtml(value) {
        return value.replace(/[&<>"']/g, char => {
            var _a;
            return (_a = ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#39;',
            })[char]) !== null && _a !== void 0 ? _a : char;
        });
    }
    formatDescriptionHtml(html) {
        return html.replace(/\{g:citadel_(?:binding|keybind):(?:'([^']+)'|"([^"]+)"|([^}]+))\}/g, (_match, singleQuoted, doubleQuoted, bare) => {
            var _a, _b, _c;
            const binding = ((_b = (_a = singleQuoted !== null && singleQuoted !== void 0 ? singleQuoted : doubleQuoted) !== null && _a !== void 0 ? _a : bare) !== null && _b !== void 0 ? _b : '').trim().replace(/^Default\./, '');
            const key = (_c = DlItemTooltip.DEFAULT_BINDING_KEYS[binding]) !== null && _c !== void 0 ? _c : binding;
            return `<span class="InlineKey">${DlItemTooltip.escapeHtml(key)}</span>`;
        });
    }
    renderFormattedValue(prop, shrinkPostfix = false) {
        const { prefix, value, suffix } = this.getFormattedParts(prop);
        return (h("span", { class: { 'full-property-value': true, 'is-negative': prop.negative_attribute === true } }, prefix && h("span", { class: "prefix-value" }, prefix), h("span", { class: "property-value" }, value), suffix && h("span", { class: { 'postfix-value': true, 'shrink': shrinkPostfix } }, suffix)));
    }
    isTimingKey(key, prop) {
        return key === 'AbilityCooldown'
            || key === 'ProcCooldown'
            || key === 'AbilityChargeUpTime'
            || key === 'AbilityCooldownBetweenCharge';
    }
    renderImportantProp(key) {
        var _a, _b, _c;
        const item = this.item;
        if (!(item === null || item === void 0 ? void 0 : item.properties))
            return null;
        const prop = item.properties[key];
        if (!prop || !isPropertyVisible(prop)) {
            const statusEffect = DlItemTooltip.STATUS_EFFECT_LABELS[key];
            if (!statusEffect)
                return null;
            return (h("div", { class: "important-stat-box status-effect" }, h("div", { class: "important-stat-content" }, h("div", { class: "important-stat-value" }, statusEffect.label), statusEffect.sublabel && h("div", { class: "important-stat-label" }, statusEffect.sublabel))));
        }
        return (h("div", { class: { 'important-stat-box': true, [`prop_${(_a = prop.css_class) !== null && _a !== void 0 ? _a : ''}`]: !!prop.css_class } }, h("div", { class: "important-stat-content" }, h("div", { class: { 'important-stat-icon-value': true, 'hide-important-stat-icon': !prop.icon } }, prop.icon && h("img", { class: "important-stat-icon", src: prop.icon, alt: "" }), h("div", { class: "important-stat-value" }, this.renderFormattedValue(prop, true))), h("div", { class: "important-stat-labels" }, h("div", { class: "important-stat-type" }, (_b = prop.label) !== null && _b !== void 0 ? _b : key), (prop.conditional || ((_c = prop.usage_flags) === null || _c === void 0 ? void 0 : _c.includes('ConditionallyApplied'))) && (h("div", { class: "important-stat-label" }, "Conditional"))))));
    }
    renderBlockProperty(key, elevated) {
        var _a;
        const item = this.item;
        if (!(item === null || item === void 0 ? void 0 : item.properties))
            return null;
        const prop = item.properties[key];
        if (!prop || !isPropertyVisible(prop))
            return null;
        return (h("div", { class: "block-prop-item shrink-container" }, h("span", { class: "attribute-value" }, this.renderFormattedValue(prop)), h("span", { class: { 'attribute-name': true, 'elevated': elevated } }, (_a = prop.label) !== null && _a !== void 0 ? _a : key)));
    }
    renderSectionContent(section, excludedKeys = new Set()) {
        var _a;
        const itemProperties = (_a = this.item) === null || _a === void 0 ? void 0 : _a.properties;
        return section.section_attributes.map(attr => {
            var _a, _b, _c, _d, _e;
            const importantKeys = new Set((_a = attr.important_properties) !== null && _a !== void 0 ? _a : []);
            const isExcluded = (key) => excludedKeys.has(key) || this.isTimingKey(key, itemProperties === null || itemProperties === void 0 ? void 0 : itemProperties[key]);
            const importantList = ((_b = attr.important_properties) !== null && _b !== void 0 ? _b : []).filter(key => !isExcluded(key));
            const regularProps = [
                ...((_c = attr.elevated_properties) !== null && _c !== void 0 ? _c : []),
                ...((_d = attr.properties) !== null && _d !== void 0 ? _d : []),
            ].filter(key => !importantKeys.has(key) && !isExcluded(key));
            const elevatedSet = new Set((_e = attr.elevated_properties) !== null && _e !== void 0 ? _e : []);
            const importantNodes = [];
            const regularNodes = [];
            importantList.forEach(key => {
                const node = this.renderImportantProp(key);
                if (node)
                    importantNodes.push(node);
            });
            regularProps.forEach(key => {
                const node = this.renderBlockProperty(key, elevatedSet.has(key));
                if (node)
                    regularNodes.push(node);
            });
            const hasImportant = importantNodes.length > 0;
            const hasRegular = regularNodes.length > 0;
            const hasDescription = !!attr.loc_string;
            const descriptionHtml = attr.loc_string ? this.formatDescriptionHtml(attr.loc_string) : '';
            return (h("div", { class: {
                    'applied-attributes-container': true,
                    'has-description': hasDescription,
                    'has-important': hasImportant,
                    'has-multiple-important': importantNodes.length >= 2,
                    [`important-count-${importantNodes.length}`]: hasImportant,
                    'no-applied-stats': !hasRegular,
                } }, descriptionHtml && h("div", { class: "mod-info-label", innerHTML: descriptionHtml }), (hasImportant || hasRegular) && (h("div", { class: {
                    'stats-block': true,
                    'stats-block-inline': importantNodes.length === 1 && hasRegular,
                    'stats-block-stacked': importantNodes.length > 3 || (importantNodes.length >= 2 && hasRegular),
                    'stats-block-no-important': !hasImportant,
                } }, hasImportant && (h("div", { class: { 'important-stats-wrapper': true, [`count-${importantNodes.length}`]: true } }, importantNodes)), hasRegular && (h("div", { class: "stats-block-props" }, regularNodes)), !hasRegular && hasImportant && h("div", { class: "stats-block-props empty" })))));
        });
    }
    findSectionTimings(section) {
        var _a, _b, _c;
        const item = this.item;
        if (!(item === null || item === void 0 ? void 0 : item.properties))
            return {};
        const props = item.properties;
        const timings = {};
        const addTiming = (key) => {
            const prop = props[key];
            if (!prop || !isPropertyVisible(prop))
                return;
            if (key === 'AbilityChargeUpTime' || key === 'AbilityCooldownBetweenCharge') {
                timings.chargeUp = { key, prop };
                return;
            }
            if (key === 'ProcCooldown' || key === 'AbilityCooldown') {
                if (!timings.cooldown || key === 'ProcCooldown') {
                    timings.cooldown = { key, prop };
                }
            }
        };
        for (const attr of section.section_attributes) {
            [
                ...((_a = attr.important_properties) !== null && _a !== void 0 ? _a : []),
                ...((_b = attr.elevated_properties) !== null && _b !== void 0 ? _b : []),
                ...((_c = attr.properties) !== null && _c !== void 0 ? _c : []),
            ].forEach(addTiming);
        }
        if (!timings.cooldown && section.section_type === 'active') {
            addTiming('AbilityCooldown');
        }
        return timings;
    }
    renderTimingPill(timing, kind) {
        var _a, _b, _c;
        const fallbackIcon = kind === 'cooldown' ? (_c = (_b = (_a = this.item) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b['AbilityCooldown']) === null || _c === void 0 ? void 0 : _c.icon : undefined;
        const icon = timing.prop.icon || fallbackIcon;
        return (h("span", { class: { 'ability-timing': true, [kind]: true } }, icon && h("img", { class: "ability-timing-icon", src: icon, alt: "" }), h("span", { class: "ability-timing-value" }, this.renderFormattedValue(timing.prop, true))));
    }
    renderInnateSection(section) {
        return (h("div", { class: "section innate-section" }, this.renderSectionContent(section)));
    }
    renderAbilitySection(section) {
        var _a;
        const sectionType = (_a = section.section_type) !== null && _a !== void 0 ? _a : 'passive';
        const timings = this.findSectionTimings(section);
        const excludedKeys = new Set();
        if (timings.cooldown)
            excludedKeys.add(timings.cooldown.key);
        if (timings.chargeUp)
            excludedKeys.add(timings.chargeUp.key);
        return (h("div", { class: { 'section': true, 'ability-section': true, [`ability-type-${sectionType}`]: true } }, h("div", { class: { 'ability-type-label': true, [sectionType]: true } }, h("span", { class: "ability-type-text" }, sectionType), (timings.cooldown || timings.chargeUp) && (h("span", { class: "ability-timing-group" }, timings.cooldown && this.renderTimingPill(timings.cooldown, 'cooldown'), timings.chargeUp && this.renderTimingPill(timings.chargeUp, 'charge-up')))), this.renderSectionContent(section, excludedKeys)));
    }
    renderComponentGroup(label, items) {
        if (!items || items.length === 0)
            return null;
        return (h("div", { class: "component-items-section" }, h("div", { class: "component-items-label" }, label), h("div", { class: "component-items-grid" }, items.map(item => (h("div", { class: "component-item" }, item.image && h("img", { class: "component-item-icon", src: item.image, alt: "" }), h("span", { class: "component-item-name" }, item.name)))))));
    }
    // ─── Render ───────────────────────────────────────────────────────────────
    render() {
        var _a, _b, _c;
        // Loading state (only shown in standalone mode)
        if (this._loading) {
            return (h("div", { class: "tooltip loading", style: { '--slot-color': 'transparent' } }, h("div", { class: "tooltip-shadow" }, h("div", { class: "tooltip-main" }, h("div", { class: "header-container", style: { background: '#1a1a2e' } }), h("div", { class: "properties-container" })))));
        }
        // Error state (only shown in standalone mode)
        if (this._error) {
            return (h("div", { class: "tooltip error", style: { '--slot-color': 'transparent' } }, h("div", { class: "tooltip-shadow" }, h("div", { class: "tooltip-main" }, h("div", { class: "header-container", style: { background: '#1a1a2e' } }, h("div", { class: "mod-name-container shrink-container" }, h("div", { class: "mod-name shrink" }, this._error)))))));
        }
        const item = this.item;
        if (!item)
            return null;
        const slot = item.item_slot_type;
        const slotColor = getSlotColor(slot);
        const headerBg = tooltipHeaderBg(slot);
        const bodyBg = tooltipBodyBg(slot);
        const sections = (_a = item.tooltip_sections) !== null && _a !== void 0 ? _a : [];
        const resolvedComponentItems = (_b = this.componentItemsData) !== null && _b !== void 0 ? _b : this._componentItems;
        const resolvedParentItems = (_c = this.parentItemsData) !== null && _c !== void 0 ? _c : this._parentItems;
        const hasComponents = !!(resolvedComponentItems === null || resolvedComponentItems === void 0 ? void 0 : resolvedComponentItems.length);
        const hasParents = !!(resolvedParentItems === null || resolvedParentItems === void 0 ? void 0 : resolvedParentItems.length);
        return (h("div", { class: {
                'tooltip': true,
                [`${slot}-mod`]: true,
                'has-components': hasComponents || hasParents,
            }, style: { '--slot-color': slotColor } }, h("div", { class: "tooltip-shadow" }, h("div", { class: "tooltip-main" }, h("div", { class: "header-container", style: { backgroundImage: `url("${headerBg}")` } }, h("div", { class: "mod-name-container shrink-container" }, h("div", { class: "mod-name shrink" }, this.displayName), item.cost != null && item.cost > 0 && (h("div", { class: "mod-cost" }, h("img", { class: "soul-icon", src: soulIcon(), alt: "Souls" }), String(item.cost))))), h("div", { class: "properties-container", style: { backgroundImage: `url("${bodyBg}")` } }, sections.map(section => (section.section_type === 'innate'
            ? this.renderInnateSection(section)
            : this.renderAbilitySection(section))))), (hasComponents || hasParents) && (h("div", { class: "component-items-shell", style: { backgroundImage: `url("${bodyBg}")` } }, this.renderComponentGroup('Component:', resolvedComponentItems), this.renderComponentGroup('Component of:', resolvedParentItems))))));
    }
    static get watchers() { return {
        "itemId": [{
                "itemKeyChanged": 0
            }],
        "itemClassName": [{
                "itemKeyChanged": 0
            }],
        "itemNameLanguage": [{
                "onItemNameLanguageChange": 0
            }]
    }; }
};
// ─── Rendering helpers (unchanged) ───────────────────────────────────────
DlItemTooltip.STATUS_EFFECT_LABELS = {
    StatusEffectStun: { label: 'Stuns', sublabel: 'targets hit' },
    StatusEffectDisarmed: { label: 'Disarms', sublabel: 'targets hit' },
    StatusEffectEMP: { label: 'Silences', sublabel: 'targets hit' },
    StatusEffectInvisible: { label: 'Invisible', sublabel: 'targets hit' },
    StatusEffectInfiniteClip: { label: 'Infinite Clip', sublabel: '' },
};
DlItemTooltip.DEFAULT_BINDING_KEYS = {
    AbilityMelee: 'Q',
    Ability1: '1',
    Ability2: '2',
    Ability3: '3',
    Ability4: '4',
    Item1: 'Z',
    Item2: 'X',
    Item3: 'C',
    Item4: 'V',
    Mantle: 'SPACE',
    Roll: 'SHIFT',
    Crouch: 'CTRL',
    MoveDown: 'CTRL',
    OpenHeroSheet: 'B',
    PurchaseQuickbuy: 'G',
    Scoreboard: 'TAB',
    Reload: 'R',
    ReplayDeath: 'R',
    ExtraInfo: 'ALT',
    AltCast: 'MOUSE3',
    MoveForward: 'W',
    MoveBackwards: 'S',
    MoveLeft: 'A',
    MoveRight: 'D',
    Attack: 'MOUSE1',
    ADS: 'MOUSE2',
    HeldItem: 'F',
    Zipline: 'SPACE',
    PushToTalk: 'T',
};
DlItemTooltip.style = dlItemTooltipCss();

const dlShopPanelCss = () => `:host{display:block;font-family:var(--dl-font-family);color:var(--dl-text-primary);line-height:1.4}*{box-sizing:border-box;margin:0;padding:0}.shop{display:flex;align-items:flex-start;border-radius:6px;background:var(--dl-bg-primary);overflow:hidden;width:1080px;margin:0 auto}.nav-container{display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;gap:8px;position:sticky;top:0;align-self:flex-start;margin-right:-12px}.category-tab{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;cursor:pointer;padding:0;user-select:none;-webkit-user-drag:none}.category-icon-container{position:relative;width:84px;height:73px;overflow:hidden;border-radius:8px 0 0 8px;transition:height 0.2s ease,         margin-bottom 0.2s ease}.category-icon-container.active{height:175px;margin-bottom:0}.tab-shape{position:absolute;inset:0;mask-size:cover;mask-position:top center;mask-repeat:no-repeat;-webkit-mask-size:cover;-webkit-mask-position:top center;-webkit-mask-repeat:no-repeat}.tab-icon{position:absolute;top:50%;left:calc(50% - 6px);transform:translate(-50%, -50%);width:60px;height:60px;object-fit:contain;pointer-events:none}.tab-edge-overlay{position:absolute;inset:0;background-position:bottom right;background-repeat:no-repeat;background-size:cover;pointer-events:none;opacity:0.6}.tiers{display:flex;flex-wrap:wrap;justify-content:space-between;position:relative;flex:1;min-width:0;background-position:0 0;background-repeat:no-repeat;background-size:contain;aspect-ratio:1825 / 1618}.tier-section{box-sizing:border-box;display:flex;flex-direction:column;margin:1%;position:relative}.tier-section.tier-1{width:45%;padding:16% 2% 3% 4%}.tier-section.tier-2{width:51%;padding:5% 3.5% 2% 1%}.tiers.weapon .tier-section.tier-3{width:54%;padding-top:3%;margin-left:5%}.tiers.weapon .tier-section.tier-4{width:31%;margin-right:5%;padding-top:3%}.tiers.vitality .tier-section.tier-3,.tiers.spirit .tier-section.tier-3{width:45%;margin-right:0.8%;padding:5% 2% 2% 4%}.tiers.vitality .tier-section.tier-4,.tiers.spirit .tier-section.tier-4{width:51%;padding:5% 2.8% 1.4% 1%}.mods-grid{display:grid;gap:4px;grid-auto-rows:min-content;align-items:start;justify-items:stretch;width:100%}.mods-grid.tier-1{grid-template-columns:repeat(5, 1fr)}.mods-grid.tier-2{grid-template-columns:repeat(6, 1fr)}.tiers.weapon .mods-grid.tier-3{grid-template-columns:repeat(7, 1fr)}.tiers.weapon .mods-grid.tier-4{grid-template-columns:repeat(4, 1fr)}.tiers.vitality .mods-grid.tier-3,.tiers.spirit .mods-grid.tier-3{grid-template-columns:repeat(5, 1fr)}.tiers.vitality .mods-grid.tier-4,.tiers.spirit .mods-grid.tier-4{grid-template-columns:repeat(6, 1fr)}.tier-price{position:absolute;display:inline-flex;align-items:baseline;gap:0;font-family:'Retail Demo';font-size:24px;font-weight:700;line-height:1;color:rgb(107, 166, 128);text-shadow:rgba(0, 0, 0, 0.7) 0px 1px 3px;z-index:1;pointer-events:none;white-space:nowrap;transform:rotate(-5deg);user-select:none}.tier-price .soul-icon{align-self:baseline;display:inline-block;width:auto;height:0.78em;flex-shrink:0;margin:0 0.32em 0 0;object-fit:contain;position:static;transform:translateY(0.08em);vertical-align:baseline;filter:none}.tier-price.tier-1{top:29%;left:4%}.tiers.spirit .tier-price.tier-1,.tiers.vitality .tier-price.tier-1{top:31%;left:5%}.tier-price.tier-2{font-size:26px;top:2%;left:-0.8rem}.tier-price.tier-3{font-size:26px;top:-6%;left:-3%}.tiers.spirit .tier-price.tier-3,.tiers.vitality .tier-price.tier-3{left:5%;top:-1%}.tier-price.tier-4{font-size:28px;top:-8%;left:-3%}.tiers.spirit .tier-price.tier-4,.tiers.vitality .tier-price.tier-4{top:-3.7%;left:-3%}.item-wrapper{transition:opacity 0.15s ease}.item-wrapper.dimmed{opacity:0.3}.item-wrapper.highlighted{opacity:1}.item-wrapper.tooltip-source{position:relative;z-index:100}.loading{padding:60px;text-align:center;color:var(--dl-text-muted);font-size:14px}@media (max-width: 1119px){.category-icon-container{width:60px;height:63px}.category-icon-container.active{height:170px}.tab-icon{top:8px;width:42px;height:42px}}@media (max-width: 767px){.shop{flex-direction:column}.nav-container{flex-direction:row;align-items:center;width:100%;justify-content:center}.category-tab{align-items:center;flex-grow:1}.category-icon-container,.category-icon-container.active{width:40px;height:42px;margin-bottom:0}.tab-icon{top:5px;width:28px;height:28px}.tiers{flex-direction:column}.tier-section{width:98% !important}.mods-grid{grid-template-columns:repeat(auto-fill, minmax(55px, 1fr)) !important}}`;

const CATEGORIES = [
    { label: 'Weapon', slot: 'weapon', color: '#e4b20c' },
    { label: 'Vitality', slot: 'vitality', color: '#a5ce3c' },
    { label: 'Spirit', slot: 'spirit', color: '#b866de' },
];
const VALID_TABS = new Set(CATEGORIES.map(c => c.slot));
const TIERS = [1, 2, 3, 4];
const DlShopPanel = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /** The tab to display initially. One of `"weapon"`, `"vitality"`, or `"spirit"`. */
        this.activeTab = 'weapon';
        /** Hover effect applied to each item card. One of `"none"` or `"scale"`. */
        this.hoverEffect = 'scale';
        /** When `true`, disables the highlight effect that dims unrelated items on hover. */
        this.disableHighlight = false;
        this._items = [];
        this._loading = false;
        this._activeTab = 'weapon';
        this._tierPrices = [];
        this._highlightedItems = null;
        this._highlightSource = null;
        /** Maps class_name → set of all related class_names in the upgrade chain */
        this._upgradeChains = new Map();
        /** Maps class_name → resolved component item info for tooltips */
        this._componentItemsMap = new Map();
        /** Maps class_name → items that use this item as a component */
        this._parentItemsMap = new Map();
        /** Maps class_name → display name in the override language */
        this._nameOverrides = new Map();
        this.handleTooltipOpen = (e) => {
            if (this.disableHighlight)
                return;
            const className = e.detail;
            this._highlightSource = className;
            const chain = this._upgradeChains.get(className);
            this._highlightedItems = chain !== null && chain !== void 0 ? chain : new Set([className]);
        };
        this.handleTooltipClose = (e) => {
            if (e.detail !== this._highlightSource)
                return;
            this._highlightedItems = null;
            this._highlightSource = null;
        };
    }
    onActiveTabChange(value) {
        if (VALID_TABS.has(value)) {
            this._activeTab = value;
        }
    }
    onItemNameLanguageChange() {
        this.loadItems();
    }
    connectedCallback() {
        if (VALID_TABS.has(this.activeTab)) {
            this._activeTab = this.activeTab;
        }
        this.loadItems();
        this.loadGenericData();
        this._unsubLanguage = onChange('language', () => {
            this.loadItems();
        });
    }
    disconnectedCallback() {
        var _a;
        (_a = this._unsubLanguage) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    async loadItems() {
        this._loading = true;
        try {
            const language = state.language;
            const items = await fetchItems(language);
            const filtered = items.filter(i => i.type === 'upgrade' && i.shopable && !i.disabled);
            // Resolve name overrides if itemNameLanguage is set
            this._nameOverrides.clear();
            if (this.itemNameLanguage && this.itemNameLanguage !== language) {
                const nameItems = await fetchItems(this.itemNameLanguage);
                const nameMap = new Map(nameItems.map(i => [i.class_name, i.name]));
                for (const item of filtered) {
                    const name = nameMap.get(item.class_name);
                    if (name)
                        this._nameOverrides.set(item.class_name, name);
                }
            }
            // Sort by display name (override or original)
            const getName = (item) => { var _a; return (_a = this._nameOverrides.get(item.class_name)) !== null && _a !== void 0 ? _a : item.name; };
            this._items = filtered.sort((a, b) => getName(a).localeCompare(getName(b)));
            this.buildUpgradeChains();
        }
        catch (_a) {
            this._items = [];
        }
        finally {
            this._loading = false;
        }
    }
    buildUpgradeChains() {
        var _a, _b, _c, _d, _e;
        // Build parent map: component_class_name → [items that use it as component]
        const parentOf = new Map();
        for (const item of this._items) {
            if (item.component_items) {
                for (const comp of item.component_items) {
                    const list = (_a = parentOf.get(comp)) !== null && _a !== void 0 ? _a : [];
                    list.push(item.class_name);
                    parentOf.set(comp, list);
                }
            }
        }
        // For each item, walk the full chain (up and down) and cache the result
        const chains = new Map();
        const collectChain = (className) => {
            if (chains.has(className))
                return chains.get(className);
            const chain = new Set();
            const queue = [className];
            while (queue.length > 0) {
                const current = queue.pop();
                if (chain.has(current))
                    continue;
                chain.add(current);
                // Walk down: find components of current
                const item = this._items.find(i => i.class_name === current);
                if (item === null || item === void 0 ? void 0 : item.component_items) {
                    for (const comp of item.component_items) {
                        if (!chain.has(comp))
                            queue.push(comp);
                    }
                }
                // Walk up: find items that use current as component
                const parents = parentOf.get(current);
                if (parents) {
                    for (const p of parents) {
                        if (!chain.has(p))
                            queue.push(p);
                    }
                }
            }
            return chain;
        };
        for (const item of this._items) {
            if (((_b = item.component_items) === null || _b === void 0 ? void 0 : _b.length) || parentOf.has(item.class_name)) {
                const chain = collectChain(item.class_name);
                // Share the same Set for all items in the chain
                for (const cn of chain) {
                    chains.set(cn, chain);
                }
            }
        }
        this._upgradeChains = chains;
        // Build component items map for tooltips
        const byClassName = new Map(this._items.map(i => [i.class_name, i]));
        const getDisplayName = (i) => { var _a; return (_a = this._nameOverrides.get(i.class_name)) !== null && _a !== void 0 ? _a : i.name; };
        const componentMap = new Map();
        for (const item of this._items) {
            if ((_c = item.component_items) === null || _c === void 0 ? void 0 : _c.length) {
                const resolved = [];
                for (const cn of item.component_items) {
                    const comp = byClassName.get(cn);
                    if (!comp)
                        continue;
                    resolved.push({
                        name: getDisplayName(comp),
                        image: comp.shop_image_webp || comp.shop_image || comp.image_webp || comp.image || undefined,
                    });
                }
                if (resolved.length > 0) {
                    componentMap.set(item.class_name, resolved);
                }
            }
        }
        this._componentItemsMap = componentMap;
        // Build parent items map: for each component, list the items that use it
        const parentItemsMap = new Map();
        for (const item of this._items) {
            if ((_d = item.component_items) === null || _d === void 0 ? void 0 : _d.length) {
                for (const cn of item.component_items) {
                    if (!byClassName.has(cn))
                        continue;
                    const list = (_e = parentItemsMap.get(cn)) !== null && _e !== void 0 ? _e : [];
                    list.push({
                        name: getDisplayName(item),
                        image: item.shop_image_webp || item.shop_image || item.image_webp || item.image || undefined,
                    });
                    parentItemsMap.set(cn, list);
                }
            }
        }
        this._parentItemsMap = parentItemsMap;
    }
    async loadGenericData() {
        try {
            const data = await fetchGenericData();
            this._tierPrices = data.item_price_per_tier;
        }
        catch (_a) {
            this._tierPrices = [];
        }
    }
    getItemsBySlotAndTier(slot, tier) {
        return this._items.filter(i => i.item_slot_type === slot && i.item_tier === tier);
    }
    handleTabClick(slot) {
        this._activeTab = slot;
    }
    render() {
        if (this._loading) {
            return h("div", { class: "shop" }, h("div", { class: "loading" }, "Loading items..."));
        }
        return (h("div", { class: "shop" }, h("div", { class: "nav-container" }, CATEGORIES.map(cat => {
            const isActive = this._activeTab === cat.slot;
            return (h("div", { class: { 'category-tab': true, [`is-${cat.slot}`]: true, 'active': isActive }, onClick: () => this.handleTabClick(cat.slot) }, h("div", { class: { 'category-icon-container': true, 'active': isActive } }, h("div", { class: "tab-shape", style: {
                    backgroundColor: cat.color,
                    maskImage: `url("${shopTabShape()}")`,
                    WebkitMaskImage: `url("${shopTabShape()}")`,
                } }), h("img", { class: "tab-icon", src: shopTabIcon(cat.slot) }), h("div", { class: "tab-edge-overlay", style: { backgroundImage: `url("${shopTabEdgeOverlay()}")` } }))));
        })), h("div", { class: { 'tiers': true, [this._activeTab]: true }, style: { backgroundImage: `url("${shopBackground(this._activeTab)}")` } }, TIERS.map(tier => {
            const items = this.getItemsBySlotAndTier(this._activeTab, tier);
            const price = this._tierPrices[tier];
            return (h("div", { class: { 'tier-section': true, [`tier-${tier}`]: true } }, price != null && (h("div", { class: { 'tier-price': true, [`tier-${tier}`]: true } }, h("img", { class: "soul-icon", src: soulIcon(), alt: "" }), h("span", null, price.toLocaleString()))), items.length > 0 && (h("div", { class: { 'mods-grid': true, [`tier-${tier}`]: true } }, items.map(item => {
                const isHighlighting = this._highlightedItems !== null;
                const isRelated = isHighlighting && this._highlightedItems.has(item.class_name);
                const isSource = isHighlighting && item.class_name === this._highlightSource;
                return (h("div", { class: {
                        'item-wrapper': true,
                        'dimmed': isHighlighting && !isRelated,
                        'highlighted': isRelated,
                        'tooltip-source': isSource,
                    } }, h("dl-item-card", { itemData: item, hoverEffect: this.hoverEffect, itemNameLanguage: this.itemNameLanguage, componentItemsData: this._componentItemsMap.get(item.class_name), parentItemsData: this._parentItemsMap.get(item.class_name), onTooltipOpen: this.handleTooltipOpen, onTooltipClose: this.handleTooltipClose })));
            })))));
        }))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "activeTab": [{
                "onActiveTabChange": 0
            }],
        "itemNameLanguage": [{
                "onItemNameLanguageChange": 0
            }]
    }; }
};
DlShopPanel.style = dlShopPanelCss();

export { DlItemCard as dl_item_card, DlItemTooltip as dl_item_tooltip, DlProvider as dl_provider, DlShopPanel as dl_shop_panel };
