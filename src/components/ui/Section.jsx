export default function Section({ children, className = "" }) {
  return (
    <section className={`border-4 border-a2 rounded-3xl bg-[rgba(29,18,50,.82)] p-[22px] shadow-[0_0_28px_rgba(255,58,242,.35),10px_10px_0_#ffe600] mb-[18px] ${className}`}>
      {children}
    </section>
  );
}
