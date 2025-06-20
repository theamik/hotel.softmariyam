import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  get_a_pre_order,
  get_pre_order,
  place_order,
  remove_pre_order,
  get_orders,
} from "../../store/Actions/orderAction";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import "../../css/InvoiceStyles.css"; // Assuming this CSS file is present
import { Button, Modal } from "antd";
import { intLocal } from "../../api/api";
import { useNavigate } from "react-router-dom";

// --- Type Definitions (Added for clarity, assuming your Redux state structure) ---
interface CartItem {
  _id: string; // Use _id as per backend schema, but `id` is used in cartItems, reconcile if needed
  id: string; // Adjusted to match usage in cartActions.addItem
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface PreOrderType {
  _id: string;
  date: string;
  party: string;
  partyId: string;
  cartItems: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  discount: number;
  delivery: number;
  service: number;
  finalAmount: number;
  generatedBy: string;
  remark?: string; // Added remark field to type definition
  // Add other properties if they exist in your pre-order schema
}

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

interface OrderState {
  preOrder: PreOrderType | null;
  preOrders: PreOrderType[];
  errorMessage: string | null;
  successMessage: string | null;
}

interface AuthState {
  userInfo: UserInfo;
}

interface RootState {
  order: OrderState;
  auth: AuthState;
}
// --- End Type Definitions ---

const PreOrder = () => {
  const navigate = useNavigate();

  // Use typed selectors
  const { preOrder, preOrders, errorMessage, successMessage } = useSelector(
    (state: RootState) => state.order
  );
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(get_pre_order() as any); // Type assertion for Redux Thunk
  }, [dispatch]);

  const orderHandler = ({
    preOrderId,
    party,
    partyId,
    cartItems,
    totalAmount,
    totalQuantity,
    discount,
    delivery,
    finalAmount,
    service,
    remark, // Added remark to the orderHandler arguments
    e,
  }: {
    preOrderId: string;
    party: string;
    partyId: string;
    cartItems: CartItem[];
    totalAmount: number;
    totalQuantity: number;
    discount: number;
    delivery: number;
    finalAmount: number;
    service: number;
    remark?: string; // Type for remark
    e: React.MouseEvent;
  }) => {
    e.preventDefault();
    dispatch(
      place_order({
        party,
        partyId,
        cartItems,
        totalAmount,
        totalQuantity,
        discount,
        delivery,
        finalAmount,
        service,
        remark, // Passed remark to the place_order action
      }) as any
    ); // Type assertion
    navigate("/restaurant/order");
    dispatch(remove_pre_order({ preOrderId, partyId }) as any);
    // Type assertion
  };

  const draftHandler = ({
    preOrderId,
    partyId,
    cartItems,
    totalAmount,
    totalQuantity,
    discount, // Include discount
    service, // Include service
    delivery, // Include delivery
    remark, // Include remark
    party, // Include party name for selectedParty.label
    e,
  }: {
    preOrderId: string;
    partyId: string;
    cartItems: CartItem[];
    totalAmount: number;
    totalQuantity: number;
    discount: number; // Type for discount
    service: number; // Type for service
    delivery: number; // Type for delivery
    remark?: string; // Type for remark
    party: string; // Type for party name
    e: React.MouseEvent;
  }) => {
    e.preventDefault();
    // Save all relevant data to localStorage for FormElements to pick up
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("totalAmount", JSON.stringify(totalAmount));
    localStorage.setItem("totalQuantity", JSON.stringify(totalQuantity));
    localStorage.setItem("draftDiscount", JSON.stringify(discount)); // Save discount
    localStorage.setItem("draftService", JSON.stringify(service)); // Save service
    localStorage.setItem("draftDelivery", JSON.stringify(delivery)); // Save delivery
    localStorage.setItem("draftRemark", JSON.stringify(remark)); // Save remark
    localStorage.setItem("draftPartyId", JSON.stringify(partyId)); // Save partyId
    localStorage.setItem("draftPartyLabel", JSON.stringify(party)); // Save party label

    dispatch(remove_pre_order({ preOrderId, partyId }) as any); // Type assertion
    // Optionally, navigate to the FormElements page if not already there, or trigger a re-render
    // window.location.reload(); // A simple but often heavy way to refresh and trigger useEffect in FormElements
    // Or if using react-router-dom, navigate to the route containing FormElements:
    // navigate('/your-form-elements-path');
  };

  const printHandler = ({ preOrderId }: { preOrderId: string }) => {
    dispatch(get_a_pre_order(preOrderId) as any); // Type assertion
    setShowModal(true);
  };

  const cancelHandler = () => {
    setShowModal(false);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Changed contentRef to content for useReactToPrint
    documentTitle: `KOT_Order_${preOrder?.party || "Unknown"}`, // Dynamic title
  });

  return (
    <div>
      <div className="mt-3 border-spacing-1 border-blue-50">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="relative flex flex-col w-full h-full text-gray-700 dark:text-white bg-white dark:bg-boxdark shadow-md rounded-xl bg-clip-border">
            <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 dark:text-white bg-white dark:bg-boxdark rounded-none bg-clip-border">
              <div className="flex items-center justify-between gap-8 mb-8">
                <div>
                  <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                    Pre Order list
                  </h5>
                </div>
              </div>
            </div>
            <div className="p-6 px-0 overflow-scroll">
              <table className="w-full text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
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
                      <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 dark:text-white opacity-70">
                        Bill For
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
                        Food Items
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
                        Final Amount
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
                        Remark
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50 dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:bg-neutral-700">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70"></p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preOrders &&
                    preOrders.map((d, j) => (
                      <tr
                        key={d._id || j}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-700/50"
                      >
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <div className="w-max">
                            <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 dark:bg-slate-300 ">
                              {moment(d?.date).format("ll")}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
                                {d?.party}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
                            {d?.cartItems.length}
                          </p>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
                            {Number(d.totalAmount).toFixed(2)}
                          </p>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
                              {Number(d?.finalAmount).toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <div className="flex flex-col">
                            <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 dark:text-white">
                              {d?.remark || "N/A"} {/* Display remark here */}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 dark:border-neutral-700">
                          <button
                            onClick={(e) =>
                              orderHandler({
                                preOrderId: d?._id,
                                party: d?.party,
                                partyId: d?.partyId,
                                cartItems: d?.cartItems,
                                totalAmount: d?.totalAmount,
                                totalQuantity: d?.totalQuantity,
                                discount: d?.discount,
                                delivery: d?.delivery,
                                service: d?.service,
                                finalAmount: d?.finalAmount,
                                remark: d?.remark, // Pass remark here
                                e,
                              })
                            }
                            className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-200 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200/20 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                            title="Place Order"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                                className="w-6 h-6"
                                version="1.1"
                                id="Layer_1"
                              >
                                <path d="M19.3,5.3L9,15.6l-4.3-4.3l-1.4,1.4l5,5L9,18.4l0.7-0.7l11-11L19.3,5.3z"></path>
                              </svg>
                            </span>
                          </button>
                          <button
                            onClick={(e) =>
                              draftHandler({
                                preOrderId: d?._id,
                                partyId: d?.partyId,
                                cartItems: d?.cartItems,
                                totalAmount: d?.totalAmount,
                                totalQuantity: d?.totalQuantity,
                                discount: d?.discount, // Pass discount
                                service: d?.service, // Pass service
                                delivery: d?.delivery, // Pass delivery
                                remark: d?.remark, // Pass remark
                                party: d?.party, // Pass party name
                                e,
                              })
                            }
                            className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-200 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200/20 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                            title="Edit Draft"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                                className="w-4 h-4"
                              >
                                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"></path>
                              </svg>
                            </span>
                          </button>
                          <button
                            className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-200 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200/20 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                            onClick={() => printHandler({ preOrderId: d?._id })}
                            title="Print KOT"
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
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <>
          {showModal && (
            <Modal
              width={400}
              title="KOT Details"
              open={showModal}
              onCancel={() => {
                cancelHandler();
              }}
              footer={false}
            >
              {/* ============ invoice modal start ==============  */}
              <div id="invoice-POS" ref={componentRef}>
                {/*End InvoiceTop*/}
                <div id="mid">
                  <div className="mt-2">
                    <p className="items-center justify-center">
                      <h3 className="upprelative grid items-center text-center px-4 py-2 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 dark:bg-slate-300ercase mb-3 ">
                        KOT
                      </h3>
                    </p>
                    <center id="top">
                      <div className="info">
                        <div className="logo">
                          <img
                            src={`${intLocal}${userInfo?.companyId?.image}`}
                            alt="Invoice"
                            className="w-20 h-20 rounded-full object-cover border"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/80x80/cccccc/000000?text=Logo";
                              e.currentTarget.onerror = null;
                            }}
                          />
                        </div>
                      </div>
                    </center>
                    <p className="flex justify-between items-center">
                      <span>
                        {" "}
                        Order For : <b>{preOrder?.party}</b>{" "}
                      </span>
                      <span>
                        {" "}
                        <b> {moment(preOrder?.date).format("ll")}</b>
                      </span>
                    </p>
                    <p className="flex justify-between mt-2 items-center">
                      <span>
                        {" "}
                        Generated by : <b>{preOrder?.generatedBy}</b>{" "}
                      </span>
                      <span> {moment(preOrder?.date).format("HH:mm")}</span>
                    </p>
                    {preOrder?.remark && ( // Conditionally display remark in KOT
                      <p className="flex justify-between mt-2 items-center">
                        <span>
                          {" "}
                          Remark : <b>{preOrder.remark}</b>{" "}
                        </span>
                      </p>
                    )}
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
                              <b>Quantity</b>
                            </p>
                          </td>
                        </tr>
                        {preOrder?.cartItems?.map((item) => (
                          <tr className="service" key={item._id || item.id}>
                            <td className="tableitem">
                              <p className="itemtext">{item.name}</p>
                            </td>
                            <td className="tableitem">
                              <p className="itemtext">{item.quantity}</p>
                            </td>
                          </tr>
                        ))}
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
        </>
      </div>
    </div>
  );
};

export default PreOrder;
