import { getAllAdminEvents } from '../../api/queries/select';
import { AdminEventOrganizedList } from '../../components/AdminEvent/AdminEventOrganizedList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AdminEventsPage = async () => {
  const events = await getAllAdminEvents();

  if (!events || events.length === 0) {
    return (
      <div className="text-center p-8 text-white">
        No events found. Try syncing events first.
      </div>
    );
  }

  return <AdminEventOrganizedList events={events} />;
};

export default AdminEventsPage;
