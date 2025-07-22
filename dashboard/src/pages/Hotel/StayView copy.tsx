// Updated StayView component with fixed modal date formatting and conditional "New Booking" button

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { categories_get, rooms_get } from "../../store/Actions/roomAction";
import {
  get_a_reservation,
  get_reservations_by_date_status_stay_view,
} from "../../store/Actions/foodAction";

const StayView = () => {
  const [startDate, setStartDate] = useState<Date>(
    moment().startOf("day").toDate()
  );
  const [popupRes, setPopupRes] = useState<any>(null);
  const [popupRoom, setPopupRoom] = useState<string | null>(null);
  const [popupDate, setPopupDate] = useState<moment.Moment | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, rooms } = useSelector((state: any) => state.room);
  const { reservations } = useSelector((state: any) => state.food);

  const numberOfDays = 7;
  const dateCellWidth = 150;

  useEffect(() => {
    dispatch(rooms_get());
    dispatch(categories_get());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      get_reservations_by_date_status_stay_view({ startDate, numberOfDays })
    );
  }, [startDate, numberOfDays, dispatch]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "will_check":
        return "bg-red-200";
      case "checked_in":
        return "bg-green-500";
      case "checked_out":
        return "bg-orange-400";
      case "out_of_order":
        return "bg-red-500";
      case "maintenance":
        return "bg-gray-400";
      case "complimentary":
        return "bg-yellow-400";
      case "cancel":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  }, []);

  const viewInvoice = useCallback(
    (id: string) => {
      dispatch(get_a_reservation(id));
      navigate("/hotel/invoice");
    },
    [dispatch, navigate]
  );

  const editReservation = useCallback(
    (reservationId, roomId, startDate) => {
      const formattedDate = moment(startDate).format("YYYY-MM-DD");
      navigate(
        `/hotel/reservation/edit?reservationId=${reservationId}&&roomId=${roomId}&&checkInDate=${formattedDate}`
      );
    },
    [navigate]
  );

  const newReservation = (roomId: string, date: moment.Moment) => {
    navigate(
      `/hotel/new-reservation?roomId=${roomId}&checkInDate=${date.format("YYYY-MM-DD")}`
    );
  };

  const dates = useMemo(
    () =>
      Array.from({ length: numberOfDays }, (_, i) =>
        moment(startDate).add(i, "days").startOf("day")
      ),
    [startDate, numberOfDays]
  );

  const roomsByCategory = useMemo(() => {
    const grouped: any = {};
    categories.forEach((cat: any) => {
      const roomList = cat.roomId
        ?.map((id: string) => rooms.find((r: any) => r._id === id))
        .filter(Boolean);
      grouped[cat._id] = { ...cat, rooms: roomList };
    });
    return grouped;
  }, [categories, rooms]);

  const PopupModal = () => {
    if (!popupRes || !popupRoom || !popupDate) return null;

    const isCheckout = popupRes.roomDetails.find(
      (rd) =>
        moment(rd.checkOutDate).isSame(popupDate, "day") &&
        rd.roomId?._id === popupRoom
    );

    const isRoomFree = !reservations.some(
      (res) =>
        res._id !== popupRes._id &&
        res.roomDetails?.some(
          (rd) =>
            rd.roomId?._id === popupRoom &&
            moment(popupDate).isSameOrAfter(moment(rd.checkInDate), "day") &&
            moment(popupDate).isBefore(moment(rd.checkOutDate), "day")
        )
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-xl p-4 w-72 text-center shadow-lg">
          <h3 className="text-lg font-semibold mb-2">
            {popupRes.residentId?.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {popupDate.format("dddd, MMM DD, YYYY")}
          </p>
          <div className="flex justify-center gap-2">
            <button
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => viewInvoice(popupRes._id)}
            >
              Invoice
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={() =>
                editReservation(popupRes._id, popupRoom, popupDate)
              }
            >
              Edit
            </button>
            {isCheckout && isRoomFree && (
              <button
                className="bg-red-200 px-3 py-1 rounded"
                onClick={() => newReservation(popupRoom, popupDate)}
              >
                New Booking
              </button>
            )}
            <button
              className="ml-2 text-gray-600"
              onClick={() => setPopupRes(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center bg-gray-800 text-white p-3 sticky top-0 z-50">
        <DatePicker
          className="bg-gray-800 text-white text-lg px-2 py-1 rounded"
          selected={startDate}
          onChange={(d: Date) => setStartDate(d)}
          dateFormat="yyyy-MM-dd"
        />
        <h2 className="text-xl font-semibold">Stay View</h2>
        <div className="flex gap-2 text-sm">
          <LegendDot color="bg-red-200" label="Assigned" />
          <LegendDot color="bg-green-500" label="Checked In" />
          <LegendDot color="bg-orange-400" label="Checked Out" />
        </div>
      </div>

      <div
        className="grid sticky top-[60px] bg-white z-40"
        style={{
          gridTemplateColumns: `150px repeat(${numberOfDays}, ${dateCellWidth}px)`,
        }}
      >
        <div className="bg-gray-200 font-semibold text-center p-2">Room</div>
        {dates.map((d, i) => (
          <div key={i} className="bg-gray-100 text-center p-2">
            {d.format("D MMM")}
            <div className="text-sm text-gray-600">{d.format("ddd")}</div>
          </div>
        ))}
      </div>

      <div className="overflow-auto max-h-[calc(100vh-120px)]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `150px repeat(${numberOfDays}, ${dateCellWidth}px)`,
          }}
        >
          {Object.values(roomsByCategory).map((cat: any) => (
            <React.Fragment key={cat._id}>
              <div className="col-span-full bg-gray-300 font-semibold p-2">
                {cat.name}
              </div>
              {cat.roomId.map((room: any) => (
                <React.Fragment key={room._id}>
                  <div className="border-r text-sm font-medium flex items-center justify-center bg-gray-50">
                    {room.name}
                  </div>
                  {dates.map((date) => {
                    const cellKey = `${room._id}_${date.format("YYYY-MM-DD")}`;
                    const dayRes = reservations.filter((res: any) =>
                      res.roomDetails?.some((rd: any) => {
                        const isSameRoom = rd.roomId?._id === room._id;
                        const checkIn = moment(rd.checkInDate);
                        const checkOut = moment(rd.checkOutDate);
                        return (
                          isSameRoom &&
                          date.isSameOrAfter(checkIn, "day") &&
                          date.isSameOrBefore(checkOut, "day")
                        );
                      })
                    );

                    if (!dayRes.length) {
                      return (
                        <div
                          key={cellKey}
                          className="flex items-center justify-center border text-gray-400 text-xl cursor-pointer h-full"
                          onClick={() => newReservation(room._id, date)}
                        >
                          +
                        </div>
                      );
                    }

                    return (
                      <div
                        key={cellKey}
                        className="relative border text-white text-xs cursor-pointer h-12"
                      >
                        {dayRes.map((res, idx) => {
                          const rd = res.roomDetails.find(
                            (r) => r.roomId?._id === room._id
                          );
                          const showTop = moment(rd.checkOutDate).isSame(
                            date,
                            "day"
                          );
                          const showBottom = moment(rd.checkInDate).isSame(
                            date,
                            "day"
                          );
                          const showFull =
                            !showTop &&
                            !showBottom &&
                            moment(date).isBetween(
                              moment(rd.checkInDate),
                              moment(rd.checkOutDate),
                              "day"
                            );

                          const handleClick = () => {
                            setPopupRes(res);
                            setPopupRoom(room._id);
                            setPopupDate(date);
                          };

                          return (
                            <React.Fragment key={idx}>
                              {showTop && (
                                <div
                                  className={`${getStatusColor(res.status)} absolute top-0 left-0 right-0 h-1/2 rounded-t-full px-2 flex items-center justify-between`}
                                  onClick={handleClick}
                                >
                                  <span>
                                    {res.residentId?.name?.slice(0, 10)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editReservation(res._id, room._id, date);
                                    }}
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                              {showBottom && (
                                <div
                                  className={`${getStatusColor(res.status)} absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full px-2 flex items-center justify-between`}
                                  onClick={handleClick}
                                >
                                  <span>
                                    {res.residentId?.name?.slice(0, 10)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewInvoice(res._id);
                                    }}
                                  >
                                    📄
                                  </button>
                                </div>
                              )}
                              {showFull && (
                                <div
                                  className={`${getStatusColor(res.status)} absolute top-0 left-0 right-0 bottom-0 rounded-full px-2 flex items-center justify-between`}
                                  onClick={handleClick}
                                >
                                  <span>
                                    {res.residentId?.name?.slice(0, 10)}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewInvoice(res._id);
                                      }}
                                    >
                                      📄
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        editReservation(
                                          res._id,
                                          room._id,
                                          date
                                        );
                                      }}
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <PopupModal />
    </div>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded-full ${color}`}></span> {label}
  </span>
);

export default StayView;
