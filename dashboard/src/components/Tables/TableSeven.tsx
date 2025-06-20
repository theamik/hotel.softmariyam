import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Modal as BasicModal } from "../Modal/Basic"; // Assuming this path is correct
import toast from "react-hot-toast";
import Select from "react-select"; // Assuming you are using react-select for the dropdown
import {
  hotel_guests_get, // This action will be updated to accept pagination and filters
  get_a_guest,
  guest_add,
  guest_update,
  available_guests_get, // New action for Available status
  confirmed_guests_get, // New action for Confirmed status
  finished_guests_get, // New action for Finished status
  cancelled_guests_get, // New action for Cancelled status
} from "../../store/Actions/foodAction";
import { messageClear } from "../../store/Reducers/foodReducer";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Type definitions for Redux state (adjust as per your actual Redux state structure)
interface GuestInfo {
  _id: string;
  name: string;
  address: string;
  mobile: string;
  description: string;
  date: string; // Assuming date is stored as a string, convert to Date object when needed
  status: string;
  under: string; // 'hotel' or 'restaurant'
}

interface FoodState {
  loader: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  guests: GuestInfo[];
  guest: GuestInfo | null;
  totalGuests: number; // Added for pagination
}

interface RootState {
  food: FoodState;
}

// Assuming the BasicModal component props are structured this way
interface LoremModalProps {
  modal: {
    Frame: React.FC<{
      open: boolean;
      onClose: () => void;
      children: React.ReactNode;
    }>;
    Head: React.FC<{ children: React.ReactNode }>;
    Body: React.FC<{ children: React.ReactNode }>;
  };
}

const LoremModal: React.FC<LoremModalProps> = ({ modal }) => {
  const { loader, successMessage, errorMessage, guest } = useSelector(
    (state: RootState) => state?.food
  );
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const dispatch = useDispatch();

  // Define status options for the modal Select component
  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "confirmed", label: "Confirmed" },
    { value: "finished", label: "Finished" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !address ||
      !mobile ||
      !description ||
      !selectedStatus ||
      !startDate
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    dispatch(
      guest_add({
        name,
        address,
        mobile,
        description,
        date: startDate, // Pass date to the action
        status: selectedStatus.value, // Pass selected status to the action
        under: "hotel", // Assuming guests in this table are "hotel" guests
      }) as any // Type assertion for dispatch, as createAsyncThunk return type can be complex
    );
    params.delete("modal");
    setParams(params);
  };

  useEffect(() => {
    if (guest) {
      setName(guest.name || "");
      setAddress(guest.address || "");
      setMobile(guest.mobile || "");
      setDescription(guest.description || "");
      setStartDate(guest.date ? new Date(guest.date) : new Date());
      setSelectedStatus(
        statusOptions.find((x) => x.value === guest.status) || null
      );
    } else {
      // Reset form fields when modal is opened for new entry
      setName("");
      setAddress("");
      setMobile("");
      setDescription("");
      setStartDate(new Date());
      setSelectedStatus(null);
    }
  }, [guest]); // Only run when 'guest' object changes

  const updateHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !address ||
      !mobile ||
      !description ||
      !selectedStatus ||
      !startDate
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    dispatch(
      guest_update({
        name,
        address,
        mobile,
        description,
        date: startDate,
        status: selectedStatus.value,
        guestId: guest?._id,
      }) as any // Type assertion for dispatch
    );
    // After update, we usually re-fetch the list to reflect changes.
    // The `useEffect` in TableSeven will handle the re-fetch via successMessage.
    params.delete("modal");
    setParams(params);
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      // Re-fetch guests after a successful add/update
      // This will be handled by the TableSeven component's useEffect, which listens to successMessage
    }
  }, [successMessage, errorMessage, dispatch]);

  return (
    <modal.Frame
      open={!!params.get("modal")}
      onClose={() => {
        params.delete("modal");
        setParams(params);
      }}
    >
      <modal.Head>
        <div className="text-white">
          {guest ? "Guest Update 🙋‍♀️" : "Guest Entry 🙋‍♀️"}
        </div>
      </modal.Head>
      <modal.Body>
        <div className="flex flex-col space-y-2">
          <DatePicker
            className="text-gray-800 outline-none border-2 w-full text-center border-white focus:border-blue-300 p-1 rounded-md"
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select Date"
          />
          <Select
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1 rounded-md"
            onChange={(option) =>
              setSelectedStatus(option as { value: string; label: string })
            }
            options={statusOptions}
            value={selectedStatus}
            placeholder="Select Status"
            required
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "white",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#93C5FD", // blue-300
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999, // Ensure dropdown is above other elements
              }),
            }}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1 rounded-md dark:bg-gray-700 dark:text-neutral-200 dark:border-neutral-600 dark:focus:border-blue-500"
            placeholder="Name"
            type="text" // Changed from 'name' to 'text' for HTML input type
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1 rounded-md dark:bg-gray-700 dark:text-neutral-200 dark:border-neutral-600 dark:focus:border-blue-500"
            placeholder="Address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1 rounded-md dark:bg-gray-700 dark:text-neutral-200 dark:border-neutral-600 dark:focus:border-blue-500"
            placeholder="Mobile"
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1 rounded-md dark:bg-gray-700 dark:text-neutral-200 dark:border-neutral-600 dark:focus:border-blue-500"
            placeholder="Description"
          />

          {guest ? (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded-md shadow-xl p-2 outline-none focus:border-blue-300 hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-800 dark:border-blue-800 dark:hover:bg-blue-900"
              onClick={updateHandler}
            >
              Update Guest
            </button>
          ) : (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded-md shadow-xl p-2 outline-none focus:border-blue-300 hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-800 dark:border-blue-800 dark:hover:bg-blue-900"
              onClick={submitHandler}
            >
              Create Guest
            </button>
          )}
        </div>
      </modal.Body>
    </modal.Frame>
  );
};

