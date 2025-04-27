import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const party_add = createAsyncThunk(
  "party/party-add",
  async (
    { name, address, mobile, description, accountType, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/party-add",
        { name, address, mobile, description, accountType, under },
        {
          withCredentials: true,
        }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const party_update = createAsyncThunk(
  "party/party-update",
  async (
    { name, address, mobile, description, accountType, under, partyId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/party-update",
        { name, address, mobile, description, accountType, under, partyId },
        {
          withCredentials: true,
        }
      );
      localStorage.setItem("accessToken", data.token);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const parties_get = createAsyncThunk(
  "party/parties-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/parties-get", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_party = createAsyncThunk(
  "party/get_party",
  async (partyId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/party-get/${partyId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_payment_parties = createAsyncThunk(
  "party/get_payment_parties",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/payment-parties-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_purchase_parties = createAsyncThunk(
  "party/get_purchase_parties",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/purchase-parties-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_draft_party = createAsyncThunk(
  "party/get_draft_party",
  async (partyId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/party-get/${partyId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const account_type_parties = createAsyncThunk(
  "party/account_type_parties",
  async (type, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/account-type-parties?accountType=${type}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
