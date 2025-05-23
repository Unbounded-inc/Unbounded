import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "../Pages/userPages/Login/welcome";
import Register from "../Pages/userPages/Signup/register";
import Profile from "../Pages/userPages/profile/profile";
import Feed from "../Pages/mainPages/Feed";
import { NotFoundPage } from "../Pages/mainPages/NotFound.page.tsx";
import Messages from "../Pages/mainPages/Messages.tsx";
import PrivateRoute from "../components/Auth/PrivateRoute.tsx";
import Friends from "../Pages/mainPages/Friends.tsx";
import Events from "../Pages/mainPages/Events";
import Forums from "../Pages/mainPages/Forums";
import Settings from "../Pages/userPages/profile/Settings";
import MyPosts from "../Pages/mainPages/MyPosts";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          }
        />

<Route
  path="/map"
  element={
    <PrivateRoute>
      <Events />
    </PrivateRoute>
  }
/>

<Route
  path="/forums"
  element={
    <PrivateRoute>
      <Forums />
    </PrivateRoute>
  }
/>

<Route
  path="/settings"
  element={
    <PrivateRoute>
      <Settings />
    </PrivateRoute>
  }
/>

<Route
  path="/my-posts"
  element={
    <PrivateRoute>
      <MyPosts />
    </PrivateRoute>
  }
/>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
