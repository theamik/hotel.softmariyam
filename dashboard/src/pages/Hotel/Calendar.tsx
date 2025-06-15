import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Assuming these actions and reducers exist and are correctly imported
import {
  categories_get,
  get_a_room,
  rooms_get,
} from "../../store/Actions/roomAction";
import {
  get_a_reservation,
  get_reservations_by_date_status,
} from "../../store/Actions/foodAction";
// Assuming you have actions to fetch a single reservation/room details for forms

const Calendar = () => {
  const [startDate, setStartDate] = useState(new Date());

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigate hook

  const { categories } = useSelector((state) => state?.room);
  const { reservations, loadingReservations, reservationsError } = useSelector(
    (state) => state?.food
  );

  useEffect(() => {
    dispatch(rooms_get());
    dispatch(categories_get());
  }, [dispatch]);

  useEffect(() => {
    const formattedDate = startDate.toISOString().split("T")[0];
    dispatch(get_reservations_by_date_status(formattedDate));
  }, [startDate, dispatch]);

  // Helper function to determine the color based on reservation status
  const getReservationStatusColor = (status) => {
    switch (status) {
      case "will_check":
        return "bg-blue-400"; // Light blue for pending check-in
      case "checked_in":
        return "bg-green-400"; // Green for currently checked-in
      case "checked_out":
        return "bg-yellow-400"; // Yellow for checked-out
      default:
        return "bg-gray-300"; // Default or fallback color
    }
  };

  // --- Action Handlers ---
  // Modified newReservationHandler to be flexible for new bookings or re-bookings

  const newReservationHandler = (roomId, startDate) => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");

    navigate(
      `/hotel/new-reservation?roomId=${roomId}&checkInDate=${formattedDate}`
    );
  };
  const invoiceHandler = (reservationId) => {
    dispatch(get_a_reservation(reservationId)); // Fetch the specific reservation details
    navigate("/hotel/invoice"); // Navigate to the invoice page
  };

  const editHandler = (reservationId, roomId, startDate) => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");

    navigate(
      `/hotel/reservation/edit?reservationId=${reservationId}&&roomId=${roomId}&&checkInDate=${formattedDate}`
    ); // Navigate to the edit reservation page
  };

  // --- END Action Handlers ---

  return (
    <>
      <div className="parent grid grid-cols-1 bg-gray-800 justify-between">
        <span>
          <p className="parent grid grid-cols-1 bg-gray-800 text-white p-3 text-center text-xl">
            Select a Date
          </p>
        </span>
        <DatePicker
          className="parent grid grid-cols-1 bg-gray-800 text-white p-3 text-center text-xl"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>

      {loadingReservations && (
        <div className="text-center p-4 text-lg dark:text-white">
          Loading Reservations...
        </div>
      )}
      {reservationsError && (
        <div className="text-center p-4 text-lg text-red-500">
          Error:{" "}
          {reservationsError?.message || JSON.stringify(reservationsError)}
        </div>
      )}

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {categories &&
          categories.map((category, j) => (
            <table className="w-full" key={category._id}>
              <thead>
                <tr className="grid rounded-t-sm bg-primary text-white">
                  <th className="flex h-15 items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
                    <span className="hidden lg:block"> {category?.name} </span>
                    <span className="block lg:hidden"> {category?.name} </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="grid grid-cols-7">
                  {category.roomId.map((room, q) => {
                    const matchedReservation = reservations.find((res) => {
                      return (
                        res.roomDetails &&
                        Array.isArray(res.roomDetails) &&
                        res.roomDetails.some(
                          (detail) =>
                            detail.roomId && detail.roomId._id === room._id
                        )
                      );
                    });

                    const cellBgColor = matchedReservation
                      ? getReservationStatusColor(matchedReservation.status)
                      : "bg-gray-100 dark:bg-gray-700";

                    return (
                      <td
                        key={room._id}
                        className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-200 dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${cellBgColor}`}
                      >
                        {/* Always display the room number */}
                        <span className="font-medium text-black dark:text-white">
                          {room?.name}
                        </span>

                        <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                          {matchedReservation ? (
                            // Content for reserved rooms (will_check, checked_in, checked_out)
                            <div
                              className={`event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-sm border-l-[3px] border-primary ${getReservationStatusColor(
                                matchedReservation.status
                              )} px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:${getReservationStatusColor(
                                matchedReservation.status
                              )} md:visible md:w-[90%] md:opacity-100`}
                            >
                              {/* Reservation details */}
                              <span className="event-name text-sm font-semibold text-black dark:text-white">
                                {matchedReservation.residentId?.name || "Guest"}
                              </span>
                              <span className="time text-sm font-medium text-black dark:text-white">
                                {moment(matchedReservation.checkInDate).format(
                                  "MMM D"
                                )}{" "}
                                -{" "}
                                {moment(matchedReservation.checkOutDate).format(
                                  "MMM D"
                                )}
                              </span>
                              <span className="time text-xs text-black dark:text-white mb-2">
                                Status: {matchedReservation.status}
                              </span>

                              {/* Action Buttons for existing reservations */}
                              <div className="flex flex-wrap gap-1 mt-auto">
                                {/* Invoice Button (for checked_in & checked_out) */}
                                {(matchedReservation.status === "checked_in" ||
                                  matchedReservation.status === "checked_out" ||
                                  matchedReservation.status ===
                                    "will_check") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      invoiceHandler(matchedReservation._id);
                                    }}
                                    title="View Invoice"
                                    className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                  >
                                    {/* Heroicons-style SVG for Invoice */}
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      ></path>
                                    </svg>
                                    {/* Or use Font Awesome: <i className="fa-solid fa-file-invoice text-sm"></i> */}
                                  </button>
                                )}

                                {/* Edit Button (for checked_in & will_check) */}
                                {(matchedReservation.status === "checked_in" ||
                                  matchedReservation.status ===
                                    "will_check") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editHandler(
                                        matchedReservation._id,
                                        room._id,
                                        startDate
                                      );
                                    }}
                                    title="Edit Reservation"
                                    className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                  >
                                    {/* Heroicons-style SVG for Edit */}
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      ></path>
                                    </svg>
                                    {/* Or use Font Awesome: <i className="fa-solid fa-pencil text-sm"></i> */}
                                  </button>
                                )}

                                {/* New Booking Button (for checked_out) */}
                                {matchedReservation.status ===
                                  "checked_out" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      newReservationHandler(
                                        room._id,
                                        startDate
                                      );
                                    }}
                                    title="New Booking for this room"
                                    className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                  >
                                    {/* Heroicons-style SVG for Add */}
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path>
                                    </svg>
                                    {/* Or use Font Awesome: <i className="fa-solid fa-circle-plus text-sm"></i> */}
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            // Content for available rooms
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-sm text-gray-500 mt-2">
                                Available
                              </span>
                              {/* New Booking Button for Available rooms */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  newReservationHandler(room._id, startDate);
                                }}
                                title="New Booking"
                                className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 mt-1"
                              >
                                {/* Heroicons-style SVG for Add */}
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                                {/* Or use Font Awesome: <i className="fa-solid fa-circle-plus text-lg"></i> */}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          ))}
      </div>
    </>
  );
};

export default Calendar;
