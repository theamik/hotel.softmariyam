import DatePickerOne from '../DatePicker/DatePickerOne';
import { useState } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

function TypeWiseReport() {
  const [selectedOption, setSelectedOption] = useState(null);
  return (
    <>
      <div className="grid grid-cols-1 mt-3 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Input Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-6.5">
              <DatePickerOne title="Start Date" />
              <Select
                defaultValue={selectedOption}
                onChange={setSelectedOption}
                options={options}
                placeholder="Select Type"
                className="pb-10"
              />
            </div>
          </div>

          {/* <!-- Toggle switch input --> */}

          {/* <!-- Time and date --> */}

          {/* <!-- File upload --> */}
        </div>

        <div className="flex flex-col gap-9">
          {/* <!-- Textarea Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-9.5">
              <DatePickerOne title="End Date" />
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-full bg-green-600 py-4  px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Type Summary
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TypeWiseReport;
