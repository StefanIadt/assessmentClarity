# Mobile review — 6 November 2026

Production is unchanged. Review branch: `mobile-review`.

Preview: https://finding-clarity-k15q5uhdh-spb-iadt-wdf.vercel.app/
Annotated walkthrough: append `/review/`.

## Interaction proposal

On mobile (including coarse-pointer landscape up to 1100px), stories use native document scrolling. Persona cards retain 90% width and native horizontal swiping. Explicit chapter selection and Previous / Next replace scroll-driven chapter changes. The relevant actual brief opens in a same-page modal reader with its original controls docked at the bottom. Back restores focus and the page position.

Desktop retains the paired narrative and device. The global page progress strip remains. Wheel deltas are normalized across pixel, line and page modes, and parent journey distance matches the actual case viewport rather than an arbitrary 0.8 multiplier.

## Root causes

- Cancelled touch events were forwarded through two nested frames, losing native inertia and changing scroll ownership.
- Touches beginning on controls were treated differently from touches on ordinary content.
- Vertical wheel units were not normalized.
- Parent scroll distance and embedded chapter distance used different scales.
- Maya's overview intentionally aligned a later task row, leaving a confusing mobile opening position.
- Hidden case frames can have zero height; chapter calculation now guards this case.

## Verification

Chromium touch emulation: all 11 chapter/story and brief pairs captured, scrollable readers moved with actual CDP touch dispatch, no chapter-walkthrough JavaScript errors. Additional checks passed for native page movement, persona swiping, isolated reader scrolling, preserved return position, orientation changes and 320px horizontal overflow. Wheel test: 16 pixel units -> 16px; 1 line -> 16px; 1 page -> case viewport height. Controls, AI Usage Log, light/dark, full menu, original story sections, and readable alternative captured.

Screenshots and annotated PDF are in `review/`. Test scripts and raw touch results are under `/tmp/review-*.cjs` and `/workspace/work/mobile-review/` for this session.

Physical Safari/iPhone and Android momentum and browser toolbar resizing still require device review. Original long visual-story sections and the desktop pinned storytelling model are retained, not fully redesigned. The modal reader is a proposed mobile information architecture change for review.
