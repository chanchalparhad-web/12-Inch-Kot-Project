import React, { useState } from 'react';
import type { PrinterDevice, Business, Sale } from '../types/billpro';
import {
  Printer,
  Bluetooth,
  CheckCircle2,
  AlertTriangle,
  FileText,
  WifiOff,
  Smartphone,
  Radio,
} from 'lucide-react';
import {
  printerDriver,
  generateThermalReceiptText,
  generateEscPosBuffer,
} from '../services/escposPrinter';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isConnected = printerDriver.isConnected();

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
        productName: 'The Original 12',
        quantity: 2,
        unitPrice: 99,
        discount: 0,
        total: 198,
      },
      {
        id: '2',
        productId: 'p2',
        productName: 'Cheese Blast',
        quantity: 1,
        unitPrice: 119,
        discount: 0,
        total: 119,
      },
    ],
    subtotal: 317,
    discount: 0,
    grandTotal: 317,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    createdAt: new Date().toISOString(),
  };

  const receiptPreviewText = generateThermalReceiptText(sampleSale, business);

  const handleSearchAndConnect = async () => {
    setIsSearching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const device = await printerDriver.requestPrinter();
      onUpdatePrinter(device);
      setSuccessMessage(`Successfully paired and connected to ${device.name}!`);
    } catch (err: any) {
      console.error('Bluetooth connection failed:', err);
      setErrorMessage(
        err.message || 'Could not connect to printer. Please ensure printer is ON and Bluetooth is enabled.'
      );
      onUpdatePrinter({
        ...printer,
        status: 'DISCONNECTED',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDisconnect = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    await printerDriver.disconnect();
    onUpdatePrinter({
      ...printer,
      status: 'DISCONNECTED',
    });
    setSuccessMessage('Printer disconnected.');
  };

  const handleTestPrint = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!printerDriver.isConnected()) {
      setErrorMessage(
        'Printer is NOT turned ON or connected!\n' +
        'Please turn ON your printer and click "Connect Printer" first.'
      );
      return;
    }

    try {
      const buffer = generateEscPosBuffer(sampleSale, business);
      await printerDriver.sendRawData(buffer);
      setSuccessMessage('Test print bill sent to printer successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to print. Check printer power & paper roll.');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-1 sm:px-0">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Printer className="w-5 h-5 text-yellow-500" />
          Bluetooth Thermal Printer (SHREYANS SRS588)
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Real-time Web Bluetooth pairing &amp; 58mm ESC/POS hardware control.
        </p>
      </div>

      {/* Main Connection Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              <Printer className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">
                {isConnected ? (printerDriver.getConnectedDeviceName() || printer.name) : 'No Printer Connected'}
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Radio className="w-3.5 h-3.5 text-yellow-500" />
                58mm Bluetooth ESC/POS Wireless Thermal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {isConnected ? 'PRINTER ONLINE' : 'DISCONNECTED / OFF'}
            </span>
          </div>
        </div>

        {/* Device Information Grid (Only active details when connected) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <span className="text-zinc-500 text-[10px] block font-medium">Model</span>
            <span className="font-bold text-white text-xs sm:text-sm">SHREYANS SRS588</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <span className="text-zinc-500 text-[10px] block font-medium">Paper Width</span>
            <span className="font-bold text-white text-xs sm:text-sm">58mm (32 chars)</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <span className="text-zinc-500 text-[10px] block font-medium">Bluetooth GATT</span>
            <span className="font-bold text-yellow-400 text-xs sm:text-sm">
              {isConnected ? 'Active & Bound' : 'Not Connected'}
            </span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <span className="text-zinc-500 text-[10px] block font-medium">Auto-Print</span>
            <span className="font-bold text-emerald-400 text-xs sm:text-sm">
              {printer.autoPrintOnSale ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Status messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold block text-rose-400">Connection or Print Warning</span>
              <p className="text-[11px] whitespace-pre-line mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {isConnected ? (
            <>
              <button
                onClick={handleTestPrint}
                className="px-5 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition active:scale-95 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Send Test Bill to Printer
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-zinc-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
              >
                <WifiOff className="w-4 h-4" /> Disconnect Printer
              </button>
            </>
          ) : (
            <button
              onClick={handleSearchAndConnect}
              disabled={isSearching}
              className="px-6 py-3.5 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs sm:text-sm shadow-xl shadow-yellow-500/25 transition active:scale-95 flex items-center gap-2.5"
            >
              <Bluetooth className="w-4 h-4 stroke-[2.5]" />
              {isSearching ? 'Opening Bluetooth Picker...' : 'Connect Bluetooth Printer'}
            </button>
          )}

          <button
            onClick={() =>
              onUpdatePrinter({
                ...printer,
                autoPrintOnSale: !printer.autoPrintOnSale,
              })
            }
            className={`px-4 py-3 rounded-2xl text-xs font-semibold border transition active:scale-95 ${
              printer.autoPrintOnSale
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            Auto-Print after checkout: {printer.autoPrintOnSale ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Phone / Mobile Bluetooth Guide */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Smartphone className="w-4 h-4" />
            <span>How to connect on your Phone:</span>
          </div>
          <ul className="text-zinc-300 text-[11px] space-y-1 list-disc list-inside">
            <li>Turn <strong>ON</strong> your thermal printer power switch (check green/blue light).</li>
            <li>Turn <strong>ON</strong> Bluetooth on your Android phone or iPhone.</li>
            <li>Tap <strong>Connect Bluetooth Printer</strong> above. When the browser prompts permission, select <strong>SRS588 / Thermal Printer</strong> and tap <strong>Pair</strong>.</li>
            <li>Once connected, the bill will print directly to your physical printer every time!</li>
          </ul>
        </div>
      </div>

      {/* 58mm Thermal Monospaced Paper Preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-yellow-500" />
          58mm Receipt Monospaced Layout Preview
        </h3>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex justify-center">
          <div className="w-[280px] bg-amber-50 text-black p-4 rounded-xl shadow-2xl font-mono text-[11px] leading-tight select-all border border-amber-200">
            <pre className="whitespace-pre-wrap font-mono">{receiptPreviewText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
