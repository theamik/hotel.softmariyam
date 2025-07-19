import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import "../../css/InvoiceStyles.css"; // Ensure this CSS file is present for modal styles
import { Button, Modal, Select } from "antd"; // Import Select from antd
import { useDispatch, useSelector } from "react-redux";
import {
  get_orders,
  get_a_order,
  cancel_order,
  update_order_status, // Import the new action
} from "../../store/Actions/orderAction.js"; // Ensure correct path and .js extension if applicable
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer"; // Ensure correct path
import { intLocal } from "../../api/api.js"; // Ensure correct path

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

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  // Add other item properties if they exist
}

interface Order {
  _id: string;
  date: string;
  orderNo: string;
  party: string;
  totalQuantity: number;
  finalAmount: number;
  generatedBy: string;
  cartItems: OrderItem[];
  discount?: number;
  service?: number;
  delivery?: number;
  status: string; // Assuming 'paid', 'due', 'cancelled'
  remark?: string; // Add remark to Order interface
}

interface OrderState {
  order: Order | null;
  orders: Order[];
  totalOrders: number; // Added for pagination
  errorMessage: string | null;
  successMessage: string | null;
}

interface RootState {
  auth: {
    userInfo: UserInfo;
  };
  order: OrderState;
}

const TableFive = () => {
  const { order, orders, errorMessage, successMessage, totalOrders } =
    useSelector((state: RootState) => state?.order);
  const { userInfo } = useSelector((state: RootState) => state?.auth);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement>(null);
  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed number of orders per page

  // --- Filter States ---
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'paid', 'due', 'cancelled'
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Define your order status options with color information for both display and filter buttons
  const orderStatusOptions = [
    {
      value: "paid",
      label: "Paid",
      bgColor: "rgba(0, 128, 0, 0.2)",
      color: "green",
    }, // Green
    {
      value: "due",
      label: "Due",
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
    paid: {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-200",
      hoverText: "hover:text-green-900",
    },
    due: {
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      hoverBg: "hover:bg-orange-200",
      hoverText: "hover:text-orange-900",
    },
    cancelled: {
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverBg: "hover:bg-red-200",
      hoverText: "hover:text-red-900",
    },
  };

  // --- NEW: Fetch orders based on active filter, pagination, and search query ---
  useEffect(() => {
    const fetchFilteredOrders = () => {
      const payload = {
        page: currentPage,
        perPage: itemsPerPage,
        searchQuery: searchQuery,
        // The 'under' property from the guest table is not applicable here,
        // so it's omitted for order fetching.
      };

      switch (activeFilter) {
        case "paid":
          // Dispatch get_orders with status 'paid'
          dispatch(get_orders({ ...payload, status: "paid" }) as any);
          break;
        case "due":
          // Dispatch get_orders with status 'due' (assuming "finished" in your provided code
          // was intended to map to "due" for orders)
          dispatch(get_orders({ ...payload, status: "due" }) as any);
          break;
        case "cancelled":
          // Dispatch get_orders with status 'cancelled'
          dispatch(get_orders({ ...payload, status: "cancelled" }) as any);
          break;
        case "all":
        default:
          // For "all" filter, status is undefined to fetch all orders
          dispatch(get_orders(payload as any));
          break;
      }
    };

    const debounceSearch = setTimeout(() => {
      fetchFilteredOrders();
    }, 300); // Debounce search input to avoid excessive API calls

    return () => clearTimeout(debounceSearch); // Cleanup debounce timeout
  }, [dispatch, currentPage, itemsPerPage, activeFilter, searchQuery]); // Re-fetch on filter/page/search changes

  const orderPrint = (orderId: string) => {
    dispatch(get_a_order(orderId) as any); // Use 'as any'
    setShowModal(true);
  };

  const cancelHandler = () => {
    setShowModal(false);
  };

  const handlePrint = useReactToPrint({
    documentTitle: `Order-Invoice-${order?.orderNo || "Unknown"}`, // Dynamic title
    contentRef: componentRef,
    if(contentRef) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(content.outerHTML);
      printWindow.document.close();
      printWindow.print();
    },
  });

  const confirmCancelOrder = (orderId: string) => {
    Modal.confirm({
      title: "Confirm Cancellation",
      content:
        "Are you sure you want to cancel this order? This action cannot be undone.",
      okText: "Yes, Cancel",
      okButtonProps: { className: "bg-red-500 text-white hover:bg-red-600" },
      cancelText: "No",
      onOk() {
        dispatch(cancel_order(orderId) as any); // Dispatch cancellation
        // Re-fetch orders after cancellation. Use current filter and page.
        const payload = {
          page: currentPage,
          perPage: itemsPerPage,
          searchQuery: searchQuery,
          status: activeFilter === "all" ? undefined : activeFilter,
        };
        // Delay re-fetch slightly to allow backend to process
        setTimeout(() => {
          dispatch(get_orders(payload as any)); // Re-fetch based on current filters
        }, 500); // Small delay
      },
      onCancel() {
        // Do nothing if cancellation is not confirmed
        console.log("Order cancellation cancelled by user.");
      },
    });
  };

  // NEW: Handler for status change with validation
  const handleStatusChange = (
    orderId: string,
    currentStatus: string,
    newStatusValue: string
  ) => {
    // Prevent changing from Paid
    if (
      currentStatus === "paid" &&
      (newStatusValue === "due" || newStatusValue === "cancelled")
    ) {
      toast.error("Cannot change a 'Paid' order back to 'Due' or 'Cancelled'.");
      return;
    }
    // Prevent changing from Cancelled
    if (
      currentStatus === "cancelled" &&
      (newStatusValue === "paid" || newStatusValue === "due")
    ) {
      toast.error("Cannot change a 'Cancelled' order back to 'Paid' or 'Due'.");
      return;
    }

    // If attempting to mark 'due' as 'paid', you might want an additional confirmation here
    // or ensure the backend handles the financial implications (e.g., payment recording).
    // For now, if validations above pass, we proceed.

    dispatch(update_order_status({ orderId, status: newStatusValue }) as any);

    // Re-fetch orders after update
    const payload = {
      page: currentPage,
      perPage: itemsPerPage,
      searchQuery: searchQuery,
      status: activeFilter === "all" ? undefined : activeFilter,
    };
    setTimeout(() => {
      dispatch(get_orders(payload as any));
    }, 500);
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      dispatch(get_orders());
      // No need to dispatch get_orders() here as it's already handled in the confirmCancelOrder's onOk callback
      // and in the main useEffect for initial load and filter/search changes.
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
  const totalPages = Math.ceil((totalOrders || 0) / itemsPerPage);

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
                Orders
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all orders
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              <Link to="/restaurant/bill">
                <button
                  className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  New Order
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

                  {/* Paid Button */}
                  <button onClick={() => handleFilterClick("paid")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["paid"].bgColor} ${filterButtonStyles["paid"].textColor} ${filterButtonStyles["paid"].hoverBg} ${filterButtonStyles["paid"].hoverText}
                        ${activeFilter === "paid" ? "bg-white shadow-sm dark:bg-neutral-800 text-green-800 dark:text-green-200" : ""}
                      `}
                      data-value="paid"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Paid&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Due Button */}
                  <button onClick={() => handleFilterClick("due")}>
                    <li
                      role="tab"
                      className={`relative flex items-center justify-center w-full h-full px-4 py-2 font-sans text-base antialiased font-normal leading-relaxed text-center cursor-pointer select-none transition-colors duration-200 rounded-md ml-1
                        ${filterButtonStyles["due"].bgColor} ${filterButtonStyles["due"].textColor} ${filterButtonStyles["due"].hoverBg} ${filterButtonStyles["due"].hoverText}
                        ${activeFilter === "due" ? "bg-white shadow-sm dark:bg-neutral-800 text-orange-800 dark:text-orange-200" : ""}
                      `}
                      data-value="due"
                    >
                      <div className="z-20 text-inherit">
                        &nbsp;&nbsp;Due&nbsp;&nbsp;
                      </div>
                    </li>
                  </button>

                  {/* Cancelled Button */}
                  <button onClick={() => handleFilterClick("cancelled")}>
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
                  placeholder="Search order number, party, or items"
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
              <p className="text-xl dark:text-white">
                Total Orders : {totalOrders}
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
                    Billed On
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
                    Billed To
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
                    Items
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
              {orders &&
                orders.map((d, j) => {
                  const currentStatusOption = orderStatusOptions.find(
                    (option) => option.value === d?.status
                  );
                  // These styles are for the dropdown options and for the main Select display
                  const statusStyle = {
                    backgroundColor:
                      currentStatusOption?.bgColor ||
                      "rgba(108, 117, 125, 0.2)",
                    color: currentStatusOption?.color || "gray",
                  };

                  return (
                    <tr
                      key={d?._id || j}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                    >
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          {moment(d?.date).format("YYYY-MM-DD HH:mm")}{" "}
                          {/* Display date and time */}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                              {d?.party}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                            {d?.totalQuantity}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <p className="block font-sans text-sm antialiased dark:text-white font-normal leading-normal text-blue-gray-900">
                          Tk {Number(d?.finalAmount).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        {/* Status Selector */}
                        <Select
                          value={d.status} // Current status of the order
                          onChange={(newStatusValue) =>
                            handleStatusChange(d._id, d.status, newStatusValue)
                          }
                          style={{
                            minWidth: 100, // Adjust width as needed
                          }}
                          options={orderStatusOptions.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                          className="w-full rounded-md dark:bg-boxdark dark:text-white"
                          bordered={false} // Remove default border
                          dropdownStyle={{
                            borderRadius: "0.375rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            // Dark mode for dropdown
                            ...(document.documentElement.classList.contains(
                              "dark"
                            ) && {
                              backgroundColor: "#2b303b", // dark:bg-boxdark
                              color: "white",
                            }),
                          }}
                          // Renders each option in the dropdown with its specific color
                          optionRender={(option) => {
                            const optStyle = orderStatusOptions.find(
                              (o) => o.value === option.value
                            );
                            return (
                              <div
                                style={{
                                  backgroundColor: optStyle?.bgColor,
                                  color: optStyle?.color,
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                {option.label}
                              </div>
                            );
                          }}
                          // Renders the currently selected value in the Select box with its specific color
                          valueRender={(valueProps) => {
                            const selectedOption = orderStatusOptions.find(
                              (o) => o.value === valueProps.value
                            );
                            return (
                              <div
                                style={{
                                  backgroundColor:
                                    selectedOption?.bgColor ||
                                    "rgba(108, 117, 125, 0.2)",
                                  color: selectedOption?.color || "gray",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  width: "100%", // Ensure it takes full width for consistent look
                                  textAlign: "center", // Center the text
                                }}
                              >
                                {selectedOption?.label || valueProps.label}
                              </div>
                            );
                          }}
                        />
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                        <div className="flex gap-2">
                          {/* Print Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => orderPrint(d?._id)}
                            title="Print Order"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                fill="currentColor"
                                height="20px"
                                width="20px"
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 64 64"
                              >
                                <g id="Printer">
                                  <path d="M57.7881012,14.03125H52.5v-8.0625c0-2.2091999-1.7909012-4-4-4h-33c-2.2091999,0-4,1.7908001-4,4v8.0625H6.2119002 C2.7871001,14.03125,0,16.8183498,0,20.2431507V46.513649c0,3.4248009,2.7871001,6.2119026,6.2119002,6.2119026h2.3798995 c0.5527,0,1-0.4472008,1-1c0-0.5527-0.4473-1-1-1H6.2119002C3.8896,50.7255516,2,48.8359489,2,46.513649V20.2431507 c0-2.3223,1.8896-4.2119007,4.2119002-4.2119007h51.5762024C60.1102982,16.03125,62,17.9208508,62,20.2431507V46.513649 c0,2.3223-1.8897018,4.2119026-4.2118988,4.2119026H56c-0.5527992,0-1,0.4473-1,1c0,0.5527992,0.4472008,1,1,1h1.7881012 C61.2128983,52.7255516,64,49.9384499,64,46.513649V20.2431507C64,16.8183498,61.2128983,14.03125,57.7881012,14.03125z M13.5,5.96875c0-1.1027999,0.8971996-2,2-2h33c1.1027985,0,2,0.8972001,2,2v8h-37V5.96875z" />
                                  <path d="M44,45.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,47.0302505,20,47.0302505h24 c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,45.0322495,44,45.0322495z" />
                                  <path d="M44,52.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,54.0302505,20,54.0302505h24 c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,52.0322495,44,52.0322495z" />
                                  <circle
                                    cx="7.9590998"
                                    cy="21.8405495"
                                    r="2"
                                  />
                                  <circle
                                    cx="14.2856998"
                                    cy="21.8405495"
                                    r="2"
                                  />
                                  <circle
                                    cx="20.6121998"
                                    cy="21.8405495"
                                    r="2"
                                  />
                                  <path d="M11,62.03125h42v-26H11V62.03125z M13.4036999,38.4349518h37.1925964v21.1925964H13.4036999V38.4349518z" />
                                </g>
                              </svg>
                            </span>
                          </button>

                          {/* Cancel Button */}
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none dark:text-gray-200 dark:hover:bg-neutral-600/20 dark:active:bg-neutral-600/40"
                            type="button"
                            onClick={() => confirmCancelOrder(d?._id)}
                            title="Cancel Order"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                width="20px"
                                height="20px"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6 18L18 6M6 6L18 18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
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

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-4 p-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ============ Invoice Modal Start ============== */}
      {showModal && (
        <Modal
          width={350} // Reduce modal width for compactness
          title="Order Invoice"
          open={showModal}
          onCancel={cancelHandler}
          footer={false}
        >
          <div id="invoice-POS" ref={componentRef}>
            {/* Invoice Top */}
            <div id="top" className="text-center">
              {userInfo?.companyId?.image && (
                <div className="logo mx-auto">
                  <img
                    src={`${intLocal}${userInfo.companyId.image}`}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-full object-cover border mx-auto mb-2"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/80x80/cccccc/000000?text=Logo";
                      e.currentTarget.onerror = null;
                    }}
                  />
                </div>
              )}
              <div className="info">
                <h2 className="text-sm font-bold">
                  {userInfo?.companyId?.name || "Your Company Name"}
                </h2>
                <p className="text-xs">
                  {userInfo?.companyId?.address || "Company Address"}
                </p>
                <p className="text-xs">
                  {userInfo?.companyId?.mobile || "Company Mobile"}
                </p>
                <p className="text-xs">
                  {userInfo?.companyId?.email || "Company Email"}
                </p>
              </div>
            </div>

            {/* Invoice Mid */}
            <div id="mid" className="mt-2">
              <div className="info text-xs">
                <p className="flex justify-between items-center mb-1">
                  <span>
                    Order No: <b>{order?.orderNo || "N/A"}</b>
                  </span>
                  <span>
                    <b>{moment(order?.date).format("YYYY-MM-DD")}</b>
                  </span>
                </p>
                <p className="flex justify-between text-xs items-center mb-1">
                  <span>
                    Order For: <b>{order?.party || "N/A"}</b>
                  </span>
                  <span>
                    <b>{moment(order?.date).format("HH:mm")}</b>
                  </span>
                </p>
                <p className="flex justify-between text-xs mt-1 items-center mb-1">
                  <span>
                    Bill By: <b>{order?.generatedBy || "N/A"}</b>
                  </span>
                  {order?.remark && (
                    <span>
                      Remark: <b>{order.remark}</b>
                    </span>
                  )}
                </p>
                <hr style={{ margin: "5px 0", borderTop: "1px dashed #bbb" }} />
              </div>
            </div>

            {/* Invoice Bot */}
            <div id="bot" className="mt-2">
              <div id="table">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="tabletitle">
                      <td
                        className="item table-header text-left"
                        style={{ padding: "5px", width: "80%" }}
                      >
                        <p className="font-bold">Item</p>
                      </td>
                      <td
                        className="Hours table-header text-center"
                        style={{ padding: "5px", width: "20%" }}
                      >
                        <p className="font-bold">Qty</p>
                      </td>
                      <td
                        className="Rate table-header text-right"
                        style={{ padding: "5px", width: "20%" }}
                      >
                        <p className="font-bold">Amount</p>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {order?.cartItems?.map((item) => (
                      <tr className="service" key={item._id}>
                        <td
                          className="tableitem text-left"
                          style={{ padding: "3px" }}
                        >
                          <p className="itemtext">
                            {item.name || "Item not available"}
                          </p>
                        </td>
                        <td
                          className="tableitem text-center"
                          style={{ padding: "3px" }}
                        >
                          <p className="itemtext">{item.quantity || 0}</p>
                        </td>
                        <td
                          className="tableitem text-right"
                          style={{ padding: "3px" }}
                        >
                          <p className="itemtext">
                            {(item.price * item.quantity || 0).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ))}
                    {order?.discount || order?.delivery || order?.service ? (
                      <tr className="tabletitle">
                        <td
                          className="Rate text-left"
                          colSpan={2}
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">Sub Total</p>
                        </td>
                        <td
                          className="payment text-right"
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">
                            {Number(order?.totalAmount).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    {order?.discount ? (
                      <tr className="tabletitle">
                        <td
                          className="Rate text-left"
                          colSpan={2}
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">Discount</p>
                        </td>
                        <td
                          className="payment text-right"
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">
                            {Number(order.discount).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    {order?.service ? (
                      <tr className="tabletitle">
                        <td
                          className="Rate text-left"
                          colSpan={2}
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">Service Fee</p>
                        </td>
                        <td
                          className="payment text-right"
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">
                            {Number(order?.service).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    {order?.delivery ? (
                      <tr className="tabletitle">
                        <td
                          className="Rate text-left"
                          colSpan={2}
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">Delivery Fee</p>
                        </td>
                        <td
                          className="payment text-right"
                          style={{ padding: "5px" }}
                        >
                          <p className="font-bold">
                            {Number(order.delivery).toFixed(2)}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    <tr className="tabletitle total">
                      <td
                        className="Rate text-left"
                        colSpan={2}
                        style={{ padding: "5px" }}
                      >
                        <p className="font-bold">Grand Total</p>
                      </td>
                      <td
                        className="payment text-right"
                        style={{ padding: "5px" }}
                      >
                        <p className="font-bold">
                          {(order?.finalAmount || 0).toFixed(2)}
                        </p>
                      </td>
                    </tr>
                    <tr className="tabletitle total">
                      <td
                        className="Rate text-left"
                        colSpan={2}
                        style={{ padding: "5px" }}
                      >
                        <p className="font-bold">Order Status</p>
                      </td>
                      <td
                        className="payment text-right"
                        style={{ padding: "5px" }}
                      >
                        <p className="font-bold">{order?.status || "N/A"}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                id="legalcopy"
                className="mt-3 text-center text-xs text-gray-600"
              >
                <p className="legal">
                  <strong>Thank you for your order!</strong> Come again. <br />
                  <b>Developed by AleeZaInnovation</b>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button
              className="px-4 py-2 rounded-sm bg-blue-500 text-white text-xs uppercase"
              onClick={handlePrint}
            >
              Print Invoice
            </Button>
          </div>
        </Modal>
      )}

      {/* ============ Invoice Modal End ============== */}
    </div>
  );
};

export default TableFive;
