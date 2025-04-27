
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
const ProtectedRoute = () => {
  const { role } = useSelector(state => state?.auth)
  // show unauthorized screen if no user is found in redux store
  if (!role) {
    return (
      <Navigate
        replace={true}
        to="/auth/signin"
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
