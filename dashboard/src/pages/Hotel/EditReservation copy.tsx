import { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import HotelInvoice from "./HotelInvoice";
import {
  get_a_guest,
  guest_add,
  hotel_guests_get,
  update_reservation,
  get_a_reservation, // You'll likely need this action to fetch the specific reservation
} from "../../store/Actions/foodAction"; // Adjust path if needed
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/foodReducer";
import {
  available_rooms_get, // Keep this for new reservations if you reuse logic
  booked_rooms_get,
  get_a_room,
  available_rooms_get_for_edit,
  booked_rooms_get_for_edit, // Import the new action
} from "../../store/Actions/roomAction"; // Adjust path if needed
import { validatePhoneNumber } from "../../utils/validations";

// Constants
const RESERVATION_STATUS = [
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "will_check", label: "Will Check" },
  { value: "cancel", label: "Cancel" },
];

function EditReservation() {
  const { reservationId: paramReservationId } = useParams(); // Get reservation ID from URL

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mobile: "",
    description: "",
    source: "",
    other: "",
    otherAmount: 0,
    restaurant: "",
    restaurantAmount: 0,
    remark: "",
    totalGuest: 1,
    paidDetails: "",
  });

  // Component state
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBookedRoom, setSelectedBookedRoom] = useState(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [rackRate, setRackRate] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [newPaid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [due, setDue] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [dayStay, setDayStay] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(getNextDate(new Date(), 1));

  // Redux state
  const { guests, reservation, guest, errorMessage, successMessage } =
    useSelector((state) => state.food);
  const { rooms, room, bookedRooms } = useSelector((state) => state.room); // `rooms` will now contain available rooms + current reservation's room

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Utility functions
  function getNextDate(date, offset = 1) {
    const next = new Date(date);
    next.setDate(next.getDate() + offset);
    return next;
  }

  function calculateDayGap(start, end) {
    const oneDay = 1000 * 60 * 60 * 24;
    const startTime = new Date(start).setHours(0, 0, 0, 0);
    const endTime = new Date(end).setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((endTime - startTime) / oneDay));
  }

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const guestHandler = (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(formData.mobile)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    dispatch(
      guest_add({
        name: formData.name,
        address: formData.address,
        mobile: formData.mobile,
        description: formData.description,
      })
    );
  };

  const reservationHandler = (e) => {
    e.preventDefault();

    if (!selectedGuest?.value) {
      toast.error("Please select a guest");
      return;
    }

    if (!selectedRoom?.value) {
      toast.error("Please select a room");
      return;
    }

    if (!formData.paidDetails && newPaid > 0) {
      toast.error("Please enter payment details");
      return;
    }
    // --- NEW FRONTEND STATUS TRANSITION VALIDATION ---
    const currentStatus = reservation?.status; // Get the original status of the reservation
    const newStatus = selectedStatus?.value; // Get the new status selected by the user

    // Rule 1: Once checked_in, cannot make it will_check
    if (currentStatus === "checked_in" && newStatus === "will_check") {
      toast.error("Cannot change status from 'Checked In' to 'Will Check'.");
      return; // Stop the form submission
    }

    // Rule 2: Once cancel or checked_out, cannot make it checked_in or will_check
    if (
      (currentStatus === "cancel" || currentStatus === "checked_out") &&
      (newStatus === "checked_in" || newStatus === "will_check")
    ) {
      toast.error(
        `Cannot change status from '${currentStatus}' to '${newStatus}'. Reservation is already finalized.`
      );
      return; // Stop the form submission
    }
    // --- END NEW FRONTEND STATUS TRANSITION VALIDATION ---
    const existingPaidInfo = reservation?.paidInfo || [];
    let updatedPaidInfo = [...existingPaidInfo]; // Create a shallow copy of the existing array

    if (newPaid > 0) {
      updatedPaidInfo.push({
        paid: Number(newPaid),
        paidDetails: formData.paidDetails,
        currentDate: new Date(),
      });
    }
    dispatch(
      update_reservation({
        startDate,
        endDate,
        roomId: selectedRoom.value,
        rackRate,
        discountRate,
        category: room?.categoryId?.name,
        totalGuest: formData.totalGuest,
        guestId: selectedGuest.value,
        dayStay,
        totalAmount,
        source: formData.source,
        other: formData.other,
        otherAmount: formData.otherAmount,
        restaurant: formData.restaurant,
        restaurantAmount: formData.restaurantAmount,
        due,
        discount,
        paidInfo: updatedPaidInfo,
        finalAmount,
        status: newStatus,
        remark: formData.remark,
        billTransfer: selectedBookedRoom?.value,
        reservationId: reservation?._id, // Use the ID from useParams
      })
    );
  };

  // Effects

  useEffect(() => {
    if (reservation) {
      setStartDate(new Date(reservation.checkInDate));
      setEndDate(new Date(reservation.checkOutDate));
      setRackRate(reservation.roomDetails[0]?.rackRate || 0);
      setDiscountRate(reservation.roomDetails[0]?.discountRate || 0);
      setDayStay(reservation.roomDetails[0]?.dayStay || 1);
      setDiscount(reservation.discount || 0);

      setFormData({
        name: reservation.residentId?.name || "",
        address: reservation.residentId?.address || "",
        mobile: reservation.residentId?.mobile || "",
        description: reservation.residentId?.description || "",
        source: reservation.source || "",
        other: reservation.others?.other || "",
        otherAmount: reservation.others?.otherAmount || 0,
        restaurant: reservation.restaurants?.restaurant || "",
        restaurantAmount: reservation.restaurants?.restaurantAmount || 0,
        remark: reservation.remark || "",
        totalGuest: reservation.totalGuest || 1,
        paidDetails: "",
      });

      setTotalAmount(reservation.totalAmount || 0);
      setDue(reservation.due || 0);
      setFinalAmount(reservation.finalAmount || 0);
    }
  }, [reservation]);

  useEffect(() => {
    setDayStay(calculateDayGap(startDate, endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    dispatch(hotel_guests_get());
    // Use the new action for available rooms when editing
    if (reservation?._id) {
      dispatch(
        available_rooms_get_for_edit({
          startDate: startDate,
          reservationId: reservation?._id,
        })
      );
      dispatch(
        booked_rooms_get_for_edit({
          startDate: startDate,
          reservationId: reservation?._id,
        })
      );
    } else {
      // Fallback for new reservations, though this component is for edit
      dispatch(available_rooms_get(startDate));

      dispatch(booked_rooms_get(startDate));
    }
    // Still useful for Bill Transfer

    if (endDate <= startDate) {
      setEndDate(getNextDate(startDate, 1));
    }
  }, [dispatch, startDate, reservation?._id, endDate]); // Added endDate to dependency to re-run when it changes

  useEffect(() => {
    if (selectedRoom?.value) {
      dispatch(get_a_room(selectedRoom.value));
    }
  }, [selectedRoom, dispatch]);

  useEffect(() => {
    if (room?.categoryId) {
      setRackRate(room.categoryId.rackRate);
      setDiscountRate(room.categoryId.discountRate);
      setFormData((prev) => ({
        ...prev,
        totalGuest: room.categoryId.occupancy,
      }));
    }
  }, [room]);

  useEffect(() => {
    const baseAmount = dayStay * discountRate;
    const additionalCharges =
      Number(formData.otherAmount || 0) +
      Number(formData.restaurantAmount || 0);
    setTotalAmount(baseAmount + additionalCharges);
  }, [dayStay, discountRate, formData.otherAmount, formData.restaurantAmount]);

  useEffect(() => {
    const totalPaid =
      (reservation?.paidInfo?.reduce((sum, payment) => sum + payment.paid, 0) ||
        0) + Number(newPaid);
    const calculatedDue = totalAmount - totalPaid;
    const calculatedFinal = calculatedDue - discount;

    setDue(calculatedDue);
    setFinalAmount(calculatedFinal);
  }, [totalAmount, newPaid, discount, reservation]);

  // Data preparation for dropdowns
  const guestOptions = guests.map((guest) => ({
    value: guest._id,
    label: guest.name,
  }));

  const roomOptions = rooms.map((room) => ({
    value: room._id,
    label: room.name,
  }));

  const bookedRoomOptions = bookedRooms?.map((room) => ({
    value: room._id,
    label: room.name,
  }));

  // Auto-select guest and room when data is loaded
  useEffect(() => {
    if (reservation && guests.length > 0 && rooms.length > 0) {
      const matchedGuest = guests.find(
        (g) => g._id === reservation.residentId?._id
      );
      // Find the room that is part of *this* reservation
      const currentReservationRoom = reservation.roomDetails[0]?.roomId;
      const matchedRoom = rooms.find(
        (r) => r._id === currentReservationRoom?._id
      );

      if (matchedGuest) {
        setSelectedGuest({
          value: matchedGuest._id,
          label: matchedGuest.name,
        });
      }

      if (matchedRoom) {
        setSelectedRoom({
          value: matchedRoom._id,
          label: matchedRoom.name,
        });
      }

      if (reservation.status) {
        const statusOption = RESERVATION_STATUS.find(
          (s) => s.value === reservation.status
        );
        setSelectedStatus(statusOption);
      }

      // Auto-select bill transfer room if exists
      if (reservation.billTransfer && bookedRooms.length > 0) {
        const matchedBillTransferRoom = bookedRooms.find(
          (r) => r._id === reservation.billTransfer
        );
        if (matchedBillTransferRoom) {
          setSelectedBookedRoom({
            value: matchedBillTransferRoom._id,
            label: matchedBillTransferRoom.name,
          });
        }
      }
    }
  }, [reservation, guests, rooms, bookedRooms]); // Added bookedRooms to dependency

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate("/hotel/invoice");
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  // Check if check-in date is in the past
  const isPastCheckIn = new Date() > new Date(startDate);

  return (
    <div className="space-y-4">
      {/* ... (rest of your JSX remains largely the same) ... */}
      {/* Guest Information Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {["name", "address", "mobile", "description"].map((field) => (
          <div
            key={field}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{`Guest ${field.charAt(0).toUpperCase() + field.slice(1)}`}</p>
              <input
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                type={field === "mobile" ? "tel" : "text"}
                placeholder={`Guest ${field}`}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {field === "description" && !guest && (
                <button
                  className="inline-flex items-center justify-center rounded-full py-3 px-2.5 bg-primary text-center font-medium text-white hover:bg-opacity-90"
                  onClick={guestHandler}
                >
                  Update Guest
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dates and Room Selection */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Check In</p>
            <DatePicker
              selected={startDate}
              onChange={(date) => !isPastCheckIn && setStartDate(date)}
              minDate={new Date()}
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary ${
                isPastCheckIn ? "bg-gray-100 cursor-not-allowed" : ""
              } dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
              readOnly={isPastCheckIn}
            />
            {isPastCheckIn && (
              <p className="text-xs text-gray-500 mt-1">
                Check-in date cannot be changed after check-in
              </p>
            )}
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Check Out</p>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Room No</p>
            <Select
              options={roomOptions}
              value={selectedRoom}
              onChange={setSelectedRoom}
              placeholder="Select Room"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Total Guest</p>
            <input
              name="totalGuest"
              type="number"
              min="1"
              value={formData.totalGuest}
              onChange={handleNumberInput}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Rates and Calculation Section */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { label: "Rack Rate", value: rackRate, readOnly: true },
          { label: "Offer Rate", value: discountRate, readOnly: true },
          { label: "Total Stay", value: dayStay, readOnly: true },
          { label: "Total Amount", value: totalAmount, readOnly: true },
        ].map((field, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{field.label}</p>
              <input
                value={field.value}
                readOnly={field.readOnly}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Guest Selection and Additional Info */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Guest Name</p>
            <Select
              options={guestOptions}
              value={selectedGuest}
              onChange={setSelectedGuest}
              placeholder="Select Guest"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {["source", "other", "restaurant"].map((field) => (
          <div
            key={field}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>
                {field === "other"
                  ? "Others Service"
                  : field === "restaurant"
                    ? "Restaurant Service"
                    : "Guest Source"}
              </p>
              <input
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                type="text"
                placeholder={
                  field === "other"
                    ? "Others"
                    : field === "restaurant"
                      ? "Restaurant Service"
                      : "Source"
                }
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Consolidated Payment Section */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Others Charge</p>
            <input
              name="otherAmount"
              value={formData.otherAmount}
              onChange={handleNumberInput}
              type="number"
              min="0"
              placeholder="Others Charge"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Restaurant Amount</p>
            <input
              name="restaurantAmount"
              value={formData.restaurantAmount}
              onChange={handleNumberInput}
              type="number"
              min="0"
              placeholder="Restaurant Amount"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Discount</p>
            <input
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value === "" ? "" : Number(e.target.value))
              }
              type="number"
              min="0"
              placeholder="Discount"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Paid Amount</p>
            <input
              value={newPaid}
              onChange={(e) =>
                setPaid(e.target.value === "" ? "" : Number(e.target.value))
              }
              type="number"
              min="0"
              placeholder="Paid Amount"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Consolidated Final Section (Due, Paid Details, Balance, Status) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Paid Details</p>
            <input
              name="paidDetails"
              value={formData.paidDetails}
              onChange={handleInputChange}
              type="text"
              placeholder="Paid Details"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Due</p>
            <input
              value={due}
              readOnly
              type="number"
              placeholder="Due"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Balance</p>
            <input
              value={finalAmount}
              readOnly
              type="number"
              placeholder="Balance"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Status</p>
            <Select
              options={RESERVATION_STATUS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Status"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>

      {/* Remark and Action Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div className="w-full sm:w-3/4">
          <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-2.5 p-2.5 h-full">
              <p>Remark</p>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                placeholder="Remark"
                className="w-full h-full min-h-[160px] rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/4 flex flex-col gap-4">
          <div className="flex-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-2.5 p-2.5 h-full">
              <p>Bill Transfer</p>
              <Select
                options={bookedRoomOptions}
                value={selectedBookedRoom}
                onChange={setSelectedBookedRoom}
                placeholder="Select Room"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="flex-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-2.5 p-2.5 justify-between h-full">
              <button
                onClick={reservationHandler}
                className="inline-flex items-center justify-center mt-3 rounded-full py-3 px-4 bg-green-600 text-center font-medium text-white hover:bg-green-700 transition-colors"
              >
                Update Reservation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="mt-6">
        <HotelInvoice
          guest={guest || reservation?.residentId}
          room={room || reservation?.roomDetails[0]?.roomId}
          dayStay={dayStay || reservation?.roomDetails[0]?.dayStay}
          startDate={startDate || reservation?.checkInDate}
          endDate={endDate || reservation?.checkOutDate}
          currentDate={new Date()}
          discount={discount || reservation?.discount}
          newPaid={newPaid}
          finalAmount={finalAmount}
          paidInfo={[
            ...(reservation?.paidInfo || []),
            ...(newPaid > 0
              ? [
                  {
                    paid: newPaid,
                    paidDetails: formData.paidDetails,
                    currentDate: new Date(),
                  },
                ]
              : []),
          ]}
          source={formData.source || reservation?.source}
          other={formData.other || reservation?.others?.other}
          otherAmount={formData.otherAmount || reservation?.others?.otherAmount}
          restaurant={
            formData.restaurant || reservation?.restaurants?.restaurant
          }
          restaurantAmount={
            formData.restaurantAmount ||
            reservation?.restaurants?.restaurantAmount
          }
          totalAmount={totalAmount || reservation?.totalAmount}
          status={selectedStatus?.label || reservation?.status}
          rackRate={rackRate || reservation?.roomDetails[0]?.rackRate}
          discountRate={
            discountRate || reservation?.roomDetails[0]?.discountRate
          }
          remark={formData.remark || reservation?.remark}
        />
      </div>
    </div>
  );
}

export default EditReservation;
