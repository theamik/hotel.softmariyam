import { useSearchParams } from "react-router-dom";
import { Modal as BasicModal } from "../Modal/Basic";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  get_a_party,
  parties_get,
  party_add,
  party_update,
} from "../../store/Actions/partyAction";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/partyReducer";

const LoremModal: React.FC<{ modal: typeof BasicModal }> = ({ modal }) => {
  const { loader, successMessage, errorMessage, party } = useSelector(
    (state) => state?.party
  );
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState();
  const [address, setAddress] = useState();
  const [mobile, setMobile] = useState();
  const [description, setDescription] = useState();
  const [selectedTypes, setSelectedTypes] = useState(null);
  const [selectedUnder, setSelectedUnder] = useState(null);
  const dispatch = useDispatch();
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      party_add({
        name,
        address,
        mobile,
        description,
        accountType: selectedTypes.value,
        under: selectedUnder.value,
      })
    );
    params.delete("modal");
    setParams(params);
  };
  const types = [
    { value: "accounts_receivable", label: "Accounts Receivable" },
    { value: "accounts_payable", label: "Accounts Payable" },
    { value: "asset", label: "Asset" },
    { value: "cash_restaurant", label: "Cash Restaurant" },
    { value: "cash_hotel", label: "Cash Hotel" },
    { value: "cash_general", label: "Cash General" },
    { value: "card_restaurant", label: "Card Restaurant" },
    { value: "card_hotel", label: "Card Hotel" },
    { value: "card_general", label: "Card General" },
    { value: "discount", label: "Discount" },
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "inventory", label: "Inventory" },
    { value: "liability", label: "Liability" },
    { value: "loan_given", label: "Loan Given" },
    { value: "loan_taken", label: "Loan Taken" },
    { value: "mobile_banking_restaurant", label: "Mobile Banking Restaurant" },
    { value: "mobile_banking_hotel", label: "Mobile Banking Hotel" },
    { value: "mobile_banking_general", label: "Mobile Banking General" },
    { value: "purchase_account", label: "Purchase Account" },
    { value: "res_sales_account", label: "Sales Account Restaurant" },
    { value: "hot_sales_account", label: "Sales Account Hotel" },
  ];
  const under = [
    { value: "hotel", label: "Hotel" },
    { value: "restaurant", label: "Restaurant" },
    { value: "general", label: "General" },
  ];

  useEffect(() => {
    dispatch(parties_get());
  }, [dispatch]);

  useEffect(() => {
    setName(party?.name);
    setAddress(party?.address);
    setMobile(party?.mobile);
    setDescription(party?.description);
    setSelectedTypes(types.filter((x) => x.value === party?.accountType));
    setSelectedUnder(under.filter((x) => x.value === party?.under));
  }, [party]);

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
      setSelectedTypes(null);
      setSelectedUnder(null);
      setTimeout(() => dispatch(parties_get()), 1000);
    }
  }, [successMessage, errorMessage]);

  const updateHandler = (e) => {
    e.preventDefault();
    dispatch(
      party_update({
        name,
        address,
        mobile,
        description,
        accountType: selectedTypes.value,
        under: selectedUnder.value,
        partyId: party?._id,
      })
    );
    params.delete("modal");
    setParams(params);
  };

  return (
    <modal.Frame
      open={!!params.get("modal")}
      onClose={() => {
        params.delete("modal");
        setParams(params);
      }}
    >
      <modal.Head>
        {party ? "Account Update 🙋‍♀️" : "Account Entry 🙋‍♀️"}
      </modal.Head>
      <modal.Body>
        <div className="flex flex-col space-y-2">
          <Select
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            onChange={setSelectedTypes}
            options={types}
            value={selectedTypes}
            placeholder="Account"
          />
          <Select
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            onChange={setSelectedUnder}
            options={under}
            value={selectedUnder}
            placeholder="Under"
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
            type="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            placeholder="Mobile"
            type="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <input
            className="text-gray-800 outline-none border-2 border-white focus:border-blue-300 p-1"
            placeholder="Description"
            type="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {party ? (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded shadow-xl p-2 outline-none focus:border-blue-300"
              onClick={updateHandler}
            >
              Update Account
            </button>
          ) : (
            <button
              className="text-gray-100 border-2 border-blue-700 bg-blue-600 rounded shadow-xl p-2 outline-none focus:border-blue-300"
              onClick={submitHandler}
            >
              Create Account
            </button>
          )}
        </div>
      </modal.Body>
    </modal.Frame>
  );
};

const TableEleven = () => {
  const [params, setParams] = useSearchParams();
  const { parties } = useSelector((state) => state?.party);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(parties_get());
  }, [dispatch]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="relative flex flex-col w-full h-full text-gray-700 dark:text-white bg-white dark:bg-boxdark shadow-md rounded-xl bg-clip-border">
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 dark:text-white bg-white dark:bg-boxdark rounded-none bg-clip-border">
          <div className="flex items-center justify-between gap-8 mb-8">
            <div>
              <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                Account
              </h5>
              <p className="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700 dark:text-white">
                See information about all accounts
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
              <button
                className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 dark:text-white transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                Type
              </button>
              <button
                className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                onClick={() => setParams({ ...params, modal: "true" })}
              >
                New Account
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
                    Name
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
                    Type
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
                    Under
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
                    Balance
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
              {parties &&
                parties.map((d, i) => (
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                            {d.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d.accountType}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d.under}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {d.balance}
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <button
                        className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 dark:text-gray-2 transition-all hover:bg-gray-900/10 dark:hover:bg-blue-200 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        onClick={(e) =>
                          dispatch(get_a_party(d._id)) &&
                          setParams({ ...params, modal: "true" })
                        }
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
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableEleven;
