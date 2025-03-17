import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "../Pages/userPages/Login/welcome";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
