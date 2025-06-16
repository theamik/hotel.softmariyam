import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import {
  foods_get,
  guests_get,
  guest_add, // Import guest_add action
  // Assuming you have an action to get a single guest by ID if needed for deeper guest update
} from "../../store/Actions/foodAction"; // Ensure these actions are in foodAction
import {
  new_program,
  update_program,
  get_a_program,
} from "../../store/Actions/orderAction";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer"; // Assuming messageClear is for orderReducer
import { validatePhoneNumber } from "../../utils/validations";
import queryString from "query-string"; // Import validation utility

function ProgramForm() {
  // Get reservation ID from URL path
  const location = useLocation(); // To parse query params for initial room/date selection in new mode

  // Determine if it's edit mode or new reservation mode
  const { programId: paramProgramId } = queryString.parse(location.search);
  const isEditMode = !!paramProgramId;

  // Redux state
  const {
    guests,
    foods,
    guest: currentGuestDetails,
  } = useSelector((state) => state.food); // Renamed `guest` to `currentGuestDetails` to avoid confusion with `selectedGuest`
  const { errorMessage, successMessage, program, loader } = useSelector(
    (state) => state.order
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Consolidated form data for Program details
  const [programFormData, setProgramFormData] = useState({
    programType: "",
    season: "",
    hall: "",
    reference: "",
    totalGuest: "",
    perHead: "",
    decoration: 0,
    hallCharge: 0,
    service: 0,
    paidDetails: "",
    newPaidAmount: 0,
    discount: 0,
    remark: "",
  });

  // Separate form data for Guest details (for the Add Guest section)
  const [guestFormData, setGuestFormData] = useState({
    name: "",
    address: "",
    mobile: "",
    description: "",
  });

  // State for calculated values
  const [calculatedAmounts, setCalculatedAmounts] = useState({
    amount: 0,
    finalAmount: 0,
    due: 0,
  });

  // Date state
  const [programDate, setProgramDate] = useState(new Date());

  // Dropdown selections (React-Select format)
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedFoodItems, setSelectedFoodItems] = useState([]);

  // Effect to fetch initial data (guests and foods) and program data for edit mode
  useEffect(() => {
    dispatch(guests_get());
    dispatch(foods_get());

    if (isEditMode && paramProgramId) {
      dispatch(get_a_program(paramProgramId)); // Fetch existing program details
    }
  }, [dispatch, isEditMode, paramProgramId]);

  // Effect to populate form when program data is fetched in edit mode
  useEffect(() => {
    if (isEditMode && program) {
      setProgramDate(new Date(program.programDate));
      setProgramFormData({
        programType: program.programType || "",
        season: program.season || "",
        hall: program.hall || "",
        reference: program.reference || "",
        totalGuest: program.totalGuest || "",
        perHead: program.perHead || "",
        decoration: program.decoration || 0,
        hallCharge: program.hallCharge || 0,
        service: program.service || 0,
        paidDetails: "",
        newPaidAmount: 0,
        discount: program.discount || 0,
        remark: program.remark || "",
      });

      // Set selected guest in dropdown
      if (program.guestId) {
        setSelectedGuest({
          value: program.guestId._id,
          label: program.guestId.name,
        });
      }

      // Populate guestFormData if program.guestId exists
      if (program.guestId) {
        setGuestFormData({
          name: program.guestId.name || "",
          address: program.guestId.address || "",
          mobile: program.guestId.mobile || "",
          description: program.guestId.description || "",
        });
      }

      // Set selected food items
      if (Array.isArray(program.foodItems) && program.foodItems.length > 0) {
        setSelectedFoodItems(
          program.foodItems.map((item) => ({
            value: item._id,
            label: item.name || item.label,
          }))
        );
      }
    } else if (!isEditMode) {
      // Reset form for new program creation
      setProgramFormData({
        programType: "",
        season: "",
        hall: "",
        reference: "",
        totalGuest: "",
        perHead: "",
        decoration: 0,
        hallCharge: 0,
        service: 0,
        paidDetails: "",
        newPaidAmount: 0,
        discount: 0,
        remark: "",
      });
      setGuestFormData({ name: "", address: "", mobile: "", description: "" });
      setProgramDate(new Date());
      setSelectedGuest(null);
      setSelectedFoodItems([]);
    }
  }, [program, isEditMode]);

  // Effect to populate Guest Add fields when a guest is selected in the dropdown
  useEffect(() => {
    if (selectedGuest && guests.length > 0) {
      const foundGuest = guests.find((g) => g._id === selectedGuest.value);
      if (foundGuest) {
        setGuestFormData({
          name: foundGuest.name || "",
          address: foundGuest.address || "",
          mobile: foundGuest.mobile || "",
          description: foundGuest.description || "",
        });
      }
    } else if (!selectedGuest && !isEditMode) {
      // Clear guestFormData if no guest is selected (for new programs)
      setGuestFormData({ name: "", address: "", mobile: "", description: "" });
    }
  }, [selectedGuest, guests, isEditMode]);

  // Handler for Program form inputs
  const handleProgramInputChange = (e) => {
    const { name, value } = e.target;
    setProgramFormData((prev) => ({
      ...prev,
      [name]: [
        "totalGuest",
        "perHead",
        "decoration",
        "hallCharge",
        "service",
        "newPaidAmount",
        "discount",
      ].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  // Handler for Guest form inputs
  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;
    setGuestFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper function to sum existing payments (for edit mode)
  const getExistingPaidAmount = () => {
    return isEditMode && program?.paid?.length > 0
      ? program.paid.reduce((sum, p) => sum + Number(p.paid), 0)
      : 0;
  };

  // Effect for all calculations
  useEffect(() => {
    const totalGuestsNum = Number(programFormData.totalGuest) || 0;
    const perHeadNum = Number(programFormData.perHead) || 0;
    const decorationNum = Number(programFormData.decoration) || 0;
    const hallChargeNum = Number(programFormData.hallCharge) || 0;
    const serviceNum = Number(programFormData.service) || 0;
    const discountNum = Number(programFormData.discount) || 0;
    const newPaidAmountNum = Number(programFormData.newPaidAmount) || 0;

    const amount = totalGuestsNum * perHeadNum;
    let final =
      amount + decorationNum + hallChargeNum + serviceNum - discountNum;
    const totalPaid = getExistingPaidAmount() + newPaidAmountNum;
    const due = final - totalPaid;

    setCalculatedAmounts({
      amount: amount,
      finalAmount: final,
      due: due,
    });
  }, [
    programFormData.totalGuest,
    programFormData.perHead,
    programFormData.decoration,
    programFormData.hallCharge,
    programFormData.service,
    programFormData.discount,
    programFormData.newPaidAmount,
    program?.paid,
    isEditMode,
  ]);

  // Handle adding/updating a guest
  const handleGuestAction = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(guestFormData.mobile)) {
      toast.error("Please enter a valid phone number for the guest.");
      return;
    }
    if (!guestFormData.name.trim()) {
      toast.error("Guest name is required.");
      return;
    }

    // Dispatch guest_add with 'under: "restaurant"'
    await dispatch(guest_add({ ...guestFormData, under: "restaurant" }));

    // After adding/updating, re-fetch guests to update the dropdown list
    setTimeout(() => {
      dispatch(guests_get());
    }, 500);
  };

  // Consolidated submission handler for Program
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedGuest?.value) {
      toast.error("Please select a guest for the program.");
      return;
    }
    if (!programDate) {
      toast.error("Please select a program date.");
      return;
    }
    if (!programFormData.programType) {
      toast.error("Please enter a program type.");
      return;
    }
    if (!programFormData.hall) {
      toast.error("Please enter a hall name.");
      return;
    }
    if (Number(programFormData.totalGuest) <= 0) {
      toast.error("Total guests must be a positive number.");
      return;
    }
    if (Number(programFormData.perHead) <= 0) {
      toast.error("Per head charge must be a positive number.");
      return;
    }

    const currentPaidInfo =
      isEditMode && program?.paid ? [...program.paid] : [];

    if (programFormData.newPaidAmount > 0) {
      currentPaidInfo.push({
        paid: Number(programFormData.newPaidAmount),
        paidDetails: programFormData.paidDetails,
        currentDate: new Date(),
      });
    }

    const foodItemsPayload = selectedFoodItems.map((item) => ({
      _id: item.value,
      name: item.label,
    }));

    const payload = {
      foodItems: foodItemsPayload,
      totalAmount: calculatedAmounts.amount,
      discount: Number(programFormData.discount),
      finalAmount: calculatedAmounts.finalAmount,
      hallCharge: Number(programFormData.hallCharge),
      decoration: Number(programFormData.decoration),
      service: Number(programFormData.service),
      guestId: selectedGuest.value,
      totalGuest: Number(programFormData.totalGuest),
      due: calculatedAmounts.due,
      paid: currentPaidInfo,
      programDate: programDate,
      hall: programFormData.hall,
      programType: programFormData.programType,
      season: programFormData.season,
      perHead: Number(programFormData.perHead),
      reference: programFormData.reference,
      remark: programFormData.remark,
    };

    if (isEditMode) {
      dispatch(update_program({ ...payload, programId: paramProgramId }));
    } else {
      dispatch(new_program(payload));
    }
  };

  // Handle success/error messages
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate("/restaurant/invoice"); // Navigate after success
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  // Data preparation for React-Select dropdowns
  const guestOptions = guests.map((el) => ({
    value: el._id,
    label: `${el.name} (${el.mobile})`, // Show name and mobile for better selection
  }));

  const foodOptions = foods.map((el) => ({
    value: el._id,
    label: el.name,
  }));

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {isEditMode ? "Edit Program" : "New Program"}
      </h2>
      {loader && (
        <p className="text-center text-lg text-blue-600 dark:text-blue-400">
          Loading program data...
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Add Guest Section */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              {selectedGuest ? "Update Guest Details" : "Add New Guest"}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={guestFormData.name}
                  onChange={handleGuestInputChange}
                  type="text"
                  placeholder="Guest Name"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  name="mobile"
                  value={guestFormData.mobile}
                  onChange={handleGuestInputChange}
                  type="tel"
                  placeholder="Guest Mobile (e.g., +8801...)"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Address
                </label>
                <input
                  name="address"
                  value={guestFormData.address}
                  onChange={handleGuestInputChange}
                  type="text"
                  placeholder="Guest Address"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={guestFormData.description}
                  onChange={handleGuestInputChange}
                  placeholder="Any additional guest notes"
                  rows="2"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>
              <button
                onClick={handleGuestAction}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 py-3 px-6 text-center font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loader}
              >
                {selectedGuest ? "Update Selected Guest" : "Add New Guest"}
              </button>
            </div>
          </div>

          {/* Program Details Section */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Program Details
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Program Date
                </label>
                <DatePicker
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  selected={programDate}
                  onChange={(date) => setProgramDate(date)}
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Program Type <span className="text-red-500">*</span>
                </label>
                <input
                  name="programType"
                  value={programFormData.programType}
                  onChange={handleProgramInputChange}
                  type="text"
                  placeholder="e.g., Wedding, Birthday, Corporate Event"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Season
                </label>
                <input
                  name="season"
                  value={programFormData.season}
                  onChange={handleProgramInputChange}
                  type="text"
                  placeholder="e.g., Lunch, Dinner, Whole Day"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Hall <span className="text-red-500">*</span>
                </label>
                <input
                  name="hall"
                  value={programFormData.hall}
                  onChange={handleProgramInputChange}
                  type="text"
                  placeholder="e.g., Blue Diamond"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Reference
                </label>
                <input
                  name="reference"
                  value={programFormData.reference}
                  onChange={handleProgramInputChange}
                  type="text"
                  placeholder="e.g., Zabed Sir, Event Planner"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Total Guests <span className="text-red-500">*</span>
                </label>
                <input
                  name="totalGuest"
                  value={programFormData.totalGuest}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Number of guests"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Per Head Charge <span className="text-red-500">*</span>
                </label>
                <input
                  name="perHead"
                  value={programFormData.perHead}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Cost per guest"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="flex justify-between items-center text-black dark:text-white text-lg font-medium py-2 border-t border-stroke dark:border-strokedark pt-4 mt-2">
                <span>Calculated Base Amount:</span>
                <span>TK {calculatedAmounts.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials and Foods */}
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Additional Charges
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Others Charge
                </label>
                <input
                  name="decoration"
                  value={programFormData.decoration}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Others charge"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Hall Charge
                </label>
                <input
                  name="hallCharge"
                  value={programFormData.hallCharge}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Hall rental charge"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Service Charge
                </label>
                <input
                  name="service"
                  value={programFormData.service}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Service charge"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Financials
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Discount
                </label>
                <input
                  name="discount"
                  value={programFormData.discount}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Discount amount"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="flex justify-between items-center text-black dark:text-white text-lg font-medium py-2">
                <span>Final Amount:</span>
                <span>${calculatedAmounts.finalAmount.toFixed(2)}</span>
              </div>
              {isEditMode && program?.paid?.length > 0 && (
                <div className="flex justify-between items-center text-black dark:text-white text-sm py-1">
                  <span>Already Paid:</span>
                  <span>Tk {getExistingPaidAmount().toFixed(2)}</span>
                </div>
              )}
              <div>
                <label className="block text-black dark:text-white mb-2">
                  New Paid Amount
                </label>
                <input
                  name="newPaidAmount"
                  value={programFormData.newPaidAmount}
                  onChange={handleProgramInputChange}
                  type="number"
                  min="0"
                  placeholder="Amount being paid now"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Paid Details
                </label>
                <input
                  name="paidDetails"
                  value={programFormData.paidDetails}
                  onChange={handleProgramInputChange}
                  type="text"
                  placeholder="e.g., Cash, Card, Bank Transfer"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="flex justify-between items-center text-black dark:text-white text-lg font-medium py-2">
                <span>Due Amount:</span>
                <span>${calculatedAmounts.due.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              Guest & Food Details
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Guest Details
                </label>
                <Select
                  onChange={setSelectedGuest}
                  options={guestOptions}
                  value={selectedGuest}
                  placeholder="Select Guest"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-black dark:text-white mb-2">
                  Food Items
                </label>
                <Select
                  isMulti
                  options={foodOptions}
                  onChange={setSelectedFoodItems}
                  value={selectedFoodItems}
                  placeholder="Select Food Items"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Selected:</span>
                {selectedFoodItems.length > 0 ? (
                  selectedFoodItems.map((d, j) => (
                    <span
                      key={j}
                      className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {d?.label}
                    </span>
                  ))
                ) : (
                  <span>None</span>
                )}
              </div>
              <label className="block text-black dark:text-white mb-2">
                Remark
              </label>
              <textarea
                name="remark"
                value={programFormData.remark}
                onChange={handleProgramInputChange}
                placeholder="Add any specific notes or remarks here..."
                rows="3"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 py-4 px-10 text-center font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loader}
        >
          {isEditMode ? "Update Program" : "Create New Program"}
        </button>
      </div>
    </>
  );
}

export default ProgramForm;
