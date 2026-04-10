const { z } = require('zod');

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .optional();

const createInvoiceSchema = z.object({
  orderId: z.string().uuid('orderId must be a valid UUID'),
  customerName: optionalTrimmedString,
  customerEmail: z.string().email('customerEmail must be a valid email').optional(),
  customerAddress: optionalTrimmedString,
  customerCity: optionalTrimmedString,
  customerPostalCode: optionalTrimmedString,
  customerPhone: optionalTrimmedString,
  saveCustomerData: z.boolean().optional(),
});

const updateInvoiceSchema = z
  .object({
    customerName: optionalTrimmedString,
    customerEmail: z.string().email('customerEmail must be a valid email').optional(),
    customerAddress: optionalTrimmedString,
    customerCity: optionalTrimmedString,
    customerPostalCode: optionalTrimmedString,
    customerPhone: optionalTrimmedString,
    metadata: z.record(z.any()).optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some((key) => data[key] !== undefined),
    { message: 'At least one field must be provided for update' }
  );

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
};