const TableSeven = () => {
  const [params, setParams] = useSearchParams();
  const { guests, totalGuests, successMessage, errorMessage } = useSelector(
    (state: RootState) => state?.food
  );
  const dispatch = useDispatch();

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed number of guests per page

  // --- Filter States ---
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'available', 'confirmed', 'finished', 'cancelled'
  const [searchQuery, setSearchQuery] = useState("");

  // Define status options with color information for both display and filter buttons
  const guestStatusOptions = [
    {
      value: "available",
      label: "Available",
      bgColor: "rgba(100, 200, 255, 0.2)",
      color: "#64C8FF",
    }, // Lighter Blue
    {
      value: "confirmed",
      label: "Confirmed",
      bgColor: "rgba(0, 128, 0, 0.2)",
      color: "green",
    }, // Green
    {
      value: "finished",
      label: "Finished",
      bgColor: "rgba(255, 165, 0, 0.2)",
      color: "orange",
    }, // Orange
    {
      value: "cancelled",
      label: "Cancelled",
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
    available: {
      bgColor: "bg-blue-200",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-300",
      hoverText: "hover:text-blue-900",
    },
    confirmed: {
      bgColor: "bg-green-200",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-300",
      hoverText: "hover:text-green-900",
    },
    finished: {
      bgColor: "bg-orange-200",
      textColor: "text-orange-800",
      hoverBg: "hover:bg-orange-300",
      hoverText: "hover:text-orange-900",
    },
    cancelled: {
      bgColor: "bg-red-200",
      textColor: "text-red-800",
      hoverBg: "hover:bg-red-300",
      hoverText: "hover:text-red-900",
    },
  };

  // --- Fetch guests based on active filter, pagination, and search query ---
  useEffect(() => {
    const fetchFilteredGuests = () => {
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery,
        under: "restaurant",
      };

      switch (activeFilter) {
        case "available":
          dispatch(available_guests_get(payload));
          break;
        case "confirmed":
          dispatch(confirmed_guests_get(payload));
          break;
        case "finished":
          dispatch(finished_guests_get(payload));
          break;
        case "cancelled":
          dispatch(cancelled_guests_get(payload));
          break;
        case "all":
        default:
          dispatch(hotel_guests_get(payload));
          break;
      }
    };

    const debounceSearch = setTimeout(() => {
      fetchFilteredGuests();
    }, 300); // Debounce search input to avoid excessive API calls

    return () => clearTimeout(debounceSearch); // Cleanup debounce timeout
  }, [dispatch, currentPage, itemsPerPage, activeFilter, searchQuery]); // Re-fetch on filter/page/search changes
  // Handler for status filter buttons (tabs)
  const handleFilterClick = (filter: string) => {
    setCurrentPage(1); // Always reset to the first page when changing filters
    setActiveFilter(filter);
  };

  // Handler for search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      // Trigger a re-fetch of guests after success (add/update)
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery,
      };
      switch (activeFilter) {
        case "available":
          dispatch(available_guests_get(payload));
          break;
        case "confirmed":
          dispatch(confirmed_guests_get(payload));
          break;
        case "finished":
          dispatch(finished_guests_get(payload));
          break;
        case "cancelled":
          dispatch(cancelled_guests_get(payload));
          break;
        case "all":
        default:
          dispatch(hotel_guests_get(payload));
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
    searchQuery,
  ]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil((totalGuests || 0) / itemsPerPage);

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

  const handleEditGuest = (guestId: string) => {
    dispatch(get_a_guest(guestId));
    setParams({ ...params, modal: "true" });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="relative flex flex-col w-full h-full text-gray-700 dark:text-white bg-white dark:bg-boxdark shadow-md rounded-xl bg-clip-border">
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 dark:text-white bg-white dark:bg-boxdark rounded-none bg-clip-border">
          <div className="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Hotel Guest
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all guests
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              <button
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 dark:text-white transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                onClick={() => handleFilterClick("all")} // View All button to reset filters
              >
                View all
              </button>
              <button
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                onClick={() => {
                  setParams({ modal: "true" }); // Open modal for new guest
                  dispatch(get_a_guest(null)); // Clear guest data in Redux for new entry
                }}
              >
                New Guest
              </button>
              <LoremModal modal={BasicModal} />
            </div>
          </div>
          {/* Filter Buttons and Search Bar Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="block w-full md:w-max overflow-hidden">
              <nav>
                <ul
                  role="tablist"
                  className="relative flex flex-wrap p-1 rounded-lg bg-blue-gray-50 bg-opacity-60 dark:bg-gray-700 dark:bg-opacity-60"
                >
                  {/* All Button */}

                  {/* Available Button */}
                  <button onClick={() => handleFilterClick("available")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-auto h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1 text-nowrap
                        ${filterButtonStyles["available"].bgColor} ${filterButtonStyles["available"].textColor} ${filterButtonStyles["available"].hoverBg} ${filterButtonStyles["available"].hoverText}
                        ${activeFilter === "available" ? "bg-white shadow-sm dark:bg-neutral-800" : ""}
                      `}
                      data-value="available"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Available&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Confirmed Button */}
                  <button onClick={() => handleFilterClick("confirmed")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-auto h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1 text-nowrap
                        ${filterButtonStyles["confirmed"].bgColor} ${filterButtonStyles["confirmed"].textColor} ${filterButtonStyles["confirmed"].hoverBg} ${filterButtonStyles["confirmed"].hoverText}
                        ${activeFilter === "confirmed" ? "bg-white shadow-sm dark:bg-neutral-800" : ""}
                      `}
                      data-value="confirmed"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Confirmed&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Finished Button */}
                  <button onClick={() => handleFilterClick("finished")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-auto h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1 text-nowrap
                        ${filterButtonStyles["finished"].bgColor} ${filterButtonStyles["finished"].textColor} ${filterButtonStyles["finished"].hoverBg} ${filterButtonStyles["finished"].hoverText}
                        ${activeFilter === "finished" ? "bg-white shadow-sm dark:bg-neutral-800" : ""}
                      `}
                      data-value="finished"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Finished&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Cancelled Button */}
                  <button onClick={() => handleFilterClick("cancelled")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-auto h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1 text-nowrap
                        ${filterButtonStyles["cancelled"].bgColor} ${filterButtonStyles["cancelled"].textColor} ${filterButtonStyles["cancelled"].hoverBg} ${filterButtonStyles["cancelled"].hoverText}
                        ${activeFilter === "cancelled" ? "bg-white shadow-sm dark:bg-neutral-800" : ""}
                      `}
                      data-value="cancelled"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Cancelled&nbsp;&nbsp;
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
                  placeholder="Search guest name or mobile"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 dark:text-neutral-400 dark:peer-focus:text-blue-500">
                  Search
                </label>
              </div>
            </div>
          </div>
          {/* Total Guests Count */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row mb-4">
            <div className="block w-full overflow-hidden md:w-max">
              <p className="text-xl dark:text-white">
                Total Guests : {totalGuests}
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
                    Address
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
                    Mobile
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
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Event
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
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Date
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
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
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
              {guests &&
                guests?.map((d, j) => {
                  const currentStatusOption = guestStatusOptions.find(
                    (option) => option.value === d?.status
                  );
                  const statusBgColor =
                    currentStatusOption?.bgColor || "rgba(108, 117, 125, 0.2)"; // Default grey
                  const statusTextColor = currentStatusOption?.color || "gray"; // Default grey
                  return (
                    <tr
                      key={d?._id || j}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                              {d?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                              {d?.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {d?.mobile}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {d?.description || "N/A"}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                            {d?.date ? moment(d.date).format("ll") : "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="w-max">
                          <div
                            className="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap cursor-pointer transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: statusBgColor,
                              color: statusTextColor,
                            }}
                            onClick={() => handleEditGuest(d._id)} // Click status to edit
                          >
                            <span className="">
                              {currentStatusOption?.label || d?.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex gap-2">
                          {/* Edit Button - Reusing existing logic to open modal */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => handleEditGuest(d._id)}
                            title="Edit Guest"
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

export default TableSeven;
