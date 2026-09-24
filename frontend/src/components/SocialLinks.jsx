const INSTAGRAM_URL = "https://instagram.com/umkmgodigital";
const WHATSAPP_URL = "https://wa.me/6282129078762";

export default function SocialLinks({ className = "", linkClass = "" }) {
  return (
    <div className={`flex flex-col gap-2 text-sm ${className}`}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${linkClass}`}
        data-testid="social-instagram"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.4-3.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
        </svg>
        <span>@UMKMgodigital</span>
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${linkClass}`}
        data-testid="social-whatsapp"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.25 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.53.06-.24-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.1-.5.11-.11.24-.29.37-.43.12-.14.16-.25.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47z" />
        </svg>
        <span>082129078762</span>
      </a>
    </div>
  );
}
