export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/[0.07] blur-[120px]" />
      <div className="absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 1px, transparent 1px, transparent 18px)",
        }}
      />
    </div>
  );
}
