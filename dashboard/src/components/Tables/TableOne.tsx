import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  get_a_reservation,
  reservations_get, // Will be updated to accept searchQuery
  update_reservation_status, // Will be updated to accept searchQuery
} from "../../store/Actions/foodAction";
import { messageClear } from "../../store/Reducers/foodReducer";
import toast from "react-hot-toast";
import moment from "moment";

// Type definitions for Redux state (adjust as per your actual Redux state structure)
interface UserInfo {
  name: string;
  companyId: {
    image: string;
    name: string;
    address: string;
    mobile: string;
    email: string;
  };
}

interface ResidentInfo {
  _id: string; // Add _id for residentId to search
  name: string;
  address: string;
  mobile: string;
}

interface RoomDetails {
  roomId: {
    name: string;
    categoryId: {
      name: string;
      rackRate: number;
      discountRate: number;
    };
  };
  dayStay: number;
}

interface Reservation {
  _id: string;
  bookedDate: string;
  residentId: ResidentInfo;
  checkInDate: string;
  checkOutDate: string;
  source: string;
  totalAmount: number;
  status: string;
  remark?: string;
  roomDetails?: RoomDetails[];
  others?: any[]; // Define a proper interface if needed
  restaurants?: any[]; // Define a proper interface if needed
  paidInfo?: any[]; // Define a proper interface if needed
}

interface FoodState {
  reservations: Reservation[];
  totalReservations: number;
  errorMessage: string | null;
  successMessage: string | null;
}

interface RootState {
  auth: {
    userInfo: UserInfo;
  };
  food: FoodState;
}

