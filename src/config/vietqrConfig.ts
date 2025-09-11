export interface VietQRBank {
  code: string;
  name: string;
}

export interface VietQRConfig {
  defaultAccount: {
    accountNo: string;
    accountName: string;
    bankCode: string;
  };
  supportedBanks: VietQRBank[];
}

export interface BankAccountInfo {
  accountNo: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

const VIETQR_CONFIG: VietQRConfig = {
  defaultAccount: {
    accountNo: '108879382193',
    accountName: 'Hoàng Công Nhựt Việt',
    bankCode: 'VCB', // Vietcombank
  },
  supportedBanks: [
    // Các ngân hàng chính hỗ trợ QR code (transferSupported: 1)
    { code: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)' },
    { code: 'ICB', name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)' },
    { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)' },
    { code: 'VBA', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)' },
    { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông (OCB)' },
    { code: 'MB', name: 'Ngân hàng TMCP Quân đội (MBBank)' },
    { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)' },
    { code: 'ACB', name: 'Ngân hàng TMCP Á Châu (ACB)' },
    { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)' },
    { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong (TPBank)' },
    { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)' },
    { code: 'HDB', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh (HDBank)' },
    { code: 'VCCB', name: 'Ngân hàng TMCP Bản Việt (VietCapitalBank)' },
    { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn (SCB)' },
    { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)' },
    { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)' },
    { code: 'EIB', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam (Eximbank)' },
    { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải (MSB)' },
    { code: 'CAKE', name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank' },
    { code: 'Ubank', name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank' },
    { code: 'SGICB', name: 'Ngân hàng TMCP Sài Gòn Công Thương (SaigonBank)' },
    { code: 'BAB', name: 'Ngân hàng TMCP Bắc Á (BacABank)' },
    { code: 'PVCB', name: 'Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)' },
    { code: 'PVDB', name: 'Ngân hàng TMCP Đại Chúng Việt Nam Ngân hàng số (PVcomBank Pay)' },
    { code: 'MBV', name: 'Ngân hàng TNHH MTV Việt Nam Hiện Đại (MBV)' },
    { code: 'NCB', name: 'Ngân hàng TMCP Quốc Dân (NCB)' },
    { code: 'SHBVN', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam (ShinhanBank)' },
    { code: 'ABB', name: 'Ngân hàng TMCP An Bình (ABBANK)' },
    { code: 'VAB', name: 'Ngân hàng TMCP Việt Á (VietABank)' },
    { code: 'NAB', name: 'Ngân hàng TMCP Nam Á (NamABank)' },
    { code: 'PGB', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển (PGBank)' },
    { code: 'VIETBANK', name: 'Ngân hàng TMCP Việt Nam Thương Tín (VietBank)' },
    { code: 'BVB', name: 'Ngân hàng TMCP Bảo Việt (BaoVietBank)' },
    { code: 'SEAB', name: 'Ngân hàng TMCP Đông Nam Á (SeABank)' },
    { code: 'COOPBANK', name: 'Ngân hàng Hợp tác xã Việt Nam (COOPBANK)' },
    { code: 'LPB', name: 'Ngân hàng TMCP Lộc Phát Việt Nam (LPBank)' },
    { code: 'KLB', name: 'Ngân hàng TMCP Kiên Long (KienLongBank)' },
    { code: 'KBank', name: 'Ngân hàng Đại chúng TNHH Kasikornbank (KBank)' },
    { code: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam (CIMB)' },
    { code: 'WVN', name: 'Ngân hàng TNHH MTV Woori Việt Nam (Woori)' },
    
    // Các tên gọi khác để mapping
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'ICB', name: 'VietinBank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'VBA', name: 'Agribank' },
    { code: 'OCB', name: 'OCB' },
    { code: 'MB', name: 'MBBank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'STB', name: 'Sacombank' },
    { code: 'HDB', name: 'HDBank' },
    { code: 'VCCB', name: 'VietCapitalBank' },
    { code: 'SCB', name: 'SCB' },
    { code: 'VIB', name: 'VIB' },
    { code: 'SHB', name: 'SHB' },
    { code: 'EIB', name: 'Eximbank' },
    { code: 'MSB', name: 'MSB' },
    { code: 'SGICB', name: 'SaigonBank' },
    { code: 'BAB', name: 'BacABank' },
    { code: 'PVCB', name: 'PVcomBank' },
    { code: 'NCB', name: 'NCB' },
    { code: 'SHBVN', name: 'ShinhanBank' },
    { code: 'ABB', name: 'ABBANK' },
    { code: 'VAB', name: 'VietABank' },
    { code: 'NAB', name: 'NamABank' },
    { code: 'PGB', name: 'PGBank' },
    { code: 'VIETBANK', name: 'VietBank' },
    { code: 'BVB', name: 'BaoVietBank' },
    { code: 'SEAB', name: 'SeABank' },
    { code: 'COOPBANK', name: 'COOPBANK' },
    { code: 'LPB', name: 'LPBank' },
    { code: 'KLB', name: 'KienLongBank' },
    { code: 'KBank', name: 'KBank' },
    { code: 'CIMB', name: 'CIMB' },
    { code: 'WVN', name: 'Woori' },
  ],
};

// Helper function to get bank info from user profile
export const getBankInfoFromUser = (user: { bankNumber?: string; bankName?: string; fullname?: string }): BankAccountInfo => {
  if (user?.bankNumber && user?.bankName) {
    // Normalize bank name for better matching
    const normalizedUserBankName = user.bankName.toLowerCase().trim();
    
    // Find bank code from bank name with improved matching logic
    const bankKeywords = [
      { keywords: ['vietcombank', 'vcb'], code: 'VCB' },
      { keywords: ['vietinbank', 'icb', 'công thương'], code: 'ICB' },
      { keywords: ['bidv', 'đầu tư và phát triển'], code: 'BIDV' },
      { keywords: ['agribank', 'vba', 'nông nghiệp'], code: 'VBA' },
      { keywords: ['techcombank', 'tcb', 'kỹ thương'], code: 'TCB' },
      { keywords: ['acb', 'á châu'], code: 'ACB' },
      { keywords: ['vpbank', 'vpb', 'thịnh vượng'], code: 'VPB' },
      { keywords: ['tpbank', 'tpb', 'tiên phong'], code: 'TPB' },
      { keywords: ['sacombank', 'stb', 'sài gòn thương tín'], code: 'STB' },
      { keywords: ['hdbank', 'hdb', 'phát triển thành phố'], code: 'HDB' },
      { keywords: ['mbbank', 'mb', 'quân đội'], code: 'MB' },
      { keywords: ['ocb', 'phương đông'], code: 'OCB' },
      { keywords: ['vib', 'quốc tế'], code: 'VIB' },
      { keywords: ['scb', 'sài gòn'], code: 'SCB' },
      { keywords: ['eximbank', 'eib', 'xuất nhập khẩu'], code: 'EIB' },
      { keywords: ['msb', 'hàng hải'], code: 'MSB' },
      { keywords: ['shb', 'sài gòn - hà nội'], code: 'SHB' },
      { keywords: ['ncb', 'quốc dân'], code: 'NCB' },
      { keywords: ['vab', 'việt á'], code: 'VAB' },
      { keywords: ['nab', 'nam á'], code: 'NAB' },
      { keywords: ['pgb', 'xăng dầu'], code: 'PGB' },
      { keywords: ['vietbank', 'thương tín'], code: 'VIETBANK' },
      { keywords: ['bvb', 'bảo việt'], code: 'BVB' },
      { keywords: ['seab', 'đông nam á'], code: 'SEAB' },
      { keywords: ['lpbank', 'lpb', 'lộc phát'], code: 'LPB' },
      { keywords: ['klb', 'kiên long'], code: 'KLB' },
      { keywords: ['cimb', 'cimb việt nam'], code: 'CIMB' },
      { keywords: ['woori', 'wvn'], code: 'WVN' },
      { keywords: ['kbank', 'kasikornbank'], code: 'KBank' },
      { keywords: ['cake', 'ubank', 'vietcapitalbank', 'vccb'], code: 'VCCB' },
      { keywords: ['saigonbank', 'sgicb'], code: 'SGICB' },
      { keywords: ['bacabank', 'bab'], code: 'BAB' },
      { keywords: ['pvcombank', 'pvcb'], code: 'PVCB' },
      { keywords: ['shinhanbank', 'shbvn'], code: 'SHBVN' },
      { keywords: ['abbank', 'abb'], code: 'ABB' },
      { keywords: ['coopbank', 'hợp tác xã'], code: 'COOPBANK' }
    ];
    
    // First try exact match
    let bank = VIETQR_CONFIG.supportedBanks.find(b => 
      b.name.toLowerCase() === normalizedUserBankName
    );
    
    // If no exact match, try keyword matching
    if (!bank) {
      for (const bankGroup of bankKeywords) {
        if (bankGroup.keywords.some(keyword => 
          normalizedUserBankName.includes(keyword)
        )) {
          // Find the bank with the matching code
          bank = VIETQR_CONFIG.supportedBanks.find(b => b.code === bankGroup.code);
          if (bank) break;
        }
      }
    }
    
    
    return {
      accountNo: user.bankNumber,
      accountName: user.fullname || 'Tài khoản',
      bankCode: bank?.code || 'VCB', // Default to Vietcombank if not found
      bankName: user.bankName
    };
  }
  
  // Fallback to default config
  return {
    accountNo: VIETQR_CONFIG.defaultAccount.accountNo,
    accountName: VIETQR_CONFIG.defaultAccount.accountName,
    bankCode: VIETQR_CONFIG.defaultAccount.bankCode,
    bankName: VIETQR_CONFIG.supportedBanks.find(bank => bank.code === VIETQR_CONFIG.defaultAccount.bankCode)?.name || 'Vietcombank'
  };
};

export default VIETQR_CONFIG;
