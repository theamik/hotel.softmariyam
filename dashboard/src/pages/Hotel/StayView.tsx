// StayView.tsx — Final Fix with Popup + Icons in Full-Day and Half-Day Blocks 💎

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
  const [popupType, setPopupType] = useState<string>("");

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
        return "bg-blue-500";
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
        return "bg-blue-500";
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
    [dispatch, navigate]
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
          <LegendDot color="bg-blue-500" label="Assigned" />
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

                    const checkInRes = reservations.find(
                      (r: any) =>
                        r.roomDetails?.some(
                          (rd: any) => rd.roomId?._id === room._id
                        ) && moment(r.checkInDate).isSame(date, "day")
                    );

                    const checkOutRes = reservations.find(
                      (r: any) =>
                        r.roomDetails?.some(
                          (rd: any) => rd.roomId?._id === room._id
                        ) && moment(r.checkOutDate).isSame(date, "day")
                    );

                    const fullRes = reservations.find(
                      (r: any) =>
                        r.roomDetails?.some(
                          (rd: any) => rd.roomId?._id === room._id
                        ) &&
                        moment(r.checkInDate).isBefore(date, "day") &&
                        moment(r.checkOutDate).isAfter(date, "day")
                    );

                    const sameResId =
                      checkInRes?._id && checkInRes._id === checkOutRes?._id;

                    if (!checkInRes && !checkOutRes && !fullRes) {
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
                        className="relative border flex flex-col cursor-pointer"
                        onClick={() => {
                          if (checkOutRes && !checkInRes && !fullRes) {
                            setPopupRes(checkOutRes);
                            setPopupType("checkout");
                          } else if (checkInRes && !checkOutRes && !fullRes) {
                            setPopupRes(checkInRes);
                            setPopupType("checkin");
                          } else if (fullRes) {
                            setPopupRes(fullRes);
                            setPopupType("full");
                          } else {
                            setPopupRes(null);
                            setPopupType("available");
                          }
                          setPopupRoom(room._id);
                          setPopupDate(date);
                        }}
                      >
                        {checkOutRes && (!sameResId || !checkInRes) && (
                          <div
                            className={`h-1/2 ${getStatusColor(checkOutRes.status)} px-2 text-white text-xs flex items-center justify-between rounded-t-full`}
                          >
                            <span>
                              {checkOutRes.residentId?.name.slice(0, 10)}
                            </span>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewInvoice(checkOutRes._id);
                                }}
                                title="Invoice"
                              >
                                📄
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editReservation(
                                    checkOutRes._id,
                                    room._id,
                                    date
                                  );
                                }}
                                title="Edit"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        )}
                        {checkInRes && (!sameResId || !checkOutRes) && (
                          <div
                            className={`h-1/2 ${getStatusColor(checkInRes.status)} px-2 text-white text-xs flex items-center justify-between rounded-b-full`}
                          >
                            <span>
                              {checkInRes.residentId?.name.slice(0, 10)}
                            </span>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewInvoice(checkInRes._id);
                                }}
                                title="Invoice"
                              >
                                📄
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editReservation(
                                    checkInRes._id,
                                    room._id,
                                    date
                                  );
                                }}
                                title="Edit"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        )}
                        {checkInRes && checkOutRes && sameResId && (
                          <>
                            <div
                              className={`h-1/2 ${getStatusColor(checkOutRes.status)} px-2 text-white text-xs flex items-center justify-between rounded-t-full`}
                            >
                              <span>
                                {checkOutRes.residentId?.name.slice(0, 10)}
                              </span>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewInvoice(checkOutRes._id);
                                  }}
                                  title="Invoice"
                                >
                                  📄
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editReservation(
                                      checkOutRes._id,
                                      room._id,
                                      date
                                    );
                                  }}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                            <div
                              className={`h-1/2 ${getStatusColor(checkInRes.status)} px-2 text-white text-xs flex items-center justify-between rounded-b-full`}
                            >
                              <span>
                                {checkInRes.residentId?.name.slice(0, 10)}
                              </span>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewInvoice(checkInRes._id);
                                  }}
                                  title="Invoice"
                                >
                                  📄
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editReservation(
                                      checkInRes._id,
                                      room._id,
                                      date
                                    );
                                  }}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        {fullRes && !checkInRes && !checkOutRes && (
                          <div
                            className={`h-full ${getStatusColor(fullRes.status)} px-2 text-white text-xs flex items-center justify-between rounded-full`}
                          >
                            <span>{fullRes.residentId?.name.slice(0, 10)}</span>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewInvoice(fullRes._id);
                                }}
                                title="Invoice"
                              >
                                📄
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editReservation(fullRes._id, room._id, date);
                                }}
                                title="Edit"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {popupRoom && popupDate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-2">
              {popupRes ? popupRes.residentId?.name.slice(0, 10) : "Available"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {popupDate.format("dddd, MMM D")}
            </p>
            <div className="flex justify-end gap-2">
              {popupType !== "available" && (
                <>
                  <button
                    onClick={() => viewInvoice(popupRes._id)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Invoice
                  </button>
                  <button
                    onClick={() =>
                      editReservation(popupRes._id, popupRoom._id, popupDate)
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </>
              )}
              {popupType === "checkout" && (
                <button
                  onClick={() => newReservation(popupRoom!, popupDate!)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  New Booking
                </button>
              )}
              {popupType === "available" && (
                <button
                  onClick={() => newReservation(popupRoom!, popupDate!)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  New Booking
                </button>
              )}
              <button
                onClick={() => {
                  setPopupRes(null);
                  setPopupRoom(null);
                  setPopupDate(null);
                  setPopupType("");
                }}
                className="text-sm text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded-full ${color}`}></span> {label}
  </span>
);

export default StayView;