const TableOne = () => {
  const { reservations, totalReservations, errorMessage, successMessage } =
    useSelector((state: RootState) => state?.food);
  const { userInfo } = useSelector((state: RootState) => state?.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed number of reservations per page

  // --- Filter States ---
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'will_check', 'checked_in', 'checked_out', 'cancel'
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // State to manage the visibility of the status dropdown for each reservation
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null
  );

  // Define your status options with color information for both display and filter buttons
  const statusOptions = [
    {
      value: "will_check",
      label: "Will Check",
      bgColor: "rgba(0, 191, 255, 0.2)",
      color: "#00BFFF",
    }, // Blue
    {
      value: "checked_in",
      label: "Check In",
      bgColor: "rgba(0, 128, 0, 0.2)",
      color: "green",
    }, // Green
    {
      value: "checked_out",
      label: "Checked Out",
      bgColor: "rgba(255, 165, 0, 0.2)",
      color: "orange",
    }, // Orange
    {
      value: "cancel",
      label: "Cancel",
      bgColor: "rgba(255, 0, 0, 0.2)",
      color: "red",
    }, // Red
  ];

  // Map for easy lookup of filter button styles
  const filterButtonStyles: {
    [key: string]: {
      bgColor: string;
      textColor: string;
      hoverBg: string;
      hoverText: string;
    };
  } = {
    all: {
      bgColor: "bg-gray-200",
      textColor: "text-gray-800",
      hoverBg: "hover:bg-gray-300",
      hoverText: "hover:text-gray-900",
    },
    will_check: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-200",
      hoverText: "hover:text-blue-900",
    },
    checked_in: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-200",
      hoverText: "hover:text-green-900",
    },
    checked_out: {
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      hoverBg: "hover:bg-orange-200",
      hoverText: "hover:text-orange-900",
    },
    cancel: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverBg: "hover:bg-red-200",
      hoverText: "hover:text-red-900",
    },
  };

  // --- Fetch reservations based on active filter, pagination, and search query ---
  useEffect(() => {
    const fetchFilteredReservations = () => {
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery, // Pass search query to actions
      };

      switch (activeFilter) {
        case "will_check":
          dispatch(will_check_reservations_get(payload));
          break;
        case "checked_in":
          dispatch(checked_in_reservations_get(payload));
          break;
        case "checked_out":
          dispatch(check_out_reservations_get(payload));
          break;
        case "cancel":
          dispatch(cancel_reservations_get(payload));
          break;
        case "all":
        default:
          dispatch(reservations_get(payload));
          break;
      }
    };

    const debounceSearch = setTimeout(() => {
      fetchFilteredReservations();
    }, 300); // Debounce search input to avoid excessive API calls

    return () => clearTimeout(debounceSearch); // Cleanup debounce timeout
  }, [dispatch, currentPage, itemsPerPage, activeFilter, searchQuery]); // Re-fetch on filter/page/search changes

  // Handler for changing reservation status (from dropdown)
  const handleStatusChange = (
    reservationId: string,
    newStatusValue: string
  ) => {
    dispatch(update_reservation_status({ reservationId, newStatusValue }));
    setOpenStatusDropdown(null); // Close the dropdown after selection
  };

  // --- Handlers for status filter buttons (tabs) ---
  const handleFilterClick = (filter: string) => {
    setCurrentPage(1); // Always reset to the first page when changing filters
    setActiveFilter(filter);
  };

  // Handler for search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const invoiceHandler = (reservationId: string) => {
    dispatch(get_a_reservation(reservationId));
    navigate("/hotel/invoice");
  };

  const editHandler = (reservationId: string, startDate: string) => {
    const formattedDate = moment(startDate).format("YYYY-MM-DD");
    // Navigate to the edit route with reservationId in the path
    navigate(
      `/hotel/reservation/edit?reservationId=${reservationId}?checkInDate=${formattedDate}`
    );
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      // Re-fetch reservations after a successful update to reflect changes
      // This will trigger the useEffect for fetching filtered reservations based on current activeFilter
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery, // Pass search query to actions
      };
      switch (activeFilter) {
        case "will_check":
          dispatch(will_check_reservations_get(payload));
          break;
        case "checked_in":
          dispatch(checked_in_reservations_get(payload));
          break;
        case "checked_out":
          dispatch(check_out_reservations_get(payload));
          break;
        case "cancel":
          dispatch(cancel_reservations_get(payload));
          break;
        case "all":
        default:
          dispatch(reservations_get(payload));
          break;
      }
    }
  }, [
    successMessage,
    errorMessage,
    dispatch,
    currentPage,
    itemsPerPage,
    activeFilter,
    searchQuery, // Added searchQuery dependency
  ]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil((totalReservations || 0) / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="relative flex flex-col w-full h-full text-gray-700 dark:text-white bg-white dark:bg-boxdark shadow-md rounded-xl bg-clip-border">
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 dark:text-white bg-white dark:bg-boxdark rounded-none bg-clip-border">
          <div className="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Reservation list
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all reservations
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              {/* Removed "View all" button as "All" filter tab serves this purpose */}
              <Link
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                to="/hotel/new-reservation"
              >
                New Reservation
              </Link>
            </div>
          </div>
          {/* Filter Buttons and Search Bar Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="block w-full md:w-max overflow-hidden">
              <nav>
                <ul
                  role="tablist"
                  className="relative flex flex-row p-1 rounded-lg bg-blue-gray-50 bg-opacity-60 dark:bg-gray-700 dark:bg-opacity-60"
                >
                  {/* All Button */}
                  <button onClick={() => handleFilterClick("all")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md
                        ${filterButtonStyles["all"].bgColor} ${filterButtonStyles["all"].textColor} ${filterButtonStyles["all"].hoverBg} ${filterButtonStyles["all"].hoverText}
                        ${activeFilter === "all" ? "bg-white shadow-sm dark:bg-neutral-800 text-gray-900 dark:text-white" : ""}
                      `}
                      data-value="all"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;All&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Will Check Button */}
                  <button onClick={() => handleFilterClick("will_check")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["will_check"].bgColor} ${filterButtonStyles["will_check"].textColor} ${filterButtonStyles["will_check"].hoverBg} ${filterButtonStyles["will_check"].hoverText}
                        ${activeFilter === "will_check" ? "bg-white shadow-sm dark:bg-neutral-800 text-blue-800 dark:text-blue-200" : ""}
                      `}
                      data-value="will_check"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Will Check&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Check In Button */}
                  <button onClick={() => handleFilterClick("checked_in")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["checked_in"].bgColor} ${filterButtonStyles["checked_in"].textColor} ${filterButtonStyles["checked_in"].hoverBg} ${filterButtonStyles["checked_in"].hoverText}
                        ${activeFilter === "checked_in" ? "bg-white shadow-sm dark:bg-neutral-800 text-green-800 dark:text-green-200" : ""}
                      `}
                      data-value="checked_in"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Checked In&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Checked Out Button */}
                  <button onClick={() => handleFilterClick("checked_out")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["checked_out"].bgColor} ${filterButtonStyles["checked_out"].textColor} ${filterButtonStyles["checked_out"].hoverBg} ${filterButtonStyles["checked_out"].hoverText}
                        ${activeFilter === "checked_out" ? "bg-white shadow-sm dark:bg-neutral-800 text-orange-800 dark:text-orange-200" : ""}
                      `}
                      data-value="checked_out"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Checked Out&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Cancel Button */}
                  <button onClick={() => handleFilterClick("cancel")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["cancel"].bgColor} ${filterButtonStyles["cancel"].textColor} ${filterButtonStyles["cancel"].hoverBg} ${filterButtonStyles["cancel"].hoverText}
                        ${activeFilter === "cancel" ? "bg-white shadow-sm dark:bg-neutral-800 text-red-800 dark:text-red-200" : ""}
                      `}
                      data-value="cancel"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Cancel&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>
                </ul>
              </nav>
            </div>
            {/* Search Bar */}
            <div className="w-full md:w-72 mt-4 md:mt-0">
              <div className="relative h-10 w-full min-w-[200px]">
                <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 dark:border-neutral-700 dark:text-neutral-200 dark:focus:border-blue-500"
                  placeholder="Search guest name, mobile, or source"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 dark:text-neutral-400 dark:peer-focus:text-blue-500">
                  Search
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-max">
              <p className="text-xl">
                Total Reservations : {totalReservations}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 px-0 overflow-scroll">
          <table className="w-full mt-4 text-left table-auto min-w-max">
            <thead>
              <tr>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Booked On
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Guest
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Check In
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Checked Out
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Source
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Amount
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                    Status
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>

                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70"></p>
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations &&
                reservations?.map((i, j) => {
                  const currentStatusOption = statusOptions.find(
                    (option) => option.value === i?.status
                  );
                  const statusBgColor =
                    currentStatusOption?.bgColor || "rgba(108, 117, 125, 0.2)"; // Default grey
                  const statusTextColor = currentStatusOption?.color || "gray"; // Default grey
                  return (
                    <tr
                      key={i?._id || j}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {moment(i?.bookedDate).format("YYYY-MM-DD")}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                              {i?.residentId?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {moment(i?.checkInDate).format("YYYY-MM-DD")}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {moment(i?.checkOutDate).format("YYYY-MM-DD")}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                            {i?.source}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          Tk {Number(i?.totalAmount).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="w-max relative">
                          {/* Status Display and Clickable area */}
                          <div
                            className="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: statusBgColor,
                              color: statusTextColor,
                            }}
                            onClick={() =>
                              setOpenStatusDropdown(
                                openStatusDropdown === i?._id ? null : i?._id
                              )
                            }
                          >
                            <span className="">
                              {currentStatusOption?.label || i?.status}
                            </span>
                          </div>

                          {/* Status Dropdown */}
                          {openStatusDropdown === i?._id && (
                            <div className="absolute z-20 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700 dark:ring-neutral-600">
                              <div className="py-1">
                                {statusOptions.map((option) => (
                                  <div
                                    key={option.value}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-neutral-200 dark:hover:bg-neutral-600"
                                    onClick={() =>
                                      handleStatusChange(i?._id, option.value)
                                    }
                                  >
                                    {option.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex gap-2">
                          {/* Edit Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => editHandler(i?._id, i?.checkInDate)}
                            title="Edit Reservation"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                              </svg>
                            </span>
                          </button>

                          {/* Print Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => invoiceHandler(i?._id)}
                            title="Generate Invoice"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v4h14V3a1 1 0 00-1-1H6zM5 8a2 2 0 00-2 2v5a1 1 0 001 1h2v4a1 1 0 001 1h10a1 1 0 001-1v-4h2a1 1 0 001-1v-5a2 2 0 00-2-2H5zm4 9a1 1 0 100-2h6a1 1 0 100 2H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-blue-gray-50 dark:border-neutral-700">
          <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOne;
