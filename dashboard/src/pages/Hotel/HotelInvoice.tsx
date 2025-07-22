import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { intLocal } from "../../api/api";
import moment from "moment";

// Define interfaces for complex nested objects
interface RoomDetailProp {
  category: string;
  roomName: string;
  dayStay: number;
  rackRate: number;
  discountRate: number;
  checkInDate: string;
  checkOutDate: string;
}

interface PaidInfoProp {
  currentDate: string;
  paidDetails: string;
  paid: number;
}

interface OtherChargeProp {
  other: string;
  otherAmount: number;
}

interface RestaurantChargeProp {
  restaurant: string;
  restaurantAmount: number;
}

interface GuestProp {
  name: string;
  address: string;
  mobile: string;
}

// Full Reservation structure (matching previous HotelInvoiceReady)
interface ReservationObject {
  _id?: string;
  reservationNo?: string;
  bookedDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  generatedBy?: string;
  status?: string;
  remark?: string;
  residentId?: GuestProp; // Matches HotelInvoiceReady structure
  source?: string;
  roomDetails?: {
    roomId?: {
      name?: string;
      categoryId?: {
        name?: string;
        rackRate?: number;
        discountRate?: number;
      };
    };
    dayStay?: number;
    rackRate?: number;
    discountRate?: number;
    checkInDate?: string;
    checkOutDate?: string;
  }[]; // Updated to match HotelInvoiceReady nested structure
  others?: OtherChargeProp[];
  restaurants?: RestaurantChargeProp[];
  totalAmount?: number; // Total before discount
  discount?: number;
  finalAmount?: number; // Final amount after discount
  paidInfo?: PaidInfoProp[];
}

// Combined props for the Chart component
interface ChartProps {
  title?: string;
  types?: string; // Likely "Hotel" or "Restaurant" invoice type

  // Primary data source: full reservation object (optional)
  reservation?: ReservationObject;

  // Fallback/Direct props (used if 'reservation' is not provided or specific fields are missing)
  guest?: GuestProp;
  roomDetails?: RoomDetailProp[]; // Note: this is different structure than reservation.roomDetails
  startDate?: string; // For check-in date if no reservation.checkInDate
  endDate?: string; // For check-out date if no reservation.checkOutDate
  currentDate?: string; // For invoice date if no reservation.bookedDate
  discount?: number; // For discount if no reservation.discount
  newPaid?: number; // Represents a single, new payment if not part of paidInfo array
  finalAmount?: number; // Calculated final amount if no reservation.finalAmount
  source?: string;
  other?: string; // Single "other" entry
  otherAmount?: number;
  restaurant?: string; // Single "restaurant" entry
  restaurantAmount?: number;
  totalAmount?: number; // Calculated total amount if no reservation.totalAmount
  status?: string;
  rackRate?: number; // This prop seems redundant if roomDetails are passed
  discountRate?: number; // This prop seems redundant if roomDetails are passed
  remark?: string; // For remark if no reservation.remark
}

