import Contra from '../../components/Forms/Transactions/Contra';
import Payments from '../../components/Forms/Transactions/Payments';
import Received from '../../components/Forms/Transactions/Received';

const Transaction = () => {
  return (
    <>
      <Payments />
      <Received />
      <Contra />
    </>
  );
};

export default Transaction;
