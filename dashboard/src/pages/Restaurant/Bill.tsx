import Select from "react-select";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  foods_get,
  get_a_food,
  menu_foods,
  menus_get,
} from "../../store/Actions/foodAction";
import { cartActions } from "../../store/Reducers/cartReducer";
import {
  order_parties_get,
  pre_order,
  get_pre_order,
} from "../../store/Actions/orderAction";
import PreOrder from "./PreOrder";
import toast from "react-hot-toast";
import { messageClear } from "../../store/Reducers/orderReducer";

interface Food {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface Menu {
  _id: string;
  name: string;
}

interface Party {
  _id: string;
  name: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface FoodState {
  foods: Food[];
  menus: Menu[];
  food: Food | null;
}

interface OrderState {
  parties: Party[];
  errorMessage: string | null;
  successMessage: string | null;
}

interface CartState {
  cartItems: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

interface RootState {
  food: FoodState;
  order: OrderState;
  cart: CartState;
}

interface SelectOption {
  value: string;
  label: string;
}

// Helper function to safely parse localStorage items
const getLocalStorageItem = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error parsing localStorage item "${key}":`, e);
    return null;
  }
};

const FormElements = () => {
  const [selectedParty, setSelectedParty] = useState<SelectOption | null>(null);
  const [selectedFood, setSelectedFood] = useState<SelectOption | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [service, setService] = useState<number>(0);
  const [delivery, setDelivery] = useState<number>(0);
  const [remark, setRemark] = useState<string>(""); // State for remark
  const [loadedDraft, setLoadedDraft] = useState<boolean>(false); // New state to track if draft is loaded

  const { menus, foods, food } = useSelector((state: RootState) => state.food);
  const { parties, errorMessage, successMessage } = useSelector(
    (state: RootState) => state.order
  );
  const { cartItems, totalAmount, totalQuantity } = useSelector(
    (state: RootState) => state.cart
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(order_parties_get() as any);
    dispatch(menus_get() as any);
    dispatch(foods_get() as any);
  }, [dispatch]);

  const foodOptions: SelectOption[] = foods.map((food) => ({
    value: food._id,
    label: food.name,
  }));

  const partyOptions: SelectOption[] = parties.map((party) => ({
    value: party._id,
    label: party.name,
  }));

  const cardHandler = (food: Food) => {
    dispatch(
      cartActions.addItem({
        id: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        newQuantity: 1,
      })
    );
  };

  const quantityHandler = (item: CartItem, value: string) => {
    const newQty = parseInt(value) || 0;
    dispatch(
      cartActions.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        newQuantity: newQty,
      })
    );
  };

  const deleteItem = (id: string) => {
    dispatch(cartActions.deleteItem(id));
  };

  const finalAmount = totalAmount - discount + service + delivery;

  const preOrderHandler = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedParty) {
      toast.error("Please select a table/party");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Please add items to the cart");
      return;
    }

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
        remark, // Pass remark to the action
      }) as any
    );
    // These resets are now handled in the successMessage useEffect
    dispatch(cartActions.clearCart());
    setDiscount(0);
    setService(0);
    setDelivery(0);
    setRemark(""); // Reset remark after successful order
    setSelectedParty(null);
    setSelectedFood(null);
  };

  useEffect(() => {
    if (selectedFood) {
      dispatch(get_a_food(selectedFood.value) as any);
    }
  }, [selectedFood, dispatch]);

  useEffect(() => {
    if (food && selectedFood && food._id === selectedFood.value) {
      dispatch(
        cartActions.addItem({
          id: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          newQuantity: 1,
        })
      );
      setSelectedFood(null);
    }
  }, [food, dispatch, selectedFood]);

  // This useEffect handles loading draft data and should trigger AFTER parties are loaded
  useEffect(() => {
    // Only attempt to load if parties are available and not already loaded
    if (parties.length > 0 && !loadedDraft) {
      const draftDiscount = getLocalStorageItem("draftDiscount");
      const draftService = getLocalStorageItem("draftService");
      const draftDelivery = getLocalStorageItem("draftDelivery");
      const draftRemark = getLocalStorageItem("draftRemark");
      const draftPartyId = getLocalStorageItem("draftPartyId");
      const draftPartyLabel = getLocalStorageItem("draftPartyLabel");
      const draftCartItems = getLocalStorageItem("cartItems"); // Retrieve cartItems
      const draftTotalAmount = getLocalStorageItem("totalAmount"); // Retrieve totalAmount
      const draftTotalQuantity = getLocalStorageItem("totalQuantity"); // Retrieve totalQuantity

      let isDraftFound = false;

      if (draftDiscount !== null) {
        setDiscount(draftDiscount);
        localStorage.removeItem("draftDiscount");
        isDraftFound = true;
      }
      if (draftService !== null) {
        setService(draftService);
        localStorage.removeItem("draftService");
        isDraftFound = true;
      }
      if (draftDelivery !== null) {
        setDelivery(draftDelivery);
        localStorage.removeItem("draftDelivery");
        isDraftFound = true;
      }
      if (draftRemark !== null) {
        setRemark(draftRemark);
        localStorage.removeItem("draftRemark");
        isDraftFound = true;
      }

      // Important: Find the actual Party object from `parties` array
      // to ensure react-select gets a proper object reference.
      if (draftPartyId && draftPartyLabel) {
        const foundParty = parties.find((p) => p._id === draftPartyId);
        if (foundParty) {
          setSelectedParty({
            value: foundParty._id,
            label: foundParty.name,
          });
          localStorage.removeItem("draftPartyId");
          localStorage.removeItem("draftPartyLabel");
          isDraftFound = true;
        } else {
          console.warn(
            `Draft party with ID ${draftPartyId} not found in available parties.`
          );
        }
      }

      // If cart items were saved, explicitly set them in the Redux store
      if (draftCartItems && draftCartItems.length > 0) {
        dispatch(
          cartActions.setCartState({
            items: draftCartItems,
            totalAmount: draftTotalAmount,
            totalQuantity: draftTotalQuantity,
          })
        );
        localStorage.removeItem("cartItems");
        localStorage.removeItem("totalAmount");
        localStorage.removeItem("totalQuantity");
        isDraftFound = true;
      }

      // If any draft item was found and processed, set loadedDraft to true
      if (isDraftFound) {
        setLoadedDraft(true);
      }
    }
  }, [dispatch, parties, loadedDraft]); // Depend on 'parties' and 'loadedDraft'

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear()); // Reset selected food
      setLoadedDraft(false); // Reset loadedDraft state to allow new drafts to be loaded
      dispatch(get_pre_order() as any);
      window.location.reload(); // Re-fetch pre-orders to update the list
    }
  }, [successMessage, errorMessage, dispatch]);

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "#1F2937",
      borderColor: "rgb(75 85 99)",
      color: "rgb(243 244 246)",
      borderRadius: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 1px rgb(96 165 250)" : "none",
      "&:hover": {
        borderColor: "rgb(147 197 253)",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "rgb(243 244 246)",
    }),
    input: (base: any) => ({
      ...base,
      color: "rgb(243 244 246)",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "rgb(243 244 246)",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1F2937",
      borderColor: "rgb(75 85 99)",
      borderWidth: "1px",
      borderStyle: "solid",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      marginTop: "4px",
      borderRadius: "0.25rem",
    }),
    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      backgroundColor: isSelected
        ? "#3B82F6"
        : isFocused
          ? "#4B5563"
          : "#1F2937",
      color: isSelected ? "white" : "rgb(243 244 246)",
      "&:active": {
        backgroundColor: "#2563EB",
      },
      padding: "8px 12px",
    }),
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border p-3 border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between p-3">
              <h3 className="font-medium text-black dark:text-white">
                Order Items
              </h3>
              <div className="App mt-2 w-full max-w-xs">
                <Select
                  value={selectedParty}
                  onChange={setSelectedParty}
                  options={partyOptions}
                  placeholder="Bill to"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>
            </div>
            <ul className="flex flex-col pt-4 space-y-2">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <li key={item.id}>
                    <div className="flex items-start justify-between">
                      <h3 className="flex items-center justify-center dark:text-violet-600 gap-2">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-dark dark:text-violet-600"
                        >
                          <RiDeleteBin6Line />
                        </button>
                        {item.name}
                      </h3>
                      <div className="text-right">
                        <span className="block dark:text-violet-600">
                          Tk {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center justify-start">
                      <input
                        onChange={(e) => quantityHandler(item, e.target.value)}
                        value={item.quantity}
                        className="text-sm h-6 w-10 border-slate-700 outline-none border dark:text-violet-600 dark:bg-black p-1"
                        type="number"
                        name="quantity"
                        placeholder="Qty"
                        min="0"
                        required
                      />
                      x
                      <span className="text-sm dark:text-violet-600">
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No items in cart.
                </p>
              )}
            </ul>
            <div className="pt-4 space-y-2">
              <div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Tk {totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  <input
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    value={discount}
                    className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black p-1"
                    type="number"
                    name="discount"
                    placeholder="Discount"
                    min="0"
                  />
                </span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>
                  <input
                    onChange={(e) => setService(Number(e.target.value))}
                    value={service}
                    className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black p-1"
                    type="number"
                    name="service"
                    placeholder="Service"
                    min="0"
                  />
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>
                    <input
                      onChange={(e) => setDelivery(Number(e.target.value))}
                      value={delivery}
                      className="text-sm h-6 w-15 text-right border-slate-700 outline-none border dark:text-violet-600 dark:bg-black p-1"
                      type="number"
                      name="delivery"
                      placeholder="Delivery"
                      min="0"
                    />
                  </span>
                </div>
              </div>
              {/* Remark field is already here */}
              <div className="mt-4">
                <label className="block text-black dark:text-white mb-2">
                  Remark
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add any specific notes or remarks here..."
                  rows={3}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">
                    Tk {finalAmount.toFixed(2)}
                  </span>
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
          <div className="relative">
            <div className="hs-carousel flex space-x-2">
              <div className="flex-none">
                <div className="hs-carousel-pagination max-h-180 flex flex-col gap-y-2 overflow-y-auto">
                  {menus.length > 0 ? (
                    menus.map((menu) => (
                      <div
                        key={menu._id}
                        className="hs-carousel-pagination-item shrink-0 border border-black-2 dark:border-white rounded-md overflow-hidden cursor-pointer w-[150px] h-[150px] hs-carousel-active:border-blue-400"
                        onClick={() => dispatch(menu_foods(menu._id) as any)}
                      >
                        <div className="flex justify-center items-center h-full bg-gray-100 p-2 dark:bg-neutral-900">
                          <button
                            type="button"
                            className="self-center text-xs text-gray-800 transition duration-700 dark:text-white"
                          >
                            {menu.name}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No menus available.
                    </p>
                  )}
                </div>
              </div>
              <div className="relative grow overflow-hidden min-h-96 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium flex items-center justify-center text-black dark:text-white pt-2">
                  Select Item
                </h3>
                <div className="App mt-2 p-2">
                  <Select
                    value={selectedFood}
                    onChange={setSelectedFood}
                    options={foodOptions}
                    placeholder="Search Food"
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>
                <div className="mt-3 hs-carousel-pagination max-h-150 flex flex-col gap-y-2 overflow-y-auto p-2">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-4">
                      {foods.length > 0 ? (
                        foods.map((foodItem) => (
                          <div
                            key={foodItem._id}
                            className="border group transition-all bg-slate-200 dark:bg-slate-700 duration-500 hover:shadow-md hover:-mt-3 rounded-md"
                          >
                            <button
                              className="w-full h-full text-left p-2"
                              onClick={() => cardHandler(foodItem)}
                            >
                              <div className="relative overflow-hidden"></div>
                              <div className="text-slate-800 py-1 dark:text-slate-100 px-1">
                                <h2 className="text-sm font-medium">
                                  {foodItem.name}
                                </h2>
                                <div className="flex justify-center items-center gap-1">
                                  <span className="text-lg font-bold">
                                    Tk.{Number(foodItem.price).toFixed(2)}
                                  </span>
                                  <div className="flex"></div>
                                </div>
                              </div>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-4 text-center text-gray-500 dark:text-gray-400">
                          Select a menu or no foods available.
                        </p>
                      )}
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
