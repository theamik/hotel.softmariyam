import DayBook from '../../components/Forms/Ledger/DayBook';
import PerAccount from '../../components/Forms/Ledger/PerAccount';
import TypeWiseReport from '../../components/Forms/Ledger/TypeWiseReport';

const Ledger = () => {
  return (
    <>
      <DayBook />
      <PerAccount />
      <TypeWiseReport />
    </>
  );
};

export default Ledger;
