import authSlice from "./Reducers/authReducer";
import cartReducer from "./Reducers/cartReducer";
import foodSlice from "./Reducers/foodReducer";
import partySlice from "./Reducers/partyReducer";
import roomSlice from "./Reducers/roomReducer";
import orderSlice from "./Reducers/orderReducer";

const rootReducers = {
  auth: authSlice,
  party: partySlice,
  room: roomSlice,
  food: foodSlice,
  cart: cartReducer,
  order: orderSlice,
};

export default rootReducers;
