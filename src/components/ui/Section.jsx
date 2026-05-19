export default function Section({ children, className = "" }) {
  return (
    <section className={`border-4 border-accent rounded-3xl bg-[rgba(10,10,10,0.82)] p-[22px] shadow-[0_0_28px_rgba(244,140,54,0.35),10px_10px_0_rgba(244,140,54,0.3)] mb-[18px] ${className}`}>
      {children}
    </section>
  );
}
