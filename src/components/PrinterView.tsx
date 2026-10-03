import React, { useState } from 'react';
import type { PrinterDevice, Business, Sale } from '../types/billpro';
import {
  generateThermalReceiptText,
  generateEscPosBuffer,
  printerDriver,
  printViaBrowserSystem,
  printViaRawBT,
} from '../services/escposPrinter';
import {
  Printer,
  Bluetooth,
  CheckCircle2,
  AlertCircle,
  Unplug,
  Radio,
  FileText,
  Smartphone,
  Info,
} from 'lucide-react';

interface PrinterViewProps {
  printer: PrinterDevice;
  business: Business;
  latestSale?: Sale;
  onUpdatePrinter: (printer: PrinterDevice) => void;
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
  const connectedName = printerDriver.getConnectedDeviceName();
  const isBleSupported = printerDriver.isBluetoothSupported();

  // Sample sale record for test printing
  const sampleSale: Sale = {
    id: 'test-sale',
    businessId: '1',
    invoiceNumber: 'INF-0099',
    customerName: 'Table 4 / Dine-In',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'The Original 12',
        quantity: 2,
        unitPrice: 99,
        discount: 0,
        total: 198,
      },
      {
        id: '2',
        productId: '5',
        productName: 'Chipotle Kick',
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

  const saleToPrint = latestSale || sampleSale;
  const receiptPreviewText = generateThermalReceiptText(saleToPrint, business);

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
        'Please turn ON your printer and click "Connect Bluetooth Printer" first, or use "Test System Print".'
      );
      return;
    }

    try {
      const buffer = generateEscPosBuffer(saleToPrint, business);
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
              <Radio className={`w-6 h-6 ${isConnected ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  {isConnected ? (connectedName || printer.name) : 'No Printer Paired'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isConnected ? 'LIVE CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                58mm Bluetooth ESC/POS Wireless Thermal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 border border-rose-500/20 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Unplug className="w-4 h-4" /> Disconnect
              </button>
            ) : (
              <button
                onClick={handleSearchAndConnect}
                disabled={isSearching}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Bluetooth className="w-4 h-4" />
                {isSearching ? 'Scanning Bluetooth...' : 'Pair & Connect Printer'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-rose-400 block">Printer Error:</span>
              <p className="text-[11px] whitespace-pre-line leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Quick Test Printing Actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestPrint}
            className={`px-5 py-3 rounded-2xl font-black text-xs transition active:scale-95 flex items-center gap-2 ${
              isConnected
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            Test Bluetooth ESC/POS Print
          </button>

          <button
            onClick={() => printViaBrowserSystem(sampleSale, business)}
            className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-yellow-400" />
            Test System Thermal Print
          </button>

          <button
            onClick={() => printViaRawBT(sampleSale, business)}
            className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            Test RawBT (Android)
          </button>

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
            Auto-Print on checkout: {printer.autoPrintOnSale ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Home Screen & Android PWA Bluetooth Guide */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Info className="w-4 h-4" />
            <span>Home Screen &amp; Mobile Bluetooth Printing Guide:</span>
          </div>
          <ul className="text-zinc-300 text-[11px] space-y-1.5 list-disc list-inside">
            <li>
              <strong>Browser Status:</strong> Web Bluetooth is{' '}
              <span className={isBleSupported ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {isBleSupported ? 'Supported on this device' : 'Limited in this browser'}
              </span>
              . On Android, Google Chrome is recommended.
            </li>
            <li>
              <strong>Installed PWA on Home Screen:</strong> Ensure Bluetooth and Nearby Devices permissions are enabled for your browser in Android Settings.
            </li>
            <li>
              <strong>Auto-Reconnect:</strong> Once you pair your printer once, the POS remembers it and automatically attempts silent re-connection when you open the app from your home screen.
            </li>
            <li>
              <strong>Zero-Friction Fallback:</strong> If your printer is connected via Bluetooth settings or USB, you can use the <strong>System Thermal Print</strong> or <strong>RawBT</strong> buttons to print bills instantly without BLE pairing!
            </li>
          </ul>
        </div>
      </div>

      {/* 58mm Thermal Monospaced Paper Preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-yellow-500" />
          58mm Thermal Receipt Preview (Shreyans SRS588 format)
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
