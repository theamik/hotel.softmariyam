import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const owner_login = createAsyncThunk(
  "auth/owner-login",
  async ({ email, password }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/owner-login",
        { email, password },
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

export const owner_register = createAsyncThunk(
  "auth/owner-register",
  async ({ name, email, password }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post(
        "/owner-register",
        { name, email, password },
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
export const owner_update = createAsyncThunk(
  "auth/owner-update",
  async (
    { email, name, password, mobile, position, role, status, userId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/owner-update",
        { email, name, password, mobile, position, role, status, userId },
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

export const get_user_info = createAsyncThunk(
  "auth/get-user-info",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/get-user", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const a_user = createAsyncThunk(
  "auth/a_user",
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/get-a-user/${userId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const user_update = createAsyncThunk(
  "auth/user-update",
  async (
    { mobile, companyId, role, status, userId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/user-update",
        { mobile, companyId, role, status, userId },
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

export const get_pending_users = createAsyncThunk(
  "auth/get-pending-user",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/pending-users", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const get_all_users = createAsyncThunk(
  "auth/get-all-user",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/all-users", { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const logout = createAsyncThunk(
  "auth/logout",
  async ({ navigate, role }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/logout", { withCredentials: true });
      localStorage.removeItem("accessToken");
      if (role === "owner") {
        navigate("/auth/signin");
      } else {
        navigate("/auth/signin");
      }

      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forget_password = createAsyncThunk(
  "auth/forget_password",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/forget-password", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const reset_password = createAsyncThunk(
  "auth/reset_password",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("/reset-password", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const change_password = createAsyncThunk(
  "auth/change_password",
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.put("/change-password", info, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const organization_register = createAsyncThunk(
  "super/organization-register",
  async (
    { name, email, address, mobile, description, status, image },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.post("/company-add", {
        name,
        email,
        address,
        mobile,
        description,
        status,
        image,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const get_organizations = createAsyncThunk(
  "super/get-organizations",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("/companies-get", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const get_a_organization = createAsyncThunk(
  "super/get_a_organization",
  async (companyId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/a-company-get/${companyId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const organization_update = createAsyncThunk(
  "super/organization-update",
  async (
    { name, email, address, mobile, description, status, image, companyId },
    { rejectWithValue, fulfillWithValue }
  ) => {
    try {
      const { data } = await api.put(
        "/company-update",
        { name, email, address, mobile, description, status, image, companyId },
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
