export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='container mx-auto py-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin Dashboard</h1>
      {children}
    </div>
  );
}
