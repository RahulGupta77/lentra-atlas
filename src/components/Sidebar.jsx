import React from "react";
import { BiLogOut } from "react-icons/bi";
import { IoSearch, IoSettingsOutline } from "react-icons/io5";
import { TbGridDots } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import "./Sidebar.scss";

export const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar-container">
      <div className="icon-group">
        <div className="icon-wrapper primary">
          <TbGridDots className="icon" />
        </div>
        <div
          style={{ cursor: "not-allowed" }}
          className="icon-wrapper secondary"
        >
          <IoSettingsOutline className="icon" />
        </div>
        <div
          style={{ cursor: "not-allowed" }}
          className="icon-wrapper secondary"
        >
          <IoSearch className="icon" />
        </div>
      </div>
      <div className="logout-wrapper">
        <div
          className="icon-wrapper secondary"
          onClick={() => navigate("/dashboard")}
        >
          <BiLogOut className="icon" />
        </div>
      </div>
    </div>
  );
};
