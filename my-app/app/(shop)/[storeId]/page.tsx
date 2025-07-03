interface StorePageProps {
  params: Promise<{
    storeId: string;
  }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeId } = await params;
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Shop</h1>
          <p className="text-muted-foreground">Store ID: {storeId}</p>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <p className="text-center text-muted-foreground">
            Shop-Seite wird implementiert
          </p>
        </div>
      </div>
    </div>
  );
}
