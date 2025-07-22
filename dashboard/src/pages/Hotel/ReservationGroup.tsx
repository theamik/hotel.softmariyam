import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Import useLocation
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import HotelInvoice from "./HotelInvoice"; // Assuming this will be updated to handle multiple rooms
import {
  get_a_guest,
  guest_add,
  guests_get,
  update_reservation,
  new_reservation, // Import new_reservation action
  get_a_reservation, // Action to fetch specific reservation for edit mode
} from "../../store/Actions/foodAction";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/foodReducer";
import {
  available_rooms_get,
  booked_rooms_get,
  get_a_room,
  available_rooms_get_for_edit, // Used for fetching rooms for edit mode
  booked_rooms_get_for_edit, // Used for fetching booked rooms for edit mode
} from "../../store/Actions/roomAction";
import { validatePhoneNumber } from "../../utils/validations";
import queryString from "query-string";
import moment from "moment"; // Import moment for consistent date handling

// Constants
const RESERVATION_STATUS = [
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "will_check", label: "Will Check" },
  { value: "cancel", label: "Cancel" },
];

function ReservationGroupForm() {
  const { reservationId: paramReservationId } = useParams(); // Get reservation ID from URL
  const location = useLocation(); // To parse query params for initial room/date selection in new mode

  // Determine if it's edit mode or new reservation mode
  const isEditMode = !!paramReservationId;
  const initialRoomIdFromQuery = queryString.parse(location.search).roomId;
  const initialCheckInDateFromQuery = queryString.parse(
    location.search
  ).checkInDate;

  // Redux state
  const { guests, reservation, guest, errorMessage, successMessage } =
    useSelector((state) => state.food);
  const { rooms, room, bookedRooms } = useSelector((state) => state.room); // `rooms` will contain available rooms + current reservation's room

  // State Initialization (Conditional based on mode)
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

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedRoomToAdd, setSelectedRoomToAdd] = useState(null); // For adding rooms in multi-room setup
  const [selectedBookedRoom, setSelectedBookedRoom] = useState(null); // For bill transfer
  const [newPaid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [due, setDue] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [dayStay, setDayStay] = useState(1); // This remains the 'global' dayStay for primary reservation dates
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(getNextDate(new Date(), 1));
  const [updatedPaidInfo, setUpdatedPaidInfo] = useState([]); // This remains the 'global' endDate for primary reservation dates

  // State to hold multiple selected rooms for the reservation
  // Each room will now have its own checkOutDate and calculated dayStay
  const [roomSelections, setRoomSelections] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Utility functions
  function getNextDate(date, offset = 1) {
    const next = new Date(date);
    next.setDate(next.getDate() + offset);
    return next;
  }

  // Calculates day gap between two dates, ensuring at least 1 day
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
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: "", // Keep empty for UI, will convert to number on submission
      }));
    } else if (!isNaN(value)) {
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
    // Fetch guests again after a short delay to get the newly added guest
    setTimeout(() => {
      dispatch(guests_get());
    }, 1000);
  };

  // Handler to add a room to the roomSelections array
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
      // Initially, the room's check-out date will be the global reservation's end date
      setRoomSelections((prev) => [
        ...prev,
        {
          roomId: selectedRoomToAdd.value,
          roomName: selectedRoomToAdd.label, // Storing name for display purposes
          rackRate: room.categoryId?.rackRate || 0,
          discountRate: room.categoryId?.discountRate || 0, // This is the 'Offer Rate'
          category: room.categoryId?.name,
          checkInDate: startDate, // Keep category for potential future use or display elsewhere
          checkOutDate: endDate, // Initial check-out date for this specific room
          dayStay: calculateDayGap(startDate, endDate), // Initial dayStay for this room
        },
      ]);
      // Reset the dropdown after adding
      setSelectedRoomToAdd(null);
    } else {
      toast.error("Please select a room to add.");
    }
  };

  // Handler to remove a room from the roomSelections array
  const handleRemoveRoom = (roomIdToRemove) => {
    setRoomSelections((prev) =>
      prev.filter((room) => room.roomId !== roomIdToRemove)
    );
  };

  // Handler for changing individual room's offer rate
  const handleRoomOfferRateChange = (roomId, newRate) => {
    setRoomSelections((prev) =>
      prev.map((roomSel) =>
        roomSel.roomId === roomId
          ? { ...roomSel, discountRate: Number(newRate) }
          : roomSel
      )
    );
  };

  // Handler for changing individual room's check-out date
  const handleRoomCheckOutDateChange = (roomId, newDate) => {
    setRoomSelections((prev) =>
      prev.map((roomSel) =>
        roomSel.roomId === roomId
          ? {
              ...roomSel,
              checkOutDate: newDate,
              dayStay: calculateDayGap(startDate, newDate), // Calculate dayStay based on global startDate and new room check-out
            }
          : roomSel
      )
    );
  };

  const handleRoomCheckInDateChange = (roomId, newDate) => {
    setRoomSelections((prev) =>
      prev.map((roomSel) =>
        roomSel.roomId === roomId
          ? {
              ...roomSel,
              checkInDate: newDate,
              dayStay: calculateDayGap(newDate, roomSel.checkOutDate),
            }
          : roomSel
      )
    );
  };

  // Prepare paidInfo for submission

  useEffect(() => {
    let checkPaidInfo = [];

    if (Number(newPaid) > 0) {
      checkPaidInfo.push({
        paid: Number(newPaid),
        paidDetails: formData.paidDetails,
        currentDate: new Date(),
      });
    }

    setUpdatedPaidInfo(checkPaidInfo);
  }, [reservation, newPaid, formData.paidDetails]);

  const reservationHandler = async (e) => {
    e.preventDefault();

    if (!selectedGuest?.value) {
      toast.error("Please select a guest");
      return;
    }

    if (roomSelections.length === 0) {
      toast.error("Please add at least one room to the reservation");
      return;
    }

    if (!formData.source) {
      toast.error("Please provide a source");
      return;
    }

    // Determine final status
    const newStatus = selectedStatus?.value;
    const currentStatus = reservation?.status; // Only defined in edit mode
    let finalStatusToSend = newStatus;

    if (isEditMode) {
      // Status transition validation for edit mode
      if (currentStatus === "checked_in" && newStatus === "will_check") {
        toast.error("Cannot change status from 'Checked In' to 'Will Check'.");
        return;
      }
      if (
        (currentStatus === "cancel" || currentStatus === "checked_out") &&
        (newStatus === "checked_in" || newStatus === "will_check")
      ) {
        toast.error(
          `Cannot change status from '${currentStatus}' to '${newStatus}'. Reservation is already finalized.`
        );
        return;
      }
    } else {
      // Validation for new reservation
      const invalidStatusesForNewReservation = ["cancel", "checked_out"];
      if (invalidStatusesForNewReservation.includes(newStatus)) {
        toast.error(
          "New reservations cannot be created with 'Cancel' or 'Checked Out' status."
        );
        return;
      }
      // Default for new reservation if not explicitly checked_in or will_check
      if (newStatus !== "checked_in" && newStatus !== "will_check") {
        finalStatusToSend = "will_check";
      }
    }

    // Prepare roomDetails array for the payload
    const roomDetailsPayload = roomSelections.map((roomSel) => ({
      roomId: roomSel.roomId,
      rackRate: Number(roomSel.rackRate),
      discountRate: Number(roomSel.discountRate),
      category: roomSel.category,
      dayStay: roomSel.dayStay,
      checkInDate: moment(roomSel.checkInDate).format("YYYY-MM-DD"),
      checkOutDate: moment(roomSel.checkOutDate).format("YYYY-MM-DD"), // Use the individual room's dayStay
    }));

    const payload = {
      startDate: startDate, // Global start date for the reservation
      endDate: endDate, // Global end date for the reservation (consider if this should be max of room checkout dates)
      roomDetails: roomDetailsPayload,
      totalGuest: Number(formData.totalGuest),
      guestId: selectedGuest.value,
      totalAmount: Number(totalAmount),
      source: formData.source,
      others: [
        {
          other: formData.other,
          otherAmount: Number(formData.otherAmount),
        },
      ],
      restaurants: [
        {
          restaurant: formData.restaurant,
          restaurantAmount: Number(formData.restaurantAmount),
        },
      ],
      due: Number(due),
      discount: Number(discount),
      paidInfo: updatedPaidInfo,
      finalAmount: Number(finalAmount),
      status: finalStatusToSend,
      remark: formData.remark,
      billTransfer: selectedBookedRoom?.value || null, // Ensure null if not selected
    };

    if (isEditMode) {
      dispatch(
        update_reservation({ ...payload, reservationId: paramReservationId })
      );
    } else {
      dispatch(new_reservation(payload));
    }
  };

  // Effects

  // Effect to fetch existing reservation data in edit mode
  useEffect(() => {
    if (isEditMode && paramReservationId) {
      dispatch(get_a_reservation(paramReservationId));
      dispatch(guests_get()); // Ensure guests are fetched for dropdown
    } else if (!isEditMode) {
      // Initialize for new reservation mode
      setFormData({
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
      setSelectedStatus(null);
      setSelectedGuest(null);
      setPaid(0);
      setDiscount(0);
      setDue(0);
      setTotalAmount(0);
      setFinalAmount(0);
      setDayStay(1);
      setStartDate(new Date());
      setEndDate(getNextDate(new Date(), 1));
      setRoomSelections([]); // Empty for new reservation

      // Handle initial room/date from query params for new reservation
      if (initialCheckInDateFromQuery) {
        const parsedDate = new Date(initialCheckInDateFromQuery);
        setStartDate(parsedDate);
        setEndDate(getNextDate(parsedDate, 1)); // Set default end date
      }
      if (initialRoomIdFromQuery) {
        // Fetch room details to add it to roomSelections initially
        dispatch(get_a_room(initialRoomIdFromQuery));
      }
      dispatch(guests_get());
    }
  }, [
    isEditMode,
    paramReservationId,
    dispatch,
    initialRoomIdFromQuery,
    initialCheckInDateFromQuery,
  ]);

  // Effect to populate form data when a reservation is fetched (edit mode)
  useEffect(() => {
    if (reservation && isEditMode) {
      // Set global start/end dates from reservation
      setStartDate(new Date(reservation.startDate));
      setEndDate(new Date(reservation.endDate));
      setDayStay(
        calculateDayGap(
          new Date(reservation.startDate),
          new Date(reservation.endDate)
        )
      );

      setDiscount(reservation.discount || 0);

      setFormData({
        name: reservation.residentId?.name || "",
        address: reservation.residentId?.address || "",
        mobile: reservation.residentId?.mobile || "",
        description: reservation.residentId?.description || "",
        source: reservation.source || "",
        other: reservation.others?.[0]?.other || "", // Assuming others/restaurants are arrays with one object
        otherAmount: reservation.others?.[0]?.otherAmount || 0,
        restaurant: reservation.restaurants?.[0]?.restaurant || "",
        restaurantAmount: reservation.restaurants?.[0]?.restaurantAmount || 0,
        remark: reservation.remark || "",
        totalGuest: reservation.totalGuest || 1,
        paidDetails: "", // New payments details will be added
      });

      // Populate roomSelections for edit mode
      // Each room will use the reservation's global check-in and check-out dates initially
      if (
        Array.isArray(reservation.roomDetails) &&
        reservation.roomDetails.length > 0
      ) {
        setRoomSelections(
          reservation.roomDetails.map((detail) => ({
            roomId: detail.roomId?._id || detail.roomId, // Handle populated or unpopulated roomId
            roomName: detail.roomId?.name || "N/A", // Assuming roomId is populated or has a name
            rackRate: detail.rackRate || 0,
            discountRate: detail.discountRate || 0, // This is the 'Offer Rate'
            category: detail.roomId?.categoryId?.name || "N/A", // Assuming category is populated
            checkOutDate: new Date(reservation.endDate), // Use global endDate as default for each room
            dayStay:
              detail.dayStay ||
              calculateDayGap(
                new Date(reservation.startDate),
                new Date(reservation.endDate)
              ), // Use saved dayStay or recalculate
          }))
        );
      } else {
        setRoomSelections([]); // Ensure it's an empty array if no rooms
      }

      setTotalAmount(reservation.totalAmount || 0);
      setDue(reservation.due || 0);
      setFinalAmount(reservation.finalAmount || 0);

      // Set selected guest
      if (reservation.residentId) {
        setSelectedGuest({
          value: reservation.residentId._id,
          label: reservation.residentId.name,
        });
      }

      // Set selected status
      if (reservation.status) {
        const statusOption = RESERVATION_STATUS.find(
          (s) => s.value === reservation.status
        );
        setSelectedStatus(statusOption);
      }

      // Set bill transfer room
      if (reservation.billTransfer) {
        // Need to fetch bookedRooms first for this to match
        // This will be handled by the effect that fetches booked rooms
      }
    }
  }, [reservation, isEditMode]);

  // Update global dayStay when global start or end date changes
  useEffect(() => {
    setDayStay(calculateDayGap(startDate, endDate));
  }, [startDate, endDate]);

  // Fetch rooms (available & booked) based on mode and dates
  useEffect(() => {
    // Always fetch all guests
    dispatch(guests_get());

    if (isEditMode && reservation?._id) {
      // In edit mode, fetch rooms considering the current reservation
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
      // In new mode, fetch all available rooms (excluding existing reservations)
      dispatch(available_rooms_get({ startDate: startDate })); // Pass startDate for filtering
      dispatch(booked_rooms_get(startDate)); // Pass startDate for filtering
    }

    // Ensure endDate is always after startDate, update individual room check-out dates if global endDate changes
    if (endDate <= startDate) {
      const newEndDate = getNextDate(startDate, 1);
      setEndDate(newEndDate);
      setRoomSelections((prev) =>
        prev.map((roomSel) => ({
          ...roomSel,
          checkOutDate: newEndDate,
          dayStay: calculateDayGap(startDate, newEndDate),
        }))
      );
    } else {
      // If global endDate changes and is valid, update individual room check-out dates
      setRoomSelections((prev) =>
        prev.map((roomSel) => {
          // Only update if the room's current checkout date is linked to the old global endDate
          // or if it falls before the new global endDate.
          // This logic might need refinement based on exact user expectation for global vs per-room dates
          if (
            moment(roomSel.checkOutDate).isSame(moment(endDate), "day") ||
            moment(roomSel.checkOutDate).isBefore(moment(startDate))
          ) {
            return {
              ...roomSel,
              checkOutDate: endDate,
              dayStay: calculateDayGap(startDate, endDate),
            };
          }
          return roomSel;
        })
      );
    }
  }, [dispatch, startDate, endDate, isEditMode, reservation?._id]);

  // Effect to get details of a room selected in the ADD dropdown (new or edit mode)
  // This helps populate rackRate/discountRate for the `room` state in Redux
  useEffect(() => {
    if (selectedRoomToAdd?.value) {
      dispatch(get_a_room(selectedRoomToAdd.value));
    } else if (initialRoomIdFromQuery && !room && !isEditMode) {
      // If a room ID came from query params and it's new reservation mode, fetch its details
      dispatch(get_a_room(initialRoomIdFromQuery));
    }
  }, [selectedRoomToAdd, dispatch, initialRoomIdFromQuery, room, isEditMode]);

  // Handle auto-adding initial room from query param
  useEffect(() => {
    if (
      initialRoomIdFromQuery &&
      room &&
      !isEditMode &&
      room.name &&
      roomSelections.length === 0 // Ensure it's only added once initially
    ) {
      // Only add if not already added and it's new reservation mode
      const isRoomAlreadyAdded = roomSelections.some(
        (selRoom) => selRoom.roomId === room._id
      );
      if (!isRoomAlreadyAdded) {
        setRoomSelections([
          {
            roomId: room._id,
            roomName: room.name,
            rackRate: room.categoryId?.rackRate || 0,
            discountRate: room.categoryId?.discountRate || 0,
            category: room.categoryId?.name,
            checkInDate: startDate,
            checkOutDate: endDate, // Initial check-out for this specific room from global endDate
            dayStay: calculateDayGap(startDate, endDate), // Initial dayStay for this room
          },
        ]);
        // Consider if you want to clear query param from URL after adding
        // navigate(location.pathname, { replace: true });
      }
    }
  }, [
    initialRoomIdFromQuery,
    room,
    isEditMode,
    startDate, // Dependency for dayStay calculation
    endDate, // Dependency for initial checkOutDate and dayStay calculation
    roomSelections.length, // Check length to avoid re-adding
    // location.pathname, // not directly used but part of navigation
    // navigate, // not directly used but part of navigation
  ]);

  // Calculate total amount whenever roomSelections, otherAmount, restaurantAmount, or dayStay change
  // Now sums based on each room's individual discountRate and dayStay
  useEffect(() => {
    const roomsTotal = roomSelections.reduce(
      (sum, room) => sum + Number(room.discountRate) * room.dayStay,
      0
    );
    const additionalCharges =
      (Number(formData.otherAmount) || 0) +
      (Number(formData.restaurantAmount) || 0);
    setTotalAmount(roomsTotal + additionalCharges);
  }, [roomSelections, formData.otherAmount, formData.restaurantAmount]);

  // Calculate due and final amount
  useEffect(() => {
    const totalPaidFromReservation =
      reservation?.paidInfo?.reduce((sum, payment) => sum + payment.paid, 0) ||
      0;
    const currentTotalPaid = isEditMode
      ? totalPaidFromReservation + Number(newPaid)
      : Number(newPaid);

    const calculatedDue = totalAmount - currentTotalPaid;
    const calculatedFinal = calculatedDue - Number(discount); // Ensure discount is a number

    setDue(calculatedDue);
    setFinalAmount(calculatedFinal);
  }, [totalAmount, newPaid, discount, reservation, isEditMode]);

  // Auto-select guest, main room, status, and bill transfer room when data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && reservation && guests.length > 0 && rooms.length > 0) {
      // Set selected guest
      if (reservation.residentId) {
        const matchedGuest = guests.find(
          (g) => g._id === reservation.residentId?._id
        );
        if (matchedGuest) {
          setSelectedGuest({
            value: matchedGuest._id,
            label: matchedGuest.name,
          });
        }
      }

      // Set selected status
      if (reservation.status) {
        const statusOption = RESERVATION_STATUS.find(
          (s) => s.value === reservation.status
        );
        setSelectedStatus(statusOption);
      }

      // Set bill transfer room (needs bookedRooms to be fetched)
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
  }, [isEditMode, reservation, guests, rooms, bookedRooms]); // Added bookedRooms to dependency

  // This effect seems to be a redundant toast message from original code.
  // Review if it's still needed, it currently prevents bill transfer selection.
  useEffect(() => {
    if (selectedBookedRoom) {
      // This toast might be triggered unintentionally if selectedBookedRoom is populated in edit mode
      // Consider removing or making it conditional based on specific user action for bill transfer
      // toast.error(
      //   "You need to reservation first or going to group reservation!"
      // );
      // setSelectedBookedRoom(null); // This line prevents selection if it's not the intended behavior
    }
  }, [selectedBookedRoom]);

  // Handle success/error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setSelectedStatus(null);
      setSelectedGuest(null);
      setPaid(0);
      setDiscount(0);
      setDue(0);
      setTotalAmount(0);
      setFinalAmount(0);
      setDayStay(1);
      setStartDate(new Date());
      setEndDate(getNextDate(new Date(), 1));
      setRoomSelections([]);
      setFormData("");
      setUpdatedPaidInfo([]);
      navigate("/hotel/invoice");
    }
  }, [successMessage, errorMessage, dispatch, navigate, isEditMode]);

  // Data preparation for dropdowns
  const guestOptions = guests.map((guest) => ({
    value: guest._id,
    label: guest.name,
  }));

  const roomOptions = rooms.map((room) => ({
    value: room._id,
    label: `${room.name} (${room.categoryId?.name})`, // Show room name and category
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

  // Check if check-in date is in the past for disabling changes
  const isPastCheckIn =
    moment(startDate).isBefore(moment().startOf("day"), "day") &&
    moment(startDate).isAfter(
      moment().subtract(1, "days").startOf("day"),
      "day"
    ); // Compares dates without time

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {isEditMode ? "Edit Reservation" : "New Reservation"}
      </h2>

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
              {field === "description" && ( // Show button always, text changes based on guest
                <button
                  className="inline-flex items-center justify-center rounded-full py-3 px-2.5 bg-primary text-center font-medium text-white hover:bg-opacity-90"
                  onClick={guestHandler}
                >
                  {selectedGuest ? "Update Guest" : "New Guest"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dates and Room Selection */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* Check In Date (Global) */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Check In (Reservation)</p>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                if (!isPastCheckIn) setStartDate(date);
              }}
              minDate={moment().subtract(1, "days").toDate()} // Can't select a date before yesterday for check-in
              className={`w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary ${
                isPastCheckIn ? "bg-gray-100 cursor-not-allowed" : ""
              } dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
              readOnly={isEditMode && isPastCheckIn} // Only readOnly if in edit mode and past date
            />
            {isEditMode && isPastCheckIn && (
              <p className="text-xs text-gray-500 mt-1">
                Check-in date cannot be changed after check-in.
              </p>
            )}
          </div>
        </div>

        {/* Check Out Date (Global) - Acts as default for new rooms */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-col gap-2.5 p-2.5">
            <p>Check Out (Reservation Default)</p>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate} // Check-out cannot be before check-in
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

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

      {/* Display Selected Rooms */}
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
                  {/* Category Column Removed */}
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Rack Rate
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Offer Rate
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Checked In Date
                  </th>
                  <th className="py-2 px-1 text-sm font-medium text-black dark:text-white">
                    Checked Out Date
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
                {roomSelections.map((roomSel) => (
                  <tr
                    key={roomSel.roomId}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="py-2 px-1 pl-4">
                      <p className="text-black dark:text-white text-sm">
                        {roomSel.roomName}
                      </p>
                    </td>
                    {/* Category cell removed */}
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        {Number(roomSel.rackRate).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="number"
                        min="0"
                        value={roomSel.discountRate}
                        onChange={(e) =>
                          handleRoomOfferRateChange(
                            roomSel.roomId,
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-1.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <DatePicker
                        selected={roomSel.checkInDate}
                        onChange={(date) =>
                          handleRoomCheckInDateChange(roomSel.roomId, date)
                        }
                        maxDate={roomSel.checkOutDate} // Can't check out before global check-in
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-1.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <DatePicker
                        selected={roomSel.checkOutDate}
                        onChange={(date) =>
                          handleRoomCheckOutDateChange(roomSel.roomId, date)
                        }
                        minDate={startDate} // Can't check out before global check-in
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-1.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        {roomSel.dayStay}
                      </p>
                    </td>
                    <td className="py-2 px-1">
                      <p className="text-black dark:text-white text-sm">
                        {(
                          Number(roomSel.discountRate) * roomSel.dayStay
                        ).toFixed(2)}
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
              (sum, r) => sum + Number(r.discountRate) * r.dayStay, // Sum using per-room dayStay
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
                value={Number(field.value).toFixed(2)} // Format to 2 decimal places
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
              // You might want to add state and onChange for this Select
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
              value={Number(due).toFixed(2)} // Format to 2 decimal places
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
              value={Number(finalAmount).toFixed(2)} // Format to 2 decimal places
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
                {isEditMode ? "Update Reservation" : "New Reservation"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="mt-6">
        <HotelInvoice
          guest={
            selectedGuest
              ? guests.find((g) => g._id === selectedGuest.value)
              : reservation?.residentId
          }
          // Passing roomDetails as an array, HotelInvoice must be updated to handle this
          roomDetails={roomSelections}
          dayStay={dayStay} // This is the global dayStay, consider if HotelInvoice needs per-room dayStay from roomDetails
          startDate={startDate}
          endDate={endDate}
          currentDate={new Date()}
          discount={discount}
          newPaid={newPaid}
          finalAmount={finalAmount}
          paidInfo={[
            ...(reservation?.paidInfo || []), // Existing payments in edit mode
            ...(Number(newPaid) > 0 // Only add new paid info if newPaid > 0
              ? [
                  {
                    paid: Number(newPaid),
                    paidDetails: formData.paidDetails,
                    currentDate: new Date(),
                  },
                ]
              : []),
          ]}
          source={formData.source}
          other={formData.other}
          otherAmount={formData.otherAmount}
          restaurant={formData.restaurant}
          restaurantAmount={formData.restaurantAmount}
          totalAmount={totalAmount}
          status={selectedStatus?.label || "Will Check"}
          remark={formData.remark}
          reservation={isEditMode ? reservation : null} // Pass the full reservation object in edit mode
          // Removed individual room props like rackRate, discountRate as they are now in roomDetails
        />
      </div>
    </div>
  );
}

export default ReservationGroupForm;