const Chart: React.FC<ChartProps> = ({
  reservation,
  guest,
  roomDetails,
  startDate,
  endDate,
  currentDate,
  discount,
  newPaid,
  finalAmount,
  source,
  other,
  otherAmount,
  restaurantAmount,
  restaurant,
  totalAmount,
  status,
  remark,
}) => {
  const { userInfo } = useSelector((state: any) => state?.auth); // Use 'any' or define state type if available

  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    documentTitle: `Invoice - ${reservation?.reservationNo || "Draft"}`,
    content: () => componentRef.current,
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

  // Determine data source: prefer reservation object, fallback to direct props
  const displayGuest = reservation?.residentId || guest;
  const displaySource = reservation?.source || source;
  const displayStatus = reservation?.status || status;
  const displayInvoiceNo = reservation?.reservationNo || "Pre Invoice";
  const displayBookedDate = reservation?.bookedDate || currentDate;
  const displayCheckInDate = reservation?.checkInDate || startDate;
  const displayCheckOutDate = reservation?.checkOutDate || endDate;
  const displayGeneratedBy =
    reservation?.generatedBy || userInfo?.name || "N/A";
  const displayRemark = reservation?.remark || remark;
  const displayDiscount = Number(reservation?.discount || discount || 0);

  // --- Room Details Logic ---
  const reservationRoomDetailsTransformed: RoomDetailProp[] =
    reservation?.roomDetails
      ? reservation.roomDetails.map((r) => ({
          category: r?.roomId?.categoryId?.name || "N/A",
          roomName: r?.roomId?.name || "N/A",
          dayStay: Number(r?.dayStay) || 0,
          rackRate: Number(r?.rackRate) || 0,
          discountRate: Number(r?.discountRate) || 0,
          checkInDate: Number(r?.checkInDate) || 0,
          checkOutDate: Number(r?.checkOutDate) || 0,
        }))
      : [];

  // Merge roomDetails from reservation with direct roomDetails prop
  // Filter out any potential duplicates if the same room is somehow in both
  const combinedRoomDetails = [
    ...reservationRoomDetailsTransformed,
    ...(Array.isArray(roomDetails) ? roomDetails : []),
  ].filter((v, i, a) => a.findIndex((t) => t.roomName === v.roomName) === i); // Deduplicate by roomName

  const displayRoomDetails = combinedRoomDetails;

  const calculatedRoomCharges = displayRoomDetails.reduce((sum, room) => {
    return sum + room.discountRate * room.dayStay;
  }, 0);

  // --- Other Charges Logic ---
  const currentOthers: OtherChargeProp[] = Array.isArray(reservation?.others)
    ? [...reservation.others]
    : [];
  if (other && (Number(otherAmount) || 0) > 0) {
    currentOthers.push({ other, otherAmount: Number(otherAmount) });
  }
  const displayOthers = currentOthers;

  const calculatedOtherCharges = displayOthers.reduce((sum, item) => {
    return sum + (Number(item?.otherAmount) || 0);
  }, 0);

  // --- Restaurant Charges Logic ---
  const currentRestaurants: RestaurantChargeProp[] = Array.isArray(
    reservation?.restaurants
  )
    ? [...reservation.restaurants]
    : [];
  if (restaurant && (Number(restaurantAmount) || 0) > 0) {
    currentRestaurants.push({
      restaurant,
      restaurantAmount: Number(restaurantAmount),
    });
  }
  const displayRestaurants = currentRestaurants;

  const calculatedRestaurantCharges = displayRestaurants.reduce((sum, item) => {
    return sum + (Number(item?.restaurantAmount) || 0);
  }, 0);

  // --- Financial Summary Calculations ---
  const calculatedTotalBeforeDiscount =
    calculatedRoomCharges +
    calculatedOtherCharges +
    calculatedRestaurantCharges;
  const displayTotalAmount = calculatedTotalBeforeDiscount; // Always use the dynamically calculated sum
  const displayFinalAmount = displayTotalAmount - displayDiscount; // Always calculate final based on dynamic total

  // --- Paid Info Logic ---
  const currentPaidInfo: PaidInfoProp[] = Array.isArray(reservation?.paidInfo)
    ? [...reservation.paidInfo]
    : [];
  if ((Number(newPaid) || 0) > 0) {
    // For payments, assuming each 'newPaid' is a distinct entry for simplicity in this preview
    currentPaidInfo.push({
      currentDate: currentDate || moment().toISOString(),
      paidDetails: "New Payment",
      paid: Number(newPaid),
    });
  }
  const displayPaidInfo = currentPaidInfo; // This will now include both existing and new 'paid'

  const calculatedTotalPaid = displayPaidInfo.reduce(
    (sum, p) => sum + (Number(p?.paid) || 0),
    0
  );
  const totalPaidAmount = calculatedTotalPaid;

  const calculatedDue = displayFinalAmount - totalPaidAmount;

  const allCheckInDates = roomDetails
    ?.map((r) => new Date(r.checkInDate))
    .filter(Boolean);
  const allCheckOutDates = roomDetails
    ?.map((r) => new Date(r.checkOutDate))
    .filter(Boolean);

  const globalCheckInDate = allCheckInDates?.length
    ? new Date(Math.min(...allCheckInDates.map((date) => date.getTime())))
    : null;

  const globalCheckOutDate = allCheckOutDates?.length
    ? new Date(Math.max(...allCheckOutDates.map((date) => date.getTime())))
    : null;

  return (
    <>
      <div className="max-w-[95rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10">
        <div ref={componentRef} className="sm:w-11/12 mx-auto print:p-0">
          <div className="flex flex-col p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800">
            {/* Company Info */}
            <div className="flex justify-between items-start mb-8">
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
                  Hotel Reservation Invoice
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

            {/* Guest & Invoice Details */}
            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {/* Guest Details */}
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
                      {displayGuest?.name || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Address:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displayGuest?.address || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Mobile:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displayGuest?.mobile || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Source:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displaySource || "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Generated By:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displayGeneratedBy}
                    </dd>
                  </dl>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="sm:text-end space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-200 mb-2">
                  Invoice Details:
                </h3>
                <div className="space-y-1">
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Invoice No:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displayInvoiceNo}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Invoice Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {moment(displayBookedDate).isValid()
                        ? moment(displayBookedDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Check-in Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {globalCheckInDate
                        ? moment(globalCheckInDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Check-out Date:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {globalCheckOutDate
                        ? moment(globalCheckOutDate).format("ll")
                        : "N/A"}
                    </dd>
                  </dl>
                  <dl className="grid grid-cols-5 gap-x-3">
                    <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                      Status:
                    </dt>
                    <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                      {displayStatus || "N/A"}
                    </dd>
                  </dl>
                  {displayRemark && (
                    <dl className="grid grid-cols-5 gap-x-3">
                      <dt className="col-span-2 font-semibold text-gray-900 dark:text-neutral-200">
                        Remark:
                      </dt>
                      <dd className="col-span-3 text-gray-900 dark:text-neutral-300">
                        {displayRemark}
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

                {displayRoomDetails.length > 0 ? (
                  displayRoomDetails.map((i, j) => (
                    <div
                      key={j}
                      className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-black dark:text-neutral-200"
                    >
                      <div className="col-span-full sm:col-span-1">
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Category
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.category || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Room No
                        </h5>
                        <p className="font-bold print:font-bold print:text-black">
                          {i?.roomName || "N/A"}
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
                          Tk {Number(i?.rackRate).toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <h5 className="sm:hidden text-xs font-medium text-black uppercase dark:text-neutral-500">
                          Discount Rate
                        </h5>
                        <p className="sm:text-end font-bold print:font-bold print:text-black">
                          Tk {Number(i?.discountRate).toFixed(2) || "0.00"}
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
            {calculatedOtherCharges > 0 && (
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
                  {displayOthers.map((i, j) => (
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
            {calculatedRestaurantCharges > 0 && (
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
                  {displayRestaurants.map((i, j) => (
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
                    Tk {calculatedRoomCharges.toFixed(2)}
                  </dd>
                </dl>
                {calculatedOtherCharges > 0 && (
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">
                      Total Other Charges:
                    </dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {calculatedOtherCharges.toFixed(2)}
                    </dd>
                  </dl>
                )}
                {calculatedRestaurantCharges > 0 && (
                  <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                    <dt className="col-span-3 font-semibold">
                      Total Restaurant Charges:
                    </dt>
                    <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                      Tk {calculatedRestaurantCharges.toFixed(2)}
                    </dd>
                  </dl>
                )}

                <dl className="grid grid-cols-5 gap-x-3 text-gray-900 dark:text-neutral-200">
                  <dt className="col-span-3 font-semibold">Discount:</dt>
                  <dd className="col-span-2 text-gray-900 dark:text-neutral-300">
                    - Tk {displayDiscount.toFixed(2)}
                  </dd>
                </dl>

                <dl className="grid grid-cols-5 gap-x-3 text-black dark:text-white border-t border-gray-300 dark:border-neutral-600 pt-2 font-bold text-lg">
                  <dt className="col-span-3">Grand Total:</dt>
                  <dd className="col-span-2">
                    Tk {displayFinalAmount.toFixed(2)}
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
                  {displayPaidInfo.length > 0 ? (
                    displayPaidInfo.map((p, q) => (
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
                Thank you for your business!
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

        {/* Print Buttons outside invoice content */}
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
            Print
          </button>
        </div>
      </div>
    </>
  );
};

export default Chart;
