import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import moment from "moment"; // Import moment.js for date formatting

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
    { name, address, mobile, description, date, status, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/guest-add",
        { name, address, mobile, description, date, status, under },
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

export const hotel_guests_get = createAsyncThunk(
  "hotel/guests-get",
  async (
    { page, perPage, searchQuery, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/hotel-guests-get?under=${under}&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// New async thunks for specific guest statuses - YOU MUST ADD THESE
export const available_guests_get = createAsyncThunk(
  "hotel/available-guests-get",
  async (
    { page, perPage, searchQuery, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/hotel-guests-get?status=available&under=${under}&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const confirmed_guests_get = createAsyncThunk(
  "hotel/confirmed-guests-get",
  async (
    { page, perPage, searchQuery, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/hotel-guests-get?status=confirmed&under=${under}&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const finished_guests_get = createAsyncThunk(
  "hotel/finished-guests-get",
  async (
    { page, perPage, searchQuery, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/hotel-guests-get?status=finished&under=${under}&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelled_guests_get = createAsyncThunk(
  "hotel/cancelled-guests-get",
  async (
    { page, perPage, searchQuery, under },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/hotel-guests-get?status=cancelled&under=${under}&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const get_a_guest = createAsyncThunk(
  "guest/get_guest",
  async (guestId, { rejectWithValue, fulfillWithValue }) => {
    console.log(guestId);
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

export const new_reservation = createAsyncThunk(
  "hotel/new_reservation",
  async (
    {
      startDate,
      endDate,
      roomDetails,
      totalGuest,
      guestId,
      totalAmount,
      source,
      others,
      restaurants,
      due,
      discount,
      paidInfo,
      finalAmount,
      status,
      remark,
      billTransfer,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/order/new-reservation",
        {
          startDate,
          endDate,
          roomDetails,
          totalGuest,
          guestId,
          totalAmount,
          source,
          others,
          restaurants,
          due,
          discount,
          paidInfo,
          finalAmount,
          status,
          remark,
          billTransfer,
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

export const reservations_get = createAsyncThunk(
  "hotel/reservations-get",
  async (
    { page, perPage, searchQuery },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/order/reservations-get?page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
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

export const cancel_reservations_get = createAsyncThunk(
  "hotel/cancel-reservations-get",
  async (
    { page, perPage, searchQuery },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/order/reservations-get?status=cancel&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
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

export const will_check_reservations_get = createAsyncThunk(
  "hotel/will-check-reservations-get",
  async (
    { page, perPage, searchQuery },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/order/reservations-get?status=will_check&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
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

export const checked_in_reservations_get = createAsyncThunk(
  "hotel/checked-in-reservations-get",
  async (
    { page, perPage, searchQuery },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/order/reservations-get?status=checked_in&page=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
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

export const check_out_reservations_get = createAsyncThunk(
  "hotel/check-out-reservations-get",
  async (
    { page, perPage, searchQuery },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/order/reservations-get?status=checked_out&=${page}&perPage=${perPage}&searchQuery=${searchQuery}`,
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

export const get_a_reservation = createAsyncThunk(
  "hotel/get-a-reservation",
  async (reservationId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/order/get-a-reservation/${reservationId}`,
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

export const update_reservation_status = createAsyncThunk(
  "hotel/update-reservation-status",
  async (
    { reservationId, newStatusValue },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const body = JSON.stringify({ status: newStatusValue });
      const { data } = await api.put(
        `/order/update-reservation-status/${reservationId}`,
        body,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json", // ✅ Important for Express to parse body
          },
        }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const update_reservation = createAsyncThunk(
  "hotel/update_reservation",
  async (
    {
      startDate,
      endDate,
      roomDetails,
      totalGuest,
      guestId,
      totalAmount,
      source,
      others,
      restaurants,
      due,
      discount,
      paidInfo,
      finalAmount,
      status,
      remark,
      billTransfer,
      reservationId,
    },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/order/update-reservation",
        {
          startDate,
          endDate,
          roomDetails,
          totalGuest,
          guestId,
          totalAmount,
          source,
          others,
          restaurants,
          due,
          discount,
          paidInfo,
          finalAmount,
          status,
          remark,
          billTransfer,
          reservationId,
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

export const get_reservations_by_date_status = createAsyncThunk(
  "hotel/get-reservation-by-date-status",
  async (selectedDate, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(
        `/order/reservations-by-date-status?date=${selectedDate}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const get_reservations_by_date_status_stay_view = createAsyncThunk(
  "hotel/get-reservation-by-date-status-stay-view",
  // Change here: accept an object with startDate and numberOfDays
  async (
    { startDate, numberOfDays },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const formattedStartDate = moment(startDate).format("YYYY-MM-DD");

      // Modify API call to send start date and number of days
      const { data } = await api.get(
        `/order/reservations-by-date-status-stay-view?startDate=${formattedStartDate}&numberOfDays=${numberOfDays}`,
        { withCredentials: true }
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
