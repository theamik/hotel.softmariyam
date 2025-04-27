import { useEffect, useState } from "react";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { foods_get, guests_get } from "../../store/Actions/foodAction";
import { new_program, update_program } from "../../store/Actions/orderAction";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer";

function Program() {
  const [selectedOption, setSelectedOption] = useState();
  const [selectedGuest, setSelectedGuest] = useState();
  const [startDate, setStartDate] = useState();
  const [type, setType] = useState();
  const [season, setSeason] = useState();
  const [hall, setHall] = useState();
  const [reference, setReference] = useState();
  const [totalGuest, setTotalGuest] = useState();
  const [perHead, setPerHead] = useState();
  const [amount, setAmount] = useState();
  const [decoration, setDecoration] = useState(0);
  const [hallCharge, setHallCharge] = useState(0);
  const [service, setService] = useState(0);
  const [newPaid, setPaid] = useState(0);
  const [paidDetails, setPaidDetails] = useState();
  const [paidInfo, setPaidInfo] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [due, setDue] = useState();
  const [finalAmount, setFinalAmount] = useState();
  const [foodInfo, setFoodInfo] = useState([]);
  const { guests, foods } = useSelector((state) => state?.food);
  const { errorMessage, successMessage, program } = useSelector(
    (state) => state?.order
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(guests_get());
    dispatch(foods_get());
  }, [dispatch]);

  const guestArray = guests.map((el) => ({
    value: el["_id"],
    label: el["name"],
  }));

  useEffect(() => {
    const guestArray = guests.map((el) => ({
      value: el["_id"],
      label: el["name"],
    }));
    setStartDate(program?.programDate);
    setType(program?.programType);
    setSeason(program?.season);
    setHall(program?.hall);
    setReference(program?.reference);
    setTotalGuest(program?.totalGuest);
    setPerHead(program?.perHead);
    setDecoration(program?.decoration);
    setHallCharge(program?.hallCharge);
    setService(program?.service);
    setDiscount(program?.discount);
    setTimeout(() => {
      setSelectedGuest(
        guestArray.filter((x) => x?.value === program?.guestId?._id)
      );
    }, 1000);
  }, [program]);

  const foodArray = foods.map((el) => ({
    value: el["_id"],
    label: el["name"],
  }));

  // For Selected Filter Alhamdulillah
  let currentDate = new Date();
  useEffect(() => {
    const paid = Number(newPaid);
    setPaidInfo([
      {
        paid,
        paidDetails,
        currentDate,
      },
    ]);
    setStartDate(new Date());
    const food = foodInfo;
    food?.push(selectedOption);
    setFoodInfo(food);
    setAmount(totalGuest * perHead);
    setFinalAmount(
      Number(amount) +
        Number(hallCharge) +
        Number(decoration) +
        Number(service) -
        Number(discount)
    );
    if (program) {
      setDue(
        Number(finalAmount) -
          Number(program?.paid?.reduce((n, { paid }) => n + paid, 0)) -
          Number(newPaid)
      );
    } else {
      setDue(Number(finalAmount) - Number(newPaid));
    }
  }, [
    newPaid,
    paidDetails,
    selectedOption,
    totalGuest,
    perHead,
    amount,
    hallCharge,
    service,
    discount,
    finalAmount,
    due,
  ]);
  var finalFood = foodInfo?.reduce((unique, o) => {
    if (
      !unique.some((obj) => obj?.label === o?.label && obj?.value === o?.value)
    ) {
      unique.push(o);
    }
    return unique;
  }, []);

  const programHandler = (e) => {
    e.preventDefault();
    if (selectedGuest?.value == undefined) {
      toast.error("Please select guest");
    } else {
      dispatch(
        new_program({
          foodItems: finalFood,
          totalAmount: amount,
          discount: discount,
          finalAmount: finalAmount,
          hallCharge: hallCharge,
          decoration: decoration,
          service: service,
          guestId: selectedGuest?.value,
          totalGuest: totalGuest,
          due: due,
          paid: paidInfo,
          programDate: startDate,
          hall: hall,
          programType: type,
          season: season,
          perHead: perHead,
          reference: reference,
        })
      );
    }
  };

  const updateHandler = (e) => {
    e.preventDefault();
    if (selectedGuest?.value == undefined) {
      toast.error("Please select guest");
    } else {
      dispatch(
        update_program({
          foodItems: finalFood,
          totalAmount: amount,
          discount: discount,
          finalAmount: finalAmount,
          hallCharge: hallCharge,
          decoration: decoration,
          service: service,
          guestId: selectedGuest?.value,
          totalGuest: totalGuest,
          due: due,
          paid: paidInfo,
          programDate: startDate,
          hall: hall,
          programType: type,
          season: season,
          perHead: perHead,
          reference: reference,
          programId: program?._id,
        })
      );
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
      navigate("/restaurant/invoice");
    }
  }, [successMessage, errorMessage]);
  return (
    <>
      <div className="grid grid-cols-1 mt-3 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Input Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-6.5">
              <label className="block text-black dark:text-white">
                Select Program Date
              </label>
              <DatePicker
                className="text-gray-800 outline-none border-2 w-full text-center border-white focus:border-blue-300 dark:bg-boxdark dark:text-white p-1"
                selected={startDate ? startDate : new Date()}
                onChange={(date) => setStartDate(date)}
              />
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Program Type
                </label>
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  type="text"
                  placeholder="Program Type"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Season
                </label>
                <input
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  type="text"
                  placeholder="Season"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Hall
                </label>
                <input
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                  type="text"
                  placeholder="Hall"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Reference
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  type="text"
                  placeholder="Reference"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Total Guest
                </label>
                <input
                  value={totalGuest}
                  onChange={(e) => setTotalGuest(e.target.value)}
                  type="number"
                  placeholder="Total Guest"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Per Head
                </label>
                <input
                  value={perHead}
                  onChange={(e) => setPerHead(e.target.value)}
                  type="number"
                  placeholder="Per Head"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Amount
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="Amount"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Decoration
                </label>
                <input
                  value={decoration}
                  onChange={(e) => setDecoration(e.target.value)}
                  type="number"
                  placeholder="Decoration"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* <!-- Toggle switch input --> */}

          {/* <!-- Time and date --> */}

          {/* <!-- File upload --> */}
        </div>

        <div className="flex flex-col gap-9">
          {/* <!-- Textarea Fields --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-9.5">
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Hall Charge
                </label>
                <input
                  value={hallCharge}
                  onChange={(e) => setHallCharge(e.target.value)}
                  type="number"
                  placeholder="Hall Charge"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Service
                </label>
                <input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  type="number"
                  placeholder="Service"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Paid
                </label>
                <input
                  value={newPaid}
                  onChange={(e) => setPaid(e.target.value)}
                  type="number"
                  placeholder="Paid"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              {program ? (
                <span className="flex justify-start items-start">
                  Already Paid Tk{" "}
                  {program?.paid?.reduce((n, { paid }) => n + paid, 0)}
                </span>
              ) : (
                ""
              )}
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Paid Details
                </label>
                <input
                  value={paidDetails}
                  onChange={(e) => setPaidDetails(e.target.value)}
                  type="text"
                  placeholder="Paid Details"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Discount
                </label>
                <input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  type="number"
                  placeholder="Discount"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <label className="mb-3 block text-black dark:text-white">
                  Due
                </label>
                <input
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  type="number"
                  placeholder="Due"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Guest Details
                </label>
                <Select
                  onChange={setSelectedGuest}
                  options={guestArray}
                  value={selectedGuest}
                  placeholder="Select Guest"
                />
              </div>
              <div>
                <label className="mb-3 block text-black dark:text-white">
                  Food Items
                </label>
                <Select
                  defaultValue={selectedOption}
                  onChange={setSelectedOption}
                  options={foodArray}
                  placeholder="Food Items"
                />
              </div>
              <span className="flex justify-start items-start">
                {finalFood && finalFood.map((d, j) => <p>{d?.label} &nbsp;</p>)}
              </span>
              <label className="block text-black dark:text-white">
                Previous Food list
              </label>
              <span className="flex justify-start items-start">
                {program?.foodItems?.map((i, q) => <p>{i?.label} &nbsp;</p>)}
              </span>

              {program ? (
                <button
                  onClick={(e) => updateHandler(e)}
                  className="inline-flex items-center justify-center rounded-full bg-primary py-4  px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                  Update Program
                </button>
              ) : (
                <button
                  onClick={(e) => programHandler(e)}
                  className="inline-flex items-center justify-center rounded-full bg-primary py-4  px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                  New Program
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Program;
