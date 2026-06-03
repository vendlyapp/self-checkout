import ViewProductClient from './ViewProductClient';

export const dynamic = 'force-dynamic';

export default async function ViewProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  return <ViewProductClient productId={productId} />;
}
