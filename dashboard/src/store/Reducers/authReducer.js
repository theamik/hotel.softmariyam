import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import {
  owner_login,
  owner_register,
  get_user_info,
  forget_password,
  reset_password,
  change_password,
  get_all_users,
  owner_update,
  a_user,
  organization_register,
  get_organizations,
  get_a_organization,
  organization_update,
  user_update,
  get_pending_users,
} from "../Actions/authAction";

const returnRole = (token) => {
  if (token) {
    const decodeToken = jwtDecode(token);
    const expireTime = new Date(decodeToken.exp + 3 * 24 * 60 * 60 * 1000);
    if (new Date() > expireTime) {
      localStorage.removeItem("accessToken");
      return "";
    } else {
      return decodeToken.role;
    }
  } else {
    return "";
  }
};

const initialState = {
  successMessage: "",
  errorMessage: "",
  loader: false,
  users: [],
  user: "",
  userInfo: "",
  role: "",
  organizations: [],
  organization: "",
  totalOrganizations: 0,
  token: localStorage.getItem("accessToken"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    messageClear: (state, _) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(owner_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(owner_login.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.token = action.payload.token;
        state.role = returnRole(action.payload.token);
      })
      .addCase(owner_login.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(owner_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(owner_register.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.token = action.payload.token;
        state.role = returnRole(action.payload.token);
      })
      .addCase(owner_register.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(owner_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(owner_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
        state.token = action.payload.token;
        state.role = returnRole(action.payload.token);
      })
      .addCase(owner_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_all_users.fulfilled, (state, action) => {
        state.loader = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
      })
      .addCase(get_pending_users.fulfilled, (state, action) => {
        state.loader = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
      })
      .addCase(get_user_info.fulfilled, (state, action) => {
        state.loader = false;
        state.userInfo = action.payload.userInfo;
        state.role = action.payload.userInfo.role;
      })
      .addCase(a_user.fulfilled, (state, action) => {
        state.loader = false;
        state.user = action.payload.user;
      })
      .addCase(forget_password.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forget_password.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(forget_password.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(reset_password.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(reset_password.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(change_password.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(change_password.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(organization_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(organization_register.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(organization_register.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(get_organizations.fulfilled, (state, action) => {
        state.loader = false;
        state.organizations = action.payload.companies;
        state.totalOrganizations = action.payload.totalCompany;
      })
      .addCase(get_a_organization.fulfilled, (state, action) => {
        state.loader = false;
        state.organization = action.payload.company;
      })
      .addCase(organization_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(organization_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(organization_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      })
      .addCase(user_update.pending, (state) => {
        state.loader = true;
      })
      .addCase(user_update.fulfilled, (state, action) => {
        state.loader = false;
        state.successMessage = action.payload.message;
      })
      .addCase(user_update.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload.error;
      });
  },
});

export const { messageClear } = authSlice.actions;
export default authSlice.reducer;
