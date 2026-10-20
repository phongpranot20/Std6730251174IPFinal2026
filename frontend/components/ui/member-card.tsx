"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ban, Check, Copy, Crown, Link2, Mail, MoreHorizontal, RotateCcw, Sparkles, Timer, Trash2, UserCog, UserRound } from "lucide-react";

/* ==========================================================================
   Self-contained build for 21st.dev.

   Composed by scripts/compose-publish.mjs from:
     avatar, role-chip, menu, member-card

   Edit src/ and re-run the script — changes made in this file are lost.
   ========================================================================== */


/* ------------------------------------------------------ inlined from lib --
 *  Inlined by scripts/build-shapes.mjs so this file stands alone.
 *  Edit src/lib/ and rebuild — changes made here are overwritten.
 * ------------------------------------------------------------------------ */

/**
 * Squircle corners — continuous curvature rather than a circular arc, the way
 * iOS and Figma draw them. Progressive: browsers without `corner-shape` fall
 * back to the plain rounded corner the radius already specifies.
 */
const SQUIRCLE = "[corner-shape:squircle]";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * The interface type scale, in pixels. Small and tight: these are product
 * surfaces, not reading surfaces, so the steps are half-pixels near the bottom
 * where the difference between a label and a caption actually matters.
 */
const TYPE = {
  /** Dialog titles, primary headings. */
  title: 15,
  /** Row titles, button labels, anything you read first. */
  body: 13.5,
  /** Secondary body — descriptions that sit under a title. */
  sub: 13,
  /** Dense rows, table cells. */
  dense: 12.5,
  /** Metadata: timestamps, file sizes, counts. */
  meta: 11.5,
  /** Chips and pills. */
  chip: 11,
  /** Uppercase eyebrows and the smallest legible label. */
  micro: 10.5,
} as const;

/**
 * Inter for the interface. Load the face once in your app — the components
 * never fetch it — and the system stack keeps them legible until it arrives.
 */
const FONT_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * A hairline inset ring. Used instead of `border` so the edge never changes an
 * element's box size, which keeps rows from shifting by a pixel on hover.
 */
const EDGE = "ring-1 ring-inset ring-black/[0.12] dark:ring-white/[0.16]";

/**
 * The focus ring. Applied on `:focus-visible` only, so a mouse click never
 * paints a ring but a Tab key always does.
 */
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 dark:focus-visible:ring-white/30";

/**
 * Durations in seconds, for the tween cases where a spring is wrong — opacity
 * crossfades and colour transitions, which should not overshoot.
 */
const DURATION = {
  /** Hover and press feedback. */
  fast: 0.12,
  /** Enter and exit of small elements. */
  base: 0.18,
  /** Panels, dialogs, anything large. */
  slow: 0.26,
} as const;

/**
 * Danger is `red`, not `rose`. Rose reads as pink against the neutral greys
 * used everywhere else, which makes a destructive action look decorative.
 */
const DANGER = {
  text: "text-red-600 dark:text-red-400",
  bg: "bg-red-50 dark:bg-red-950/40",
  edge: "ring-1 ring-inset ring-red-500/20 dark:ring-red-400/25",
  solid: "bg-red-600 text-white hover:bg-red-700",
} as const;

/** The z-index ladder, so portalled surfaces stack predictably. */
const LAYER = {
  /** Dropdowns and popovers anchored to a trigger. */
  popover: 60,
  /** Dialog scrim and panel. */
  dialog: 70,
  /** Toasts, which must clear an open dialog. */
  toast: 80,
} as const;

import { createPortal } from "react-dom";

/**
 * Renders children into `document.body`, or into `container`.
 *
 * Every component that portalled did so with the same
 * `typeof document !== "undefined" ? createPortal(…) : null` guard written out
 * by hand. That guard is correct but it is not enough on its own: it renders
 * nothing on the server and the portal's contents on the first client render,
 * which React flags as a hydration mismatch. Mounting on an effect instead
 * means the first client render matches the server's, and the portal appears
 * on the pass after.
 */
