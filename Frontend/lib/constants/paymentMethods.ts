/**
 * Métodos de pago predefinidos disponibles para configurar
 * Estos son los métodos que el usuario puede configurar en "Zahlungsarten Einstellungen"
 */

export interface AvailablePaymentMethod {
  code: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  configFields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'email' | 'number';
    required: boolean;
    placeholder?: string;
  }[];
}

export const AVAILABLE_PAYMENT_METHODS: AvailablePaymentMethod[] = [
  {
    code: 'twint',
    name: 'TWINT',
    displayName: 'TWINT',
    icon: '/logo-twint.svg',
    description: 'Zahlungsmethode TWINT einrichten',
    configFields: [
      {
        key: 'phoneNumber',
        label: 'Telefonnummer',
        type: 'text',
        required: true,
        placeholder: '+41 79 123 45 67',
      },
      {
        key: 'merchantName',
        label: 'Händlername (optional)',
        type: 'text',
        required: false,
        placeholder: 'Name deines Geschäfts',
      },
    ],
  },
  {
    code: 'qr-rechnung',
    name: 'QR-Rechnung',
    displayName: 'QR-Rechnung',
    icon: '/qr.svg',
    description: 'Richten Sie die QR-Rechnung ein. Sie benötigen Ihre QR-IBAN von Ihrer Bank sowie Ihre vollständige Rechnungsadresse.',
    configFields: [
      {
        key: 'qrIban',
        label: 'QR-IBAN',
        type: 'text',
        required: true,
        placeholder: 'CH44 3199 9123 0008 8901 2',
      },
      {
        key: 'creditorName',
        label: 'Kontoinhaber',
        type: 'text',
        required: true,
        placeholder: 'Musterfirma AG',
      },
      {
        key: 'creditorStreet',
        label: 'Strasse',
        type: 'text',
        required: true,
        placeholder: 'Musterstrasse',
      },
      {
        key: 'creditorHouseNo',
        label: 'Hausnummer',
        type: 'text',
        required: true,
        placeholder: '7',
      },
      {
        key: 'creditorZip',
        label: 'PLZ',
        type: 'text',
        required: true,
        placeholder: '8001',
      },
      {
        key: 'creditorCity',
        label: 'Ort',
        type: 'text',
        required: true,
        placeholder: 'Zürich',
      },
      {
        key: 'creditorCountry',
        label: 'Land',
        type: 'text',
        required: false,
        placeholder: 'CH',
      },
    ],
  },
  {
    code: 'debit-credit',
    name: 'Debit-/Kreditkarte',
    displayName: 'Debit-/Kreditkarte',
    icon: '/card.svg',
    description: 'Debit- und Kreditkartenzahlung einrichten',
    configFields: [
      {
        key: 'terminalId',
        label: 'Terminal-ID',
        type: 'text',
        required: true,
        placeholder: 'Terminal-Nummer',
      },
      {
        key: 'merchantName',
        label: 'Händlername',
        type: 'text',
        required: true,
        placeholder: 'Name deines Geschäfts',
      },
    ],
  },
  {
    code: 'apple-pay',
    name: 'Apple Pay',
    displayName: 'Apple Pay',
    icon: '/pay.svg',
    description: 'Apple Pay einrichten',
    configFields: [
      {
        key: 'merchantName',
        label: 'Händlername',
        type: 'text',
        required: true,
        placeholder: 'Name deines Geschäfts',
      },
      {
        key: 'contactEmail',
        label: 'Kontakt-E-Mail',
        type: 'email',
        required: true,
        placeholder: 'kontakt@dein-geschaeft.ch',
      },
    ],
  },
  {
    code: 'klarna',
    name: 'Klarna',
    displayName: 'Klarna',
    icon: '/Klarna.svg',
    description: 'Klarna einrichten',
    configFields: [
      {
        key: 'merchantName',
        label: 'Händlername',
        type: 'text',
        required: true,
        placeholder: 'Name deines Geschäfts',
      },
      {
        key: 'contactEmail',
        label: 'Kontakt-E-Mail',
        type: 'email',
        required: true,
        placeholder: 'kontakt@dein-geschaeft.ch',
      },
    ],
  },
];

/**
 * Obtiene un método de pago disponible por su código
 */
export const getAvailablePaymentMethod = (code: string): AvailablePaymentMethod | undefined => {
  return AVAILABLE_PAYMENT_METHODS.find((method) => method.code === code);
};

