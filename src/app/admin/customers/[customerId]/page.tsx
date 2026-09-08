import { CustomerDetail } from '../../../components/CustomerDetail/CustomerDetail';
import { parseAdminRecordId } from '../../../components/AdminLayout/adminView';
import { notFound } from 'next/navigation';

const AdminCustomerPage = ({ params }: { params: { customerId: string } }) => {
  const customerId = parseAdminRecordId(params.customerId);

  if (!customerId) {
    notFound();
  }

  return <CustomerDetail key={customerId} customerId={customerId} />;
};

export default AdminCustomerPage;