function Portal({
  children,
  container,
}: {
  children: React.ReactNode;
  container?: Element | null;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  return target ? createPortal(children, target) : null;
}

/* -------------------------------------------------------------------------- */
/*  Dismiss + scroll lock                                                       */
/*                                                                              */
/*  Every dialog and popover in the set had its own copy of "close on Escape,    */
/*  close on outside click", and each copy had drifted. These are the two that   */
/*  behave correctly, including the cases the hand-rolled versions missed:       */
/*  pointer capture, nested surfaces, and the scrollbar-width layout shift.      */
/* -------------------------------------------------------------------------- */

interface DismissOptions {
  /** Whether the surface is open and should listen. */
  active?: boolean;
  /** Close on Escape. Default true. */
  escapeKey?: boolean;
  /** Close on a pointer press outside the surface. Default true. */
  outsidePress?: boolean;
  /**
   * The trigger. Presses on it are ignored, so a click on an open toggle
   * closes it once via its own handler rather than closing and reopening.
   */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Closes a surface on Escape or an outside press.
 *
 * ```tsx
 * useDismiss(panelRef, () => setOpen(false), { active: open, triggerRef });
 * ```
 */
function useDismiss(
  ref: React.RefObject<HTMLElement | null>,
  onDismiss: () => void,
  {
    active = true,
    escapeKey = true,
    outsidePress = true,
    triggerRef,
  }: DismissOptions = {},
) {
  // Held in a ref so a caller passing an inline arrow doesn't re-bind the
  // listeners on every render.
  const handler = React.useRef(onDismiss);
  React.useEffect(() => {
    handler.current = onDismiss;
  });

  React.useEffect(() => {
    if (!active) return;

    function onKeyDown(e: KeyboardEvent) {
      if (!escapeKey || e.key !== "Escape") return;
      // With two surfaces open, only the innermost should close. Whoever
      // handled it first marks the event.
      if (e.defaultPrevented) return;
      e.preventDefault();
      handler.current();
    }

    function onPointerDown(e: PointerEvent) {
      if (!outsidePress) return;
      const target = e.target as Node | null;
      if (!target) return;
      // A press that starts inside and drags out — selecting text across the
      // edge of a dialog — should not dismiss.
      if (ref.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      // The node may already be detached (a row removed by the same click),
      // in which case it was inside when the press began.
      if (!document.body.contains(target)) return;
      handler.current();
    }

    document.addEventListener("keydown", onKeyDown);
    // `pointerdown` rather than `click`: a menu should close as the press
    // lands, not when the button comes back up somewhere else.
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [active, escapeKey, outsidePress, ref, triggerRef]);
}

/* ----------------------------------------------------------- scroll lock -- */

/**
 * Reference-counted so nested surfaces don't unlock the page when the inner
 * one closes, and so the original inline style is restored rather than
 * overwritten with a guess.
 */
let locks = 0;
let restore: { overflow: string; paddingRight: string } | null = null;

/**
 * Freezes page scroll while `active`.
 *
 * Compensates for the scrollbar's width, which the hand-rolled
 * `document.body.style.overflow = "hidden"` did not — on Windows and Linux
 * that version shifted the whole page 15px left the moment a dialog opened.
 */
function useScrollLock(active = true) {
  React.useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;

    if (locks === 0) {
      const body = document.body;
      restore = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
      };
      // Only compensate when a scrollbar actually takes up space — overlay
      // scrollbars (macOS, touch) report 0 and need no padding.
      const gap = window.innerWidth - document.documentElement.clientWidth;
      if (gap > 0) {
        const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + gap}px`;
      }
      body.style.overflow = "hidden";
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0 && restore) {
        document.body.style.overflow = restore.overflow;
        document.body.style.paddingRight = restore.paddingRight;
        restore = null;
      }
    };
  }, [active]);
}

/**
 * The default spring. Quick and slightly tight — it settles without a visible
 * bounce, which is what you want for anything that appears under the cursor.
 */
const SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
} as const;

/**
 * Gold, for a paid standing — a premium seat, an upgraded plan, a customer on
 * the tier that pays for the product.
 *
 * It is `amber`, not `yellow`: yellow at this weight turns green against a
 * white ground and is illegible on it, while amber keeps a gold cast and holds
 * contrast at 11px. It is the third and last hue the set spends — red for
 * something wrong, emerald for something resolved, gold for something paid —
 * and like the other two it is allowed on exactly one element at a time.
 * Nothing structural is ever gold; a gold border or a gold panel reads as a
 * warning, which is the opposite of what a paid badge means.
 */
const PREMIUM = {
  text: "text-amber-700 dark:text-amber-400",
  bg: "bg-amber-50 dark:bg-amber-950/40",
  edge: "ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/25",
  solid: "bg-amber-500 text-neutral-900 hover:bg-amber-400",
} as const;

/* ==========================================================================
   Avatar

   A person, drawn rather than initialled.

   Initials are the usual fallback and they are the weakest part of most
   interfaces: "PR" in a coloured square tells you a slot is filled, not who is
   in it. At pin size — 26px on a document — two letters are unreadable anyway.
   A drawn face is recognisable at that size, stays the same for the same
   person, and never shows a broken image.

   The portrait is derived from the seed, so Priya Raman is always the same
   Priya Raman across the pin, the thread, the signer list and the audit trail.
   Pass `src` and a real photo wins; the drawing is what stands in until then.
   ========================================================================== */

const SKIN = ["#f4d9c0", "#e8b894", "#cf9367", "#a2673f", "#79482a"];
const HAIR = ["#2b2622", "#6b4423", "#a8552c", "#d9a441", "#5c5c5c", "#171717"];
const SHIRT = ["#6478e4", "#df6072", "#3fa66a", "#e1a35b", "#8a63d2", "#3f9fb3"];
const BACKDROP = ["#eef1f4", "#f2eee9", "#eaf1ee", "#f1edf5", "#f3f0e8"];

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Six hair shapes, drawn over the head. */
function Hair({ variant, fill }: { variant: number; fill: string }) {
  switch (variant % 6) {
    case 0:
      return <path d="M27 44c0-14 10-22 23-22s23 8 23 22c0-6-8-9-23-9s-23 3-23 9Z" fill={fill} />;
    case 1:
      return (
        <g fill={fill}>
          <circle cx="34" cy="28" r="9" />
          <circle cx="50" cy="23" r="10" />
          <circle cx="66" cy="28" r="9" />
          <circle cx="28" cy="40" r="7" />
          <circle cx="72" cy="40" r="7" />
        </g>
      );
    case 2:
      return (
        <path
          d="M26 46c0-16 11-24 24-24s24 8 24 24v30c0 4-4 6-7 4 2-14 1-24-1-30-4 4-11 6-16 6s-12-2-16-6c-2 6-3 16-1 30-3 2-7 0-7-4V46Z"
          fill={fill}
        />
      );
    case 3:
      return (
        <g fill={fill}>
          <circle cx="50" cy="15" r="8" />
          <path d="M27 44c0-14 10-22 23-22s23 8 23 22c0-7-9-11-23-11s-23 4-23 11Z" />
        </g>
      );
    case 4:
      return (
        <path
          d="M26 47c0-15 11-25 24-25s24 10 24 25c-2-9-9-14-18-14-6 0-10 2-16 6-5 3-10 5-14 8Z"
          fill={fill}
        />
      );
    default:
      return (
        <path
          d="M26 47c0-16 11-25 24-25s24 9 24 25v12c0 3-4 4-6 2 1-8 1-14 0-18-5 4-11 6-18 6s-13-2-18-6c-1 4-1 10 0 18-2 2-6 1-6-2V47Z"
          fill={fill}
        />
      );
  }
}

export interface AvatarProps {
  /** Stable identity — an email is ideal. Same seed, same face, forever. */
  seed: string;
  /** A real photo. Wins over the drawing; falls back to it if it fails. */
  src?: string;
  /** For the alt text and the title attribute. */
  name?: string;
  /** Pixel size. 20–44 are the sizes the set actually uses. */
  size?: number;
  /**
   * Circular by default, matching Share Dialog and Notification Panel — the
   * set has always drawn people as circles and objects as squircles, and a
   * squircle face reads as a file tile. Squircle stays available for the rare
   * case where an avatar sits in a grid of tiles.
   */
  shape?: "circle" | "squircle";
  /** A hairline, for a pale face against a pale surface. */
  ring?: boolean;
  className?: string;
}

export function Avatar({
  seed,
  src,
  name,
  size = 28,
  shape = "circle",
  ring = true,
  className,
}: AvatarProps) {
  const [broken, setBroken] = React.useState(false);
  const h = hash(seed);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >> 3) % HAIR.length];
  const shirt = SHIRT[(h >> 6) % SHIRT.length];
  const backdrop = BACKDROP[(h >> 9) % BACKDROP.length];
  const shade = `color-mix(in srgb, ${skin} 86%, #000)`;

  /* People are round. For the squircle variant the radius tracks the size — a
     20px tile should not be as round as a 40px one — but it snaps to the set's
     radius scale rather than computing freely, or a 36px avatar lands on 11px
     and quietly breaks the scale. */
  const STEPS = [6, 7, 8, 9, 10, 12, 14, 18];
  const wanted = size * 0.3;
  const radius =
    shape === "circle"
      ? "9999px"
      : `${STEPS.reduce((a, b) => (Math.abs(b - wanted) < Math.abs(a - wanted) ? b : a))}px`;

  const frame = cn(
    // `inline-grid`, not the default: a <span> is display:inline, and an inline
    // element ignores width and height outright — so without this the SVG sizes
    // the avatar instead of the other way round, and a 28px pin renders at 300px.
    "relative inline-grid shrink-0 overflow-hidden bg-neutral-100 dark:bg-white/[0.07]",
    ring && "ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.12]",
    shape === "squircle" && SQUIRCLE,
    className,
  );

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        title={name}
        onError={() => setBroken(true)}
        style={{ width: size, height: size, borderRadius: radius }}
        className={cn(frame, "object-cover")}
      />
    );
  }

  return (
    <span style={{ width: size, height: size, borderRadius: radius }} className={frame} title={name}>
      <svg viewBox="0 0 100 106" aria-hidden className="h-full w-full">
        <rect width="100" height="106" fill={backdrop} />
        <path d="M12 106c0-23 17-34 38-34s38 11 38 34Z" fill={shirt} />
        <path d="M42 73h16l-8 10Z" fill={backdrop} opacity="0.5" />
        <path d="M42 60h16v14a8 8 0 0 1-16 0Z" fill={shade} />
        <circle cx="27" cy="47" r="4.5" fill={skin} />
        <circle cx="73" cy="47" r="4.5" fill={skin} />
        <ellipse cx="50" cy="45" rx="22" ry="24.5" fill={skin} />
        <Hair variant={h >> 12} fill={hair} />
        <ellipse cx="42" cy="46" rx="1.9" ry="2.4" fill="#2b2622" />
        <ellipse cx="58" cy="46" rx="1.9" ry="2.4" fill="#2b2622" />
        <path
          d="M44 54c2 2.4 10 2.4 12 0"
          stroke="#2b2622"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </svg>
      {name && <span className="sr-only">{name}</span>}
    </span>
  );
}

/**
 * Overlapping avatars with a +N tail.
 *
 * Used where a group is the subject rather than an individual — a clustered
 * pin at low zoom, or the people on one phase of a plan.
 */
export function AvatarStack({
  people,
  size = 24,
  max = 3,
  className,
}: {
  people: Array<{ seed: string; src?: string; name?: string }>;
  size?: number;
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <span className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <span key={p.seed + i} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <Avatar {...p} size={size} className="ring-2 ring-white dark:ring-neutral-900" />
        </span>
      ))}
      {rest > 0 && (
        <span
          style={{ width: size, height: size, marginLeft: -size * 0.32 }}
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600",
            "ring-2 ring-white dark:bg-neutral-700 dark:text-neutral-200 dark:ring-neutral-900",
          )}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}

/* ==========================================================================
   RoleChip
   ========================================================================== */

export type Role = "owner" | "admin" | "member" | "viewer" | "guest";
export type AssignableRole = Exclude<Role, "owner">;

export const ROLES: readonly Role[] = ["owner", "admin", "member", "viewer", "guest"] as const;
export const ASSIGNABLE_ROLES: readonly AssignableRole[] = [
  "admin",
  "member",
  "viewer",
  "guest",
] as const;

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
  guest: "Guest",
};

