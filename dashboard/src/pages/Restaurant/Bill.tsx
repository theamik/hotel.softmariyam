import Select from "react-select";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  foods_get,
  get_a_food,
  menus_get,
} from "../../store/Actions/foodAction";
import { cartActions } from "../../store/Reducers/cartReducer";
import { order_parties_get, pre_order } from "../../store/Actions/orderAction";
import PreOrder from "./PreOrder";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer";
const FormElements = () => {
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const { menus, foods } = useSelector((state) => state?.food);
  const { parties, errorMessage, successMessage } = useSelector(
    (state) => state?.order
  );

  const cartItems = useSelector((state) => state?.cart.cartItems);
  const totalAmount = useSelector((state) => state?.cart.totalAmount);
  const totalQuantity = useSelector((state) => state?.cart.totalQuantity);

  const foodArray = foods.map((el) => ({
    value: el["_id"],
    label: el["name"],
  }));

  const orderParties = parties.map((el) => ({
    value: el["_id"],
    label: el["name"],
  }));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(order_parties_get());
    dispatch(menus_get());
    dispatch(foods_get());
  }, [dispatch]);
  const [newQuantity, setNewQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [service, setService] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const cardHandler = (obj) => {
    dispatch(
      cartActions.addItem({
        id: obj.id,
        name: obj.name,
        price: obj.price,
        image: obj.image,
        newQuantity: newQuantity,
      })
    );
  };

  const quantityHandler = (obj, event) => {
    setNewQuantity(obj.quantity);
    dispatch(
      cartActions.addItem({
        id: obj.id,
        name: obj.name,
        price: obj.price,
        image: obj.image,
        newQuantity: parseInt(obj.quantity),
      })
    );
  };
  const deleteItem = (id) => {
    dispatch(cartActions.deleteItem(id));
  };

  const finalAmount =
    Number(totalAmount) - Number(discount) + Number(service) + Number(delivery);

  const preOrderHandler = (e) => {
    e.preventDefault();
    if (!selectedParty) {
      toast.error("Please select table");
    } else {
      dispatch(
        pre_order({
          cartItems,
          totalAmount,
          totalQuantity,
          discount,
          delivery,
          service,
          finalAmount,
          party: selectedParty.label,
          partyId: selectedParty.value,
        })
      );
      localStorage.removeItem("cartItems");
      localStorage.removeItem("totalAmount");
      localStorage.removeItem("totalQuantity");
    }
    // dispatch(cartActions.deleteCard())
  };

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      window.location.reload();
    }
  }, [successMessage, errorMessage]);
  return (
    <>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border p-3 border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between p-3">
              <h3 className="font-medium text-black dark:text-white">
                Order Items
              </h3>
              <div className="App mt-2">
                <Select
                  defaultValue={selectedParty}
                  onChange={setSelectedParty}
                  options={orderParties}
                  placeholder="Bill to"
                />
              </div>
            </div>
            <ul className="flex flex-col pt-4 space-y-2">
              {cartItems &&
                cartItems.map((d, i) => (
                  <li>
                    <div className="flex items-start justify-between">
                      <h3 className="flex items-center justify-center dark:text-violet-600 gap-2">
                        <button
                          onClick={(e) => deleteItem(d?.id)}
                          className=" text-dark dark:text-violet-600 "
                        >
                          <RiDeleteBin6Line />
                        </button>
                        {d?.name}
                      </h3>
                      <div className="text-right">
                        <span className="block dark:text-violet-600">
                          Tk {d?.price * d?.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center justify-start">
                      <input
                        onChange={(e) =>
                          quantityHandler({
                            id: d?.id,
                            name: d?.name,
                            price: d?.price,
                            quantity: e.target.value,
                          })
                        }
                        value={newQuantity}
                        className="text-sm h-6 w-10 border-slate-700 outline-none border dark:text-violet-600 dark:bg-black"
                        type="Number"
                        name="quantity"
                        placeholder="Quantity"
                        id="quantity"
                        required
                      />{" "}
                      x
                      <span className="text-sm dark:text-violet-600">
                        {d?.price}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
            <div className="pt-4 space-y-2">
              <div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Tk {totalAmount}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  <input
                    onChange={(e) => setDiscount(e.target.value)}
                    value={discount}
                    className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black"
                    type="number"
                    name="discount"
                    placeholder="Discount"
                    id="discount"
                    required
                  />
                </span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>
                  <input
                    onChange={(e) => setService(e.target.value)}
                    value={service}
                    className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black"
                    type="number"
                    name="service"
                    placeholder="Service"
                    id="service"
                    required
                  />
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>
                    <input
                      onChange={(e) => setDelivery(e.target.value)}
                      value={delivery}
                      className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black"
                      type="number"
                      name="delivery"
                      placeholder="Delivery"
                      id="delivery"
                      required
                    />
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">Tk {finalAmount}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => preOrderHandler(e)}
                  className="w-full py-2 font-semibold border rounded dark:bg-violet-600 dark:text-gray-50 dark:border-violet-600"
                >
                  Go to kitchen
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-9">
          <div
            data-hs-carousel='{
    "loadingClasses": "opacity-0"
  }'
            className="relative"
          >
            <div className="hs-carousel flex space-x-2">
              <div className="flex-none">
                <div className="hs-carousel-pagination max-h-180 flex flex-col gap-y-2 overflow-y-auto">
                  {menus &&
                    menus.map((d, i) => (
                      <div className="hs-carousel-pagination-item shrink-0 border  border-black-2 dark:border-white rounded-md overflow-hidden cursor-pointer w-[150px] h-[150px] hs-carousel-active:border-blue-400">
                        <div className="flex justify-center h-full bg-gray-100 p-2 dark:bg-neutral-900">
                          <span className="self-center text-xs text-gray-800 transition duration-700 dark:text-white">
                            {d?.name}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="relative grow overflow-hidden min-h-96 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium flex items-center justify-center text-black dark:text-white">
                  Select Item
                </h3>
                <div className="App mt-2">
                  <Select
                    defaultValue={selectedFood}
                    onChange={setSelectedFood}
                    options={foodArray}
                  />
                </div>
                <div className="mt-3 hs-carousel-pagination max-h-150 flex flex-col gap-y-2 overflow-y-auto">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-4">
                      {foods &&
                        foods.map((d, i) => (
                          <div className="border group transition-all bg-slate-200  dark:bg-slate-700  duration-500 hover:shadow-md hover:-mt-3">
                            <button
                              onClick={(e) =>
                                cardHandler({
                                  id: d?._id,
                                  name: d?.name,
                                  price: d?.price,
                                })
                              }
                            >
                              <div className="relative overflow-hidden"></div>
                              <div className=" text-slate-800 py-1 dark:text-slate-100 px-1">
                                <h2> {d?.name} </h2>
                                <div className="flex justify-center items-center gap-1">
                                  <span className="text-lg  font-bold">
                                    Tk.{d?.price}
                                  </span>
                                  <div className="flex"></div>
                                </div>
                              </div>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PreOrder />
    </>
  );
};

export default FormElements;
