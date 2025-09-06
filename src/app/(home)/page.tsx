import Hero from "@/components/section/hero";
import { CTA } from "@/components/section/cta";
import { FeaturesBento } from "@/components/section/features-bento";

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <Hero />
      <FeaturesBento />
      <CTA />
    </div>
  );
}
