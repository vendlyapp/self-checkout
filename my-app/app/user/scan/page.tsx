'use client'
import HeaderUser from '@/components/navigation/user/HeaderUser';
import QRScanner from '@/components/user/SnanerDash';


export default function ScanPage() {

  return (
    <>
      <HeaderUser isDarkMode={true} />
      <QRScanner/>
    </>
  );
}