export const ROLE_HINT: Record<Role, string> = {
  owner: "Full control, including billing and transfer",
  admin: "Manage people and settings",
  member: "Create and edit, but not manage people",
  viewer: "Read and comment only",
  guest: "Outside the organisation, access expires",
};

const TINT: Record<Role, string> = {
  owner: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
  admin: "bg-black/[0.09] text-neutral-800 dark:bg-white/[0.14] dark:text-neutral-100",
  member: "bg-black/[0.05] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300",
  viewer: "bg-black/[0.05] text-neutral-500 dark:bg-white/[0.06] dark:text-neutral-400",
  guest:
    "bg-transparent text-neutral-500 ring-1 ring-inset ring-black/[0.14] dark:text-neutral-400 dark:ring-white/[0.18]",
};

const SIZES = {
  sm: { fontSize: TYPE.micro, padding: "1.5px 6px", radius: 6, icon: 10 },
  md: { fontSize: TYPE.chip, padding: "2.5px 7px", radius: 7, icon: 11 },
} as const;

export interface RoleChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: Role;
  size?: keyof typeof SIZES;
  showOwnerMark?: boolean;
}

export const RoleChip = React.forwardRef<HTMLSpanElement, RoleChipProps>(function RoleChip(
  { role, size = "md", showOwnerMark = true, className, style, ...rest },
  ref,
) {
  const s = SIZES[size];

  return (
    <span
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex max-w-full items-center gap-1 whitespace-nowrap font-medium",
        SQUIRCLE,
        TINT[role],
        className,
      )}
      style={{ fontSize: s.fontSize, padding: s.padding, borderRadius: s.radius, ...style }}
    >
      {role === "owner" && showOwnerMark && (
        <Crown aria-hidden="true" style={{ width: s.icon, height: s.icon }} className="shrink-0" />
      )}
      <span className="truncate">{ROLE_LABEL[role]}</span>
    </span>
  );
});

