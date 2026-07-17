# Visual Architecture — Portfolio Experience

## Purpose

This document is the creative and technical contract for the portfolio. It is derived from the existing Hero, which remains the canonical opening scene. New work must extend its visual grammar, not restyle or replace it.

## Audit snapshot

- **Application:** React 19 + Vite 8, authored in JavaScript/JSX (despite the intended TypeScript stack).
- **Current route structure:** one application entry and one full-viewport Hero; the navigation already points to the future `about`, `skills`, `projects`, `experience`, and `contact` anchors.
- **Hero building blocks:** `MaskReveal`, `DesignerPanel`, `CoderPanel`, `Navbar`, and `GlowingBorderButton`.
- **Animation in use:** GSAP for text entrances and quiet perpetual accents; requestAnimationFrame for pointer physics and the reveal halo; CSS transitions for navigation and tag feedback.
- **Installed but currently unused:** Lenis, Motion, SplitType, Three.js/R3F/Drei/Postprocessing/Rapier, React Spring, Leva, and several shader/GLSL utilities. They are capability, not justification. Do not introduce them merely because they exist.
- **Assets:** the Hero actively uses `front.png` (ordinary portrait) and `back.png` (masked persona). `back1.png`, `3.png`, and `hero.png` are unused exploration assets. The first two hero images alone account for roughly 12 MB of the production payload.
- **Baseline:** production build succeeds. The present experience is structurally desktop-first, with a thoughtful static-flow mobile fallback at 960 px.

## Why the Hero works

The Hero makes a simple personal statement legible before the visitor reads a sentence: there is a real person at the centre, and there is a more capable version revealed through intent. The pointer-controlled mask makes the visitor an active collaborator in that discovery. It is a transformation metaphor, not a visual trick.

The screen is composed as one balanced field:

| Role | Existing expression | Meaning |
| --- | --- | --- |
| Centre | Portrait, then masked alter ego under the reveal | Identity and transformation |
| Left | Warm “designer.” discipline | Empathy, composition, product taste |
| Right | Cool “`<coder/>`” discipline | Systems, precision, implementation |
| Surface | White field, restrained contour lines, pale organic forms | Calm technical studio; the page is a working plane, not a dark void |
| Navigation | Small liquid-metal edged pills | Precision instrument controls, kept visually light |

The portrait is not treated as a background. It is the scene’s visual mass. The side panels respect it with transparent overlays, symmetric outer insets, and intentional negative space. This is why the Hero remains editorial rather than feeling like three cards laid over an image.

## Hero DNA

### Composition and whitespace

1. One dominant human focal point, centred and large enough to carry the page.
2. Two peripheral disciplines create a stable warm/cool tension without competing with the centre.
3. Content floats on the field without containers. Separation comes from distance, scale, and contrast—not card chrome.
4. The contour-line substrate is low contrast and continuous. It carries motion and gives every subsequent scene a shared geography.
5. Navigation is deliberately small, elevated only enough to feel operable.

### Typography language

- A geometric sans stack carries the human, product-facing voice.
- Monospace is reserved for technical metadata and code identity, never used as a generic “developer aesthetic.”
- Display words are heavy, lowercase, compressed, and fragmentary (`designer.`, `<coder/>`). They are declarations, not marketing headings.
- Supporting copy remains quiet, with generous leading and reduced contrast.
- Accent colour belongs to labels, fragments, and boundaries; body copy stays neutral.

### Colour and light

- **Base:** white / near-white ground, graphite portrait and text, pale grey topology.
- **Warm pole:** rose-magenta (`hsl(340 70% 60%)`) for design decisions.
- **Cool pole:** cyan-blue (`hsl(195 80% 55%)`) for engineering decisions.
- **Lighting:** high-key and editorial. The site does not use darkness to manufacture drama. Contrast comes from the portrait, the reveal boundary, and sparse saturated signals.
- **Glow:** only denotes energy in motion—the living dots, the mask rim, and the shader-edged controls. It must never become a generic background treatment.

