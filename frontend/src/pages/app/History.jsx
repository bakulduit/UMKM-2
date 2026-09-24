import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/apiClient";
import { rupiah, shortDate } from "@/lib/format";
import { printReceipt, whatsappUrl, shareReceiptPdf } from "@/lib/receipt";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Minus, Loader2, ScrollText, ArrowDownCircle, ArrowUpCircle, Truck, Printer, Send, FileText } from "lucide-react";
import { toast } from "sonner";

export default function History() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Operasional", amount: 0, note: "" });
  const [busy, setBusy] = useState(false);

  const { data: txns = [], isLoading } = useQuery({ queryKey: ["transactions"], queryFn: async () => (await api.get("/transactions?limit=200")).data });
  const { data: store } = useQuery({ queryKey: ["umkm"], queryFn: async () => (await api.get("/umkm")).data });

  const saveExpense = async () => {
    setBusy(true);
    try {
      await api.post("/transactions/expense", { ...form, amount: Number(form.amount) });
      toast.success("Pengeluaran dicatat");
      setOpen(false); setForm({ category: "Operasional", amount: 0, note: "" });
      qc.invalidateQueries();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title="Riwayat Transaksi" subtitle="Semua pemasukan & pengeluaran" testid="history-header"
        action={<Button variant="outline" onClick={() => setOpen(true)} data-testid="add-expense-btn"><Minus className="h-4 w-4 mr-2" /> Catat Pengeluaran</Button>} />

      <Card className="rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="h-64 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : txns.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><ScrollText className="h-10 w-10 mx-auto mb-3 opacity-50" /> Belum ada transaksi.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Waktu</TableHead><TableHead>Jenis</TableHead><TableHead>Keterangan</TableHead><TableHead>Kasir</TableHead><TableHead>Metode</TableHead><TableHead className="text-right">Jumlah</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {txns.map((t) => (
                <TableRow key={t.id} data-testid={`txn-${t.id}`}>
                  <TableCell className="whitespace-nowrap text-sm">{shortDate(t.created_at)}</TableCell>
                  <TableCell>
                    {t.type === "sale" ? (
                      <Badge className="bg-accent text-accent-foreground hover:bg-accent gap-1"><ArrowDownCircle className="h-3 w-3" /> Penjualan</Badge>
                    ) : t.type === "purchase" ? (
                      <Badge variant="outline" className="gap-1 text-sky-600 border-sky-300"><Truck className="h-3 w-3" /> Pembelian</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300"><ArrowUpCircle className="h-3 w-3" /> Pengeluaran</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">{t.type === "sale" ? (t.items?.map((i) => `${i.name} x${i.qty}`).join(", ") || "-") : t.type === "purchase" ? `${t.supplier_name ? t.supplier_name + ": " : ""}${t.items?.map((i) => `${i.name} x${i.qty}`).join(", ")}` : (t.category + (t.note ? ` · ${t.note}` : ""))}{t.is_credit && <span className="text-destructive text-xs ml-1">(Utang)</span>}</TableCell>
                  <TableCell className="text-sm">{t.cashier_name}</TableCell>
                  <TableCell className="text-sm uppercase">{t.payment_method}</TableCell>
                  <TableCell className={`text-right tabular font-medium ${t.type === "sale" ? "text-primary" : "text-amber-600"}`}>
                    {t.type === "sale" ? "+" : "-"}{rupiah(t.total)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {t.type === "sale" && (
                      <>
                        <Button size="icon" variant="ghost" title="Cetak struk" onClick={() => printReceipt(t, store)} data-testid={`print-${t.id}`}><Printer className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="Kirim struk PDF" onClick={() => shareReceiptPdf(t, store, null)} data-testid={`pdf-${t.id}`}><FileText className="h-4 w-4" /></Button>
                        <a href={whatsappUrl(t, store, null)} target="_blank" rel="noreferrer"><Button size="icon" variant="ghost" title="Kirim WhatsApp"><Send className="h-4 w-4" /></Button></a>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Pengeluaran</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Kategori</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Operasional, Bahan Baku, Gaji..." data-testid="expense-category" /></div>
            <div className="space-y-2"><Label>Jumlah</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} data-testid="expense-amount" /></div>
            <div className="space-y-2"><Label>Catatan</Label><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={saveExpense} disabled={busy || !form.amount} data-testid="save-expense">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
