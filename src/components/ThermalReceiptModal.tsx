import React, { useState } from 'react';
import type { Sale, Business, PrinterDevice } from '../types/billpro';
import {
  generateThermalReceiptText,
  generateEscPosBuffer,
  printerDriver,
  printViaBrowserSystem,
  printViaRawBT,
  shareReceipt,
} from '../services/escposPrinter';
import { Printer, CheckCircle2, AlertTriangle, X, Bluetooth, Share2, Smartphone } from 'lucide-react';

interface ThermalReceiptModalProps {
  sale: Sale;
  business: Business;
  printer: PrinterDevice;
  onClose: () => void;
  onUpdatePrinter?: (printer: PrinterDevice) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  business,
  printer,
  onClose,
  onUpdatePrinter,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED' | 'NOT_CONNECTED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const receiptText = generateThermalReceiptText(sale, business);
  const isCurrentlyConnected = printerDriver.isConnected();

  const handleConnectPrinter = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const dev = await printerDriver.requestPrinter();
      if (onUpdatePrinter) {
        onUpdatePrinter(dev);
      }
      setPrintStatus('IDLE');
      return dev;
    } catch (err: any) {
      console.error('Connection attempt failed:', err);
      setErrorMessage(err.message || 'Bluetooth connection failed.');
      if (onUpdatePrinter) {
        onUpdatePrinter({
          ...printer,
          status: 'DISCONNECTED',
        });
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrintReceipt = async () => {
    setErrorMessage(null);

    // If not connected, attempt connection right away
    if (!printerDriver.isConnected()) {
      setIsConnecting(true);
      try {
        const dev = await handleConnectPrinter();
        if (!dev) return;
      } catch {
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setIsPrinting(true);
    setPrintStatus('IDLE');
    try {
      const buffer = generateEscPosBuffer(sale, business);
      await printerDriver.sendRawData(buffer);
      setPrintStatus('SUCCESS');
    } catch (err: any) {
      console.error('Printer dispatch error:', err);
      setPrintStatus('FAILED');
      setErrorMessage(err.message || 'Failed to send data to printer.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Invoice Receipt</h3>
              <p className="text-[11px] text-zinc-400">
                Invoice #{sale.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Printer Connection Status Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCurrentlyConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <div>
              <span className="font-bold text-white block">
                {isCurrentlyConnected ? (printerDriver.getConnectedDeviceName() || printer.name) : 'Bluetooth Not Connected'}
              </span>
              <span className="text-[10px] text-zinc-400">
                {isCurrentlyConnected ? 'Direct ESC/POS Ready' : 'Turn ON printer & connect'}
              </span>
            </div>
          </div>

          {!isCurrentlyConnected && (
            <button
              onClick={handleConnectPrinter}
              disabled={isConnecting}
              className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 shadow-md shadow-yellow-500/20 transition active:scale-95"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>

        {/* Status Alerts */}
        {printStatus === 'SUCCESS' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-400 flex items-start gap-2.5 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="block font-bold">Bill sent to thermal printer successfully!</span>
              <span className="text-[11px] text-emerald-300/80 font-normal">
                Check paper roll output on your thermal printer.
              </span>
            </div>
          </div>
        )}

        {(printStatus === 'NOT_CONNECTED' || printStatus === 'FAILED' || errorMessage) && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span>{errorMessage || 'Printer connection required'}</span>
                <p className="text-[10px] text-zinc-300 font-normal mt-1">
                  You can connect Bluetooth directly, or use the 1-Click System Print button below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monospaced Receipt Preview */}
        <div className="bg-amber-50 text-black p-4 rounded-2xl font-mono text-[11px] leading-snug shadow-inner overflow-x-auto select-all border border-amber-200">
          <pre className="whitespace-pre-wrap font-mono">{receiptText}</pre>
        </div>

        {/* Printing Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Main Direct Bluetooth Print */}
          <button
            onClick={handlePrintReceipt}
            disabled={isPrinting || isConnecting}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-xs shadow-lg bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isCurrentlyConnected ? <Printer className="w-4 h-4" /> : <Bluetooth className="w-4 h-4" />}
            {isPrinting
              ? 'Sending Bill to Printer...'
              : isConnecting
              ? 'Connecting Bluetooth...'
              : isCurrentlyConnected
              ? 'Print via Bluetooth (ESC/POS)'
              : 'Connect & Print via Bluetooth'}
          </button>

          {/* Universal System Print & RawBT Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => printViaBrowserSystem(sale, business)}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition"
              title="Prints using system thermal dialog (Works on any printer: Bluetooth, USB, WiFi)"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
              System Print
            </button>

            <button
              onClick={() => printViaRawBT(sale, business)}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition"
              title="Print directly on Android to paired Bluetooth printer via RawBT"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              RawBT Android
            </button>
          </div>

          {/* WhatsApp Share & Close */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => shareReceipt(sale, business)}
              className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share / WhatsApp
            </button>

            <button
              onClick={onClose}
              className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
