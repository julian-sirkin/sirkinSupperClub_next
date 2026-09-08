import { EventRunOfShowPage } from '../../../../components/EventRunOfShow/EventRunOfShow';
import { parseAdminRecordId } from '../../../../components/AdminLayout/adminView';
import { notFound } from 'next/navigation';

const AdminEventRunOfShowPage = ({
  params,
}: {
  params: { eventId: string };
}) => {
  const eventId = parseAdminRecordId(params.eventId);

  if (!eventId) {
    notFound();
  }

  return <EventRunOfShowPage eventId={eventId} />;
};

export default AdminEventRunOfShowPage;
