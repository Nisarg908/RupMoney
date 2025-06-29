import React, { useState, useEffect, useRef } from "react";
import sidebarData from "../sidebarContent.json";
import { Link, useLocation } from "react-router-dom";
import { TfiMenuAlt } from "react-icons/tfi";

function Dashboardnavbar({ links, footer }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleClickOutside = (event) => {
    if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const location = useLocation();

  return (
    <div>
      {/* {isSidebarOpen && ( */}
        {/* <aside className="sidebar" ref={sidebarRef}> */}
        <aside
          className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
          ref={sidebarRef}
        >
          <div className="sidebar-header">
            <button className="close-btn" onClick={toggleSidebar}>
              &times;
            </button>
          </div>
          <nav className="sidebar-nav">
            {links.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className={`nav-link ${location.pathname === link.href ? "active" : ""}`}
              >
                <div className="icon">
                  <img src={link.iconClass} alt="" />
                </div>
                {link.text}
              </Link>
            ))}
          </nav>
          <footer className="sidebar-footer">
            <img src={footer.logoSrc} alt={footer.text} className="logo" />
            <p>{footer.text}</p>
          </footer>
        </aside>
      {/* )} */}
      {/* <div className={`main-wrapper ${isSidebarOpen ? "" : "expanded"}`}> */}
      <div className={`main-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="toggle-wrapper">
          {!isSidebarOpen && (
            <button className="nav-toggle-btn" onClick={toggleSidebar}>
              <TfiMenuAlt />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <Dashboardnavbar links={sidebarData.links} footer={sidebarData.footer} />;
}