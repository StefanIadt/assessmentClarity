# Finding Clarity

Interactive companion to **Universal Design for Assessment: A Connected Approach to Student Success**, a SATLE-funded initiative at IADT.

## Run

Open `index.html` in a browser or serve this repository with `python3 -m http.server 8080`. This initial GitHub version is a self-contained static prototype with no build step.

## Edit in Codex

Open this GitHub repository in Codex. The public site is presently in `index.html`; editable narrative drafts are also available in `content/story/`. The later refactor should move content out of HTML and into a single source used by the visual scenes.

## Design principles

Monochrome editorial design, Inter typography, mobile-first intrinsic layout, layered documents, and typographic fragments that move between confusion and clarity. Accessibility controls, keyboard operation, reduced-motion handling and readable alternatives must be kept in all revisions.

## Privacy

All assessment examples are fictional. No student records or identifiable student images are included. This is a demonstration, not a live assessment system or measured evaluation.

## Notes

The interaction is a custom implementation inspired by typographic and particle-based design references. React Bits components are not directly imported. A further priority is making existing fragments physically assemble into the final document rather than crossfading into a separate one.

### Persona scenario demos

- `sam.html` opens the shared horizontal case-study gallery at Sam; `maya.html` opens that same gallery at Maya.
- `sam-case.html` and `maya-case.html` contain the two complete case studies, next to each other in the gallery. Each card takes about 85% of the viewport so the neighbouring case remains visible. Both keep their persona card on the left on wider screens and use vertical chapters. Moving between people preserves their reading positions and tab-local drafts. Horizontal gestures are forwarded across the embedded reader boundaries; vertical wheel input is not remapped. Offscreen media pauses.
- `maya-brief.html` uses the captured brief typography and toolbar for a fictional group literature review. Journals are separate for Alex and Riley; group feedback records are separate; private teaching notes are omitted from the student feedback preview. The journals and feedback are completed, read-only scenario records; selectors browse the prepared examples. Library links open simulated destination previews.
- The walkthrough uses a screenshot with the generated fictional lecturer portrait. It does not play a video or request a camera or microphone. The student preview keeps the written brief below the walkthrough card.
- Scenario controls stay inside their reader. The notice links to the complete Building Better Briefs OER; features outside the scenarios are not presented as working production features. Voice-over, inline Listen links, downloads, print and incidental outbound links are disabled. Student Actions aligns to the right-hand trigger and opens above the toolbar on phones.
