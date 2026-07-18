import Navbar from './components/Navbar';
import MaskReveal from './components/MaskReveal';
import { DesignerPanel, CoderPanel } from './components/HeroPanels';

export default function App() {
  return (
    <>
      <Navbar />
      <section 
        className="hero-section" 
        style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#000000' }}
      >
        <div className="hero-overlay-wrapper" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          <DesignerPanel />
          <MaskReveal />
          <CoderPanel />
        </div>
      </section>
    </>
  );
}
