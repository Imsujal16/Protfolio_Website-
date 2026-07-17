import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';

export default function App() {
  return (
    <>
      <Navbar />
      {/*
        * hero-overlay-wrapper: position:relative ONLY — not a flex container.
        * MaskReveal fills it naturally (100vw × 100vh in document flow).
        * DesignerPanel and CoderPanel are position:absolute overlays.
        * They do NOT affect MaskReveal's size or position.
        *
        * DOM order matters for mobile (≤960px) where panels switch to
        * position:static and stack vertically:
        *   DesignerPanel → first in DOM  → appears above the portrait ✓
        *   MaskReveal    → second in DOM → the portrait fills the screen ✓
        *   CoderPanel    → third in DOM  → appears below the portrait ✓
        */}
      <div className="hero-overlay-wrapper">
        <DesignerPanel />
        <MaskReveal />
        <CoderPanel />
      </div>
    </>
  );
}
