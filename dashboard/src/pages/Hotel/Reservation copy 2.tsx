import { useEffect, useState } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import HotelInvoice from "./HotelInvoice"; // Assuming this component will be updated later to handle multiple rooms
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
import { validatePhoneNumber } from "../../utils/validations";
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
    totalGuest: 1, // This will likely become the sum of guests per room, or a general guest count for the group
  });

  // Component state
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedRoomToAdd, setSelectedRoomToAdd] = useState(null); // Room currently selected in the dropdown to be added
  const [selectedBookedRoom, setSelectedBookedRoom] = useState(null);
  const [newPaid, setPaid] = useState(0);
  const [paidDetails, setPaidDetails] = useState("");
  const [discount, setDiscount] = useState(0);
  const [due, setDue] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [dayStay, setDayStay] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(getNextDate(new Date(), 1));

  // NEW: State to hold multiple selected rooms for the reservation
  // This array will mimic the structure of roomDetails in your Mongoose schema
  const [roomSelections, setRoomSelections] = useState([]);

  // Redux state
  const { guests, guest, errorMessage, successMessage } = useSelector(
    (state) => state.food
  );
  const { rooms, room, bookedRooms } = useSelector((state) => state.room); // `room` here is data for `get_a_room`

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

  // NEW: Handler to add a room to the roomSelections array
  const handleAddRoom = () => {
    if (selectedRoomToAdd && room) {
      // Check if the room is already in the selections
      const isRoomAlreadyAdded = roomSelections.some(
        (selRoom) => selRoom.roomId === selectedRoomToAdd.value
      );

      if (isRoomAlreadyAdded) {
        toast.error("This room has already been added.");
        return;
      }

      // Add the selected room's details to the roomSelections array
      setRoomSelections((prev) => [
        ...prev,
        {
          roomId: selectedRoomToAdd.value,
          roomName: selectedRoomToAdd.label, // Storing name for display purposes
          rackRate: room.categoryId?.rackRate || 0,
          discountRate: room.categoryId?.discountRate || 0,
          category: room.categoryId?.name,
          dayStay: dayStay, // Using the global dayStay for now, as per schema
        },
      ]);
      // Reset the dropdown after adding
      setSelectedRoomToAdd(null);
      // Optional: Update totalGuest based on occupancy of added rooms
      // setFormData(prev => ({
      //   ...prev,
      //   totalGuest: prev.totalGuest + (room.categoryId?.occupancy || 0)
      // }));
    } else {
      toast.error("Please select a room to add.");
    }
  };

  // NEW: Handler to remove a room from the roomSelections array
  const handleRemoveRoom = (roomIdToRemove) => {
    setRoomSelections((prev) =>
      prev.filter((room) => room.roomId !== roomIdToRemove)
    );
  };

  const reservationHandler = (e) => {
    e.preventDefault();

    if (!selectedGuest?.value) {
      toast.error("Please select a guest");
      return;
    }

    // UPDATED VALIDATION: Check if at least one room is selected
    if (roomSelections.length === 0) {
      toast.error("Please add at least one room to the reservation");
      return;
    }

    if (!formData.source) {
      toast.error("Please provide a source");
      return;
    }

    const selectedStatusValue = selectedStatus?.value;
    const invalidStatusesForNewReservation = ["cancel", "checked_out"];

    if (invalidStatusesForNewReservation.includes(selectedStatusValue)) {
      toast.error(
        "New reservations cannot be created with 'Cancel' or 'Checked Out' status."
      );
      return;
    }

    let finalStatusToSend;
    if (
      selectedStatusValue === "checked_in" ||
      selectedStatusValue === "will_check"
    ) {
      finalStatusToSend = selectedStatusValue;
    } else {
      finalStatusToSend = "will_check";
    }

    const paidInfo = [
      {
        paid: Number(newPaid),
        paidDetails,
        currentDate: new Date(),
      },
    ];

    // Prepare roomDetails array for the payload
    // Ensure dayStay is consistent across all rooms for this reservation as per schema
    const roomDetailsPayload = roomSelections.map((roomSel) => ({
      roomId: roomSel.roomId,
      rackRate: Number(roomSel.rackRate),
      discountRate: Number(roomSel.discountRate),
      category: roomSel.category,
      dayStay: dayStay, // Using the global dayStay calculated from startDate/endDate
    }));

    dispatch(
      new_reservation({
        checkInDate: startDate, // Renamed from startDate for clarity with schema
        checkOutDate: endDate, // Renamed from endDate for clarity with schema
        roomDetails: roomDetailsPayload, // NEW: Sending the array of room details
        totalGuest: formData.totalGuest,
        guestId: selectedGuest.value,
        totalAmount,
        source: formData.source,
        others: [
          {
            other: formData.other,
            otherAmount: formData.otherAmount,
          },
        ],
        restaurants: [
          {
            restaurant: formData.restaurant,
            restaurantAmount: formData.restaurantAmount,
          },
        ],
        due,
        discount,
        paidInfo,
        finalAmount,
        status: finalStatusToSend,
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
    // Fetch available rooms for the current date range
    dispatch(available_rooms_get({ startDate, endDate }));
    dispatch(booked_rooms_get(startDate));

    if (endDate <= startDate) {
      setEndDate(getNextDate(startDate, 1));
    }
  }, [dispatch, startDate, endDate]); // Added endDate to dependency for available_rooms_get

  // Effect to get details of a room selected in the ADD dropdown
  useEffect(() => {
    if (selectedRoomToAdd?.value) {
      dispatch(get_a_room(selectedRoomToAdd.value));
    }
  }, [selectedRoomToAdd, dispatch]);

  // When a room's detailed data is fetched (from get_a_room), we don't *directly* set individual rates anymore.
  // Instead, the 'room' object's details are used when `handleAddRoom` is called.
  // We can still use 'room' data to update `totalGuest` if `totalGuest` is meant to be the *sum* of occupancy of selected rooms.
  // useEffect(() => {
  //   if (room) {
  //     // You might want to sum up occupancies here if totalGuest represents total capacity of selected rooms
  //     // For now, keeping it as a manually editable field in formData
  //   }
  // }, [room]);

  useEffect(() => {
    // Calculate total amount whenever roomSelections, otherAmount, restaurantAmount, or dayStay change
    const roomsTotal = roomSelections.reduce(
      (sum, room) => sum + room.discountRate * dayStay,
      0
    );
    const additionalCharges =
      (formData.otherAmount || 0) + (formData.restaurantAmount || 0);
    setTotalAmount(roomsTotal + additionalCharges);
  }, [
    roomSelections,
    dayStay,
    formData.otherAmount,
    formData.restaurantAmount,
  ]);

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
      setRoomSelections([]); // Clear selected rooms after successful reservation
      setFormData({
        // Reset form data for new reservation
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
      setPaid(0);
      setPaidDetails("");
      setDiscount(0);
      setStartDate(new Date());
      setEndDate(getNextDate(new Date(), 1));
      setSelectedStatus(null);
      navigate("/hotel/invoice"); // Navigate to invoice with new reservation data
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  // Data preparation for dropdowns
  const guestOptions = guests.map((guest) => ({
    value: guest._id,
    label: guest.name,
  }));

  const roomOptions = rooms.map((room) => ({
    value: room._id,
    label: `${room.name}`, // Show room name and category
  }));

  const bookedRoomOptions = bookedRooms?.map((room) => ({
    value: room._id,
    label: room.name,
  }));

  const paidOptions = [
    { value: "Cash", label: "Cash" },
    { value: "GooZaayeen", label: "Gozayeen" },
    { value: "Agoda", label: "Agoda" },
  ];

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
  }, [selectedGuest, dispatch]);

  useEffect(() => {
    if (checkInDate) {
      const newStartDate = new Date(checkInDate);
      setStartDate(newStartDate);

      const currentEndDateAsDate = new Date(endDate);
      const dayGap = calculateDayGap(newStartDate, currentEndDateAsDate);

      if (dayGap <= 0) {
        setEndDate(getNextDate(newStartDate, 1));
      }
    }
  }, [checkInDate, endDate]);

  // Handle roomId from query params: automatically add this room to selections
  useEffect(() => {
    if (roomId && rooms.length > 0) {
      const roomFromUrl = rooms.find((r) => r._id === roomId);
      if (roomFromUrl) {
        const isRoomAlreadyAdded = roomSelections.some(
          (selRoom) => selRoom.roomId === roomFromUrl._id
        );
        if (!isRoomAlreadyAdded) {
          // This dispatches get_a_room, which will set the `room` state in Redux
          // Then the handleAddRoom could be called, but we need to ensure `room` is updated first.
          // For simplicity, we'll directly add it here as we have `roomFromUrl`
          setRoomSelections([
            {
              roomId: roomFromUrl._id,
              roomName: roomFromUrl.name,
              rackRate: roomFromUrl.categoryId?.rackRate || 0,
              discountRate: roomFromUrl.categoryId?.discountRate || 0,
              category: roomFromUrl.categoryId?.name,
              dayStay: dayStay,
            },
          ]);
        }
      }
    }
  }, [roomId, rooms, dayStay]); // Added rooms to dependency array

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

        {/* Room Selection for Adding */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Add Room No</p>
            <Select
              options={roomOptions}
              value={selectedRoomToAdd}
              onChange={setSelectedRoomToAdd}
              placeholder="Select Room to Add"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <button
              className="inline-flex items-center justify-center rounded-full py-3 px-2.5 bg-blue-600 text-center font-medium text-white hover:bg-blue-700 mt-2"
              onClick={handleAddRoom}
            >
              Add Room
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Total Guest for Group</p>
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

      {/* NEW: Display Selected Rooms */}
      {roomSelections.length > 0 && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
          <h3 className="text-lg font-semibold mb-3">Selected Rooms:</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 dark:bg-meta-4">
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white xl:pl-4">
                    Room No.
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Category
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Rack Rate
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Offer Rate
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Days
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Subtotal
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {roomSelections.map((roomSel, index) => (
                  <tr
                    key={roomSel.roomId}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="py-2 px-1 pl-4">
                      <p className="text-black dark:text-white text-sm">
                        {roomSel.roomName}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        {roomSel.category}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        ${Number(roomSel.rackRate).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        ${Number(roomSel.discountRate).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        {dayStay}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        ${(roomSel.discountRate * dayStay).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <button
                        onClick={() => handleRemoveRoom(roomSel.roomId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rates and Calculation Section - Now reflects overall totals, not single room */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Stay (Days)", value: dayStay, readOnly: true },
          {
            label: "Total Room Charges",
            value: roomSelections.reduce(
              (sum, r) => sum + r.discountRate * dayStay,
              0
            ),
            readOnly: true,
          },
          {
            label: "Total Amount (Incl. Services)",
            value: totalAmount,
            readOnly: true,
          },
        ].map((field, idx) => (
          <div
            key={idx}
            className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex flex-col gap-2.5 p-2.5">
              <p>{field.label}</p>
              <input
                value={field.value.toFixed(2)} // Format to 2 decimal places
                readOnly={field.readOnly}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        ))}
        <div className="flex-1 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5 h-full">
            <p>Paid By</p>
            <Select
              options={paidOptions}
              placeholder="Select Method"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
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

      {/* Invoice Preview - NOTE: This component currently expects single room data.
          It will need to be updated to iterate over `roomDetails` to show multiple rooms. */}
      <div className="mt-6">
        <HotelInvoice
          guest={guest}
          roomDetails={roomSelections} // NEW: Passing roomSelections as roomDetails
          dayStay={dayStay}
          startDate={startDate}
          endDate={endDate} // This is line 847
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
          // rackRate={rackRate} // REMOVED: No longer top-level single room rates
          // discountRate={discountRate} // REMOVED
          remark={formData.remark}
          // This is where the error is likely happening due to the commented lines or missing closing tag
        />
      </div>
    </div>
  );
}

export default Reservation;
