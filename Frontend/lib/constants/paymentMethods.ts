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
    name: 'QR Rechnung',
    displayName: 'QR Rechnung',
    icon: '/qr.svg',
    description: 'QR Rechnung einrichten',
    configFields: [
      {
        key: 'iban',
        label: 'IBAN',
        type: 'text',
        required: true,
        placeholder: 'CH93 0076 2011 6238 5295 7',
      },
      {
        key: 'accountName',
        label: 'Kontoinhaber',
        type: 'text',
        required: true,
        placeholder: 'Name des Kontoinhabers',
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

