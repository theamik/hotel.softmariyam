import moment from "moment";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { intLocal } from "../../api/api";
import { get_a_program } from "../../store/Actions/orderAction";
import { messageClear } from "../../store/Reducers/orderReducer";
import toast from "react-hot-toast";

const RestaurantInvoice = () => {
  const { programId } = useParams();
  const dispatch = useDispatch();

  const { program, errorMessage, successMessage, loader } = useSelector(
    (state) => state.order
  );
  const { userInfo } = useSelector((state) => state.auth);

  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: `Program Invoice - ${program?.programNo || "N/A"}`,
    contentRef: componentRef,
    // Add print-specific styles for better clarity if needed
    pageStyle: `
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    `,
  });

  useEffect(() => {
    if (programId && (!program || program._id !== programId)) {
      dispatch(get_a_program(programId));
    }
  }, [programId, program, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
  }, [errorMessage, successMessage, dispatch]);

  if (loader) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700 dark:text-gray-300">
        Loading Invoice...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-500">
        Program not found or failed to load.
      </div>
    );
  }

  const totalPaidAmount =
    program?.paid?.reduce((n, { paid }) => n + Number(paid), 0) || 0;

  return (
    <>
      <div className="max-w-[95rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10">
        <div ref={componentRef} className="sm:w-11/12 mx-auto print:p-0">
          <div className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800">
            <div className="flex justify-between items-start mb-8">
              {/* Company Info */}
              <div>
                <div className="mb-2">
                  {userInfo?.companyId?.image ? (
                    <img
                      src={`${intLocal}${userInfo.companyId.image}`}
                      alt="Company Logo"
                      className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/80x80/cccccc/000000?text=Logo";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                      No Logo
                    </div>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
                  {userInfo?.companyId?.name || "Your Company Name"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Restaurant Program Invoice
                </p>
              </div>

              {/* Company Address */}
              <div className="text-end">
                <address className="mt-4 not-italic text-gray-900 dark:text-neutral-200 text-sm">
                  {userInfo?.companyId?.address || "Company Address Line 1"}
                  <br />
                  {userInfo?.companyId?.mobile || "Company Phone"}
                  <br />
                  {userInfo?.companyId?.email || "company@example.com"}
                  <br />
                </address>
              </div>
            </div>

            {/* Program & Guest Details */}
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {/* Guest Details */}
              <div className="sm:text-left space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-2">
                  Program For:
                </h3>
                <div className="space-y-1">
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Name:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.guestId?.name || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.guestId?.address || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.guestId?.mobile || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Total Guest:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.totalGuest || 0}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Hall:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.hall || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Season:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.season || "N/A"}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Program Info */}
              <div className="sm:text-end space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-2">
                  Program Details:
                </h3>
                <div className="space-y-1">
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Program No:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.programNo || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Booked Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(program?.bookedDate).isValid()
                        ? moment(program?.bookedDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Program Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(program?.programDate).isValid()
                        ? moment(program?.programDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Reference:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.reference || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Program Type:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {program?.programType || "N/A"}
                    </dd>
                  </dl>
                  {program?.remark && (
                    <dl className="grid grid-cols-5 gap-x-3">
                      <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                        Remark:
                      </dt>
                      <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                        {program?.remark}
                      </dd>
                    </dl>
                  )}
                </div>
              </div>
            </div>

            {/* Program Charges Summary */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-4">
                Charges Breakdown
              </h3>
              <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                <div className="hidden sm:grid sm:grid-cols-5 text-black uppercase text-xs font-semibold dark:text-neutral-500">
                  <div className="text-start">Program Type</div>
                  <div className="text-start">Hall</div>
                  <div className="text-start">Total Guest</div>
                  <div className="text-end">Per Head</div>
                  <div className="text-end">Amount</div>
                </div>
                <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                {/* Program Base Line Item */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-black dark:text-neutral-200">
                  <div className="col-span-full sm:col-span-1">
                    <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                      Program Type
                    </h5>
                    <p className="font-bold">
                      {" "}
                      {/* Changed to font-bold */}
                      {program?.programType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                      Hall
                    </h5>
                    <p className="font-bold">{program?.hall || "N/A"}</p>{" "}
                    {/* Changed to font-bold */}
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                      Total Guest
                    </h5>
                    <p className="font-bold">{program?.totalGuest || 0}</p>{" "}
                    {/* Changed to font-bold */}
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                      Per Head
                    </h5>
                    <p className="sm:text-end font-bold">
                      {" "}
                      {/* Changed to font-bold */}
                      Tk {program?.perHead?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                      Amount
                    </h5>
                    <p className="sm:text-end font-bold">
                      {" "}
                      {/* Changed to font-bold */}
                      Tk {program?.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
              </div>
            </div>

            {/* Additional Charges and Financial Summary */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-6">
              {/* Food Items and Other Details */}
              <div className="w-full sm:w-1/2">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
                  <h4 className="text-lg font-semibold text-black dark:text-white mb-3">
                    Food Items
                  </h4>
                  <div className="flex flex-wrap gap-2 items-center text-gray-900 dark:text-neutral-200">
                    {program?.foodItems && program.foodItems.length > 0 ? (
                      program.foodItems.map((d, j) => (
                        <p
                          key={j}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold print:text-black print:bg-gray-200"
                        >
                          {d?.name || d?.label || "N/A"}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-neutral-500">
                        No food items selected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="w-full sm:w-1/2 sm:text-end">
                <div className="w-full max-w-sm ml-auto space-y-2">
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">Subtotal:</dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {program?.totalAmount?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>

                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">Hall Charge:</dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {program?.hallCharge?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">
                      Service Charge:
                    </dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {program?.service?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">Others:</dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {program?.decoration?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">Discount:</dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      - Tk {program?.discount?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>

                  <dl className="grid grid-cols-5 gap-x-3 text-black dark:text-white border-t border-gray-300 dark:border-neutral-600 pt-2 font-bold text-lg">
                    <dt className="col-span-3">Total Amount:</dt>
                    <dd className="col-span-2">
                      Tk {program?.finalAmount?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>

                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200 text-base">
                    <dt className="col-span-3 font-semibold">Amount Paid:</dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {totalPaidAmount.toFixed(2)}
                    </dd>
                  </dl>

                  <dl className="grid grid-cols-5 gap-x-3 text-black dark:text-white font-bold text-lg">
                    <dt className="col-span-3">Due Balance:</dt>
                    <dd className="col-span-2">
                      Tk {program?.due?.toFixed(2) || "0.00"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
              <div className="flex flex-col gap-6">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
                  <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    Payment Details
                  </h4>
                  <div className="hidden sm:grid sm:grid-cols-3 text-xs font-medium text-black uppercase dark:text-neutral-500">
                    <div>Date</div>
                    <div>Purpose</div>
                    <div>Amount</div>
                  </div>
                  {program?.paid && program.paid.length > 0 ? (
                    program.paid.map((p, q) => (
                      <div
                        key={q}
                        className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        <div className="col-span-full sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Date
                          </h5>
                          <p className="font-medium">
                            {moment(p?.currentDate).isValid()
                              ? moment(p?.currentDate).format("ll")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Purpose
                          </h5>
                          <p>{p?.paidDetails || "N/A"}</p>
                        </div>
                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Amount
                          </h5>
                          <p>{Number(p?.paid)?.toFixed(2) || "0.00"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-neutral-500">
                      No payment records.
                    </p>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="flex flex-col gap-6">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
                  <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    Signatures
                  </h4>
                  <div className="flex justify-between mt-4"></div>
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="border-b border-gray-400 w-32 mb-2"></div>
                      <label className="block text-sm text-black dark:text-white">
                        Authority Signature
                      </label>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-gray-400 w-32 mb-2"></div>
                      <label className="block text-sm text-black dark:text-white">
                        Guest Signature
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 sm:mt-12 text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-neutral-200">
                Thank you for your co-operations!
              </h4>
              <p className="text-gray-500 dark:text-neutral-500 text-sm mt-2">
                If you have any questions concerning this invoice, please
                contact us:
              </p>
              <div className="mt-2 flex flex-col items-center">
                <p className="block text-sm font-medium text-gray-900 dark:text-neutral-200">
                  {userInfo?.companyId?.email || "info@example.com"}
                </p>
                <p className="block text-sm font-medium text-gray-900 dark:text-neutral-200">
                  {userInfo?.companyId?.mobile || "+880-XXX-XXXXXX"}
                </p>
              </div>
              <p className="mt-5 text-xs text-gray-500 dark:text-neutral-500">
                © {moment().year()}{" "}
                {userInfo?.companyId?.name || "SoftMariyam"}. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Print Button outside invoice content */}
        <div className="mt-6 flex justify-end gap-x-3 print:hidden">
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download/Print PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default RestaurantInvoice;