### Materials

- Primary material: paper-like white studio field with fine technical contouring.
- Interactive material: liquid-metal edge around the navigation, softened by a transparent inner fill.
- Transformative material: organic, slightly imperfect radial mask; its soft edge is the visual language of potential becoming visible.
- Tags are outlines, not chips with depth. They catalog capability without becoming UI cards.

## Motion and interaction language

### Entrance rhythm

The Hero reveals in layers: eyebrow → segmented headline → supporting sentence → capability tags. The left discipline begins first; the right follows later. This establishes a readable hierarchy and lets the visitor discover the two roles rather than receive an immediate wall of information.

The signature transition is the segment curtain: content moves upward through a defined slit with `expo.out` and small, 100 ms steps. Future type should inherit this feeling when it is introduced—not default to arbitrary fades.

### Continuous motion

Two modest loops are meaningful: the warm/cool dots breathe as active disciplines, and the headline gradients travel gently as a hint of ongoing practice. They are low-frequency and should remain so. Motion is an indicator of living systems, not filler.

### Pointer and camera feeling

The cursor controls a lagging reveal mass, not an immediate cursor-following circle. Its position is heavy, its scale responds to velocity, and its plane tilts behind the pointer. The resulting camera feeling is intimate: the visitor appears to examine a physical print from slightly different angles.

There is no free-flying 3D camera and no spectacle-first simulation. If 3D is introduced later, it must retain this controlled, shallow-parallax “inspection plane” behaviour.

### Accessibility and fallbacks

- `prefers-reduced-motion` resolves the text and tag sequences immediately and disables CSS transitions.
- Mobile intentionally abandons the desktop overlays for an editorial stack: designer → portrait → coder.
- Future sections must preserve semantic content without pointer input or animation. The transformation must be understandable as a static sequence.

## Section evolution

The page is a continuous arc: **identity → method → evidence → capability → invitation.**

### 01 — About: the person behind the transformation

**Narrative job:** After the visitor reveals the alter ego, explain the intention and the person who makes it real.

**Visual evolution:** The soft reveal boundary expands from a circular investigation into a broad, slow editorial aperture. It carries the portrait’s white field and contour lines downward, then allows the real portrait to become smaller and more human-scale alongside a concise first-person statement. Warm and cool do not appear as separate columns; they become two quiet inline marks within the story.

**Interaction:** A single scroll-linked reveal exposes short fragments of the biography, as though the same material is being uncovered rather than a new section loading. No cards, counters, or portraits duplicated for decoration.

### 02 — Projects: proof under examination

**Narrative job:** Turn the promise into selected evidence.

**Visual evolution:** Projects are treated as case files on the same studio plane, with one project occupying the field at a time. The existing contour geography becomes a framing grid; each project enters through a directional mask derived from the Hero’s aperture. The warm/cool accents identify the dominant contribution to each project, never serve as arbitrary category colours.

**Interaction:** Progress is paced by scroll, with a deliberate foreground/background relationship rather than a tiled gallery. Hover or focus may expose a restrained metadata rail and a project action. Images must carry the visual weight; translucent cards must not be used as substitutes for composition.

### 03 — Skills: the mechanism, not a badge wall

**Narrative job:** Explain the capabilities behind the work.

**Visual evolution:** The Hero’s two disciplines become a shared system. Warm and cool strands begin at opposite edges, converge through a small number of practical capability clusters, and settle into neutral output. This keeps the dual identity while demonstrating integration.

**Interaction:** Each cluster earns an interaction only when it explains a relationship—for example, design system choices leading into implementation techniques. Tags can return as the small outlined material, but should form a readable index, not an animated cloud.

### 04 — Contact: return the agency to the visitor

**Narrative job:** Close the transformation and invite the next collaboration.

