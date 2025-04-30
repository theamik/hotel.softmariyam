import moment from "moment";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";

const RestaurantInvoice: React.FC = () => {
  const { program, errorMessage, successMessage } = useSelector(
    (state) => state?.order
  );
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80.000000pt"
                  height="80.000000pt"
                  viewBox="0 0 300.000000 300.000000"
                >
                  {" "}
                  <g
                    transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
                    fill="#e75a0d"
                    stroke="none"
                  >
                    {" "}
                    <path d="M987 2263 c-1 -1 -1 -213 1 -471 l2 -470 75 2 c41 0 75 4 75 9 0 4 0 214 0 466 l0 459 -76 4 c-42 2 -76 2 -77 1z m121 -32 c9 -1 12 -92 10 -433 l-3 -433 -47 -3 -48 -3 0 435 c0 304 3 435 11 438 6 2 23 3 37 2 15 -1 33 -3 40 -3z" />{" "}
                    <path d="M1244 2263 l-71 -4 1 -467 1 -467 78 -1 77 -2 0 474 c0 261 -3 473 -7 472 -5 -1 -40 -4 -79 -5z m54 -467 l-3 -431 -38 -6 c-24 -4 -41 -2 -47 6 -7 8 -9 163 -8 436 l3 423 25 6 c14 3 35 4 48 2 l22 -4 -2 -432z" />{" "}
                    <path d="M1630 1797 l0 -476 80 2 80 2 0 467 0 468 -64 0 c-35 0 -71 3 -80 6 -14 6 -16 -40 -16 -469z m125 420 c7 -10 12 -26 10 -35 -2 -9 -4 -198 -4 -420 l-1 -403 -47 3 -48 3 -2 424 c-1 235 2 429 6 435 15 18 71 13 86 -7z" />{" "}
                    <path d="M1820 1795 l0 -471 75 1 76 0 0 468 0 468 -76 2 -75 2 0 -470z m118 2 c2 -411 1 -437 -15 -439 -35 -3 -68 4 -75 15 -10 17 -9 813 1 840 7 19 16 23 47 22 l39 0 3 -438z" />{" "}
                    <path d="M1407 1890 c-86 -68 -36 -213 72 -213 48 0 77 16 101 56 34 54 19 125 -32 161 -33 23 -109 21 -141 -4z m115 -17 c5 1 19 -13 30 -32 24 -42 18 -97 -12 -106 -11 -4 -20 -11 -20 -16 0 -5 -20 -9 -44 -9 -40 0 -46 3 -58 30 -7 17 -17 30 -21 30 -13 0 3 62 21 83 8 9 21 17 29 17 7 0 13 4 13 10 0 6 9 6 25 0 14 -5 31 -9 37 -7z" />{" "}
                    <path d="M180 1080 c0 -113 1 -120 20 -120 17 0 20 7 20 50 l0 50 60 0 60 0 0 -50 c0 -43 3 -50 20 -50 19 0 20 7 20 120 0 113 -1 120 -20 120 -17 0 -20 -7 -20 -45 l0 -45 -60 0 -60 0 0 45 c0 38 -3 45 -20 45 -19 0 -20 -7 -20 -120z" />{" "}
                    <path d="M1750 1080 c0 -113 1 -120 20 -120 17 0 20 7 20 50 l0 50 60 0 60 0 0 -50 c0 -43 3 -50 20 -50 19 0 20 7 20 120 0 113 -1 120 -20 120 -17 0 -20 -7 -20 -45 l0 -45 -60 0 -60 0 0 45 c0 38 -3 45 -20 45 -19 0 -20 -7 -20 -120z" />{" "}
                    <path d="M440 1065 c0 -98 1 -105 20 -105 19 0 20 7 20 105 0 98 -1 105 -20 105 -19 0 -20 -7 -20 -105z" />{" "}
                    <path d="M535 1065 l0 -105 73 0 c65 0 72 2 72 20 0 18 -7 20 -55 20 l-55 0 0 85 c0 74 -2 85 -17 85 -16 0 -18 -12 -18 -105z" />{" "}
                    <path d="M660 1150 c0 -16 7 -20 35 -20 l35 0 0 -85 c0 -79 1 -85 21 -85 19 0 20 5 17 85 l-3 85 33 0 c25 0 32 4 32 20 0 18 -7 20 -85 20 -78 0 -85 -2 -85 -20z" />{" "}
                    <path d="M876 1155 c-12 -34 -7 -172 8 -184 9 -7 42 -11 88 -9 l73 3 0 100 0 100 -81 3 c-68 2 -83 0 -88 -13z m144 -90 l0 -65 -55 0 -55 0 0 65 0 65 55 0 55 0 0 -65z" />{" "}
                    <path d="M1093 1158 c2 -7 15 -55 28 -106 29 -111 45 -118 69 -25 18 75 25 83 34 41 14 -71 27 -108 39 -108 12 0 71 199 62 208 -15 16 -34 -15 -45 -73 -14 -74 -20 -71 -39 18 -8 36 -18 57 -26 57 -13 0 -20 -19 -41 -103 -9 -37 -18 -25 -33 46 -10 47 -16 57 -33 57 -12 0 -18 -5 -15 -12z" />{" "}
                    <path d="M1370 1065 c0 -85 3 -105 15 -105 11 0 15 17 17 70 l3 70 55 -70 c29 -39 60 -70 67 -70 10 0 13 26 13 105 0 85 -3 105 -15 105 -11 0 -15 -16 -17 -67 l-3 -67 -54 67 c-30 37 -60 67 -68 67 -10 0 -13 -24 -13 -105z" />{" "}
                    <path d="M2014 1157 c-2 -7 -4 -54 -2 -103 l3 -89 82 -3 c97 -3 96 -5 91 123 l-3 80 -83 3 c-62 2 -84 0 -88 -11z m140 -89 l-2 -63 -56 -3 -56 -3 0 66 0 65 58 0 57 0 -1 -62z" />{" "}
                    <path d="M2230 1150 c0 -16 7 -20 36 -20 l35 0 -3 -85 c-3 -76 -1 -85 15 -85 15 0 17 11 17 85 l0 85 35 0 c28 0 35 4 35 20 0 18 -7 20 -85 20 -78 0 -85 -2 -85 -20z" />{" "}
                    <path d="M2440 1065 l0 -105 75 0 c68 0 75 2 75 20 0 16 -8 19 -57 22 -51 3 -58 6 -61 26 -3 19 1 22 32 22 29 0 36 4 36 20 0 16 -7 20 -36 20 -31 0 -35 3 -32 22 3 20 8 22 61 19 52 -2 57 -1 57 18 0 19 -6 21 -75 21 l-75 0 0 -105z" />{" "}
                    <path d="M2640 1065 l0 -105 75 0 c68 0 75 2 75 20 0 18 -7 20 -58 20 l-58 0 4 85 c4 81 4 85 -17 85 -20 0 -21 -5 -21 -105z" />{" "}
                  </g>{" "}
                </svg>
                <h1 className="text-lg md:text-xl font-semibold text-orange-600 dark:text-white">
                  Hiltown Hotel
                </h1>
              </div>

              <div className="text-end">
                <address className="mt-4 not-italic text-gray-800 dark:text-neutral-200">
                  VIP Road Telohawor
                  <br />
                  Taltola, Sylhet
                  <br />
                  Sylhet Bangladesh
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
                  info@hiltownhotel.com
                </p>
                <p className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  +880 1618-366051
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
