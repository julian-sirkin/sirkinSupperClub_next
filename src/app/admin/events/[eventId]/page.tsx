import { AdminEvent } from '../../../components/AdminEvent/AdminEvent';
import { parseAdminRecordId } from '../../../components/AdminLayout/adminView';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const AdminEventPage = ({ params }: { params: { eventId: string } }) => {
  const eventId = parseAdminRecordId(params.eventId);

  if (!eventId) {
    notFound();
  }

  return <AdminEvent eventId={eventId} />;
};

export default AdminEventPage;
