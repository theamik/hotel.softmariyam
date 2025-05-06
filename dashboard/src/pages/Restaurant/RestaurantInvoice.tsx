import moment from "moment";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { intLocal } from "../../api/api";

const RestaurantInvoice: React.FC = () => {
  const { program, errorMessage, successMessage } = useSelector(
    (state) => state?.order
  );
  const { userInfo } = useSelector((state) => state?.auth);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Title",
    contentRef: componentRef,
  });

  console.log(componentRef.current);

  return (
    <>
      <div className="max-w-[95rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10">
        <div ref={componentRef} className="sm:w-11/12  mx-auto">
          <div className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800">
            <div className="flex justify-between">
              <div>
                <div className="">
                  <img
                    src={`${intLocal}${userInfo?.companyId?.image}`}
                    alt="Invoice"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                </div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  {userInfo?.companyId?.name}
                </h1>
              </div>

              <div className="text-end">
                <address className="mt-4 not-italic text-gray-800 dark:text-neutral-200">
                  {userInfo?.companyId?.address}
                  <br />
                  {userInfo?.companyId?.mobile}
                  <br />
                  {userInfo?.companyId?.email}
                  <br />
                </address>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div className="sm:text-left space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Program For:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.guestId?.name}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.guestId?.address}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.guestId?.mobile}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total Guest:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.totalGuest}
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="sm:text-end space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Program No:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.programNo}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Proposal date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {moment(program?.bookedDate).format("ll")}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Program date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {moment(program?.programDate).format("ll")}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Reference:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {program?.reference}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                <div className="hidden sm:grid sm:grid-cols-5">
                  <div className=" text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Party Type
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Hall
                  </div>
                  <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Total Guest
                  </div>
                  <div className="text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Per Head
                  </div>
                  <div className="text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                    Amount
                  </div>
                </div>

                <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <div className="col-span-full sm:col-span-1">
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Party Type
                    </h5>
                    <p className="font-medium text-gray-800 dark:text-neutral-200">
                      {program?.programType}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Hall
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">
                      {program?.hall}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total Guest
                    </h5>
                    <p className="text-gray-800 dark:text-neutral-200">
                      {program?.totalGuest}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Per Head
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      Tk {program?.preHead}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                      Total
                    </h5>
                    <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                      Tk {program?.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
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
                      Tk {program?.totalAmount}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Hall Charge:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.hallCharge}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Service Charge:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.service}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Decoration:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.decoration}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Discount:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.discount}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.finalAmount}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Amount paid:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.paid?.reduce((n, { paid }) => n + paid, 0)}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Due balance:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {program?.due}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mt-5">
              <div className="flex flex-col gap-9">
                {/* <!-- Input Fields --> */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-col gap-5.5 p-6.5">
                    <div>
                      <label className="mb-3 block text-black dark:text-white">
                        Food Items
                      </label>
                      <div className="flex w-auto rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                        {program?.foodItems?.map((d, j) => (
                          <p>
                            <b> {d?.label} &nbsp;</b>
                          </p>
                        ))}
                      </div>
                    </div>
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
                        Payment Details
                      </label>
                      <div className="hidden sm:grid sm:grid-cols-3">
                        <div className=" text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Date
                        </div>
                        <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Purpose
                        </div>
                        <div className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Amount
                        </div>
                      </div>

                      {program?.paid?.map((p, q) => (
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-3 gap-2">
                          <div className="col-span-full sm:col-span-1">
                            <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                              Date
                            </h5>
                            <p className="font-medium text-gray-800 dark:text-neutral-200">
                              {moment(p?.currentDate).format("ll")}
                            </p>
                          </div>
                          <div>
                            <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                              Purpose
                            </h5>
                            <p className="text-gray-800 dark:text-neutral-200">
                              {p?.paidDetails}
                            </p>
                          </div>
                          <div>
                            <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                              Amount
                            </h5>
                            <p className="text-gray-800 dark:text-neutral-200">
                              {p?.paid}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mt-5">
              <div className="flex flex-col gap-9">
                {/* <!-- Textarea Fields --> */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-col gap-5.5 p-4">
                    <div>
                      <label className="mb-1 block text-black dark:text-white">
                        Authority Signature
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-9">
                {/* <!-- Textarea Fields --> */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-col gap-5.5 p-4">
                    <div>
                      <label className="mb-1 block text-black dark:text-white">
                        Guest Signature:
                      </label>
                    </div>
                  </div>
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
                  {userInfo?.companyId?.email}
                </p>
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  {userInfo?.companyId?.mobile}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-500 dark:text-neutral-500">
              © 2025 softmariyam.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-x-3">
          <button
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            onClick={handlePrint}
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
          </button>
          <button
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handlePrint}
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
          </button>
        </div>
      </div>
    </>
  );
};
export default RestaurantInvoice;
