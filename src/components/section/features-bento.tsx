"use client";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Marquee } from "@/components/magicui/marquee";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { useRef } from "react";
import ParticlesWrapper from "@/components/particles-wrapper";

function AutoSaveBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <div
        ref={githubRef}
        className="flex items-center justify-center w-16 h-16 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 bg-neutral-100 border-neutral-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-upload-icon lucide-upload"
        >
          <path d="M12 3v12" />
          <path d="m17 8-5-5-5 5" />
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        </svg>
      </div>

      {/* Database Logo */}
      <div
        ref={supabaseRef}
        className="flex items-center justify-center w-16 h-16 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 ml-32 bg-neutral-100 border-neutral-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-8 h-8 text-neutral-900 dark:text-neutral-50"
          fill="currentColor"
        >
          <path d="M448 80l0 48c0 44.2-100.3 80-224 80S0 172.2 0 128L0 80C0 35.8 100.3 0 224 0S448 35.8 448 80zM393.2 214.7c20.8-7.4 39.9-16.9 54.8-28.6L448 288c0 44.2-100.3 80-224 80S0 332.2 0 288L0 186.1c14.9 11.8 34 21.2 54.8 28.6C99.7 230.7 159.5 240 224 240s124.3-9.3 169.2-25.3zM0 346.1c14.9 11.8 34 21.2 54.8 28.6C99.7 390.7 159.5 400 224 400s124.3-9.3 169.2-25.3c20.8-7.4 39.9-16.9 54.8-28.6l0 85.9c0 44.2-100.3 80-224 80S0 476.2 0 432l0-85.9z" />
        </svg>
      </div>

      {/* Animated Beam */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={githubRef}
        toRef={supabaseRef}
        curvature={0}
        gradientStartColor="#62C3F8"
        gradientStopColor="#315B73"
        duration={4}
        startXOffset={32}
        endXOffset={-32}
      />
    </div>
  );
}

const features = [
  {
    name: "Smart LinkedIn Import",
    description:
      "Securely upload your LinkedIn connections data and let AI parse profiles, industries, and locations.",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <AutoSaveBeam />
      </div>
    ),
  },
  {
    name: "AI-Powered Matching",
    description:
      "Describe your business goals and get intelligent recommendations from your weak ties network.",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 p-10 flex pt-16 justify-center overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg p-6 opacity-70 group-hover:opacity-100 transition-opacity">
          <div className="text-neutral-900 dark:text-white text-sm space-y-2">
            <div className="font-semibold">
              🎯 Mission: "Expanding logistics business to Brazil"
            </div>
            <div className="text-blue-600 dark:text-blue-200">
              → Maria Santos - DHL Brazil Operations
            </div>
            <div className="text-purple-600 dark:text-purple-200">
              → Joaquim Oliveira - São Paulo Logistics Expert
            </div>
            <div className="text-green-600 dark:text-green-200">
              → Carla Lima - Latin American Business Consultant
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-100/80 dark:from-neutral-900/80 via-transparent to-transparent" />
      </div>
    ),
  },
  {
    name: "Connection Insights",
    description:
      "Understand why each connection is relevant with detailed context and shared connections analysis.",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 overflow-hidden">
        <Marquee className="[--duration:25s] absolute top-4">
          <div className="bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-300 dark:border-neutral-700 mr-4 min-w-[280px] min-h-[175px]">
            <div className="text-neutral-900 dark:text-white font-semibold text-sm">Maria Santos</div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs">
              DHL Brazil • São Paulo
            </div>
            <div className="text-blue-600 dark:text-blue-300 text-xs mt-2">
              ✓ Logistics Innovation Group
            </div>
            <div className="text-green-600 dark:text-green-300 text-xs">
              ✓ 15 mutual connections
            </div>
          </div>
          <div className="bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-300 dark:border-neutral-700 mr-4 min-w-[280px] min-h-[175px]">
            <div className="text-neutral-900 dark:text-white font-semibold text-sm">
              Joaquim Oliveira
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs">Ex-Founder • Mentor</div>
            <div className="text-purple-600 dark:text-purple-300 text-xs mt-2">
              ✓ Brazil logistics expert
            </div>
            <div className="text-yellow-600 dark:text-yellow-300 text-xs">✓ Startup accelerator</div>
          </div>
          <div className="bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-300 dark:border-neutral-700 mr-4 min-w-[280px] min-h-[175px]">
            <div className="text-neutral-900 dark:text-white font-semibold text-sm">Carla Lima</div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs">
              Business Consultant • Rio de Janeiro
            </div>
            <div className="text-purple-600 dark:text-purple-300 text-xs mt-2">
              ✓ Latin American markets
            </div>
            <div className="text-blue-600 dark:text-blue-300 text-xs">✓ 8 mutual connections</div>
          </div>
          <div className="bg-neutral-200/50 dark:bg-neutral-800/50 rounded-lg p-4 border border-neutral-300 dark:border-neutral-700 mr-4 min-w-[280px] min-h-[175px]">
            <div className="text-neutral-900 dark:text-white font-semibold text-sm">Daniel Kwon</div>
            <div className="text-neutral-600 dark:text-neutral-400 text-xs">
              Supply Chain Director • Seoul
            </div>
            <div className="text-green-600 dark:text-green-300 text-xs mt-2">
              ✓ Brazil expansion experience
            </div>
            <div className="text-yellow-600 dark:text-yellow-300 text-xs">
              ✓ 12 mutual connections
            </div>
          </div>
        </Marquee>
      </div>
    ),
  },
  {
    name: "One-Click Reconnect",
    description:
      "Seamlessly reconnect with relevant contacts through direct LinkedIn integration and smart messaging.",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-start justify-center pt-16 p-4">
        <div className="w-full max-w-xs opacity-70 group-hover:opacity-90 transition-opacity">
          <div className="bg-blue-600 rounded-lg p-4 text-white text-center">
            <div className="text-sm font-semibold mb-2">
              Reconnect with Maria
            </div>
            <div className="text-xs opacity-80 mb-3">
              Last contacted: 2 years ago
            </div>
            <button className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium">
              Send LinkedIn Message
            </button>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesBento() {
  return (
    <section className="py-20 px-5 sm:px-10">
      <ParticlesWrapper />
      <div className="max-w-6xl mx-auto">
        <BlurFade delay={0.2} inView>
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <h2
              id="features"
              className="scroll-mt-32 max-w-2xl text-3xl text-center sm:text-4xl font-semibold bg-gradient-to-br dark:from-white to-neutral-400 bg-clip-text text-transparent from-neutral-900 dark:to-neutral-600"
            >
              AI-powered LinkedIn networking to activate your weak ties
            </h2>
            <div className="text-muted-foreground max-w-xl">
              Transform your dormant LinkedIn connections into valuable business
              opportunities with intelligent matching and seamless reconnection.
            </div>
          </div>
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}
