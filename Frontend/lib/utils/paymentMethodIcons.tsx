import {
  Coins,
  CreditCard,
  QrCode,
  Smartphone,
  Wallet,
  Banknote,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

/**
 * Mapa de nombres de iconos a componentes de iconos de lucide-react
 */
export const paymentMethodIconMap: Record<string, LucideIcon> = {
  Smartphone,
  CreditCard,
  QrCode,
  Coins,
  Wallet,
  Banknote,
  // Aliases comunes
  'smartphone': Smartphone,
  'credit-card': CreditCard,
  'qr-code': QrCode,
  'coins': Coins,
  'wallet': Wallet,
  'banknote': Banknote,
};

/**
 * Verifica si el icono es un SVG (ruta de archivo)
 */
export const isSvgIcon = (iconName: string | null | undefined): boolean => {
  if (!iconName) return false;
  return iconName.startsWith('/') && iconName.endsWith('.svg');
};

/**
 * Obtiene un componente de icono basado en el nombre del icono
 * @param iconName - Nombre del icono (puede ser una ruta SVG o el nombre del componente de lucide-react)
 * @returns Componente de icono de lucide-react, componente SVG, o Smartphone por defecto
 */
export const getPaymentMethodIcon = (iconName: string | null | undefined): LucideIcon | React.ComponentType<{ className?: string; width?: number; height?: number }> => {
  if (!iconName) {
    return Smartphone; // Icono por defecto
  }
  
  // Si es una ruta SVG, retornar un componente que renderice el SVG
  if (isSvgIcon(iconName)) {
    const SvgIconComponent = ({ className, width = 24, height = 24 }: { className?: string; width?: number; height?: number }) => (
      <Image 
        src={iconName} 
        alt="Payment method icon" 
        width={width} 
        height={height}
        className={className}
      />
    );
    SvgIconComponent.displayName = 'SvgIconComponent';
    return SvgIconComponent;
  }
  
  // Si es un icono de lucide-react, retornarlo
  return paymentMethodIconMap[iconName] || Smartphone;
};

/**
 * Renderiza el icono del método de pago (puede ser SVG o icono de lucide-react)
 */
export const renderPaymentMethodIcon = (
  iconName: string | null | undefined,
  className?: string,
  width: number = 24,
  height: number = 24
): React.ReactNode => {
  const Icon = getPaymentMethodIcon(iconName);
  
  if (isSvgIcon(iconName)) {
    return <Icon className={className} width={width} height={height} />;
  }
  
  return <Icon className={className} width={width} height={height} />;
};