/* ==========================================================================
   Menu
   ========================================================================== */

export interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  danger?: boolean;
  disabled?: boolean;
  checked?: boolean;
  separatorBefore?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  onSelect?: (id: string, item: MenuItem) => void;
  align?: "start" | "end";
  triggerLabel?: string;
  width?: number;
  trigger?: (props: {
    ref: React.Ref<HTMLButtonElement>;
    open: boolean;
    onClick: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
  }) => React.ReactNode;
  className?: string;
}

const OFFSET = 6;
const MARGIN = 8;

function firstEnabled(items: MenuItem[], from = 0, step = 1) {
  for (let i = from; i >= 0 && i < items.length; i += step) {
    if (!items[i].disabled) return i;
  }
  return -1;
}

export const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  { items, onSelect, align = "end", triggerLabel = "More options", width = 208, trigger, className },
  forwardedRef,
) {
  const reduce = useReducedMotion();

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [pos, setPos] = React.useState<{ top: number; left: number; up: boolean } | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(forwardedRef, () => triggerRef.current as HTMLButtonElement);

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    setActive(-1);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useDismiss(listRef, () => close(false), { active: open, triggerRef });

  const place = React.useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const h = listRef.current?.offsetHeight ?? 0;
    const below = window.innerHeight - r.bottom - OFFSET - MARGIN;
    const up = h > 0 && below < h && r.top - OFFSET - MARGIN > h;

    let left = align === "end" ? r.right - width : r.left;
    left = Math.min(Math.max(MARGIN, left), window.innerWidth - width - MARGIN);

    setPos({ top: up ? r.top - OFFSET - h : r.bottom + OFFSET, left, up });
  }, [align, width]);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    const onScroll = () => place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, place, items.length]);

  React.useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openWith(index: number) {
    setOpen(true);
    setActive(index);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openWith(firstEnabled(items));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openWith(firstEnabled(items, items.length - 1, -1));
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      let next = firstEnabled(items, active + step, step);
      if (next === -1) next = firstEnabled(items, step === 1 ? 0 : items.length - 1, step);
      setActive(next);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(firstEnabled(items));
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(firstEnabled(items, items.length - 1, -1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = items[active];
      if (item && !item.disabled) pick(item);
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  function pick(item: MenuItem) {
    close();
    onSelect?.(item.id, item);
  }

  const triggerProps = {
    ref: triggerRef,
    open,
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      if (open) close();
      else openWith(-1);
    },
    onKeyDown: onTriggerKeyDown,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
  };

  return (
    <>
      {trigger ? (
        trigger(triggerProps)
      ) : (
        <button
          type="button"
          ref={triggerRef}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={triggerProps.onClick}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "grid size-[28px] shrink-0 place-items-center rounded-[8px]",
            "text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-700",
            "dark:text-neutral-500 dark:hover:bg-white/[0.08] dark:hover:text-neutral-200",
            open && "bg-black/[0.05] text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-200",
            SQUIRCLE,
            FOCUS,
            className,
          )}
          style={{ transitionDuration: `${DURATION.fast}s` }}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </button>
      )}

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={listRef}
              role="menu"
              tabIndex={-1}
              aria-label={triggerLabel}
              onKeyDown={onListKeyDown}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: pos?.up ? 4 : -4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: pos?.up ? 2 : -2 }}
              transition={{ duration: DURATION.base }}
              style={{
                position: "fixed",
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                width,
                zIndex: LAYER.popover,
                fontFamily: FONT_STACK,
                transformOrigin: pos?.up ? "bottom right" : "top right",
                visibility: pos ? "visible" : "hidden",
              }}
              className={cn(
                "overflow-hidden rounded-[14px] bg-white p-[5px] dark:bg-neutral-900",
                "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.12)]",
                SQUIRCLE,
                EDGE,
                FOCUS,
              )}
            >
              {items.map((item, i) => {
                const Icon = item.icon;
                const rule = item.separatorBefore || (item.danger && i > 0 && !items[i - 1].danger);
                return (
                  <React.Fragment key={item.id}>
                    {rule && (
                      <div
                        aria-hidden="true"
                        className="my-[5px] h-px bg-black/[0.07] dark:bg-white/[0.09]"
                      />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      tabIndex={-1}
                      onMouseEnter={() => !item.disabled && setActive(i)}
                      onClick={(e) => {
                        e.stopPropagation();
                        pick(item);
                      }}
                      className={cn(
                        "flex w-full items-center gap-[9px] rounded-[9px] px-[9px] py-[7px] text-left",
                        "transition-colors",
                        SQUIRCLE,
                        item.disabled
                          ? "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
                          : item.danger
                            ? cn(DANGER.text, active === i && DANGER.bg)
                            : cn(
                                "text-neutral-700 dark:text-neutral-200",
                                active === i && "bg-black/[0.05] dark:bg-white/[0.08]",
                              ),
                      )}
                      style={{ transitionDuration: `${DURATION.fast}s` }}
                    >
                      {Icon && (
                        <Icon
                          aria-hidden
                          className={cn(
                            "size-[15px] shrink-0",
                            !item.danger && !item.disabled && "text-neutral-400 dark:text-neutral-500",
                          )}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium" style={{ fontSize: TYPE.sub }}>
                          {item.label}
                        </span>
                        {item.hint && (
                          <span
                            className="mt-[1px] block truncate font-normal text-neutral-400 dark:text-neutral-500"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {item.hint}
                          </span>
                        )}
                      </span>
                      {item.checked && (
                        <Check aria-hidden="true" className="size-[14px] shrink-0 text-neutral-500" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
});

/* ==========================================================================
   MemberCard
   ========================================================================== */

export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "pending" | "external" | "disabled";

export interface MemberCardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "onSelect"
  > {
  name?: string;
  email: string;
  avatar?: string;
  role?: MemberRole;
  status?: MemberStatus;
  title?: string;
  lastActive?: string;
  invitedAgo?: string;
  accessEnds?: string;
  you?: boolean;
  premium?: boolean;
  showMenu?: boolean;
  menuItems?: MenuItem[];
  interactive?: boolean;
  onOpen?: () => void;
  onMenuSelect?: (id: string, item: MenuItem) => void;
}

function nameFromEmail(email: string) {
  const local = email.slice(0, email.indexOf("@"));
  if (!local) return email;
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function domainOf(email: string) {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1);
}

function defaultMenu(status: MemberStatus): MenuItem[] {
  const common: MenuItem[] = [
    { id: "copy-email", label: "Copy email address", icon: Copy },
    { id: "change-role", label: "Change role…", icon: UserCog },
  ];

  if (status === "pending") {
    return [
      { id: "resend", label: "Resend invite", hint: "The old link stops working", icon: Mail },
      { id: "copy-link", label: "Copy invite link", icon: Link2 },
      ...common,
      { id: "cancel-invite", label: "Cancel invite", icon: Trash2, danger: true },
    ];
  }

  if (status === "external") {
    return [
      { id: "extend", label: "Extend access…", hint: "Push the expiry date out", icon: Timer },
      { id: "profile", label: "View profile", icon: UserRound },
      ...common,
      { id: "end-access", label: "End access now", icon: Ban, danger: true },
    ];
  }

  if (status === "disabled") {
    return [
      { id: "reactivate", label: "Reactivate", hint: "Takes a seat again", icon: RotateCcw },
      { id: "profile", label: "View profile", icon: UserRound },
      ...common,
      { id: "remove", label: "Remove from workspace", icon: Trash2, danger: true },
    ];
  }

  return [
    { id: "profile", label: "View profile", icon: UserRound },
    ...common,
    { id: "suspend", label: "Suspend access", hint: "Frees their seat", icon: Ban, danger: true },
    { id: "remove", label: "Remove from workspace", icon: Trash2, danger: true },
  ];
}

export const MemberCard = React.forwardRef<HTMLDivElement, MemberCardProps>(
  function MemberCard(
    {
      name,
      email,
      avatar,
      role = "member",
      status = "active",
      title,
      lastActive,
      invitedAgo,
      accessEnds,
      you = false,
      premium = false,
      showMenu = true,
      menuItems,
      interactive = true,
      onOpen,
      onMenuSelect,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const label = name?.trim() || nameFromEmail(email);
    const muted = status === "pending" || status === "disabled";
    const menuVisible = showMenu && role !== "owner" && !you;
    const clickable = Boolean(onOpen);

    const meta =
      status === "pending" && invitedAgo
        ? `Invited ${invitedAgo} ago`
        : status === "external" && accessEnds
          ? `Access ends ${accessEnds}`
          : status === "external"
            ? domainOf(email)
            : status === "disabled"
              ? "No seat"
              : (lastActive ?? title ?? email);

    const statusPill =
      status === "pending"
        ? { label: "Invited", tone: "text-neutral-500 ring-1 ring-inset ring-black/[0.10] dark:text-neutral-400 dark:ring-white/[0.14]" }
        : status === "external"
          ? { label: "External", tone: "text-neutral-500 ring-1 ring-inset ring-black/[0.10] dark:text-neutral-400 dark:ring-white/[0.14]" }
          : status === "disabled"
            ? { label: "Suspended", tone: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" }
            : null;

    return (
      <motion.div
        ref={ref}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(rest as any)}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onOpen : undefined}
        onKeyDown={
          clickable
            ? (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen?.();
                }
              }
            : undefined
        }
        whileHover={interactive && !reduce ? { y: -2 } : undefined}
        whileTap={interactive && clickable && !reduce ? { scale: 0.99 } : undefined}
        transition={SPRING}
        style={{ fontFamily: FONT_STACK, ...style }}
        className={cn(
          "relative flex w-full min-w-0 items-center gap-[11px] overflow-hidden",
          "rounded-[14px] bg-white px-[14px] py-[11px] dark:bg-neutral-900",
          SQUIRCLE,
          EDGE,
          clickable && cn("cursor-pointer", FOCUS),
          interactive && "transition-shadow duration-150 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]",
          className,
        )}
      >
        {status === "pending" && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neutral-400/80 to-transparent dark:via-neutral-500/80"
          />
        )}

        <div className={cn("shrink-0", muted && "opacity-60")}>
          <Avatar seed={email} src={avatar} name={label} size={32} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <div className="flex min-w-0 items-center gap-[6px]">
            <span
              className={cn(
                "min-w-0 truncate font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100",
                muted && "text-neutral-500 dark:text-neutral-400",
              )}
              style={{ fontSize: TYPE.body }}
            >
              {label}
              {you && (
                <span className="font-normal text-neutral-400 dark:text-neutral-500"> (you)</span>
              )}
            </span>

            {role === "owner" && (
              <Crown
                aria-hidden="true"
                className="size-[13px] shrink-0 text-neutral-400 dark:text-neutral-500"
              />
            )}

            {statusPill && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-[4px] rounded-full px-[7px] py-[2px] font-medium",
                  statusPill.tone,
                )}
                style={{ fontSize: TYPE.chip }}
              >
                <span aria-hidden="true" className="size-[5px] rounded-full bg-current" />
                {statusPill.label}
              </span>
            )}

            {premium && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-[3px] rounded-full px-[7px] py-[2px] font-medium",
                  PREMIUM.bg,
                  PREMIUM.text,
                  PREMIUM.edge,
                )}
                style={{ fontSize: TYPE.chip }}
              >
                <Sparkles aria-hidden="true" className="size-[10px]" />
                Premium
              </span>
            )}
          </div>

          <div
            className="flex min-w-0 items-center gap-[5px] text-neutral-500 dark:text-neutral-400"
            style={{ fontSize: TYPE.meta }}
          >
            <span className="shrink-0">{ROLE_LABEL[role]}</span>
            {meta && (
              <>
                <span aria-hidden="true" className="shrink-0">
                  ·
                </span>
                <span className="min-w-0 truncate">{meta}</span>
              </>
            )}
          </div>
        </div>

        {menuVisible && (
          <Menu
            items={menuItems ?? defaultMenu(status)}
            onSelect={onMenuSelect}
            triggerLabel={`Options for ${label}`}
            width={232}
          />
        )}
      </motion.div>
    );
  },
);

export default MemberCard;
export { MemberCard as Component };
