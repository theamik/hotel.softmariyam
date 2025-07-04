import { createSlice } from "@reduxjs/toolkit";
import {
  account_type_foods,
  get_a_food,
  get_draft_food,
  get_payment_foods,
  get_purchase_foods,
  foods_get,
  food_add,
  food_update,
  menu_add,
  menu_update,
  get_a_menu,
  menus_get,
  table_add,
  table_update,
  tables_get,
  get_a_table,
  guest_add,
  guest_update,
  guests_get,
  get_a_guest,
  menu_foods,
  hotel_guests_get,
  new_reservation,
  get_a_reservation,
  reservations_get,
  update_reservation_status,
  update_reservation,
  get_reservations_by_date_status,
  get_reservations_by_date_status_stay_view,
  cancel_reservations_get,
  will_check_reservations_get,
  check_out_reservations_get,
  available_guests_get,
  confirmed_guests_get,
  finished_guests_get,
  cancelled_guests_get,
  checked_in_reservations_get,
} from "../Actions/foodAction";

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  foods: [],
  food: "",
  menus: [],
  menu: "",
  tables: [],
  table: "",
  totalFood: 0,
  guests: [],
  guest: "",
  totalGuests: 0,
};

export const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
    messageClear: (state, _) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(menu_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(menu_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.menus = action.payload.menus;
      })
      .addCase(menu_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(menu_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(menu_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.menu = "";
        state.menus = action.payload.menus;
      })
      .addCase(menu_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(menus_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.menus = action.payload.menus;
      })
      .addCase(get_a_menu.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(get_a_menu.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.menu = action.payload.menu;
      })
      .addCase(get_a_menu.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(food_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(food_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(food_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(food_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(food_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.food = "";
        state.foods = action.payload.foods;
      })
      .addCase(food_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(foods_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(menu_foods.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(get_a_food.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_food.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.food = action.payload.food;
      })
      .addCase(get_a_food.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_payment_foods.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(get_payment_foods.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_purchase_foods.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(get_purchase_foods.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_draft_food.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(get_draft_food.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(account_type_foods.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.foods = action.payload.foods;
      })
      .addCase(account_type_foods.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(guest_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(guest_add.fulfilled, (state, action) => {
        state.loader = false;
        state.guest = action.payload.guest;
      })
      .addCase(guest_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(guest_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(guest_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guest = "";
      })
      .addCase(guest_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
      })
      .addCase(hotel_guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
        state.totalGuests = action.payload.totalGuests;
      })
      .addCase(available_guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
        state.totalGuests = action.payload.totalGuests;
      })
      .addCase(confirmed_guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
        state.totalGuests = action.payload.totalGuests;
      })
      .addCase(finished_guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
        state.totalGuests = action.payload.totalGuests;
      })
      .addCase(cancelled_guests_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guests = action.payload.guests;
        state.totalGuests = action.payload.totalGuests;
      })
      .addCase(get_a_guest.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_guest.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.guest = action.payload.guest;
      })
      .addCase(get_a_guest.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(table_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(table_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(table_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(table_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(table_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(table_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(tables_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.tables = action.payload.tables;
      })
      .addCase(get_a_table.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_table.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.table = action.payload.table;
      })
      .addCase(get_a_table.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(new_reservation.pending, (state) => {
        state.loader = true;
      })
      .addCase(new_reservation.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservation = action.payload.reservation;
      })
      .addCase(new_reservation.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
        state.errorMessage = action.payload.message;
      })
      .addCase(reservations_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservations = action.payload.reservations;
        state.totalReservations = action.payload.totalReservations;
      })
      .addCase(cancel_reservations_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservations = action.payload.reservations;
        state.totalReservations = action.payload.totalReservations;
      })
      .addCase(will_check_reservations_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservations = action.payload.reservations;
        state.totalReservations = action.payload.totalReservations;
      })
      .addCase(checked_in_reservations_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservations = action.payload.reservations;
        state.totalReservations = action.payload.totalReservations;
      })
      .addCase(check_out_reservations_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservations = action.payload.reservations;
        state.totalReservations = action.payload.totalReservations;
      })

      .addCase(get_a_reservation.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_reservation.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservation = action.payload.reservation;
      })
      .addCase(get_a_reservation.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(update_reservation_status.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(update_reservation_status.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.message;
      })
      .addCase(update_reservation.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_reservation.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.reservation = action.payload.reservation;
      })
      .addCase(update_reservation.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
        state.errorMessage = action.payload.message;
      })
      .addCase(get_reservations_by_date_status.pending, (state) => {
        state.loadingReservations = true;
        state.reservationsError = null;
      })
      .addCase(get_reservations_by_date_status.fulfilled, (state, action) => {
        state.loadingReservations = false;
        state.reservations = action.payload.reservations;
      })
      .addCase(get_reservations_by_date_status.rejected, (state, action) => {
        state.loadingReservations = false;
        state.reservationsError = action.payload;
      })
      .addCase(get_reservations_by_date_status_stay_view.pending, (state) => {
        state.loadingReservations = true;
        state.reservationsError = null;
      })
      .addCase(
        get_reservations_by_date_status_stay_view.fulfilled,
        (state, action) => {
          state.loadingReservations = false;
          state.reservations = action.payload.reservations;
        }
      )
      .addCase(
        get_reservations_by_date_status_stay_view.rejected,
        (state, action) => {
          state.loadingReservations = false;
          state.reservationsError = action.payload;
        }
      );
  },
});

export const { messageClear } = foodSlice.actions;
export default foodSlice.reducer;
