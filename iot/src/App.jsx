import "./index.css";
import Home from "./ui/Home/Home";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app-container">
      <div className="header-container">
        <Home />
      </div>
      <div className="main-container ">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
