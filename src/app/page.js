import { GoogleGeminiEffectDemo } from "@/components/ui/main-page-footer";
import { SpotlightNewDemo } from "@/components/ui/main-page-header";
import { NavbarMakanBot } from "@/components/ui/Navbar";
import { BentoGridDemo } from "@/components/ui/structure-bento";

export default function Home() {
  return (
    <div >
      <NavbarMakanBot />
      <SpotlightNewDemo/>
      <BentoGridDemo />

    </div>
  );
}
