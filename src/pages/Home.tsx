import { Navbar } from "../components/home/Navbar";
import { HeroSection } from "../components/home/HeroSection";
import { FeaturesSection } from "../components/home/FeaturesSection";
import { DemoPreviewSection } from "../components/home/DemoPreviewSection";
import { Footer } from "../components/home/Footer";

export function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans select-none">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoPreviewSection />
      <Footer />
    </div>
  );
}

export default Home;
