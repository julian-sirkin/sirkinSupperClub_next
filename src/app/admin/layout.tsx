import { AdminLayout } from '../components/AdminLayout/AdminLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
