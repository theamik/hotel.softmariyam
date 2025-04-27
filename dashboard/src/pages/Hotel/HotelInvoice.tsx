import React from 'react';

const Chart: React.FC = () => {
  return (
    <>
      <div className="max-w-[95rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10">
        <div className="sm:w-11/12  mx-auto">
          <div className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800">
            <div className="flex justify-between">
              <div>
                <svg
                  className="size-10"
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 26V13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13C25 19.6274 19.6274 25 13 25H12"
                    className="stroke-blue-600 dark:stroke-white"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M5 26V13.16C5 8.65336 8.58172 5 13 5C17.4183 5 21 8.65336 21 13.16C21 17.6666 17.4183 21.32 13 21.32H12"
                    className="stroke-blue-600 dark:stroke-white"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle
                    cx="13"
                    cy="13.0214"
                    r="5"
                    fill="currentColor"
                    className="fill-blue-600 dark:fill-white"
                  />
                </svg>

                <h1 className="mt-2 text-lg md:text-xl font-semibold text-blue-600 dark:text-white">
                  Preline Inc.
                </h1>
              </div>

              <div className="text-end">
                <address className="mt-4 not-italic text-gray-800 dark:text-neutral-200">
                  45 Roker Terrace
                  <br />
                  Latheronwheel
                  <br />
                  KW5 8NW, London
                  <br />
                  United Kingdom
                  <br />
                </address>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div className="sm:text-left space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Bill To:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Mr Jabbar
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Dhaka
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      013123-123121
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total Stay:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      02
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="sm:text-end space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Invoice No:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      #343242
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Invoice date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      03/10/2018
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Arrival date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      03/07/2018
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Source:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Booking.com
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                <div className="hidden sm:grid sm:grid-cols-6">
                  <div className=" text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Category
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Room No
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Total Stay
                  </div>
                  <div className="text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Rack Rate
                  </div>
                  <div className="text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Discount Rate
                  </div>
                  <div className="text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Amount
                  </div>
                </div>

                <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div className="col-span-full sm:col-span-1">
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Category
                    </h5>
                    <p className="font-medium text-gray-800 dark:text-neutral-200">
                      Deluxe
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Room No
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">211</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total Stay
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">2</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Rack Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $700
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Discount Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $500
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $1000
                    </p>
                  </div>
                </div>

                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div className="col-span-full sm:col-span-1">
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Category
                    </h5>
                    <p className="font-medium text-gray-800 dark:text-neutral-200">
                      Deluxe
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Room No
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">211</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total Stay
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">2</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Rack Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $700
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Discount Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $500
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $1000
                    </p>
                  </div>
                </div>
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div className="col-span-full sm:col-span-1">
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Category
                    </h5>
                    <p className="font-medium text-gray-800 dark:text-neutral-200">
                      Deluxe
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Room No
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">211</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total Stay
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">2</p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Rack Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $700
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Discount Rate
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $500
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      $1000
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex sm:justify-end">
              <div className="w-full max-w-2xl sm:text-end space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Subtotal:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      $2750.00
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      $2750.00
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Discount:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      $39.00
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Amount paid:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      $2711.00
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Due balance:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      $0.00
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                Thank you!
              </h4>
              <p className="text-gray-500 dark:text-neutral-500">
                If you have any questions concerning this invoice, use the
                following contact information:
              </p>
              <div className="mt-2">
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  example@site.com
                </p>
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  +1 (062) 109-9222
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-500 dark:text-neutral-500">
              © 2022 Preline.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-x-3">
            <a
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
              href="#"
            >
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Invoice PDF
            </a>
            <a
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              href="#"
            >
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              Print
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
export default Chart;
