'use client'
import HeaderUser from '@/components/navigation/user/HeaderUser';
import QRScanner from '@/components/user/SnanerDash';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();

  const handleScanSuccess = (result: string) => {
    console.log('Scanned product:', result);
    // Here you would typically add the product to cart or navigate to product details
    // For now, we'll just show an alert and go back
    alert(`Product scanned: ${result}`);
    router.back();
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    // Handle scan errors appropriately
  };

  return (
    <>
      <HeaderUser isDarkMode={true} />
      <QRScanner 
        onScan={handleScanSuccess}
        onError={handleScanError}
      />
    </>
  );
}