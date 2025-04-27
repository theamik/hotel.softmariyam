import Activity from '../../components/Forms/Ledger/Activity';
import TableTwelve from '../../components/Tables/TableTwelve';
const Activities = () => {
  return (
    <>
      <div className="flex flex-col gap-10">
        <Activity />
        <TableTwelve />
      </div>
    </>
  );
};

export default Activities;
