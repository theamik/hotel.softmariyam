import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Modal as BasicModal } from "../Modal/Basic";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  guests_get,
  get_a_guest,
  guest_add,
  guest_update,
} from "../../store/Actions/foodAction";
import { messageClear } from "../../store/Reducers/foodReducer";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LoremModal: React.FC<{ modal: typeof BasicModal }> = ({ modal }) => {
  const { loader, successMessage, errorMessage, guests, guest } = useSelector(
    (state) => state?.food
  );
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState();
  const [address, setAddress] = useState();
  const [mobile, setMobile] = useState();
  const [description, setDescription] = useState();
  const [startDate, setStartDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState(null);
  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      guest_add({
        name,
        address,
        mobile,
        description,
        date: startDate,
        status: selectedStatus.value,
        under: "restaurant",
      })
    );
    dispatch(guests_get());
    params.delete("modal");
    setParams(params);
  };

  const status = [
    { value: "available", label: "Available" },
    { value: "confirmed", label: "Confirmed" },
    { value: "finished", label: "Finished" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    setName(guest?.name);
    setAddress(guest?.address);
    setMobile(guest?.mobile);
    setDescription(guest?.description);
    setStartDate(guest?.date);
    setSelectedStatus(status.filter((x) => x.value === guest?.status));
  }, [guest]);

  const updateHandler = (e) => {
    e.preventDefault();
    dispatch(
      guest_update({
        name,
        address,
        mobile,
        description,
        date: startDate,
        status: selectedStatus.value,
        guestId: guest?._id,
      })
    );
    dispatch(guests_get());
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
      setName("");
      setAddress("");
      setMobile("");
      setDescription("");
      setSelectedStatus(null);
      dispatch(guests_get());
    }
  }, [successMessage, errorMessage]);

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
            className="text-gray-800 outline-none border-2 w-full text-center border-white focus:border-blue-300 p-1"
            selected={startDate ? startDate : new Date()}
            onChange={(date) => setStartDate(date)}
          />
          <Select
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            onChange={setSelectedStatus}
            options={status}
            value={selectedStatus}
            placeholder="Status"
            required
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            placeholder="Name"
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            placeholder="Address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
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
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            placeholder="Description"
          />

          {guest ? (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded shadow-xl p-2 outline-none focus:border-blue-300"
              onClick={updateHandler}
            >
              Update Guest
            </button>
          ) : (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded shadow-xl p-2 outline-none focus:border-blue-300"
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
  const { guests } = useSelector((state) => state?.food);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(guests_get());
  }, [dispatch]);

  // For Selected Filter Alhamdulillah

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="relative flex flex-col w-full h-full text-gray-700 dark:text-white bg-white dark:bg-boxdark shadow-md rounded-xl bg-clip-border">
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 dark:text-white bg-white dark:bg-boxdark rounded-none bg-clip-border">
          <div className="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Party Guest
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all guest
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              <button
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 dark:text-white transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                View all
              </button>
              <button
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                onClick={() => setParams({ ...params, modal: "true" })}
              >
                New Guest
              </button>
              <LoremModal modal={BasicModal} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-max"></div>
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
                    Guest
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
                    From
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
                    Mobile
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
                    Event
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
                    Date
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
              </tr>
            </thead>
            <tbody>
              {guests &&
                guests?.map((d, j) => (
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d?.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d?.mobile}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d?.description}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex flex-col">
                        <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                          {moment(d?.date).format("ll")}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="w-max">
                        <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20 dark:bg-slate-300 ">
                          <span
                            className="cursor-pointer"
                            onClick={(e) =>
                              dispatch(get_a_guest(d._id)) &&
                              setParams({ ...params, modal: "true" })
                            }
                          >
                            {d?.status}
                          </span>
                        </div>
                      </div>
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
    </div>
  );
};

export default TableSeven;
