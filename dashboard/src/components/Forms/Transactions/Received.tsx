import DatePickerOne from '../DatePicker/DatePickerOne';
import { useState } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

function Received() {
  const [selectedOption, setSelectedOption] = useState(null);
  return (
    <>
      <div className="grid grid-cols-1 mt-3 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Input Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-6.5">
              <DatePickerOne />
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <Select
                defaultValue={selectedOption}
                onChange={setSelectedOption}
                options={options}
                placeholder="Account"
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
            <div className="flex flex-col gap-5.5 p-4">
              <div>
                <label className="mb-1 block text-black dark:text-white">
                  Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Description"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-full bg-meta-3 py-4  px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Received
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Received;
