import { getAllAdminEvents } from '../api/queries/select';
import { AdminLayout } from '../components/AdminLayout/AdminLayout';

const AdminPanel = async () => {
  const adminEvents = await getAllAdminEvents()
  return (
    <AdminLayout adminEvents={adminEvents}/>
  );
};

export default AdminPanel;
