import { createSlice } from "@reduxjs/toolkit";
import {
  account_type_rooms,
  get_a_room,
  get_draft_room,
  get_payment_rooms,
  get_purchase_rooms,
  rooms_get,
  room_add,
  room_update,
  category_add,
  category_update,
  get_a_category,
  categories_get,
} from "../Actions/roomAction";

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  rooms: [],
  room: "",
  categories: [],
  category: "",
  totalRoom: 0,
  totalCategory: 0,
};

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    messageClear: (state, _) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(category_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(category_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.categories = action.payload.categories;
      })
      .addCase(category_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(category_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(category_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.category = "";
        state.categories = action.payload.categories;
      })
      .addCase(category_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(categories_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.categories = action.payload.categories;
        state.totalCategory = action.payload.totalCategory;
      })
      .addCase(get_a_category.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(get_a_category.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.category = action.payload.category;
      })
      .addCase(get_a_category.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(room_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(room_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(room_add.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(room_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(room_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.room = "";
        state.rooms = action.payload.rooms;
      })
      .addCase(room_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(rooms_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.rooms = action.payload.rooms;
        state.totalRoom = action.payload.totalRoom;
      })
      .addCase(get_a_room.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_room.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.room = action.payload.room;
      })
      .addCase(get_a_room.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_payment_rooms.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.rooms = action.payload.rooms;
      })
      .addCase(get_payment_rooms.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_purchase_rooms.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.rooms = action.payload.rooms;
      })
      .addCase(get_purchase_rooms.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_draft_room.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.rooms = action.payload.rooms;
      })
      .addCase(get_draft_room.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(account_type_rooms.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.rooms = action.payload.rooms;
      })
      .addCase(account_type_rooms.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      });
  },
});

export const { messageClear } = roomSlice.actions;
export default roomSlice.reducer;
