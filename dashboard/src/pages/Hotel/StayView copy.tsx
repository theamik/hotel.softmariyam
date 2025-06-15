import React, { useEffect, useState, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import {
  categories_get,
  get_a_room,
  rooms_get,
} from "../../store/Actions/roomAction";
import {
  get_a_reservation,
  get_reservations_by_date_status,
} from "../../store/Actions/foodAction";

const StayView = () => {
  const [startDate, setStartDate] = useState(new Date());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, rooms } = useSelector((state) => state.room);
  const { reservations, loadingReservations, reservationsError } = useSelector(
    (state) => state.food
  );

  const numberOfDays = 7;

  useEffect(() => {
    dispatch(rooms_get());
    dispatch(categories_get());
  }, [dispatch]);

  useEffect(() => {
    const formatted = moment(startDate).format("YYYY-MM-DD");
    // 👉 fetch all statuses for that date
    dispatch(
      get_reservations_by_date_status(
        formatted /*, ["will_check","checked_in","checked_out","complimentary","maintenance","out_of_order"]*/
      )
    );
  }, [startDate, dispatch]);

  useEffect(() => {
    console.log(
      "Reservations:",
      reservations.map((r) => ({
        id: r._id,
        status: r.status,
        checkIn: r.checkInDate,
        checkOut: r.checkOutDate,
        rooms: r.roomDetails?.map((d) => d.roomId?.name).join(", "),
      }))
    );
  }, [reservations]);

  const getStatusColor = useCallback((st) => {
    switch (st) {
      case "will_check":
        return "bg-green-500";
      case "checked_in":
        return "bg-blue-500";
      case "checked_out":
        return "bg-orange-400";
      case "out_of_order":
        return "bg-red-500";
      case "maintenance":
        return "bg-gray-400";
      case "complimentary":
        return "bg-yellow-400";
      default:
        return "bg-gray-200";
    }
  }, []);

  const newReservation = useCallback(
    (roomId) => {
      dispatch(get_a_room(roomId));
      navigate("/hotel/new-reservation");
    },
    [dispatch, navigate]
  );
  const viewInvoice = useCallback(
    (resId) => {
      dispatch(get_a_reservation(resId));
      navigate("/hotel/invoice");
    },
    [dispatch, navigate]
  );
  const editReservation = useCallback(
    (resId) => {
      dispatch(get_a_reservation(resId));
      navigate("/hotel/reservation/edit");
    },
    [dispatch, navigate]
  );

  const dates = useMemo(
    () =>
      Array.from({ length: numberOfDays }, (_, i) =>
        moment(startDate).add(i, "days")
      ),
    [startDate]
  );

  const roomsByCategory = useMemo(() => {
    const grp = {};
    categories.forEach((c) => {
      grp[c._id] = {
        ...c,
        rooms: rooms.filter((r) => r.category === c._id),
      };
    });
    return grp;
  }, [categories, rooms]);

  const getReservationsForRoomAndDate = useCallback(
    (roomId, date) => {
      const dayStart = moment(date).startOf("day");
      return reservations.filter((r) => {
        const ci = moment(r.checkInDate).startOf("day");
        const co = moment(r.checkOutDate).startOf("day").add(1, "day");
        const inRes = r.roomDetails?.some((d) => d.roomId?._id === roomId);
        return inRes && dayStart.isBetween(ci, co, null, "[)");
      });
    },
    [reservations]
  );

  const availability = useMemo(() => {
    const obj = {};
    dates.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      const occupied = rooms.reduce((acc, r) => {
        return acc + (getReservationsForRoomAndDate(r._id, d).length > 0);
      }, 0);
      obj[key] = rooms.length - occupied;
    });
    return obj;
  }, [dates, rooms, getReservationsForRoomAndDate]);

  return (
    <>
      <div className="flex justify-between items-center bg-gray-800 text-white p-3">
        <DatePicker
          className="bg-gray-800 text-white text-lg px-2 py-1 rounded"
          selected={startDate}
          onChange={(d) => setStartDate(d)}
          dateFormat="yyyy-MM-dd"
        />
        <h2 className="text-xl font-semibold">Stay View</h2>
        <div className="flex gap-2 text-sm">
          <LegendDot color="bg-green-500" label="Assigned" />
          <LegendDot color="bg-blue-500" label="Checked In" />
          <LegendDot color="bg-orange-400" label="Checked Out" />
          <LegendDot color="bg-yellow-400" label="Complimentary" />
          <LegendDot color="bg-gray-400" label="Maintenance" />
          <LegendDot color="bg-red-500" label="Out of Order" />
        </div>
      </div>

      {loadingReservations && (
        <div className="text-center p-4 text-lg">Loading Reservations...</div>
      )}
      {reservationsError && (
        <div className="text-center p-4 text-red-500">
          Error:{" "}
          {reservationsError.message || JSON.stringify(reservationsError)}
        </div>
      )}

      <div className="w-full overflow-x-auto border bg-white shadow">
        <div className="min-w-[1200px]">
          {/* Headers */}
          <div className="grid grid-cols-[100px_repeat(7,minmax(150px,1fr))] border-b bg-gray-100">
            <div className="py-2 px-3 font-semibold text-center">Room</div>
            {dates.map((d, i) => (
              <div key={i} className="py-2 px-3 text-center">
                {d.format("D MMM")}
                <br />
                <span className="text-sm text-gray-600">{d.format("ddd")}</span>
              </div>
            ))}
          </div>

          {/* Rooms */}
          {Object.values(roomsByCategory).map((cat) => (
            <React.Fragment key={cat._id}>
              <div className="col-span-full py-2 px-3 bg-primary text-white font-semibold">
                {cat.name}
              </div>
              {cat.roomId.map((room) => (
                <div
                  key={room._id}
                  className="grid grid-cols-[100px_repeat(7,minmax(150px,1fr))] border-b"
                >
                  <div className="py-3 px-3 text-center font-medium">
                    {room.name}
                  </div>

                  {dates.map((d, di) => {
                    const resArr = getReservationsForRoomAndDate(room._id, d);
                    const has = resArr.length > 0;
                    const res = has ? resArr[0] : null;

                    let span = 1;
                    let isStart = false;
                    if (res) {
                      const ci = moment(res.checkInDate).startOf("day");
                      span = Math.min(
                        moment(res.checkOutDate).diff(ci, "days") || 1,
                        numberOfDays - di
                      );
                      isStart = ci.isSame(d, "day");
                    }

                    if (!has) {
                      return (
                        <div
                          key={di}
                          className="relative h-20 border-l bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-sm text-gray-500">
                              Available
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                newReservation(room._id);
                              }}
                              className="p-1 rounded-full text-gray-800 hover:bg-gray-200 mt-1"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (!isStart) {
                      // Reserve span cells without rendering block
                      return (
                        <div
                          key={di}
                          className="border-l"
                          style={{ gridColumn: `span ${span}` }}
                        />
                      );
                    }

                    return (
                      <div
                        key={di}
                        className={`relative h-20 border-l ${getStatusColor(
                          res.status
                        )}`}
                        style={{ gridColumn: `span ${span}` }}
                      >
                        <div
                          className="flex flex-col h-full w-full rounded-sm p-2 text-white"
                          title={`${res.residentId?.name || "Guest"} (${moment(
                            res.checkInDate
                          ).format(
                            "MMM D"
                          )} - ${moment(res.checkOutDate).format("MMM D")})`}
                        >
                          <span className="font-semibold text-sm truncate">
                            {res.residentId?.name ||
                              {
                                out_of_order: "Out of Order",
                                maintenance: "Maintenance",
                              }[res.status] ||
                              "Guest"}
                          </span>
                          <span className="text-xs opacity-90 truncate">
                            {moment(res.checkInDate).format("MMM D")} -{" "}
                            {moment(res.checkOutDate).format("MMM D")}
                          </span>
                          <span className="text-xs opacity-80 mt-auto">
                            Status: {res.status.replace(/_/g, " ")}
                          </span>
                          <div className="flex gap-1 mt-1 justify-end">
                            {(res.status === "will_check" ||
                              res.status === "checked_in" ||
                              res.status === "checked_out" ||
                              res.status === "complimentary") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewInvoice(res._id);
                                }}
                                title="View Invoice"
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                {/* invoice svg */}
                                ...
                              </button>
                            )}
                            {(res.status === "will_check" ||
                              res.status === "checked_in" ||
                              res.status === "complimentary") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editReservation(res._id);
                                }}
                                title="Edit Reservation"
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                {/* edit svg */}
                                ...
                              </button>
                            )}
                            {res.status === "checked_out" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  newReservation(room._id);
                                }}
                                title="New Booking"
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                {/* plus svg */}
                                ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Available summary */}
          <div className="grid grid-cols-[100px_repeat(7,minmax(150px,1fr))] border-t-2 mt-4 bg-gray-100">
            <div className="py-2 px-3 text-center font-semibold">Available</div>
            {dates.map((d, i) => (
              <div key={i} className="py-2 px-3 text-center">
                {availability[d.format("YYYY-MM-DD")] || 0}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const LegendDot = ({ color, label }) => (
  <span className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded-full ${color}`}></span> {label}
  </span>
);

export default StayView;
