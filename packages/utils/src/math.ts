export const WAD = 1000000000000000000n;

export const abs = (n: bigint): bigint => (n < 0n ? -n : n);

export const min = (values: bigint[]): bigint =>
  values.reduce((a, b) => (a < b ? a : b));

export const max = (values: bigint[]): bigint =>
  values.reduce((a, b) => (a > b ? a : b));

export class MathSol {
  static max(a: bigint, b: bigint): bigint {
    return a >= b ? a : b;
  }

  static min(a: bigint, b: bigint): bigint {
    return a < b ? a : b;
  }

  static mulDownFixed(a: bigint, b: bigint): bigint {
    const product = a * b;
    return product / WAD;
  }

  static mulUpFixed(a: bigint, b: bigint): bigint {
    const product = a * b;

    if (product === 0n) {
      return 0n;
    }
    return (product - 1n) / WAD + 1n;
  }

  static divDownFixed(a: bigint, b: bigint): bigint {
    if (a === 0n) {
      return 0n;
    }
    const aInflated = a * WAD;
    return aInflated / b;
  }

  static divUpFixed(a: bigint, b: bigint): bigint {
    if (a === 0n) {
      return 0n;
    }
    const aInflated = a * WAD;
    return (aInflated - 1n) / b + 1n;
  }

  static divUp(a: bigint, b: bigint): bigint {
    if (a === 0n) {
      return 0n;
    }
    return 1n + (a - 1n) / b;
  }
}

/**
 * Converts Wei (as BigInt) to Ether (as string)
 * @param wei - BigInt amount in Wei
 * @param decimals - Number of decimal places to show (default: 18)
 * @returns string representation of Ether amount
 */
export function weiToEther(wei: bigint, decimals: number = 18): string {
  if (wei === 0n) return '0';

  // Convert to string and pad with zeros if needed
  let weiStr = wei.toString();
  while (weiStr.length <= decimals) {
    weiStr = '0' + weiStr;
  }

  // Split into whole and decimal parts
  const wholePart = weiStr.slice(0, -decimals) || '0';
  const decimalPart = weiStr.slice(-decimals).replace(/0+$/, '');

  // Combine parts
  return decimalPart ? `${wholePart}.${decimalPart}` : wholePart;
}

/**
 * Converts Ether (as string) to Wei (as BigInt)
 * @param ether - string amount in Ether
 * @returns BigInt amount in Wei
 * @throws Error if input is invalid
 */
export function etherToWei(ether: string): bigint {
  // Validate input
  if (!/^\d*\.?\d*$/.test(ether)) {
    throw new Error('Invalid ether amount');
  }

  const [wholePart = '0', decimalPart = ''] = ether.split('.');

  // Handle decimal part
  let wei = BigInt(wholePart) * 10n ** 18n;

  if (decimalPart) {
    // Pad with zeros if decimal part is less than 18 digits
    const paddedDecimal = decimalPart.padEnd(18, '0').slice(0, 18);
    wei += BigInt(paddedDecimal);
  }

  return wei;
}
