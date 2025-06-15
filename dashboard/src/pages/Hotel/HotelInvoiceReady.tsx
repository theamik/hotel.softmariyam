import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { intLocal } from "../../api/api";
import moment from "moment";
import { get_a_reservation } from "../../store/Actions/foodAction";

const HotelInvoiceReady: React.FC = () => {
  const { reservation } = useSelector((state) => state?.food);
  const { userInfo } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Title",
    contentRef: componentRef,
  });

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
                      Bill To:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.residentId?.name}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.residentId?.address}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.residentId?.mobile}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Source:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.source}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Status:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.status}
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
                      {reservation?.reservationNo}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Invoice date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {moment(reservation?.bookedDate).format("LL")}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Arrival date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {moment(reservation?.checkInDate).format("LL")}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Departure date:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {moment(reservation?.checkOutDate).format("LL")}
                    </dd>
                  </dl>
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Generate By:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      {reservation?.generatedBy}
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
                {reservation &&
                  reservation.roomDetails.map((i, j) => (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Category
                        </h5>
                        <p className="font-medium text-gray-800 dark:text-neutral-200">
                          {i?.roomId?.categoryId?.name}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Room No
                        </h5>
                        <p className="text-gray-800 dark:text-neutral-200">
                          {i?.roomId?.name}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Total Stay
                        </h5>
                        <p className="text-gray-800 dark:text-neutral-200">
                          {i?.dayStay}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Rack Rate
                        </h5>
                        <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                          Tk {i?.roomId?.categoryId?.rackRate}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Discount Rate
                        </h5>
                        <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                          Tk {i?.roomId?.categoryId?.discountRate}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                          Total
                        </h5>
                        <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                          {Number(i?.roomId?.categoryId?.discountRate) *
                            Number(i?.dayStay)}
                        </p>
                      </div>
                    </div>
                  ))}

                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>

                {reservation?.others &&
                  reservation?.others.map((i, j) =>
                    i?.other ? (
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-6 sm:col-span-4">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Purpose
                          </h5>
                          <p className="font-medium text-gray-800 dark:text-neutral-200">
                            {i?.other}
                          </p>
                        </div>

                        <div className="col-span-6 sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Charge
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                            Tk {i?.otherAmount}
                          </p>
                        </div>

                        <div className="col-span-6 sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Total
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                            Tk {i?.otherAmount}
                          </p>
                        </div>
                      </div>
                    ) : (
                      ""
                    )
                  )}
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
                {reservation?.restaurants &&
                  reservation?.restaurants.map((i, j) =>
                    i.restaurant ? (
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-6 sm:col-span-4">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Purpose
                          </h5>
                          <p className="font-medium text-gray-800 dark:text-neutral-200">
                            {i?.restaurant}
                          </p>
                        </div>

                        <div className="col-span-6 sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Charge
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                            Tk {i?.restaurantAmount}
                          </p>
                        </div>

                        <div className="col-span-6 sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
                            Total
                          </h5>
                          <p className="sm:text-end text-gray-800 dark:text-neutral-200">
                            Tk {i?.restaurantAmount}
                          </p>
                        </div>
                      </div>
                    ) : (
                      ""
                    )
                  )}
              </div>
            </div>
            <div className="mt-8 flex sm:justify-end">
              <div className="w-full max-w-2xl sm:text-end space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2">
                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Total:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {Number(reservation?.totalAmount)}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Discount:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {reservation?.discount}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Amount paid:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk{" "}
                      {reservation?.paidInfo?.reduce(
                        (n, { paid }) => n + paid,
                        0
                      )}
                    </dd>
                  </dl>

                  <dl className="grid sm:grid-cols-5 gap-x-3">
                    <dt className="col-span-3 font-semibold text-gray-800 dark:text-neutral-200">
                      Due balance:
                    </dt>
                    <dd className="col-span-2 text-gray-500 dark:text-neutral-500">
                      Tk {reservation?.finalAmount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mt-5">
              {reservation && (
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

                        {reservation?.paidInfo?.map((p, q) => (
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
              )}
              {reservation ? (
                <div className="flex flex-col gap-9">
                  {/* <!-- Textarea Fields --> */}
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="flex flex-col gap-5.5 p-4">
                      <div>
                        <label className="mb-1 block text-black dark:text-white">
                          Remarks
                        </label>
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-3 gap-2">
                          <div className="col-span-full sm:col-span-1">
                            <p className="font-medium text-gray-800 dark:text-neutral-200">
                              {reservation?.remark}
                            </p>
                          </div>
                        </div>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
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
export default HotelInvoiceReady;
