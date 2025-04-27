import DatePickerOne from '../DatePicker/DatePickerOne';
import { Link } from 'react-router-dom';

function ProfitLoss() {
  return (
    <>
      <div className="grid grid-cols-1 mb-5 gap-9 sm:grid-cols-2 ">
        <div className="flex flex-col gap-9">
          {/* <!-- Input Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-6.5">
              <DatePickerOne title="Start Date" />
              <DatePickerOne title="End Date" />
            </div>
          </div>

          {/* <!-- Toggle switch input --> */}

          {/* <!-- Time and date --> */}

          {/* <!-- File upload --> */}
        </div>

        <div className="flex flex-col gap-9">
          {/* <!-- Textarea Fields --> */}
          <div className="rounded-sm border mt-10 border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-9.5">
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 py-4  px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Income Statement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfitLoss;
