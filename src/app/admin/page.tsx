import { getAllAdminEvents } from '../api/queries/select';
import { AdminLayout } from '../components/AdminLayout/AdminLayout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AdminPanel = async () => {
  const adminEvents = await getAllAdminEvents()
  return (
    <AdminLayout adminEvents={adminEvents}/>
  );
};

export default AdminPanel;
