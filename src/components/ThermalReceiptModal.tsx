import React, { useState } from 'react';
import type { Sale, Business, PrinterDevice } from '../types/billpro';
import { Printer, CheckCircle2, AlertTriangle, X, Bluetooth } from 'lucide-react';
import { generateThermalReceiptText, generateEscPosBuffer, printerDriver } from '../services/escposPrinter';

interface ThermalReceiptModalProps {
  sale: Sale;
  business: Business;
  printer: PrinterDevice;
  onUpdatePrinter?: (p: PrinterDevice) => void;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  business,
  printer,
  onUpdatePrinter,
  onClose,
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
    } catch (err: any) {
      console.error('Connection attempt failed:', err);
      setErrorMessage(err.message || 'Bluetooth connection failed.');
      if (onUpdatePrinter) {
        onUpdatePrinter({
          ...printer,
          status: 'DISCONNECTED',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrintReceipt = async () => {
    setErrorMessage(null);

    // Strict Connection Check
    if (!printerDriver.isConnected()) {
      setPrintStatus('NOT_CONNECTED');
      setErrorMessage('Printer is NOT turned ON or connected via Bluetooth!');
      return;
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
                {isCurrentlyConnected ? (printerDriver.getConnectedDeviceName() || printer.name) : 'Printer Not Connected'}
              </span>
              <span className="text-[10px] text-zinc-400">
                {isCurrentlyConnected ? 'Ready to print' : 'Turn ON printer & connect Bluetooth'}
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
              {isConnecting ? 'Pairing...' : 'Connect'}
            </button>
          )}
        </div>

        {/* Status Alerts */}
        {printStatus === 'SUCCESS' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-400 flex items-start gap-2.5 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="block font-bold">Bill is sent to printer successfully!</span>
              <span className="text-[11px] text-emerald-300/80 font-normal">
                Check paper roll output on your thermal printer.
              </span>
            </div>
          </div>
        )}

        {(printStatus === 'NOT_CONNECTED' || printStatus === 'FAILED') && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span>{errorMessage || 'Printer is NOT on or connected!'}</span>
                <p className="text-[11px] text-zinc-300 font-normal mt-1">
                  The bill is already safely saved in sales history. Please turn ON your thermal printer, enable Bluetooth on your phone, and connect.
                </p>
              </div>
            </div>

            <button
              onClick={handleConnectPrinter}
              disabled={isConnecting}
              className="w-full py-2 px-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              {isConnecting ? 'Connecting Bluetooth...' : 'Connect Printer & Print Now'}
            </button>
          </div>
        )}

        {/* Monospaced Receipt Preview */}
        <div className="bg-amber-50 text-black p-4 rounded-2xl font-mono text-[11px] leading-snug shadow-inner overflow-x-auto select-all border border-amber-200">
          <pre className="whitespace-pre-wrap font-mono">{receiptText}</pre>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handlePrintReceipt}
            disabled={isPrinting || isConnecting}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 ${
              isCurrentlyConnected
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            {isPrinting
              ? 'Sending Bill to Printer...'
              : isCurrentlyConnected
              ? 'Print Bill to Thermal Printer'
              : 'Printer Not Connected - Click to Check'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
