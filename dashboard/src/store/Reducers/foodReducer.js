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
  totalGuest: 0,
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
        state.successMessage = action.payload.message;
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
        state.table = "";
        state.tables = action.payload.tables;
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
      });
  },
});

export const { messageClear } = foodSlice.actions;
export default foodSlice.reducer;
