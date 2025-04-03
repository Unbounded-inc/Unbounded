import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "../Pages/userPages/Login/welcome";
import Register from "../Pages/userPages/Signup/register";
import Profile from "../Pages/userPages/profile/profile";
import Feed from "../Pages/mainPages/Feed";
import {NotFoundPage} from "../Pages/mainPages/NotFound.page.tsx";
import Messages from "../Pages/mainPages/Messages.tsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
