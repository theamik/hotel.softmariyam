import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useParams to get reservationId
import { useReactToPrint } from "react-to-print";
import { intLocal } from "../../api/api";
import moment from "moment";
import { get_a_reservation } from "../../store/Actions/foodAction"; // Assuming this action exists
import { messageClear } from "../../store/Reducers/foodReducer"; // Assuming this reducer is for clearing messages
import toast from "react-hot-toast"; // For displaying error/success messages

const HotelInvoiceReady = () => {
  const { reservationId } = useParams(); // Get reservationId from URL parameters
  const dispatch = useDispatch();

  const { reservation, errorMessage, successMessage, loader } = useSelector(
    // Assuming 'loader' state exists in food slice
    (state) => state.food
  );
  const { userInfo } = useSelector((state) => state.auth); // Assuming auth slice has userInfo

  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: `Hotel Invoice - ${reservation?.reservationNo || "N/A"}`, // Dynamic title
    contentRef: componentRef,
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

  // Fetch reservation details if not already loaded or if reservationId changes
  useEffect(() => {
    if (reservationId && (!reservation || reservation._id !== reservationId)) {
      dispatch(get_a_reservation(reservationId));
    }
  }, [reservationId, reservation, dispatch]);

  // Handle Redux messages
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

  if (!reservation) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-500">
        Reservation not found or failed to load.
      </div>
    );
  }

  // Calculate total paid amount
  const totalPaidAmount =
    reservation?.paidInfo?.reduce((n, { paid }) => n + Number(paid), 0) || 0;

  // Calculate total room charges
  const totalRoomCharges =
    reservation?.roomDetails?.reduce((sum, room) => {
      const discountRate = Number(room?.discountRate) || 0;
      const dayStay = Number(room?.dayStay) || 0;
      return sum + discountRate * dayStay;
    }, 0) || 0;

  // Calculate total other charges
  const totalOtherCharges =
    reservation?.others?.reduce((sum, item) => {
      return sum + (Number(item?.otherAmount) || 0);
    }, 0) || 0;

  // Calculate total restaurant charges
  const totalRestaurantCharges =
    reservation?.restaurants?.reduce((sum, item) => {
      return sum + (Number(item?.restaurantAmount) || 0);
    }, 0) || 0;

  // Assuming finalAmount in schema is the total after all charges and discounts
  // and 'due' is calculated as finalAmount - totalPaidAmount
  const calculatedDue = Number(reservation?.finalAmount) || 0;

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
                  {userInfo?.companyId?.name || "Your Hotel Name"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Hotel Reservation Invoice
                </p>
              </div>

              {/* Company Address */}
              <div className="text-end">
                <address className="mt-4 not-italic text-gray-900 dark:text-neutral-200 text-sm">
                  {userInfo?.companyId?.address || "Hotel Address Line 1"}
                  <br />
                  {userInfo?.companyId?.mobile || "Hotel Phone"}
                  <br />
                  {userInfo?.companyId?.email || "hotel@example.com"}
                  <br />
                </address>
              </div>
            </div>

            {/* Resident & Reservation Details */}
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {/* Resident Details */}
              <div className="sm:text-left space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-2">
                  Guest Details:
                </h3>
                <div className="space-y-1">
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Name:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.residentId?.name || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.residentId?.address || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.residentId?.mobile || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Source:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.source || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Generated By:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.generatedBy || "N/A"}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Reservation Info */}
              <div className="sm:text-end space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-2">
                  Reservation Details:
                </h3>
                <div className="space-y-1">
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Invoice No:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.reservationNo || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Invoice Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(reservation?.bookedDate).isValid()
                        ? moment(reservation?.bookedDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Check-in Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(reservation?.checkInDate).isValid()
                        ? moment(reservation?.checkInDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Check-out Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(reservation?.checkOutDate).isValid()
                        ? moment(reservation?.checkOutDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Status:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {reservation?.status || "N/A"}
                    </dd>
                  </dl>
                  {reservation?.remark && (
                    <dl className="grid grid-cols-5 gap-x-3">
                      <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                        Remark:
                      </dt>
                      <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                        {reservation?.remark}
                      </dd>
                    </dl>
                  )}
                </div>
              </div>
            </div>

            {/* Room Charges Breakdown */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-4">
                Room Charges Breakdown
              </h3>
              <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                <div className="hidden sm:grid sm:grid-cols-6 text-black uppercase text-xs font-semibold dark:text-neutral-500">
                  <div className="text-start">Category</div>
                  <div className="text-start">Room No</div>
                  <div className="text-start">Total Stay</div>
                  <div className="text-end">Rack Rate</div>
                  <div className="text-end">Discount Rate</div>
                  <div className="text-end">Amount</div>
                </div>
                <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>

                {reservation?.roomDetails &&
                reservation.roomDetails.length > 0 ? (
                  reservation.roomDetails.map((i, j) => (
                    <div
                      key={j}
                      className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-black dark:text-neutral-200"
                    >
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Category
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.roomId?.categoryId?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Room No
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.roomId?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Total Stay
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.dayStay || 0}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Rack Rate
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.rackRate) || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Discount Rate
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.discountRate) || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Amount
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk{" "}
                          {(
                            Number(i?.discountRate) * Number(i?.dayStay) || 0
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-neutral-500">
                    No room charges.
                  </p>
                )}
                <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
              </div>
            </div>

            {/* Other Charges */}
            {totalOtherCharges > 0 && ( // Conditional rendering based on totalOtherCharges
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-4">
                  Other Charges
                </h3>
                <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                  <div className="hidden sm:grid sm:grid-cols-6 text-black uppercase text-xs font-semibold dark:text-neutral-500">
                    <div className="col-span-4 text-start">Purpose</div>
                    <div className="col-span-1 text-end">Charge</div>
                    <div className="col-span-1 text-end">Total</div>
                  </div>
                  <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>
                  {reservation.others.map((i, j) => (
                    <div
                      key={j}
                      className="grid grid-cols-6 gap-2 text-black dark:text-neutral-200"
                    >
                      <div className="col-span-full sm:col-span-4">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Purpose
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.other || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Charge
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.otherAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Total
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.otherAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
                </div>
              </div>
            )}

            {/* Restaurant Charges */}
            {totalRestaurantCharges > 0 && ( // Conditional rendering based on totalRestaurantCharges
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-4">
                  Restaurant Charges
                </h3>
                <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
                  <div className="hidden sm:grid sm:grid-cols-6 text-black uppercase text-xs font-semibold dark:text-neutral-500">
                    <div className="col-span-4 text-start">Purpose</div>
                    <div className="col-span-1 text-end">Charge</div>
                    <div className="col-span-1 text-end">Total</div>
                  </div>
                  <div className="hidden sm:block border-b border-gray-200 dark:border-neutral-700"></div>
                  {reservation.restaurants.map((i, j) => (
                    <div
                      key={j}
                      className="grid grid-cols-6 gap-2 text-black dark:text-neutral-200"
                    >
                      <div className="col-span-full sm:col-span-4">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Purpose
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          Order No : {i?.restaurant || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Charge
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.restaurantAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Total
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {(Number(i?.restaurantAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="sm:hidden border-b border-gray-200 dark:border-neutral-700"></div>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="mt-8 flex sm:justify-end">
              <div className="w-full max-w-2xl sm:text-end space-y-2">
                <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                  <dt className="col-span-3 font-semibold">
                    Total Room Charges:
                  </dt>
                  <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                    Tk {totalRoomCharges.toFixed(2)}
                  </dd>
                </dl>
                {totalOtherCharges > 0 && ( // Conditional rendering based on totalOtherCharges
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">
                      Total Other Charges:
                    </dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {totalOtherCharges.toFixed(2)}
                    </dd>
                  </dl>
                )}
                {totalRestaurantCharges > 0 && ( // Conditional rendering based on totalRestaurantCharges
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">
                      Total Restaurant Charges:
                    </dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {totalRestaurantCharges.toFixed(2)}
                    </dd>
                  </dl>
                )}

                <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                  <dt className="col-span-3 font-semibold">Discount:</dt>
                  <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                    - Tk {(Number(reservation?.discount) || 0).toFixed(2)}
                  </dd>
                </dl>

                <dl className="grid grid-cols-5 gap-x-3 text-black dark:text-white border-t border-gray-300 dark:border-neutral-600 pt-2 font-bold text-lg">
                  <dt className="col-span-3">Grand Total:</dt>
                  <dd className="col-span-2">
                    Tk {(Number(reservation?.totalAmount) || 0).toFixed(2)}
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
                  <dd className="col-span-2">Tk {calculatedDue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
              <div className="flex flex-col gap-6">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
                  <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    Payment Details
                  </h4>
                  <div className="hidden sm:grid sm:grid-cols-3 text-xs font-medium text-black uppercase dark:text-neutral-500 mb-2">
                    <div>Date</div>
                    <div>Purpose</div>
                    <div>Amount</div>
                  </div>
                  {reservation?.paidInfo && reservation.paidInfo.length > 0 ? (
                    reservation.paidInfo.map((p, q) => (
                      <div
                        key={q}
                        className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-gray-900 dark:text-neutral-200 mb-1"
                      >
                        <div className="col-span-full sm:col-span-1">
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Date
                          </h5>
                          <p className="font-bold print:font-bold print:text-black">
                            {moment(p?.currentDate).isValid()
                              ? moment(p?.currentDate).format("ll")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Purpose
                          </h5>
                          <p className="font-bold print:font-bold print:text-black">
                            {p?.paidDetails || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                            Amount
                          </h5>
                          <p className="font-bold print:font-bold print:text-black">
                            Tk {(Number(p?.paid) || 0).toFixed(2)}
                          </p>
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
                Thank you for your stay!
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            Print Invoice
          </button>
        </div>
      </div>
    </>
  );
};

export default HotelInvoiceReady;
