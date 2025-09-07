import { useState, useEffect } from 'react';

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

interface BanksResponse {
  code: string;
  desc: string;
  data: Bank[];
}

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBanks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const data: BanksResponse = await response.json();
      
      if (data.code === '00') {
        setBanks(data.data);
      } else {
        setError('Không thể tải danh sách ngân hàng');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách ngân hàng');
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return { banks, loading, error, refetch: fetchBanks };
};
