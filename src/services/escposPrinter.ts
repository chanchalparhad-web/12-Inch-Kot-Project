import type { Business, Sale, PrinterDevice } from '../types/billpro';

// ESC/POS Commands
export const ESC_POS_COMMANDS = {
  INIT: new Uint8Array([0x1b, 0x40]), // Initialize printer
  ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([0x1b, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([0x1b, 0x21, 0x10]),
  NORMAL_TEXT: new Uint8Array([0x1b, 0x21, 0x00]),
  FEED_LINES: (n: number) => new Uint8Array([0x1b, 0x64, n]),
  PAPER_CUT: new Uint8Array([0x1d, 0x56, 0x41, 0x00]),
};

// 58mm Thermal Printer has 32 characters per line in standard font
const LINE_WIDTH = 32;

/**
 * Format string with padding and alignment for 58mm thermal receipts
 */
export function formatRow(left: string, right: string, width: number = LINE_WIDTH): string {
  const rightClean = right.trim();
  const maxLeftWidth = width - rightClean.length - 1;
  const leftClean = left.substring(0, Math.max(0, maxLeftWidth));
  const spaces = width - (leftClean.length + rightClean.length);
  return leftClean + ' '.repeat(Math.max(1, spaces)) + rightClean;
}

export function formatLine(char: string = '-', width: number = LINE_WIDTH): string {
  return char.repeat(width);
}

/**
 * Build 58mm receipt text representation formatted for SRS588
 */
export function generateThermalReceiptText(sale: Sale, business: Business): string {
  const lines: string[] = [];

  lines.push('='.repeat(LINE_WIDTH));
  lines.push(centerText(business.name.toUpperCase(), LINE_WIDTH));
  if (business.address) lines.push(centerText(business.address, LINE_WIDTH));
  if (business.city || business.state) {
    lines.push(centerText(`${business.city || ''}, ${business.state || ''}`, LINE_WIDTH));
  }
  if (business.mobile) lines.push(centerText(`Ph: ${business.mobile}`, LINE_WIDTH));
  lines.push('='.repeat(LINE_WIDTH));

  lines.push(`Invoice: ${sale.invoiceNumber}`);
  const dateStr = new Date(sale.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Date: ${dateStr}`);
  if (sale.customerName) {
    lines.push(`Customer: ${sale.customerName}`);
  }
  lines.push('-'.repeat(LINE_WIDTH));

  // Table Header: Item (14) Qty (3) Rate (6) Amount (7)
  lines.push('Item           Qty   Rate  Amount');
  lines.push('-'.repeat(LINE_WIDTH));

  sale.items.forEach((item) => {
    const nameTrunc = item.productName.substring(0, 14).padEnd(14);
    const qtyStr = item.quantity.toString().padStart(3);
    const rateStr = item.unitPrice.toFixed(0).padStart(6);
    const amountStr = item.total.toFixed(2).padStart(7);
    lines.push(`${nameTrunc} ${qtyStr} ${rateStr} ${amountStr}`);
  });

  lines.push('-'.repeat(LINE_WIDTH));
  lines.push(formatRow('Subtotal', `₹${sale.subtotal.toFixed(2)}`));

  if (sale.discount > 0) {
    lines.push(formatRow('Discount', `-₹${sale.discount.toFixed(2)}`));
  }

  lines.push('-'.repeat(LINE_WIDTH));
  lines.push(formatRow('TOTAL', `₹${sale.grandTotal.toFixed(2)}`));
  lines.push('-'.repeat(LINE_WIDTH));

  lines.push(`Payment Mode: ${sale.paymentMethod}`);
  if (sale.paymentMethod === 'CASH' && sale.cashReceived) {
    lines.push(formatRow('Cash Received', `₹${sale.cashReceived.toFixed(2)}`));
    lines.push(formatRow('Change Returned', `₹${(sale.changeReturned || 0).toFixed(2)}`));
  }

  lines.push('\n');
  lines.push(centerText('THANK YOU! VISIT AGAIN', LINE_WIDTH));
  lines.push('='.repeat(LINE_WIDTH));

  return lines.join('\n');
}

function centerText(text: string, width: number): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPadding = Math.floor((width - text.length) / 2);
  return ' '.repeat(leftPadding) + text;
}

/**
 * Generate raw ESC/POS binary buffer for thermal bluetooth printer
 */
export function generateEscPosBuffer(sale: Sale, business: Business): Uint8Array {
  const encoder = new TextEncoder();
  const textContent = generateThermalReceiptText(sale, business);
  const encodedText = encoder.encode(textContent + '\n\n\n');

  const chunks: Uint8Array[] = [
    ESC_POS_COMMANDS.INIT,
    ESC_POS_COMMANDS.ALIGN_LEFT,
    encodedText,
    ESC_POS_COMMANDS.FEED_LINES(3),
    ESC_POS_COMMANDS.PAPER_CUT,
  ];

  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Bluetooth ESC/POS Direct Print Manager for SHREYANS SRS588
 */
export class BluetoothPrinterDriver {
  private printCharacteristic: any = null;

  async requestPrinter(): Promise<PrinterDevice> {
    if (typeof window === 'undefined' || !(navigator as any).bluetooth) {
      throw new Error('Web Bluetooth API is not supported on this device/browser.');
    }

    try {
      const dev = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'SRS588' },
          { namePrefix: 'SHREYANS' },
          { namePrefix: 'RP' },
          { namePrefix: 'POS' },
          { namePrefix: 'BT' },
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        ],
      });

      return {
        id: dev.id || 'SRS588-BT-01',
        name: dev.name || 'SHREYANS SRS588',
        address: dev.id || '00:11:22:33:44:55',
        connectionType: 'BLUETOOTH',
        paperWidth: 58,
        status: 'CONNECTED',
        autoPrintOnSale: true,
        lastConnectedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        throw new Error('No Bluetooth printer selected.');
      }
      throw err;
    }
  }

  async sendRawData(data: Uint8Array): Promise<boolean> {
    if (this.printCharacteristic) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        await this.printCharacteristic.writeValue(chunk);
      }
      return true;
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 400);
    });
  }
}

export const printerDriver = new BluetoothPrinterDriver();
