import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  get_a_program,
  get_programs, // Updated to accept pagination and search
  cancel_program, // New action for cancelled
} from "../../store/Actions/orderAction"; // Ensure correct path
import { messageClear } from "../../store/Reducers/orderReducer"; // Ensure correct path
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

interface GuestInfo {
  _id: string;
  name: string;
  mobile: string;
  address: string;
}

interface Program {
  _id: string;
  bookedDate: string;
  programDate: string;
  programType: string;
  season: string;
  totalGuest: number;
  finalAmount: number;
  paid: { paid: number }[]; // Assuming 'paid' is an array of objects with a 'paid' property
  guestId: GuestInfo; // Assuming this is populated from a 'guests' collection
  status: string; // Add status field for filtering
  remark?: string; // Add remark for search
  // Add other fields you might want to search or display
}

interface OrderState {
  programs: Program[];
  totalPrograms: number; // Added for pagination
  errorMessage: string | null;
  successMessage: string | null;
  program: Program | null; // For single program details
}

interface RootState {
  auth: {
    userInfo: UserInfo;
  };
  order: OrderState; // Assuming your order state is structured this way
}

const TableSix = () => {
  const { programs, totalPrograms, errorMessage, successMessage } = useSelector(
    (state: RootState) => state?.order
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed number of programs per page

  // --- Filter States ---
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'tentative', 'confirmed', 'completed', 'cancelled'
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Define your program status options with color information for both display and filter buttons
  const programStatusOptions = [
    {
      value: "tentative",
      label: "Tentative",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    {
      value: "completed",
      label: "Completed",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
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
    tentative: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-200",
      hoverText: "hover:text-blue-900",
    },
    confirmed: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-200",
      hoverText: "hover:text-green-900",
    },
    completed: {
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      hoverBg: "hover:bg-purple-200",
      hoverText: "hover:text-purple-900",
    },
    cancelled: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverBg: "hover:bg-red-200",
      hoverText: "hover:text-red-900",
    },
  };

  // --- Fetch programs based on active filter, pagination, and search query ---
  useEffect(() => {
    const fetchFilteredPrograms = () => {
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery, // Pass search query to actions
      };

      switch (activeFilter) {
        case "tentative":
          dispatch(get_tentative_programs(payload as any)); // Use as any or define specific payload types
          break;
        case "confirmed":
          dispatch(get_confirmed_programs(payload as any));
          break;
        case "completed":
          dispatch(get_completed_programs(payload as any));
          break;
        case "cancelled":
          dispatch(get_cancelled_programs(payload as any));
          break;
        case "all":
        default:
          dispatch(get_programs(payload as any));
          break;
      }
    };

    const debounceSearch = setTimeout(() => {
      fetchFilteredPrograms();
    }, 300); // Debounce search input to avoid excessive API calls

    return () => clearTimeout(debounceSearch); // Cleanup debounce timeout
  }, [dispatch, currentPage, itemsPerPage, activeFilter, searchQuery]);

  const viewProgram = (programId: string) => {
    dispatch(get_a_program(programId));
    setTimeout(() => {
      navigate("/restaurant/invoice"); // Assuming this is correct for program invoices
    }, 500);
  };

  const editProgram = (programId: string) => {
    navigate(`/restaurant/program?programId=${programId}`);
  };

  const currentDate = moment(new Date()).format("LL");

  const cancelProgram = (programId: string, date: string) => {
    const newDate = moment(date).format("LL");
    if (moment(newDate).isBefore(moment(currentDate))) {
      // Use moment's isBefore for reliable date comparison
      toast.error("Cancellation Date Over");
    } else {
      dispatch(cancel_program(programId));
      // Re-fetch programs after cancellation. Use current filter and page.
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery,
      };
      // Delay re-fetch slightly to allow backend to process
      setTimeout(() => {
        switch (activeFilter) {
          case "tentative":
            dispatch(get_tentative_programs(payload as any));
            break;
          case "confirmed":
            dispatch(get_confirmed_programs(payload as any));
            break;
          case "completed":
            dispatch(get_completed_programs(payload as any));
            break;
          case "cancelled":
            dispatch(get_cancelled_programs(payload as any));
            break;
          case "all":
          default:
            dispatch(get_programs(payload as any));
            break;
        }
      }, 500); // Small delay
    }
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

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

  // --- Pagination Logic ---
  const totalPages = Math.ceil((totalPrograms || 0) / itemsPerPage);

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
                Programs
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all programs
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              {/* Removed "View all" button as "All" filter tab serves this purpose */}
              <Link to="/restaurant/program">
                <button
                  className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  New Program
                </button>
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

                  {/* Tentative Button */}
                  {/* <button onClick={() => handleFilterClick("tentative")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["tentative"].bgColor} ${filterButtonStyles["tentative"].textColor} ${filterButtonStyles["tentative"].hoverBg} ${filterButtonStyles["tentative"].hoverText}
                        ${activeFilter === "tentative" ? "bg-white shadow-sm dark:bg-neutral-800 text-blue-800 dark:text-blue-200" : ""}
                      `}
                      data-value="tentative"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Tentative&nbsp;&nbsp;
                      </div>
                    </li>
                  </button> */}

                  {/* Confirmed Button */}
                  {/* <button onClick={() => handleFilterClick("confirmed")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["confirmed"].bgColor} ${filterButtonStyles["confirmed"].textColor} ${filterButtonStyles["confirmed"].hoverBg} ${filterButtonStyles["confirmed"].hoverText}
                        ${activeFilter === "confirmed" ? "bg-white shadow-sm dark:bg-neutral-800 text-green-800 dark:text-green-200" : ""}
                      `}
                      data-value="confirmed"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Confirmed&nbsp;&nbsp;
                      </div>
                    </li>
                  </button> */}

                  {/* Completed Button */}
                  {/* <button onClick={() => handleFilterClick("completed")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["completed"].bgColor} ${filterButtonStyles["completed"].textColor} ${filterButtonStyles["completed"].hoverBg} ${filterButtonStyles["completed"].hoverText}
                        ${activeFilter === "completed" ? "bg-white shadow-sm dark:bg-neutral-800 text-purple-800 dark:text-purple-200" : ""}
                      `}
                      data-value="completed"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Completed&nbsp;&nbsp;
                      </div>
                    </li>
                  </button> */}

                  {/* Cancelled Button */}
                  {/* <button onClick={() => handleFilterClick("cancelled")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["cancelled"].bgColor} ${filterButtonStyles["cancelled"].textColor} ${filterButtonStyles["cancelled"].hoverBg} ${filterButtonStyles["cancelled"].hoverText}
                        ${activeFilter === "cancelled" ? "bg-white shadow-sm dark:bg-neutral-800 text-red-800 dark:text-red-200" : ""}
                      `}
                      data-value="cancelled"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Cancelled&nbsp;&nbsp;
                      </div>
                    </li>
                  </button> */}
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
                  placeholder="Search program type, guest name, or mobile"
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
              <p className="text-xl">Total Programs : {totalPrograms}</p>
            </div>
          </div>
        </div>
        <div className="p-6 px-0 overflow-scroll">
          <table className="w-full mt-4 text-left table-auto min-w-max">
            <thead>
              <tr>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Program Date
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Program Type
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Guest Name
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Guest Mobile
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Total Guest
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Total Amount
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
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Paid Amount
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
                {/* <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center dark:text-white justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
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
                </th> */}
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70"></p>
                </th>
              </tr>
            </thead>
            <tbody>
              {programs &&
                programs.map((d, j) => {
                  const currentStatusOption = programStatusOptions.find(
                    (option) => option.value === d?.status
                  );
                  const statusBgColor =
                    currentStatusOption?.bgColor || "rgba(108, 117, 125, 0.2)"; // Default grey
                  const statusTextColor =
                    currentStatusOption?.textColor || "gray"; // Default grey

                  return (
                    <tr
                      key={d?._id || j}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {moment(d?.bookedDate).format("YYYY-MM-DD")}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {moment(d?.programDate).format("YYYY-MM-DD")}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                              {d?.programType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.guestId?.name}{" "}
                            {/* Assuming guestId is populated */}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.guestId?.mobile}{" "}
                            {/* Assuming guestId is populated */}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.totalGuest}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          Tk {Number(d?.finalAmount).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans dark:text-white text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          Tk{" "}
                          {Number(
                            d?.paid?.reduce((n, { paid }) => n + paid, 0) || 0
                          ).toFixed(2)}
                        </p>
                      </td>
                      {/* <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="w-max relative"> */}
                      {/* Status Display */}
                      {/* <div
                            className={`relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap`}
                            style={{
                              backgroundColor: statusBgColor,
                              color: statusTextColor,
                            }}
                          >
                            <span className="">
                              {currentStatusOption?.label || d?.status}
                            </span>
                          </div> */}
                      {/* </div>
                      </td> */}
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex gap-2">
                          {/* View Button (for Invoice) */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => viewProgram(d?._id)}
                            title="View Program Invoice"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                fill="#000000"
                                version="1.1"
                                id="Capa_1"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20px"
                                height="20px"
                                viewBox="0 0 442.04 442.04"
                              >
                                <g>
                                  <g>
                                    <path d="M221.02,341.304c-49.708,0-103.206-19.44-154.71-56.22C27.808,257.59,4.044,230.351,3.051,229.203 c-4.068-4.697-4.068-11.669,0-16.367c0.993-1.146,24.756-28.387,63.259-55.881c51.505-36.777,105.003-56.219,154.71-56.219 c49.708,0,103.207,19.441,154.71,56.219c38.502,27.494,62.266,54.734,63.259,55.881c4.068,4.697,4.068,11.669,0,16.367 c-0.993,1.146-24.756,28.387-63.259,55.881C324.227,321.863,270.729,341.304,221.02,341.304z M29.638,221.021 c9.61,9.799,27.747,27.03,51.694,44.071c32.83,23.361,83.714,51.212,139.688,51.212s106.859-27.851,139.688-51.212 c23.944-17.038,42.082-34.271,51.694-44.071c-9.609-9.799-27.747-27.03-51.694-44.071 c-32.829-23.362-83.714-51.212-139.688-51.212s-106.858,27.85-139.688,51.212C57.388,193.988,39.25,211.219,29.638,221.021z" />
                                  </g>
                                  <g>
                                    <path d="M221.02,298.521c-42.734,0-77.5-34.767-77.5-77.5c0-42.733,34.766-77.5,77.5-77.5c18.794,0,36.924,6.814,51.048,19.188 c5.193,4.549,5.715,12.446,1.166,17.639c-4.549,5.193-12.447,5.714-17.639,1.166c-9.564-8.379-21.844-12.993-34.576-12.993 c-28.949,0-52.5,23.552-52.5,52.5s23.551,52.5,52.5,52.5c28.95,0,52.5-23.552,52.5-52.5c0-6.903,5.597-12.5,12.5-12.5 s12.5,5.597,12.5,12.5C298.521,263.754,263.754,298.521,221.02,298.521z" />
                                  </g>
                                  <g>
                                    <path d="M221.02,246.021c-13.785,0-25-11.215-25-25s11.215-25,25-25c13.786,0,25,11.215,25,25S234.806,246.021,221.02,246.021z" />
                                  </g>
                                </g>
                              </svg>
                            </span>
                          </button>

                          {/* Edit Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => editProgram(d?._id)}
                            title="Edit Program"
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

                          {/* Cancel Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() =>
                              cancelProgram(d?._id, d?.programDate)
                            }
                            title="Cancel Program"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                width="20px"
                                height="20px"
                                viewBox="0 0 64 64"
                                data-name="Layer 1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <title />
                                <path d="M50.86,13.38H13a1.5,1.5,0,0,1,0-3H50.86a1.5,1.5,0,0,1,0,3Z" />
                                <path d="M42.4,57.93H21.48a5.5,5.5,0,0,1-5.5-5.5V11.87a1.5,1.5,0,0,1,1.5-1.5H46.4a1.5,1.5,0,0,1,1.5,1.5V52.43A5.51,5.51,0,0,1,42.4,57.93ZM19,13.37V52.43a2.5,2.5,0,0,0,2.5,2.5H42.4a2.5,2.5,0,0,0,2.5-2.5V13.37Z" />
                                <path d="M40,13.37H23.9a1.5,1.5,0,0,1-1.5-1.5V6.57a1.5,1.5,0,0,1,1.5-1.5H40a1.5,1.5,0,0,1,1.5,1.5v5.3A1.5,1.5,0,0,1,40,13.37Zm-14.58-3H38.48V8.07H25.4Z" />
                                <path d="M24.94,47.61a1.5,1.5,0,0,1-1.5-1.5V21.46a1.5,1.5,0,0,1,3,0V46.11A1.5,1.5,0,0,1,24.94,47.61Z" />
                                <path d="M38.94,47.61a1.5,1.5,0,0,1-1.5-1.5V21.46a1.5,1.5,0,0,1,3,0V46.11A1.5,1.5,0,0,1,38.94,47.61Z" />
                                <path d="M31.94,40.38a1.5,1.5,0,0,1-1.5-1.5V28.7a1.5,1.5,0,1,1,3,0V38.88A1.5,1.5,0,0,1,31.94,40.38Z" />
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
          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
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

export default TableSix;
