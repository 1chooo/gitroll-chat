import Hero from "@/components/section/hero";

export default function Home() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        scrollSnapType: "y mandatory",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <Hero />
    </div>
  );
}
