import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const category_add = createAsyncThunk(
  "category/category-add",
  async (
    { name, occupancy, rackRate, discountRate, status, description },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/category-add",
        { name, occupancy, rackRate, discountRate, status, description },
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

export const category_update = createAsyncThunk(
  "category/category-update",
  async (
    {
      name,
      occupancy,
      rackRate,
      discountRate,
      status,
      description,
      categoryId,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/category-update",
        {
          name,
          occupancy,
          rackRate,
          discountRate,
          status,
          description,
          categoryId,
        },
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

export const categories_get = createAsyncThunk(
  "category/categories-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/categories-get", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_category = createAsyncThunk(
  "category/get_category",
  async (categoryId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/category-get/${categoryId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const room_add = createAsyncThunk(
  "room/room-add",
  async (
    { name, status, description, categoryId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/room-add",
        { name, status, description, categoryId },
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

export const room_update = createAsyncThunk(
  "room/room-update",
  async (
    { name, status, description, categoryId, roomId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/room-update",
        { name, status, description, categoryId, roomId },
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

export const rooms_get = createAsyncThunk(
  "room/rooms-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/rooms-get", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_room = createAsyncThunk(
  "room/get_room",
  async (roomId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/room-get/${roomId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_payment_rooms = createAsyncThunk(
  "room/get_payment_rooms",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/payment-rooms-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_purchase_rooms = createAsyncThunk(
  "room/get_purchase_rooms",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/purchase-rooms-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_draft_room = createAsyncThunk(
  "room/get_draft_room",
  async (roomId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/room-get/${roomId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const account_type_rooms = createAsyncThunk(
  "room/account_type_rooms",
  async (type, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/account-type-rooms?accountType=${type}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
