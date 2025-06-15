import { useEffect, useState } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import HotelInvoice from "./HotelInvoice";
import {
  get_a_guest,
  guest_add,
  hotel_guests_get,
  new_reservation,
} from "../../store/Actions/foodAction";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/foodReducer";
import {
  available_rooms_get,
  booked_rooms_get,
  get_a_room,
} from "../../store/Actions/roomAction";
import { validatePhoneNumber, validateEmail } from "../../utils/validations";
import queryString from "query-string";

// Status options for dropdown
const RESERVATION_STATUS = [
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "will_check", label: "Will Check" },
  { value: "cancel", label: "Cancel" },
];

function Reservation() {
  const location = useLocation();
  const { roomId, checkInDate } = queryString.parse(location.search);
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
  const [paidDetails, setPaidDetails] = useState("");
  const [discount, setDiscount] = useState(0);
  const [due, setDue] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [dayStay, setDayStay] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(getNextDate(new Date(), 1));

  // Redux state
  const { guests, guest, errorMessage, successMessage } = useSelector(
    (state) => state.food
  );
  const { rooms, room, bookedRooms } = useSelector((state) => state.room);

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
    if (!isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    }
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
    setTimeout(() => {
      dispatch(hotel_guests_get());
    }, 1000);
  };

  const reservationHandler = (e) => {
    e.preventDefault();

    // --- EXISTING VALIDATIONS ---
    if (!selectedGuest?.value) {
      toast.error("Please select a guest");
      return;
    }

    if (!selectedRoom?.value) {
      toast.error("Please select a room");
      return;
    }

    if (!formData.source) {
      toast.error("Please give source");
      return;
    }
    // --- END EXISTING VALIDATIONS ---

    // --- NEW FRONTEND STATUS VALIDATION ---
    const selectedStatusValue = selectedStatus?.value; // Get the raw value from the dropdown/selector

    const invalidStatusesForNewReservation = ["cancel", "checked_out"];

    if (invalidStatusesForNewReservation.includes(selectedStatusValue)) {
      toast.error(
        "New reservations cannot be created with 'Cancel' or 'Checked Out' status."
      );
      return; // Stop the handler if status is invalid
    }

    // Determine the final status to send to the backend
    // If no status is selected, or if an allowed status is selected, use it.
    // Otherwise, default to 'will_check' as a safe fallback.
    let finalStatusToSend;
    if (
      selectedStatusValue === "checked_in" ||
      selectedStatusValue === "will_check"
    ) {
      finalStatusToSend = selectedStatusValue;
    } else {
      finalStatusToSend = "will_check"; // Default for cases where selectedStatusValue might be undefined/null or unexpected
    }
    // --- END NEW FRONTEND STATUS VALIDATION ---

    const paidInfo = [
      {
        paid: Number(newPaid),
        paidDetails,
        currentDate: new Date(),
      },
    ];

    dispatch(
      new_reservation({
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
        paidInfo,
        finalAmount,
        status: finalStatusToSend, // <--- Use the validated finalStatusToSend
        remark: formData.remark,
        billTransfer: selectedBookedRoom?.value,
      })
    );
  };
  // Effects
  useEffect(() => {
    setDayStay(calculateDayGap(startDate, endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    dispatch(hotel_guests_get());
    dispatch(available_rooms_get(startDate));
    dispatch(booked_rooms_get(startDate));

    if (endDate <= startDate) {
      setEndDate(getNextDate(startDate, 1));
    }
  }, [dispatch, startDate]);

  useEffect(() => {
    if (selectedRoom?.value) {
      dispatch(get_a_room(selectedRoom.value));
    }
  }, [selectedRoom, dispatch]);

  useEffect(() => {
    if (room) {
      setRackRate(room.categoryId?.rackRate || 0);
      setDiscountRate(room.categoryId?.discountRate || 0);
      setFormData((prev) => ({
        ...prev,
        totalGuest: room.categoryId?.occupancy || 1,
      }));
    }
  }, [room]);

  useEffect(() => {
    // Calculate total amount whenever dependencies change
    const baseAmount = dayStay * discountRate;
    const additionalCharges =
      (formData.otherAmount || 0) + (formData.restaurantAmount || 0);
    setTotalAmount(baseAmount + additionalCharges);
  }, [dayStay, discountRate, formData.otherAmount, formData.restaurantAmount]);

  useEffect(() => {
    // Calculate due and final amount
    const calculatedDue = totalAmount - newPaid;
    const calculatedFinal = calculatedDue - discount;

    setDue(calculatedDue);
    setFinalAmount(calculatedFinal);
  }, [totalAmount, newPaid, discount]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setSelectedGuest(null);
      navigate("/hotel/invoice");
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

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

  // Auto-select guest when guest data is loaded
  useEffect(() => {
    if (guest && !selectedGuest) {
      const matchedGuest = guests.find((g) => g?._id === guest?._id);
      if (matchedGuest) {
        setSelectedGuest({
          value: matchedGuest?._id,
          label: matchedGuest?.name,
        });
      }
    }
  }, [guest, guests, selectedGuest]);

  useEffect(() => {
    if (selectedGuest?.value) {
      dispatch(get_a_guest(selectedGuest?.value));
    }
  }, [selectedGuest]);

  useEffect(() => {
    if (checkInDate) {
      // Assuming checkInDate is already a Date object here
      const newStartDate = new Date(checkInDate); // Ensure it's a Date object
      setStartDate(newStartDate);

      // Calculate newEndDate immediately based on newStartDate
      const currentEndDateAsDate = new Date(endDate); // Convert current endDate to Date for comparison
      const dayGap = calculateDayGap(newStartDate, currentEndDateAsDate);

      // If the new startDate makes the old endDate invalid (less than or equal to new startDate)
      // or if the gap becomes 0 (meaning same day), then set endDate to newStartDate + 1 day.
      if (dayGap <= 0) {
        // If endDate is before or same as startDate
        setEndDate(getNextDate(newStartDate, 1));
      }
    }
  }, [checkInDate]);

  useEffect(() => {
    if (roomId) {
      dispatch(get_a_room(roomId));
    }
  }, [roomId]);

  useEffect(() => {
    if (room && !selectedRoom) {
      const matchedRoom = rooms.find((g) => g?._id === room?._id);
      if (matchedRoom) {
        setSelectedRoom({
          value: matchedRoom?._id,
          label: matchedRoom?.name,
        });
      }
    }
  }, [room, rooms, selectedRoom]);
  return (
    <div className="space-y-4">
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
                  New Guest
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dates and Room Selection */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { label: "Check In", value: startDate, setter: setStartDate },
          { label: "Check Out", value: endDate, setter: setEndDate },
        ].map((dateField, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{dateField.label}</p>
              <DatePicker
                selected={dateField.value}
                onChange={(date) => dateField.setter(date)}
                minDate={idx === 1 ? startDate : null}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}

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
          { label: "Rack Rate", value: rackRate, setter: setRackRate },
          { label: "Offer Rate", value: discountRate, setter: setDiscountRate },
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
                onChange={(e) => field.setter && field.setter(e.target.value)}
                readOnly={field.readOnly}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Guest Selection and Additional Info (Source, Other Service, Restaurant Service) */}
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

      {/* NEW SECTION: Others Charge, Restaurant Amount, Due, Discount in one row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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

        {[
          { label: "Due", value: due, readOnly: true },
          { label: "Discount", value: discount, setter: setDiscount },
        ].map((field, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{field.label}</p>
              <input
                value={field.value}
                onChange={(e) =>
                  field.setter && e.target.value !== ""
                    ? field.setter(Number(e.target.value))
                    : field.setter(0)
                }
                readOnly={field.readOnly}
                type={"number"}
                min="0"
                placeholder={field.label}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* NEW SECTION: Paid Amount, Paid Details, Balance, Status in one row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Paid Amount",
            value: newPaid,
            setter: setPaid,
            type: "number",
          },
          {
            label: "Paid Details",
            value: paidDetails,
            setter: setPaidDetails,
            type: "text",
          },
          {
            label: "Balance",
            value: finalAmount,
            readOnly: true,
            type: "number",
          },
        ].map((field, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{field.label}</p>
              <input
                value={field.value}
                onChange={(e) =>
                  field.setter && e.target.value !== ""
                    ? field.setter(
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    : field.setter(field.type === "number" ? 0 : "")
                }
                readOnly={field.readOnly}
                type={field.type}
                min={field.type === "number" ? "0" : undefined}
                placeholder={field.label}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}

        {/* Status dropdown */}
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
                New Reservation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="mt-6">
        <HotelInvoice
          guest={guest}
          room={room}
          dayStay={dayStay}
          startDate={startDate}
          endDate={endDate}
          currentDate={new Date()}
          discount={discount}
          newPaid={newPaid}
          finalAmount={finalAmount}
          paidInfo={[
            {
              paid: newPaid,
              paidDetails,
              currentDate: new Date(),
            },
          ]}
          source={formData.source}
          other={formData.other}
          otherAmount={formData.otherAmount}
          restaurant={formData.restaurant}
          restaurantAmount={formData.restaurantAmount}
          totalAmount={totalAmount}
          status={selectedStatus?.label || "Will Check"}
          rackRate={rackRate}
          discountRate={discountRate}
          remark={formData.remark}
        />
      </div>
    </div>
  );
}

export default Reservation;
