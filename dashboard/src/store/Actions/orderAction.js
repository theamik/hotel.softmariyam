import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const order_parties_get = createAsyncThunk(
  "order/parties-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/order/get-parties", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const pre_order = createAsyncThunk(
  "order/pre_order",
  async (
    {
      cartItems,
      totalAmount,
      totalQuantity,
      discount,
      finalAmount,
      party,
      partyId,
      delivery,
      service,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/order/make-draft",
        {
          cartItems,
          totalAmount,
          totalQuantity,
          discount,
          finalAmount,
          party,
          partyId,
          delivery,
          service,
        },
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

export const get_pre_order = createAsyncThunk(
  "order/get_pre_order",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-company-drafts`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const get_a_pre_order = createAsyncThunk(
  "order/get_a_pre_order",
  async (preOrderId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-draft/${preOrderId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const remove_pre_order = createAsyncThunk(
  "order/remove_pre_order",
  async ({ preOrderId, partyId }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(
        `/order/remove-draft/${preOrderId}/${partyId}`,
        {
          withCredentials: true,
        }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const place_order = createAsyncThunk(
  "order/place_order",
  async (
    {
      cartItems,
      totalAmount,
      totalQuantity,
      discount,
      finalAmount,
      party,
      partyId,
      delivery,
      service,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/order/place-order",
        {
          cartItems,
          totalAmount,
          totalQuantity,
          discount,
          finalAmount,
          party,
          partyId,
          delivery,
          service,
        },
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

export const get_orders = createAsyncThunk(
  "order/get_orders",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-company-orders`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_order = createAsyncThunk(
  "order/get_a_order",
  async (orderId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-company-order/${orderId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancel_order = createAsyncThunk(
  "order/cancel_order",
  async (orderId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`/order/cancel-order/${orderId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const new_program = createAsyncThunk(
  "order/new_program",
  async (
    {
      foodItems,
      totalAmount,
      remark,
      discount,
      finalAmount,
      hallCharge,
      decoration,
      service,
      guestId,
      totalGuest,
      due,
      paid,
      programDate,
      hall,
      programType,
      perHead,
      reference,
      season,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/order/new-program",
        {
          foodItems,
          totalAmount,
          remark,
          discount,
          finalAmount,
          hallCharge,
          decoration,
          service,
          guestId,
          totalGuest,
          due,
          paid,
          programDate,
          hall,
          programType,
          perHead,
          reference,
          season,
        },
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

export const get_programs = createAsyncThunk(
  "order/get_programs",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/all-programs`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_program = createAsyncThunk(
  "order/get_a_program",
  async (programId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-a-program/${programId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const update_program = createAsyncThunk(
  "order/update_program",
  async (
    {
      foodItems,
      totalAmount,
      remark,
      discount,
      finalAmount,
      hallCharge,
      decoration,
      service,
      guestId,
      totalGuest,
      due,
      paid,
      programDate,
      hall,
      programType,
      perHead,
      reference,
      season,
      programId,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/order/update-program",
        {
          foodItems,
          totalAmount,
          remark,
          discount,
          finalAmount,
          hallCharge,
          decoration,
          service,
          guestId,
          totalGuest,
          due,
          paid,
          programDate,
          hall,
          programType,
          perHead,
          reference,
          season,
          programId,
        },
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

export const cancel_program = createAsyncThunk(
  "order/cancel_program",
  async (programId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`/order/cancel-program/${programId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
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
