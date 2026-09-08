import { getAdminPath, resolveAdminView } from '../components/AdminLayout/adminView';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type AdminIndexProps = {
  searchParams: {
    view?: string;
    id?: string;
  };
};

const AdminIndex = ({ searchParams }: AdminIndexProps) => {
  redirect(getAdminPath(resolveAdminView(searchParams.view ?? null, searchParams.id ?? null)));
};

export default AdminIndex;
