// Indian GST & Currency Calculation Engine

export interface GSTCalculationResult {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

export function calculateLineGST(
  quantity: number,
  rate: number,
  discount: number = 0,
  gstRate: number = 5,
  isInterState: boolean = false
): GSTCalculationResult {
  const gross = quantity * rate;
  const taxableAmount = Math.max(0, gross - discount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = Number(((taxableAmount * gstRate) / 100).toFixed(2));
  } else {
    const halfRate = gstRate / 2;
    cgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
    sgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
  }

  const totalTax = Number((cgstAmount + sgstAmount + igstAmount).toFixed(2));
  const totalAmount = Number((taxableAmount + totalTax).toFixed(2));

  return {
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    totalAmount
  };
}

// Convert amount in Indian Number format (e.g. 1,45,200.50)
export function formatINR(val: number): string {
  if (isNaN(val)) return '₹0.00';
  return '₹' + Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

// Convert numbers into Indian Rupees in words
export function numberToWordsINR(amount: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const num = Math.floor(amount);
  const paise = Math.round((amount - num) * 100);

  if (num === 0 && paise === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  let words = inWords(num).trim() + ' Rupees';
  if (paise > 0) {
    words += ' and ' + inWords(paise).trim() + ' Paise';
  }
  return words + ' Only';
}
