import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "../Pages/userPages/Login/welcome";
import Register from "../Pages/userPages/Signup/register";
import Profile from "../Pages/userPages/profile/profile";
import Feed from "../Pages/userPages/Main Pages/Feed";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
