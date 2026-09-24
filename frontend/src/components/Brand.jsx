export default function Brand({ className = "", imgClass = "h-9", light = false }) {
  return (
    <img
      src="/logo.png"
      alt="UMKM go digital"
      className={`${imgClass} w-auto object-contain select-none ${light ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
