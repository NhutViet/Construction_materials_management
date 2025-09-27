// Utility function to convert numbers to Vietnamese words
const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];

function convertHundreds(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  if (hundred > 0) {
    result += ones[hundred] + ' trăm ';
  }
  
  if (remainder > 0) {
    if (remainder < 10) {
      if (hundred > 0) {
        result += 'lẻ ' + ones[remainder];
      } else {
        result += ones[remainder];
      }
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result += tens[ten];
      if (one > 0) {
        if (one === 5) {
          result += ' lăm';
        } else if (one === 1) {
          result += ' mốt';
        } else {
          result += ' ' + ones[one];
        }
      }
    }
  }
  
  return result.trim();
}

function convertThousands(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  const thousand = Math.floor(num / 1000);
  const remainder = num % 1000;
  
  if (thousand > 0) {
    if (thousand === 1) {
      result += 'một nghìn ';
    } else {
      result += convertHundreds(thousand) + ' nghìn ';
    }
  }
  
  if (remainder > 0) {
    result += convertHundreds(remainder);
  }
  
  return result.trim();
}

function convertMillions(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  const million = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  
  if (million > 0) {
    if (million === 1) {
      result += 'một triệu ';
    } else {
      result += convertHundreds(million) + ' triệu ';
    }
  }
  
  if (remainder > 0) {
    result += convertThousands(remainder);
  }
  
  return result.trim();
}

function convertBillions(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  const billion = Math.floor(num / 1000000000);
  const remainder = num % 1000000000;
  
  if (billion > 0) {
    if (billion === 1) {
      result += 'một tỷ ';
    } else {
      result += convertHundreds(billion) + ' tỷ ';
    }
  }
  
  if (remainder > 0) {
    result += convertMillions(remainder);
  }
  
  return result.trim();
}

export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không';
  if (num < 0) return 'âm ' + numberToVietnameseWords(-num);
  
  if (num < 1000) {
    return convertHundreds(num);
  } else if (num < 1000000) {
    return convertThousands(num);
  } else if (num < 1000000000) {
    return convertMillions(num);
  } else {
    return convertBillions(num);
  }
}

export function formatCurrencyWithWords(amount: number): string {
  const words = numberToVietnameseWords(amount);
  return `${amount.toLocaleString('vi-VN')} VNĐ (${words} đồng)`;
}

export function getShortCurrencyWords(amount: number): string {
  if (amount >= 1000000000) {
    const billions = Math.floor(amount / 1000000000);
    const remainder = Math.floor((amount % 1000000000) / 100000000);
    if (remainder > 0) {
      return `${billions},${remainder} tỷ VNĐ`;
    }
    return `${billions} tỷ VNĐ`;
  } else if (amount >= 1000000) {
    const millions = Math.floor(amount / 1000000);
    const remainder = Math.floor((amount % 1000000) / 100000);
    if (remainder > 0) {
      return `${millions},${remainder} triệu VNĐ`;
    }
    return `${millions} triệu VNĐ`;
  } else if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    return `${thousands} nghìn VNĐ`;
  } else {
    return `${amount} VNĐ`;
  }
}
