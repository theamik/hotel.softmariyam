import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import ProtectedRoute from "./routing/ProtectedRoute";

import Loader from "./common/Loader";
import PageTitle from "./components/PageTitle";
import SignIn from "./pages/Authentication/SignIn";
import SignUp from "./pages/Authentication/SignUp";
import Calendar from "./pages/Hotel/Calendar";
import Chart from "./pages/Chart";
import HotelReport from "./pages/Hotel/HotelReport";
import HotelInvoice from "./pages/Hotel/HotelInvoice";
import RestaurantInvoice from "./pages/Restaurant/RestaurantInvoice";
import ECommerce from "./pages/Dashboard/ECommerce";
import FormElements from "./pages/Form/FormElements";
import Transactions from "./pages/Admin/Transaction";
import RestaurantBill from "./pages/Restaurant/Bill";
import FormLayout from "./pages/Form/FormLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Tables from "./pages/Hotel/Tables";
import Group from "./pages/Hotel/Group";
import Guest from "./pages/Hotel/Guest";
import RestGuest from "./pages/Restaurant/RestGuest";
import TableNo from "./pages/Restaurant/TableNo";
import Room from "./pages/Admin/Room";
import Category from "./pages/Admin/Category";
import Account from "./pages/Admin/Account";
import Menu from "./pages/Admin/Menu";
import Item from "./pages/Admin/Item";
import User from "./pages/Admin/User";
import Company from "./pages/Hotel/Company";
import Order from "./pages/Restaurant/Order";
import Banquet from "./pages/Restaurant/Banquet";
import Alerts from "./pages/UiElements/Alerts";
import Buttons from "./pages/UiElements/Buttons";
import DefaultLayout from "./layout/DefaultLayout";
import Statement from "./pages/Report/Statement";
import Ledger from "./pages/Report/Ledger";
import Activities from "./pages/Report/Activities";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get_user_info } from "./store/Actions/authAction";
import Program from "./pages/Restaurant/Program";
import Client from "./pages/Super/Client";
import Organization from "./pages/Super/Organization";
import Reservation from "./pages/Hotel/Reservation";
import HotelInvoiceReady from "./pages/Hotel/HotelInvoiceReady";
import EditReservation from "./pages/Hotel/EditReservation";
import StayView from "./pages/Hotel/StayView";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state?.auth);
  useEffect(() => {
    if (token !== "undefined") {
      dispatch(get_user_info());
    }
  }, [token]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Router>
      <DefaultLayout>
        <Routes>
          <Route path="/auth/signup" element={<SignUp />} />
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | Soft Mariyam" />
                <SignIn />
              </>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/user-profile" element={<Profile />} />
            <Route
              index
              element={
                <>
                  <PageTitle title="Overview | Soft Mariyam" />
                  <HotelReport />
                </>
              }
            />
            <Route
              path="/hotel/dashboard"
              element={
                <>
                  <PageTitle title="Hotel Dashboard | Soft Mariyam" />
                  <ECommerce />
                </>
              }
            />
            <Route
              path="/hotel/stay-view"
              element={
                <>
                  <PageTitle title="Stay-view | Soft Mariyam" />
                  <StayView />
                </>
              }
            />
            <Route
              path="/hotel/room-view"
              element={
                <>
                  <PageTitle title="Room-view | Soft Mariyam" />
                  <Calendar />
                </>
              }
            />
            <Route
              path="/hotel/reservation"
              element={
                <>
                  <PageTitle title="Reservation | Soft Mariyam" />
                  <Tables />
                </>
              }
            />
            <Route
              path="/hotel/new-reservation"
              element={
                <>
                  <PageTitle title="New Reservation | Soft Mariyam" />
                  <Reservation />
                </>
              }
            />
            <Route
              path="/hotel/invoice"
              element={
                <>
                  <PageTitle title="Hotel Invoice | Soft Mariyam" />
                  <HotelInvoiceReady />
                </>
              }
            />
            <Route
              path="/hotel/reservation/edit"
              element={
                <>
                  <PageTitle title="Hotel Reservation Edit | Soft Mariyam" />
                  <EditReservation />
                </>
              }
            />
            <Route
              path="/hotel/group"
              element={
                <>
                  <PageTitle title="Group | Soft Mariyam" />
                  <Group />
                </>
              }
            />
            <Route
              path="/hotel/guest"
              element={
                <>
                  <PageTitle title="Guest | Soft Mariyam" />
                  <Guest />
                </>
              }
            />
            <Route
              path="/hotel/company"
              element={
                <>
                  <PageTitle title="Company | Soft Mariyam" />
                  <Company />
                </>
              }
            />
            <Route
              path="/hotel/report"
              element={
                <>
                  <PageTitle title="Hotel Report | Soft Mariyam" />
                  <HotelReport />
                </>
              }
            />
            <Route
              path="/hotel/invoice"
              element={
                <>
                  <PageTitle title="Hotel Invoice | Soft Mariyam" />
                  <HotelInvoice />
                </>
              }
            />
            <Route
              path="/restaurant/Dashboard"
              element={
                <>
                  <PageTitle title="Restaurant Dashboard | Soft Mariyam" />
                  <ECommerce />
                </>
              }
            />
            <Route
              path="/restaurant/bill"
              element={
                <>
                  <PageTitle title="Restaurant Bill | Soft Mariyam" />
                  <RestaurantBill />
                </>
              }
            />
            <Route
              path="/restaurant/order"
              element={
                <>
                  <PageTitle title="Restaurant Order | Soft Mariyam" />
                  <Order />
                </>
              }
            />
            <Route
              path="/restaurant/banquet"
              element={
                <>
                  <PageTitle title="Restaurant Banquet | Soft Mariyam" />
                  <Banquet />
                </>
              }
            />
            <Route
              path="/restaurant/program"
              element={
                <>
                  <PageTitle title="Restaurant Program | Soft Mariyam" />
                  <Program />
                </>
              }
            />
            <Route
              path="/restaurant/guest"
              element={
                <>
                  <PageTitle title="Restaurant Guest | Soft Mariyam" />
                  <RestGuest />
                </>
              }
            />
            <Route
              path="/restaurant/table"
              element={
                <>
                  <PageTitle title="Restaurant Table | Soft Mariyam" />
                  <TableNo />
                </>
              }
            />
            <Route
              path="/restaurant/invoice"
              element={
                <>
                  <PageTitle title="Restaurant Invoice | Soft Mariyam" />
                  <RestaurantInvoice />
                </>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <>
                  <PageTitle title="Transaction | Soft Mariyam" />
                  <Transactions />
                </>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <>
                  <PageTitle title="Account | Soft Mariyam" />
                  <Account />
                </>
              }
            />
            <Route
              path="/admin/category"
              element={
                <>
                  <PageTitle title="Category | Soft Mariyam" />
                  <Category />
                </>
              }
            />
            <Route
              path="/admin/room"
              element={
                <>
                  <PageTitle title="Room | Soft Mariyam" />
                  <Room />
                </>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <>
                  <PageTitle title="Menu | Soft Mariyam" />
                  <Menu />
                </>
              }
            />
            <Route
              path="/admin/food-item"
              element={
                <>
                  <PageTitle title="Food Item | Soft Mariyam" />
                  <Item />
                </>
              }
            />
            <Route
              path="/admin/user"
              element={
                <>
                  <PageTitle title="User | Soft Mariyam" />
                  <User />
                </>
              }
            />
            <Route
              path="/report/statement"
              element={
                <>
                  <PageTitle title="Statement | Soft Mariyam" />
                  <Statement />
                </>
              }
            />
            <Route
              path="/report/ledger"
              element={
                <>
                  <PageTitle title="Ledger | Soft Mariyam" />
                  <Ledger />
                </>
              }
            />
            <Route
              path="/report/activities"
              element={
                <>
                  <PageTitle title="Activities | Soft Mariyam" />
                  <Activities />
                </>
              }
            />
            <Route
              path="/super/organization"
              element={
                <>
                  <PageTitle title="Organization | Soft Mariyam" />
                  <Organization />
                </>
              }
            />
            <Route
              path="/super/client"
              element={
                <>
                  <PageTitle title="Client | Soft Mariyam" />
                  <Client />
                </>
              }
            />
          </Route>
        </Routes>
      </DefaultLayout>
    </Router>
  );
}

export default App;
