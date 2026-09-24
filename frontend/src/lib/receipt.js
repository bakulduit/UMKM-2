import { rupiah, shortDate } from "@/lib/format";

export function buildReceiptText(txn, store) {
  if (!txn) return "";
  const lines = [];
  lines.push(`*${store?.name || "Toko"}*`);
  if (store?.address) lines.push(store.address);
  if (store?.phone) lines.push(`Telp: ${store.phone}`);
  lines.push("--------------------------------");
  lines.push(shortDate(txn.created_at));
  if (txn.id) lines.push(`No: ${String(txn.id).slice(0, 8).toUpperCase()}`);
  lines.push(`Kasir: ${txn.cashier_name || "-"}`);
  if (txn.customer_name) lines.push(`Pelanggan: ${txn.customer_name}`);
  lines.push("--------------------------------");
  (txn.items || []).forEach((i) => {
    lines.push(`${i.name}`);
    lines.push(`  ${i.qty} x ${rupiah(i.price)} = ${rupiah(i.price * i.qty)}`);
  });
  lines.push("--------------------------------");
  if (txn.discount) lines.push(`Diskon: -${rupiah(txn.discount)}`);
  lines.push(`*TOTAL: ${rupiah(txn.total)}*`);
  lines.push(`Bayar: ${(txn.payment_method || "").toUpperCase()}`);
  if (txn.payment_method === "cash" && txn.amount_paid) {
    lines.push(`Tunai: ${rupiah(txn.amount_paid)}`);
    lines.push(`Kembali: ${rupiah(Math.max(0, txn.amount_paid - txn.total))}`);
  }
  if (txn.is_credit) lines.push("(KASBON / Belum Lunas)");
  lines.push("--------------------------------");
  lines.push("Terima kasih atas kunjungan Anda 🙏");
  lines.push("Ditenagai oleh UMKM go digital");
  return lines.join("\n");
}

export function buildReceiptHTML(txn, store) {
  if (!txn) return "";
  const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "";
  const logo = origin + "/logo.png";
  const ref = txn.id ? String(txn.id).slice(0, 8).toUpperCase() : null;
  const rows = (txn.items || [])
    .map(
      (i) => `<tr><td>${i.name}<div class="m">${i.qty} x ${rupiah(i.price)}</div></td><td class="r">${rupiah(i.price * i.qty)}</td></tr>`
    )
    .join("");
  const change = txn.payment_method === "cash" && txn.amount_paid ? Math.max(0, txn.amount_paid - txn.total) : null;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Struk</title>
  <style>
    *{font-family:'Courier New',monospace;font-size:12px;color:#000}
    body{width:280px;margin:0 auto;padding:12px}
    h2{text-align:center;margin:6px 0 2px;font-size:15px}
    .c{text-align:center}.r{text-align:right}.m{color:#555;font-size:11px}
    .logo{display:block;margin:0 auto 6px;max-height:44px;width:auto}
    hr{border:none;border-top:1px dashed #000;margin:8px 0}
    table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
    .tot{font-weight:bold;font-size:14px}
    .brand{color:#64748b;font-size:10px;margin-top:6px}
  </style></head><body>
    <img class="logo" src="${logo}" alt="logo" onerror="this.style.display='none'" />
    <h2>${store?.name || "Toko"}</h2>
    ${store?.address ? `<div class="c">${store.address}</div>` : ""}
    ${store?.phone ? `<div class="c">Telp: ${store.phone}</div>` : ""}
    <hr>
    <div>${shortDate(txn.created_at)}</div>
    ${ref ? `<div>No: ${ref}</div>` : ""}
    <div>Kasir: ${txn.cashier_name || "-"}</div>
    ${txn.customer_name ? `<div>Pelanggan: ${txn.customer_name}</div>` : ""}
    <hr>
    <table>${rows}</table>
    <hr>
    ${txn.discount ? `<div class="r">Diskon: -${rupiah(txn.discount)}</div>` : ""}
    <div class="r tot">TOTAL: ${rupiah(txn.total)}</div>
    <div class="r">Bayar: ${(txn.payment_method || "").toUpperCase()}</div>
    ${txn.amount_paid && txn.payment_method === "cash" ? `<div class="r">Tunai: ${rupiah(txn.amount_paid)}</div>` : ""}
    ${change != null ? `<div class="r">Kembali: ${rupiah(change)}</div>` : ""}
    ${txn.is_credit ? `<div class="c">(KASBON / Belum Lunas)</div>` : ""}
    <hr>
    <div class="c">Terima kasih atas kunjungan Anda</div>
    <div class="c brand">Ditenagai oleh UMKM go digital</div>
  </body></html>`;
}

export function printReceipt(txn, store) {
  if (!txn) return;
  const w = window.open("", "_blank", "width=340,height=600");
  if (!w) return;
  w.document.write(buildReceiptHTML(txn, store));
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 300);
}

export function whatsappUrl(txn, store, phone) {
  const text = encodeURIComponent(buildReceiptText(txn, store));
  const p = (phone || "").replace(/[^0-9]/g, "");
  const num = p ? (p.startsWith("0") ? "62" + p.slice(1) : p) : "";
  return num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
}
