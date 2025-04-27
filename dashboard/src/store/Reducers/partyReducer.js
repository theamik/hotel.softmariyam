import { createSlice } from "@reduxjs/toolkit";
import {
  account_type_parties,
  get_a_party,
  get_draft_party,
  get_payment_parties,
  get_purchase_parties,
  parties_get,
  party_add,
  party_update,
} from "../Actions/partyAction";

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  parties: [],
  party: "",
  totalParty: 0,
};

export const partySlice = createSlice({
  name: "party",
  initialState,
  reducers: {
    messageClear: (state, _) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(party_add.pending, (state) => {
        state.loader = true;
      })
      .addCase(party_add.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(party_add.rejected, (state, action) => {
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
      .addCase(parties_get.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(get_a_party.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(get_a_party.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.party = action.payload.party;
      })
      .addCase(get_a_party.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_payment_parties.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.parties = action.payload.parties;
      })
      .addCase(get_payment_parties.rejected, (state, action) => {
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

export const { messageClear } = partySlice.actions;
export default partySlice.reducer;
