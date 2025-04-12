import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.scss";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutBoxOpen, setIsLogoutBoxOpen] = useState(false);
  const logoutBoxRef = useRef(null);

  const [isCompanyInsightsOpen, setIsCompanyInsightsOpen] = useState(() =>
    location.pathname.includes("/dashboard/")
  );

  useEffect(() => {
    // this is used to track if we have to show shadow in navbar or not
    setIsCompanyInsightsOpen(location.pathname.includes("/dashboard/"));
  }, [location]);

  const handleUserLogout = () => {
    setIsLogoutBoxOpen(false);
    localStorage.removeItem("access_token");
    navigate("/");
  };

  useEffect(() => {
    if (isLogoutBoxOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount or when isLogoutBoxOpen changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLogoutBoxOpen]);

  const handleClickOutside = (event) => {
    if (logoutBoxRef.current && !logoutBoxRef.current.contains(event.target)) {
      setIsLogoutBoxOpen(false); // Close the logout box if clicked outside
    }
  };

  return (
    <div className={`navbar ${isCompanyInsightsOpen ? "no-shadow" : ""}`}>
      <div className="logo">
        <img src={logo} alt="Atlas AI logo" />
      </div>

      {!(location.pathname === "/") && (
        <>
          <div
            onClick={() => setIsLogoutBoxOpen(true)}
            className="profile-view"
          >
            <p>RR</p>
          </div>

          {isLogoutBoxOpen && (
            <div className="user-logout" ref={logoutBoxRef}>
              <div className="user-logout-header">
                <span>Logout</span>
                <span
                  onClick={() => setIsLogoutBoxOpen(false)}
                  style={{ cursor: "pointer" }}
                >
                  <FaXmark />
                </span>
              </div>
              <div className="user-logout-body">
                Are you sure you want to logout?
              </div>
              <div className="user-logout-footer">
                <button
                  onClick={() => setIsLogoutBoxOpen(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button onClick={handleUserLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Navbar;
