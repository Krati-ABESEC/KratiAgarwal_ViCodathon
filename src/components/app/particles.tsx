export function Particles({ count = 18 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((i) => {
        const left = (i * 37) % 100;
        const top = (i * 61) % 100;
        const size = 3 + (i % 4) * 2;
        return (
          <span
            key={i}
            className="animate-float absolute rounded-full bg-accent/50 blur-[1px]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              animationDelay: `${(i % 9) * 0.7}s`,
            }}
          />
        );
      })}
    </div>
  );
}
