import { createSlice } from "@reduxjs/toolkit";
import {
  account_type_parties,
  cancel_order,
  cancel_program,
  get_a_order,
  get_a_pre_order,
  get_a_program,
  get_draft_party,
  get_orders,
  get_pre_order,
  get_programs,
  get_purchase_parties,
  new_program,
  order_parties_get,
  party_update,
  place_order,
  pre_order,
  remove_pre_order,
  update_order_status,
  update_program,
} from "../Actions/orderAction";

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  parties: [],
  party: "",
  preOrders: [],
  preOrder: "",
  orders: [],
  order: "",
  programs: [],
  program: "",
  totalParty: 0,
  totalOrders: 0,
  totalPrograms: 0,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    messageClear: (state, _) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(order_parties_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(pre_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(pre_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.preOrder = action.payload.draft;
      })
      .addCase(pre_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_pre_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.preOrders = action.payload.drafts;
      })
      .addCase(get_pre_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_a_pre_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_pre_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.preOrder = action.payload.draft;
      })
      .addCase(get_a_pre_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(remove_pre_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(remove_pre_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(place_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(place_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.order = action.payload.order;
      })
      .addCase(place_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_orders.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders;
      })
      .addCase(get_orders.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_a_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.order = action.payload.order;
      })
      .addCase(get_a_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(update_order_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_order_status.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(update_order_status.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
        state.errorMessage = action.payload.message;
      })
      .addCase(cancel_order.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(cancel_order.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(new_program.pending, (state) => {
        state.loader = true;
      })
      .addCase(new_program.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.program = action.payload.program;
      })
      .addCase(new_program.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
        state.errorMessage = action.payload.message;
      })
      .addCase(get_programs.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.programs = action.payload.programs;
        state.totalPrograms = action.payload.totalPrograms;
      })
      .addCase(get_programs.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_a_program.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_a_program.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.program = action.payload.program;
      })
      .addCase(get_a_program.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(update_program.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_program.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.program = action.payload.program;
      })
      .addCase(update_program.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(cancel_program.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(cancel_program.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(party_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(party_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.party = "";
        state.parties = action.payload.parties;
      })
      .addCase(party_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_purchase_parties.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(get_purchase_parties.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_draft_party.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(get_draft_party.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(account_type_parties.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(account_type_parties.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      });
  },
});

export const { messageClear } = orderSlice.actions;
export default orderSlice.reducer;
