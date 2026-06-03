import CustomerDetailClient from './CustomerDetailClient';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: customerId } = await params;
  return <CustomerDetailClient customerId={customerId} />;
}
