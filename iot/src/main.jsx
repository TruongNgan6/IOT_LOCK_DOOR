import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Registration from "./ui/Registration/Registration.jsx";
import Home from "./ui/Home/Home.jsx";
import UserData from "./ui/UserData/UserData.jsx";
import ReadTagID from "./ui/ReadTagID/ReadTagID.jsx";
import Login from "./ui/Login/Login.jsx";
import SignUp from "./ui/SignUp/SignUp.jsx";
import RFIDReader from "./connectArduino/connectArduino.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="registration" element={<Registration />} />
          <Route path="userdata" element={<UserData />} />
          <Route path="read-tag-id" element={<ReadTagID />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="connect" element={<RFIDReader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