**Visual evolution:** The aperture becomes a calm opening in the same white field. The two accent frequencies resolve into a single restrained perimeter signal, echoing the navigation material without recreating it at a larger scale. The final composition should have as much quiet as the Hero.

**Interaction:** One clear contact action and a compact set of real external links. The interaction should feel like opening a channel, not completing a checkout flow.

### Experience anchor

The existing navigation includes Experience even though the requested primary sequence does not. It should become a brief chronological interval between Skills and Contact only if there is substantive content. It inherits the case-file language of Projects; it must not introduce a generic vertical timeline aesthetic.

## Continuity rules

1. Keep the white technical field alive across section boundaries; do not cut to unrelated colour worlds.
2. Preserve the warm/cool polarity as semantic discipline signals. Blend them only when explaining collaboration between design and engineering.
3. Use masks, directional reveals, and controlled parallax as the transition family. Avoid unrelated slide-ins, scale pops, and ambient particles.
4. Let large imagery, type, and whitespace do the work. Decorative surfaces need a narrative or operational purpose.
5. Treat all sections as chapters in the same camera space: shallow depth, close inspection, never a detached dashboard.
6. Use one animation engine per responsibility: GSAP + ScrollTrigger for orchestrated scroll scenes; CSS for immediate state feedback. Do not layer Motion, React Spring, and GSAP over the same elements.

## Engineering architecture for implementation

### Recommended system boundaries

- `AppShell`: global background field, navigation, scroll provider, route/anchor orchestration.
- `Hero`: preserved as an isolated scene; only performance and accessibility fixes may touch it after verification.
- `NarrativeSection`: shared semantic shell for full-bleed scenes, section label, motion lifecycle, and reduced-motion state.
- `RevealField`: reusable DOM/CSS mask primitive based on the Hero’s aperture; it should support static, pointer, and scroll-driven modes without duplicating RAF loops.
- `ProjectSequence`, `CapabilitySystem`, and `ContactScene`: content-specific scenes built on that primitive, not generic reusable cards.

### Motion architecture

- Introduce Lenis only when the scroll narrative needs a unified scroll source; connect it once to ScrollTrigger and clean it up centrally.
- Create and destroy GSAP contexts inside section scopes. ScrollTrigger instances must be scoped and reverted with each scene.
- Use `matchMedia` for desktop/mobile scene variants rather than attempting to preserve a desktop pinning system on narrow screens.
- Centralise `prefers-reduced-motion` so scroll scenes resolve to complete states rather than merely accelerating their timelines.

### Performance contract

- Retain the Hero’s direct style writes and avoid React state for pointer-rate animation.
- Consolidate the current two Hero RAF loops into one shared loop before adding further pointer-reactive scenes; this is a future optimisation, not a visual redesign.
- Render large project imagery responsively, preload only the next narrative image, and avoid full-resolution assets when the viewport cannot use them.
- Do not add a WebGL canvas until a scene needs geometry, a material, or depth that the current DOM/mask language cannot express. The Hero proves that the core story works without it.
- Measure before adding postprocessing. The baseline bundle is lightweight in code but image-heavy.

## Decisions before implementation

1. Preserve the Hero’s current art direction and interaction exactly as the reference scene.
2. Build the continuation with DOM/CSS masks and GSAP first; defer 3D to a clearly justified later scene.
3. Establish a real display/typeface loading strategy before final typography tuning; the current font stacks name fonts that are not bundled or imported.
4. Choose and prepare project content (title, one-line role, contribution, visual asset, destination) before building the Projects sequence. The direction depends on genuine work, not placeholder cards.
5. Optimise the Hero images as a separate delivery task after visual comparison; their visual quality is central, so compression must not damage the portrait or the mask transition.

## Non-negotiable test

Before a section ships, ask: **Does it feel like the same white studio field, the same transformation logic, and the same precise human/technical duality as the Hero?** If not, simplify or recompose it until it does.
