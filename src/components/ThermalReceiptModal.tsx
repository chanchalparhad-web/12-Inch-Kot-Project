import React, { useState } from 'react';
import type { Sale, Business, PrinterDevice } from '../types/billpro';
import { Printer, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { generateThermalReceiptText, generateEscPosBuffer, printerDriver } from '../services/escposPrinter';

interface ThermalReceiptModalProps {
  sale: Sale;
  business: Business;
  printer: PrinterDevice;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  business,
  onClose,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  const receiptText = generateThermalReceiptText(sale, business);

  const handlePrintReceipt = async () => {
    setIsPrinting(true);
    setPrintStatus('IDLE');
    try {
      const buffer = generateEscPosBuffer(sale, business);
      await printerDriver.sendRawData(buffer);
      setPrintStatus('SUCCESS');
    } catch (err) {
      console.error('Printer dispatch error:', err);
      // Rule 8: Sale is ALREADY saved safely. Printer error is caught gracefully.
      setPrintStatus('FAILED');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-white text-base">Invoice Receipt</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {printStatus === 'FAILED' && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              Bill saved, but printing failed.
            </div>
            <p className="text-[11px] text-zinc-300">
              The sale and payment were recorded successfully. Check Bluetooth printer connection and retry.
            </p>
            <button
              onClick={handlePrintReceipt}
              disabled={isPrinting}
              className="w-full py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Print
            </button>
          </div>
        )}

        {printStatus === 'SUCCESS' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Receipt sent to SHREYANS SRS588!
          </div>
        )}

        <div className="bg-amber-50 text-black p-4 rounded-xl font-mono text-[11px] leading-snug shadow-inner overflow-x-auto select-all border border-amber-200">
          <pre className="whitespace-pre-wrap font-mono">{receiptText}</pre>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={handlePrintReceipt}
            disabled={isPrinting}
            className="w-full py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? 'Printing to SRS588...' : 'Print Bill (SHREYANS SRS588)'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
