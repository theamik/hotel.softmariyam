import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import "../../css/InvoiceStyles.css";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  get_orders,
  get_a_order,
  cancel_order,
} from "../../store/Actions/orderAction.js";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer";
import { intLocal } from "../../api/api.js";

const TableFive = () => {
  const { order, orders, errorMessage, successMessage } = useSelector(
    (state) => state?.order
  );
  const { userInfo } = useSelector((state) => state?.auth);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dispatch(get_orders());
  }, [dispatch]);

  const orderPrint = (orderId) => {
    dispatch(get_a_order(orderId));
    setShowModal(true);
  };

  const cancelHandler = () => {
    setShowModal(false);
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Title",
    contentRef: componentRef,
  });

  console.log(componentRef.current);

  const currentDate = moment(new Date()).format("LL");
  const cancelOrder = (orderId, date) => {
    const newDate = moment(date).format("LL");
    if (newDate !== currentDate) {
      toast.error("Cancellation Date Over");
    } else {
      dispatch(cancel_order(orderId));
      setTimeout(() => {
        dispatch(get_orders());
      }, 3000);
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
  }, [successMessage, errorMessage]);

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
              <button
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 dark:text-white transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                View all
              </button>
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
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-max">
              <nav>
                <ul
                  role="tablist"
                  className="relative flex flex-row p-1 rounded-lg bg-blue-gray-50 bg-opacity-60"
                >
                  <li
                    role="tab"
                    className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none dark:text-gray-900 text-blue-gray-900"
                    data-value="all"
                  >
                    <div className="z-20 text-inherit">
                      &nbsp;&nbsp;All&nbsp;&nbsp;
                    </div>
                    <div className="absolute inset-0 z-10 h-full bg-white rounded-md shadow"></div>
                  </li>
                  <li
                    role="tab"
                    className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none text-blue-gray-900"
                    data-value="monitored"
                  >
                    <div className="z-20 text-inherit">
                      &nbsp;&nbsp;Paid&nbsp;&nbsp;
                    </div>
                  </li>
                  <li
                    role="tab"
                    className="relative flex items-center justify-center w-full h-full px-2 py-1 font-sans text-base antialiased font-normal leading-relaxed text-center bg-transparent cursor-pointer select-none text-blue-gray-900"
                    data-value="monitored"
                  >
                    <div className="z-20 text-inherit">
                      &nbsp;&nbsp;Due&nbsp;&nbsp;
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="w-full md:w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    ></path>
                  </svg>
                </div>
                <input
                  className="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Search
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 px-0 overflow-scroll">
          <table className="w-full mt-4 text-left table-auto min-w-max">
            <thead>
              <tr>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Billed On
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Billed To
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Items
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Amount
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>
                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Status
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      ></path>
                    </svg>
                  </p>
                </th>

                <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70"></p>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders.map((d, j) => (
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {moment(d?.date).format("ll")}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.party}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {d?.totalQuantity}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d?.finalAmount}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="w-max">
                        <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 dark:bg-slate-300 ">
                          <span className="">Paid</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-2 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={(e) => orderPrint(d?._id)}
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
                              <path
                                d="M57.7881012,14.03125H52.5v-8.0625c0-2.2091999-1.7909012-4-4-4h-33c-2.2091999,0-4,1.7908001-4,4v8.0625H6.2119002
    C2.7871001,14.03125,0,16.8183498,0,20.2431507V46.513649c0,3.4248009,2.7871001,6.2119026,6.2119002,6.2119026h2.3798995
    c0.5527,0,1-0.4472008,1-1c0-0.5527-0.4473-1-1-1H6.2119002C3.8896,50.7255516,2,48.8359489,2,46.513649V20.2431507
    c0-2.3223,1.8896-4.2119007,4.2119002-4.2119007h51.5762024C60.1102982,16.03125,62,17.9208508,62,20.2431507V46.513649
    c0,2.3223-1.8897018,4.2119026-4.2118988,4.2119026H56c-0.5527992,0-1,0.4473-1,1c0,0.5527992,0.4472008,1,1,1h1.7881012
    C61.2128983,52.7255516,64,49.9384499,64,46.513649V20.2431507C64,16.8183498,61.2128983,14.03125,57.7881012,14.03125z
     M13.5,5.96875c0-1.1027999,0.8971996-2,2-2h33c1.1027985,0,2,0.8972001,2,2v8h-37V5.96875z"
                              />
                              <path
                                d="M44,45.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,47.0302505,20,47.0302505h24
    c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,45.0322495,44,45.0322495z"
                              />
                              <path
                                d="M44,52.0322495H20c-0.5517998,0-0.9990005,0.4472008-0.9990005,0.9990005S19.4482002,54.0302505,20,54.0302505h24
    c0.5517006,0,0.9990005-0.4472008,0.9990005-0.9990005S44.5517006,52.0322495,44,52.0322495z"
                              />
                              <circle cx="7.9590998" cy="21.8405495" r="2" />
                              <circle cx="14.2856998" cy="21.8405495" r="2" />
                              <circle cx="20.6121998" cy="21.8405495" r="2" />
                              <path d="M11,62.03125h42v-26H11V62.03125z M13.4036999,38.4349518h37.1925964v21.1925964H13.4036999V38.4349518z" />
                            </g>
                          </svg>
                        </span>
                      </button>

                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-2 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={(e) => cancelOrder(d?._id, d?.date)}
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
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-blue-gray-50">
          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
            Page 1 of 10
          </p>
          <div className="flex gap-2">
            <button
              className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button"
            >
              Previous
            </button>
            <button
              className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          width={400}
          pagination={false}
          title="Invoice Details"
          visible={showModal}
          onCancel={() => {
            cancelHandler();
          }}
          footer={false}
        >
          {/* ============ invoice modal start ==============  */}
          {/* ============ invoice modal start ==============  */}
          <div id="invoice-POS" ref={componentRef}>
            <center id="top">
              <div className="info">
                <div className="logo">
                  <img
                    src={`${intLocal}${userInfo?.companyId?.image}`}
                    alt="Invoice"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                </div>
                <h2>{userInfo?.companyId?.name}</h2>
                <p>
                  {" "}
                  Address : {userInfo?.companyId?.address} <br /> Mobile :
                  {userInfo?.companyId?.mobile} <br /> Email :
                  {userInfo?.companyId?.email}
                </p>
              </div>
              {/*End Info*/}
            </center>
            {/*End InvoiceTop*/}
            <div id="mid">
              <div className="mt-2">
                <p className="flex justify-between items-center">
                  <span>
                    {" "}
                    <b> Order No: {order?.orderNo}</b>
                  </span>
                  <span>
                    {" "}
                    <b> {moment(order?.date).format("ll")}</b>
                  </span>
                  <span>
                    {" "}
                    <b> {moment(order?.date).format("HH:mm")}</b>
                  </span>
                </p>
                <p className="flex justify-between items-center">
                  <span>
                    {" "}
                    Bill For : <b>{order?.party}</b>{" "}
                  </span>
                  <span>
                    {" "}
                    Bill by : <b>{order?.generatedBy}</b>{" "}
                  </span>
                </p>
                <hr style={{ margin: "5px" }} />
              </div>
            </div>
            {/*End Invoice Mid*/}
            <div id="bot">
              <div id="table">
                <table>
                  <tbody>
                    <tr className="tabletitle">
                      <td className="item table-header">
                        <p>
                          <b>Item</b>
                        </p>
                      </td>
                      <td className="Hours table-header">
                        <p>
                          <b>Qty</b>
                        </p>
                      </td>
                      <td className="Rate table-header">
                        <p>
                          <b>Price</b>
                        </p>
                      </td>
                      <td className="Rate table-header">
                        <p>
                          <b>Total</b>
                        </p>
                      </td>
                    </tr>
                    {order?.cartItems?.map((item) => (
                      <tr className="service" key={item._id}>
                        <td className="tableitem">
                          <p className="itemtext">{item.name.slice(0, 30)}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">{item.quantity}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">{item.price}</p>
                        </td>
                        <td className="tableitem">
                          <p className="itemtext">
                            {item.quantity * item.price}
                          </p>
                        </td>
                      </tr>
                    ))}
                    <tr className="tabletitle">
                      <td />
                      <td />
                      <td className="Rate table-header">
                        <p className="tax-label">Total Amount</p>
                      </td>
                      <td className="payment">
                        <p className="tax-value">BDT {order?.totalAmount}</p>
                      </td>
                    </tr>
                    <tr className="tabletitle">
                      <td />
                      <td />
                      <td className="Rate table-header">
                        <p className="tax-label">Discount</p>
                      </td>
                      <td className="payment">
                        <p className="tax-value">BDT {order?.discount}</p>
                      </td>
                    </tr>
                    {order?.service ? (
                      <tr className="tabletitle">
                        <td />
                        <td />
                        <td className="Rate table-header">
                          <p className="tax-label">Service</p>
                        </td>
                        <td className="payment">
                          <p className="tax-value">BDT {order?.service}</p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    {order?.delivery ? (
                      <tr className="tabletitle">
                        <td />
                        <td />
                        <td className="Rate table-header">
                          <p className="tax-label">Delivery</p>
                        </td>
                        <td className="payment">
                          <p className="tax-value">BDT {order?.delivery}</p>
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}
                    <tr className="tabletitle">
                      <td />
                      <td />
                      <td className="Rate table-header">
                        <p className="grand-total-label">
                          <b>Grand Total</b>
                        </p>
                      </td>
                      <td className="payment">
                        <p className="grand-total-value">
                          <b>BDT {order?.finalAmount}</b>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/*End Table*/}
              <div id="legalcopy">
                <p className="legal">
                  <strong>Thank you for your order!</strong> Come again.
                  <b> Developed by AleeZaInnovation </b>
                </p>
              </div>
            </div>
            {/*End InvoiceBot*/}
          </div>
          {/*End Invoice*/}
          <div className="flex justify-end mt-3">
            <Button
              className="px-5 py-[6px] rounded-sm hover:shadow-blue-500/20 hover:shadow-lg bg-blue-500 text-sm text-white uppercase"
              onClick={handlePrint}
            >
              Print
            </Button>
          </div>
          {/* ============ invoice modal ends ==============  */}
        </Modal>
      )}
    </div>
  );
};

export default TableFive;
