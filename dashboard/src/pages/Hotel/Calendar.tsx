import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { categories_get, rooms_get } from "../../store/Actions/roomAction";
import {
  get_a_reservation,
  get_reservations_by_date_status,
} from "../../store/Actions/foodAction";

const Calendar = () => {
  const [startDate, setStartDate] = useState(new Date());

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state?.room);
  const { reservations, loadingReservations, reservationsError } = useSelector(
    (state) => state?.food
  );

  useEffect(() => {
    dispatch(rooms_get());
    dispatch(categories_get());
  }, [dispatch]);

  useEffect(() => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");
    dispatch(get_reservations_by_date_status(formattedDate));
  }, [startDate, dispatch]);

  const getReservationStatusColor = (status) => {
    switch (status) {
      case "will_check":
        return "bg-blue-400";
      case "checked_in":
        return "bg-green-400";
      case "checked_out":
        return "bg-yellow-400";
      default:
        return "bg-gray-300";
    }
  };

  const newReservationHandler = (roomId, startDate) => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");
    navigate(
      `/hotel/new-reservation?roomId=${roomId}&checkInDate=${formattedDate}`
    );
  };

  const invoiceHandler = (reservationId) => {
    dispatch(get_a_reservation(reservationId));
    navigate("/hotel/invoice");
  };

  const editHandler = (reservationId, roomId, startDate) => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");
    navigate(
      `/hotel/reservation/edit?reservationId=${reservationId}&&roomId=${roomId}&&checkInDate=${formattedDate}`
    );
  };

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
          categories.map((category) => (
            <table className="w-full" key={category._id}>
              <thead>
                <tr className="grid rounded-t-sm bg-primary text-white">
                  <th className="flex h-15 items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
                    {category?.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="grid grid-cols-7">
                  {category.roomId.map((room) => {
                    const matchedReservation = reservations.find((res) => {
                      return (
                        res.roomDetails &&
                        Array.isArray(res.roomDetails) &&
                        res.roomDetails.some(
                          (detail) =>
                            detail.roomId &&
                            detail.roomId._id === room._id &&
                            moment(detail.checkOutDate).isSameOrAfter(
                              moment(startDate).format("YYYY-MM-DD")
                            ) &&
                            moment(res.checkInDate).isSameOrBefore(
                              moment(startDate).format("YYYY-MM-DD")
                            )
                        )
                      );
                    });

                    const roomDetailForThisRoom =
                      matchedReservation?.roomDetails?.find(
                        (detail) =>
                          detail.roomId && detail.roomId._id === room._id
                      );

                    const cellBgColor = matchedReservation
                      ? getReservationStatusColor(matchedReservation.status)
                      : "bg-gray-100 dark:bg-gray-700";

                    return (
                      <td
                        key={room._id}
                        className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-200 dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${cellBgColor}`}
                      >
                        <span className="font-medium text-black dark:text-white">
                          {room?.name}
                        </span>

                        <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                          {matchedReservation && roomDetailForThisRoom ? (
                            <div
                              className={`event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-sm border-l-[3px] border-primary ${getReservationStatusColor(
                                matchedReservation.status
                              )} px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:${getReservationStatusColor(
                                matchedReservation.status
                              )} md:visible md:w-[90%] md:opacity-100`}
                            >
                              <span className="event-name text-sm font-semibold text-black dark:text-white">
                                {matchedReservation.residentId?.name || "Guest"}
                              </span>
                              <span className="time text-sm font-medium text-black dark:text-white">
                                {moment(matchedReservation.checkInDate).format(
                                  "MMM D"
                                )}{" "}
                                -{" "}
                                {moment(
                                  roomDetailForThisRoom.checkOutDate
                                ).format("MMM D")}
                              </span>
                              <span className="time text-xs text-black dark:text-white mb-2">
                                Status: {matchedReservation.status}
                              </span>

                              <div className="flex flex-wrap gap-1 mt-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    invoiceHandler(matchedReservation._id);
                                  }}
                                  title="View Invoice"
                                  className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                  📄
                                </button>

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
                                  ✏️
                                </button>

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
                                    title="New Booking"
                                    className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                  >
                                    ➕
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-sm text-gray-500 mt-2">
                                Available
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  newReservationHandler(room._id, startDate);
                                }}
                                title="New Booking"
                                className="p-1 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 mt-1"
                              >
                                ➕
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
