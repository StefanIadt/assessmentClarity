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

- `sam.html` follows a computing student through a vertical story.
- `maya.html` follows a Psychology of UX lecturer through six native horizontal chapters, with her card on the right on wider screens. Chapter links and keyboard arrows also work; vertical wheel input is not remapped.
- `maya-brief.html` uses the captured brief typography and toolbar for a fictional group literature review. Journals are separate for Alex and Riley; group feedback records are separate; private teaching notes are omitted from the student feedback preview. Records live only in the current tab.
- The walkthrough is an illustrative recording of the demo screens with a generated fictional portrait and synthetic narration. Its English captions are enabled by default and a matching transcript is included. No camera or microphone is requested.
- Scenario controls stay inside their reader. The notice links to the complete Building Better Briefs OER; features outside the scenarios are not presented as working production features.
