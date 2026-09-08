import { CustomerList } from '../../components/CustomerList/CustomerList';

const AdminCustomersPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gold">Customers</h2>
      <CustomerList />
    </div>
  );
};

export default AdminCustomersPage;
