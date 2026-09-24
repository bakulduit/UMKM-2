export default function Brand({ className = "", imgClass = "h-12" }) {
  return (
    <span className={`inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-sm border border-black/5 ${className}`}>
      <img src="/logo.webp" alt="UMKM go digital" className={`${imgClass} w-auto`} />
    </span>
  );
}
