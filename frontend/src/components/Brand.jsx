export default function Brand({ className = "", imgClass = "h-16" }) {
  return (
    <img
      src="/logo.webp"
      alt="UMKM go digital"
      className={`${imgClass} w-auto object-contain select-none ${className}`}
    />
  );
}
