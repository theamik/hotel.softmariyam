import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const menu_add = createAsyncThunk(
  "menu/menu-add",
  async (
    { name, status, description },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/menu-add",
        { name, status, description },
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

export const menu_update = createAsyncThunk(
  "menu/menu-update",
  async (
    { name, status, description, menuId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/menu-update",
        {
          name,
          status,
          description,
          menuId,
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

export const menus_get = createAsyncThunk(
  "menu/menus-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/menus-get", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_menu = createAsyncThunk(
  "menu/get_menu",
  async (menuId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/menu-get/${menuId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const food_add = createAsyncThunk(
  "food/food-add",
  async (
    { name, status, price, duration, description, menuId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/food-add",
        { name, status, price, duration, description, menuId },
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

export const food_update = createAsyncThunk(
  "food/food-update",
  async (
    { name, status, price, duration, description, menuId, foodId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/food-update",
        { name, status, price, duration, description, menuId, foodId },
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

export const foods_get = createAsyncThunk(
  "food/foods-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/foods-get", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const menu_foods = createAsyncThunk(
  "food/menu-foods",
  async (menuId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/menu-foods/${menuId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_food = createAsyncThunk(
  "food/get_food",
  async (foodId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/food-get/${foodId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_payment_foods = createAsyncThunk(
  "food/get_payment_foods",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/payment-foods-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_purchase_foods = createAsyncThunk(
  "food/get_purchase_foods",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/purchase-foods-get`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_draft_food = createAsyncThunk(
  "food/get_draft_food",
  async (foodId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/food-get/${foodId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const account_type_foods = createAsyncThunk(
  "food/account_type_foods",
  async (type, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/account-type-foods?accountType=${type}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const table_add = createAsyncThunk(
  "table/table-add",
  async (
    { name, status, position, occupancy, description },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/table-add",
        { name, status, position, occupancy, description },
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

export const table_update = createAsyncThunk(
  "table/table-update",
  async (
    { name, status, position, occupancy, description, tableId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/table-update",
        { name, status, position, occupancy, description, tableId },
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

export const tables_get = createAsyncThunk(
  "table/tables-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/tables-get", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_table = createAsyncThunk(
  "table/get_table",
  async (tableId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/table-get/${tableId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const guest_add = createAsyncThunk(
  "guest/guest-add",
  async (
    { name, address, mobile, description, date, status },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/guest-add",
        { name, address, mobile, description, date, status },
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

export const guest_update = createAsyncThunk(
  "guest/guest-update",
  async (
    { name, address, mobile, description, date, status, guestId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/guest-update",
        { name, address, mobile, description, date, status, guestId },
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

export const guests_get = createAsyncThunk(
  "guest/guests-get",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/guests-get", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const get_a_guest = createAsyncThunk(
  "guest/get_guest",
  async (guestId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/guest-get/${guestId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
