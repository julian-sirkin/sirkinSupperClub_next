import { EventRunOfShowUI } from '../../../../components/EventRunOfShow/EventRunOfShowUI';
import { parseAdminRecordId } from '../../../../components/AdminLayout/adminView';
import { buildEventRunOfShow } from '../../../../helpers/buildEventRunOfShow';
import { getEventTicketsWithPurchases } from '../../../../api/queries/select';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const AdminEventRunOfShowPage = async ({
  params,
}: {
  params: { eventId: string };
}) => {
  const eventId = parseAdminRecordId(params.eventId);

  if (!eventId) {
    notFound();
  }

  const event = await getEventTicketsWithPurchases(eventId);

  if (!event || event.title === "Error loading event") {
    notFound();
  }

  const runOfShow = buildEventRunOfShow({
    title: event.title,
    date: event.date,
    tickets: event.tickets,
  });

  return <EventRunOfShowUI eventId={eventId} runOfShow={runOfShow} />;
};

export default AdminEventRunOfShowPage;
