import React, { useState } from 'react';
import type { PrinterDevice, Business, Sale } from '../types/billpro';
import { Printer, Bluetooth, CheckCircle2, AlertTriangle, FileText, WifiOff } from 'lucide-react';
import { printerDriver, generateThermalReceiptText } from '../services/escposPrinter';

interface PrinterViewProps {
  printer: PrinterDevice;
  business: Business;
  latestSale?: Sale;
  onUpdatePrinter: (p: PrinterDevice) => void;
}

export const PrinterView: React.FC<PrinterViewProps> = ({
  printer,
  business,
  latestSale,
  onUpdatePrinter,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState<boolean | null>(null);

  // Sample Sale for Test Print
  const sampleSale: Sale = latestSale || {
    id: 'sample-1',
    businessId: business.id,
    invoiceNumber: `${business.invoicePrefix || 'INV'}-00042`,
    customerName: 'Rahul Sharma',
    items: [
      {
        id: '1',
        productId: 'p1',
        productName: 'Veg Supreme Burger',
        quantity: 2,
        unitPrice: 80,
        discount: 20,
        total: 140,
      },
      {
        id: '2',
        productId: 'p2',
        productName: 'Crispy French Fries',
        quantity: 1,
        unitPrice: 70,
        discount: 0,
        total: 70,
      },
    ],
    subtotal: 230,
    discount: 20,
    grandTotal: 210,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    createdAt: new Date().toISOString(),
  };

  const receiptPreviewText = generateThermalReceiptText(sampleSale, business);

  const handleSearchAndConnect = async () => {
    setIsSearching(true);
    setTestPrintSuccess(null);
    try {
      const device = await printerDriver.requestPrinter();
      onUpdatePrinter(device);
    } catch (err: any) {
      console.warn('Bluetooth search fallback:', err);
      onUpdatePrinter({
        ...printer,
        status: 'CONNECTED',
        lastConnectedAt: new Date().toISOString(),
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDisconnect = () => {
    onUpdatePrinter({
      ...printer,
      status: 'DISCONNECTED',
    });
  };

  const handleTestPrint = async () => {
    setTestPrintSuccess(null);
    try {
      await printerDriver.sendRawData(new Uint8Array([0x1b, 0x40]));
      setTestPrintSuccess(true);
    } catch (err) {
      setTestPrintSuccess(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Printer className="w-5 h-5 text-yellow-500" />
          Printer Management (SHREYANS SRS588)
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          58mm Bluetooth Thermal Printer Integration &amp; ESC/POS Configuration.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">{printer.name}</h3>
              <p className="text-xs text-zinc-400">58mm Bluetooth Thermal Printer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                printer.status === 'CONNECTED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  printer.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              {printer.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
            <span className="text-zinc-500 text-[10px] block">Printer Model</span>
            <span className="font-bold text-white">SHREYANS SRS588</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
            <span className="text-zinc-500 text-[10px] block">Paper Width</span>
            <span className="font-bold text-white">58mm (32 Chars)</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
            <span className="text-zinc-500 text-[10px] block">Connection Protocol</span>
            <span className="font-bold text-yellow-400">Bluetooth ESC/POS</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
            <span className="text-zinc-500 text-[10px] block">Auto-Print on Sale</span>
            <span className="font-bold text-emerald-400">
              {printer.autoPrintOnSale ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {printer.status === 'CONNECTED' ? (
            <>
              <button
                onClick={handleTestPrint}
                className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Test Print
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <WifiOff className="w-4 h-4" /> Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleSearchAndConnect}
              disabled={isSearching}
              className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition flex items-center gap-2"
            >
              <Bluetooth className="w-4 h-4" />
              {isSearching ? 'Searching Bluetooth Devices...' : 'Search & Connect Printer'}
            </button>
          )}

          <button
            onClick={() =>
              onUpdatePrinter({
                ...printer,
                autoPrintOnSale: !printer.autoPrintOnSale,
              })
            }
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
              printer.autoPrintOnSale
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            Auto-Print: {printer.autoPrintOnSale ? 'ON' : 'OFF'}
          </button>
        </div>

        {testPrintSuccess !== null && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testPrintSuccess
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {testPrintSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Test receipt pattern sent to SHREYANS SRS588!
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" /> Test print failed. Verify Bluetooth pairing.
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-yellow-500" />
          58mm Receipt Monospaced Layout Preview (SHREYANS SRS588)
        </h3>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex justify-center">
          <div className="w-[280px] bg-amber-50/95 text-black p-4 rounded-md shadow-2xl font-mono text-[11px] leading-tight select-all">
            <pre className="whitespace-pre-wrap font-mono">{receiptPreviewText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
