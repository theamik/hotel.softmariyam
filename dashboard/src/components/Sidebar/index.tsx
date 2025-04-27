import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import Logo from "../../images/logo/logo.svg";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-2 py-4 px-4 lg:mt-2 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Dashboard --> */}

              <React.Fragment>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                    (isActive && "!text-white")
                  }
                >
                  Overview
                </NavLink>
              </React.Fragment>

              {/* <!-- Menu Item Overview --> */}

              {/* <!-- Menu Item Hotel --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/hotel" || pathname.includes("hotel")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/hotel" || pathname.includes("hotel")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          width="20px"
                          height="20px"
                          viewBox="0 0 50 50"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12.691406 0L11.564453 2.3320312L9 2.6386719L10.949219 4.3613281L10.435547 7L12.691406 5.6816406L14.949219 7L14.435547 4.3613281L16.384766 2.6386719L13.820312 2.3320312L12.691406 0 z M 14.949219 7L10.435547 7L9.3007812 7C6.3307812 7 4 9.3307812 4 12.300781L4 45C4 45.55 4.45 46 5 46L22 46L22 36L28 36L28 46L45 46C45.55 46 46 45.55 46 45L46 12.300781C46 9.3307812 43.669219 7 40.699219 7L39.564453 7L35.050781 7L31.359375 7L26.845703 7L23.154297 7L18.640625 7L14.949219 7 z M 18.640625 7L20.896484 5.6816406L23.154297 7L22.640625 4.3613281L24.589844 2.6386719L22.025391 2.3320312L20.896484 0L19.769531 2.3320312L17.205078 2.6386719L19.154297 4.3613281L18.640625 7 z M 26.845703 7L29.103516 5.6816406L31.359375 7L30.845703 4.3613281L32.794922 2.6386719L30.230469 2.3320312L29.103516 0L27.974609 2.3320312L25.410156 2.6386719L27.359375 4.3613281L26.845703 7 z M 35.050781 7L37.308594 5.6816406L39.564453 7L39.050781 4.3613281L41 2.6386719L38.435547 2.3320312L37.308594 0L36.179688 2.3320312L33.615234 2.6386719L35.564453 4.3613281L35.050781 7 z M 10 12L16 12L16 16L10 16L10 12 z M 22 12L28 12L28 16L22 16L22 12 z M 34 12L40 12L40 16L34 16L34 12 z M 10 20L16 20L16 24L10 24L10 20 z M 22 20L28 20L28 24L22 24L22 20 z M 34 20L40 20L40 24L34 24L34 20 z M 10 28L16 28L16 32L10 32L10 28 z M 22 28L28 28L28 32L22 32L22 28 z M 34 28L40 28L40 32L34 32L34 28 z M 10 36L16 36L16 40L10 40L10 36 z M 34 36L40 36L40 40L34 40L34 36 z" />
                        </svg>
                        Hotel
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Dashboard
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/room-view"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Room View
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/reservation"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Reservation
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/group"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Group
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/guest"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Guest
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/company"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Company
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/report"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Report
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/hotel/invoice"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Invoice
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Hotel --> */}
              {/* <!-- Menu Item Restaurant --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/restaurant" || pathname.includes("restaurant")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/restaurant" ||
                            pathname.includes("restaurant")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 511.999 511.999"
                        >
                          <g>
                            <g>
                              <path
                                d="M256.747,86.809C149.033,86.809,61.4,174.442,61.4,282.156c0,107.715,87.633,195.348,195.347,195.348
			c107.715,0,195.347-87.633,195.347-195.348C452.094,174.441,364.462,86.809,256.747,86.809z M256.747,462.295
			c-99.328,0-180.138-80.81-180.138-180.139s80.81-180.138,180.138-180.138c99.329,0,180.138,80.809,180.138,180.138
			S356.076,462.295,256.747,462.295z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M256.748,155.943c-69.594,0-126.214,56.619-126.214,126.213c0,11.232,1.478,22.375,4.392,33.119l14.678-3.983
			c-2.564-9.445-3.863-19.249-3.863-29.137c0-61.208,49.797-111.004,111.005-111.004c17.825,0,34.844,4.093,50.584,12.167
			l6.941-13.534C296.364,160.6,277.01,155.943,256.748,155.943z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M156.761,330.436l-13.691,6.624c7.979,16.492,19.726,31.348,33.97,42.961l9.611-11.787
			C174.116,358.013,163.78,344.943,156.761,330.436z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M333.721,182.124l-9.282,12.046c27.526,21.212,43.314,53.281,43.314,87.984c0,61.208-49.797,111.005-111.005,111.005
			c-21.791,0-42.88-6.309-60.991-18.241l-8.368,12.699c20.602,13.575,44.585,20.751,69.359,20.751
			c69.595,0,126.214-56.619,126.214-126.214C382.961,242.698,365.013,206.238,333.721,182.124z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M63.945,48.058v88.065H47.181V48.058H31.972v88.065H15.209V48.058H0v88.065v13.111v2.098h0.057
			c0.96,18.283,14.386,33.312,31.916,36.738v281.83h15.209V188.07c17.529-3.427,30.955-18.455,31.916-36.739h0.057v-2.098v-13.111
			V48.058H63.945z M39.577,173.601c-12.73,0-23.211-9.813-24.278-22.27h48.557C62.787,163.788,52.306,173.601,39.577,173.601z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M499.327,42.243c-22.486,13.731-36.456,38.628-36.456,64.975V273.63h33.919v196.269h15.209v-196.27v-92.423V34.496
			L499.327,42.243z M496.791,181.205v77.215h-18.711V107.217c0-16.624,6.948-32.525,18.711-43.896V181.205z"
                              />
                            </g>
                          </g>
                        </svg>
                        Restaurant
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/#"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Dashboard
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/bill"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Bill
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/order"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Orders
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/banquet"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Banquet
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/guest"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Guest
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/table"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Table No
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/restaurant/invoice"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Report
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Restaurant --> */}
              {/* <!-- Menu Item Admin --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/admin" || pathname.includes("admin")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/admin" || pathname.includes("admin")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Capa_1"
                          viewBox="0 0 474.565 474.565"
                        >
                          <g>
                            <path d="M255.204,102.3c-0.606-11.321-12.176-9.395-23.465-9.395C240.078,95.126,247.967,98.216,255.204,102.3z" />
                            <path
                              d="M134.524,73.928c-43.825,0-63.997,55.471-28.963,83.37c11.943-31.89,35.718-54.788,66.886-63.826
		C163.921,81.685,150.146,73.928,134.524,73.928z"
                            />
                            <path
                              d="M43.987,148.617c1.786,5.731,4.1,11.229,6.849,16.438L36.44,179.459c-3.866,3.866-3.866,10.141,0,14.015l25.375,25.383
		c1.848,1.848,4.38,2.888,7.019,2.888c2.61,0,5.125-1.04,7.005-2.888l14.38-14.404c2.158,1.142,4.55,1.842,6.785,2.827
		c0-0.164-0.016-0.334-0.016-0.498c0-11.771,1.352-22.875,3.759-33.302c-17.362-11.174-28.947-30.57-28.947-52.715
		c0-34.592,28.139-62.739,62.723-62.739c23.418,0,43.637,13.037,54.43,32.084c11.523-1.429,22.347-1.429,35.376,1.033
		c-1.676-5.07-3.648-10.032-6.118-14.683l14.396-14.411c1.878-1.856,2.918-4.38,2.918-7.004c0-2.625-1.04-5.148-2.918-7.004
		l-25.361-25.367c-1.94-1.941-4.472-2.904-7.003-2.904c-2.532,0-5.063,0.963-6.989,2.904l-14.442,14.411
		c-5.217-2.764-10.699-5.078-16.444-6.825V9.9c0-5.466-4.411-9.9-9.893-9.9h-35.888c-5.451,0-9.909,4.434-9.909,9.9v20.359
		c-5.73,1.747-11.213,4.061-16.446,6.825L75.839,22.689c-1.942-1.941-4.473-2.904-7.005-2.904c-2.531,0-5.077,0.963-7.003,2.896
		L36.44,48.048c-1.848,1.864-2.888,4.379-2.888,7.012c0,2.632,1.04,5.148,2.888,7.004l14.396,14.403
		c-2.75,5.218-5.063,10.708-6.817,16.438H23.675c-5.482,0-9.909,4.441-9.909,9.915v35.889c0,5.458,4.427,9.908,9.909,9.908H43.987z"
                            />
                            <path
                              d="M354.871,340.654c15.872-8.705,26.773-25.367,26.773-44.703c0-28.217-22.967-51.168-51.184-51.168
		c-9.923,0-19.118,2.966-26.975,7.873c-4.705,18.728-12.113,36.642-21.803,52.202C309.152,310.022,334.357,322.531,354.871,340.654z
		"
                            />
                            <path
                              d="M460.782,276.588c0-5.909-4.799-10.693-10.685-10.693H428.14c-1.896-6.189-4.411-12.121-7.393-17.75l15.544-15.544
		c2.02-2.004,3.137-4.721,3.137-7.555c0-2.835-1.118-5.553-3.137-7.563l-27.363-27.371c-2.08-2.09-4.829-3.138-7.561-3.138
		c-2.734,0-5.467,1.048-7.547,3.138l-15.576,15.552c-5.623-2.982-11.539-5.481-17.751-7.369v-21.958
		c0-5.901-4.768-10.685-10.669-10.685H311.11c-2.594,0-4.877,1.04-6.739,2.578c3.26,11.895,5.046,24.793,5.046,38.552
		c0,8.735-0.682,17.604-1.956,26.423c7.205-2.656,14.876-4.324,22.999-4.324c36.99,0,67.086,30.089,67.086,67.07
		c0,23.637-12.345,44.353-30.872,56.303c13.48,14.784,24.195,32.324,31.168,51.976c1.148,0.396,2.344,0.684,3.54,0.684
		c2.733,0,5.467-1.04,7.563-3.13l27.379-27.371c2.004-2.004,3.106-4.721,3.106-7.555s-1.102-5.551-3.106-7.563l-15.576-15.552
		c2.982-5.621,5.497-11.555,7.393-17.75h21.957c2.826,0,5.575-1.118,7.563-3.138c2.004-1.996,3.138-4.72,3.138-7.555
		L460.782,276.588z"
                            />
                            <path
                              d="M376.038,413.906c-16.602-48.848-60.471-82.445-111.113-87.018c-16.958,17.958-37.954,29.351-61.731,29.351
		c-23.759,0-44.771-11.392-61.713-29.351c-50.672,4.573-94.543,38.17-111.145,87.026l-9.177,27.013
		c-2.625,7.773-1.368,16.338,3.416,23.007c4.783,6.671,12.486,10.631,20.685,10.631h315.853c8.215,0,15.918-3.96,20.702-10.631
		c4.767-6.669,6.041-15.234,3.4-23.007L376.038,413.906z"
                            />
                            <path
                              d="M120.842,206.782c0,60.589,36.883,125.603,82.352,125.603c45.487,0,82.368-65.014,82.368-125.603
		C285.563,81.188,120.842,80.939,120.842,206.782z"
                            />
                          </g>
                        </svg>
                        Admin
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Dashboard
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/transactions"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Transactions
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/accounts"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Accounts
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/category"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Category
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/room"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Rooms
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/menu"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Menu
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/food-item"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Food Item
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/user"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              User
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Admin --> */}
              {/* <!-- Menu Item Kitchen --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/forms" || pathname.includes("forms")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/forms" || pathname.includes("forms")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          width="20px"
                          height="20px"
                          viewBox="0 -5.59 122.88 122.88"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g>
                            <path d="M25.66,19.3c-0.4,0.4-0.93,0.6-1.45,0.6c-0.53,0-1.05-0.2-1.45-0.6c-0.4-0.4-0.6-0.93-0.6-1.45c0-0.53,0.2-1.05,0.6-1.45 c0.73-0.73,0.94-1.39,0.86-2.02c-0.08-0.69-0.47-1.43-0.9-2.22c-0.74-1.39-1.54-2.87-1.79-4.67c-0.26-1.82,0.04-3.91,1.51-6.45 L22.45,1c0.28-0.47,0.73-0.79,1.22-0.93c0.5-0.14,1.06-0.08,1.55,0.2c0.49,0.28,0.82,0.74,0.96,1.24c0.14,0.5,0.08,1.06-0.2,1.55 c-0.9,1.57-1.07,2.87-0.9,4.01c0.18,1.15,0.73,2.18,1.25,3.14c0.77,1.43,1.48,2.76,1.57,4.23C28,15.95,27.45,17.51,25.66,19.3 L25.66,19.3z M14.09,42.76h94.51c0.38,0,0.75,0.08,1.09,0.22c0.33,0.14,0.62,0.33,0.88,0.57c0.02,0.01,0.04,0.03,0.06,0.05 c0.52,0.52,0.84,1.23,0.84,2.02v6.37h9.36c0.57,0,1.08,0.23,1.45,0.6l0,0c0.37,0.37,0.6,0.89,0.6,1.45c0,0.57-0.23,1.08-0.6,1.45 l-0.03,0.03c-0.37,0.35-0.87,0.57-1.42,0.57h-9.36v42.1c0,1.82-0.37,3.56-1.03,5.15c-0.69,1.65-1.69,3.14-2.93,4.38 c-1.24,1.24-2.73,2.25-4.38,2.93c-1.59,0.66-3.33,1.03-5.15,1.03H24.73c-1.82,0-3.56-0.37-5.15-1.03 c-1.65-0.69-3.14-1.69-4.38-2.94c-1.24-1.24-2.25-2.73-2.94-4.38c-0.66-1.59-1.03-3.33-1.03-5.15V56.11H2.06 c-0.57,0-1.08-0.23-1.45-0.6C0.23,55.13,0,54.62,0,54.05c0-0.57,0.23-1.08,0.6-1.45l0,0c0.37-0.37,0.89-0.6,1.45-0.6h9.18v-6.37 c0-0.38,0.08-0.75,0.22-1.09c0.15-0.35,0.36-0.67,0.62-0.93C12.59,43.09,13.31,42.76,14.09,42.76L14.09,42.76z M107.35,46.88h-92 v51.32c0,1.27,0.25,2.47,0.71,3.58c0.48,1.15,1.18,2.18,2.05,3.05c0.87,0.87,1.9,1.57,3.05,2.05c1.1,0.46,2.31,0.71,3.58,0.71 h73.25c1.26,0,2.47-0.25,3.57-0.71c1.14-0.48,2.18-1.18,3.05-2.04c0.87-0.87,1.57-1.9,2.04-3.05c0.46-1.1,0.71-2.31,0.71-3.57 V46.88L107.35,46.88z M20.06,53.85c0-0.57,0.23-1.08,0.6-1.45c0.37-0.37,0.89-0.6,1.45-0.6c0.57,0,1.08,0.23,1.45,0.6 c0.37,0.37,0.6,0.89,0.6,1.45v27.09c0,0.57-0.23,1.08-0.6,1.45c-0.37,0.37-0.89,0.6-1.45,0.6c-0.57,0-1.08-0.23-1.45-0.6 l-0.03-0.03c-0.35-0.37-0.57-0.87-0.57-1.42V53.85L20.06,53.85z M40.3,25.44c-3.54,0.51-6.72,1.16-9.54,1.93 c-2.83,0.78-5.32,1.69-7.46,2.73c-1.5,0.73-2.83,1.52-3.98,2.37c-0.81,0.59-1.53,1.22-2.17,1.87h88.43 c-0.59-0.62-1.27-1.21-2.03-1.77c-1.11-0.81-2.4-1.56-3.86-2.24c-2.08-0.98-4.5-1.82-7.21-2.56c-2.73-0.74-5.75-1.35-9.01-1.86 c-1.48-0.23-2.98-0.44-4.49-0.63l-0.02,0c-1.49-0.19-2.99-0.35-4.51-0.5c-1.49-0.14-3-0.27-4.54-0.37 c-1.52-0.1-3.03-0.18-4.53-0.24c-0.57-0.02-1.07-0.27-1.43-0.65c-0.36-0.38-0.57-0.9-0.55-1.47l0-0.01 c0.01-0.33,0.1-0.64,0.25-0.91c0.15-0.28,0.37-0.51,0.63-0.7c0.32-0.24,0.62-0.51,0.88-0.82c0.26-0.3,0.48-0.64,0.66-0.99 c0.18-0.35,0.32-0.72,0.41-1.13c0.09-0.39,0.14-0.79,0.14-1.21c0-0.7-0.14-1.36-0.39-1.96c-0.26-0.62-0.64-1.19-1.11-1.66 c-0.47-0.47-1.04-0.86-1.66-1.11c-0.6-0.25-1.26-0.39-1.96-0.39c-0.7,0-1.36,0.14-1.96,0.39c-0.63,0.26-1.19,0.64-1.66,1.12 c-0.47,0.47-0.86,1.04-1.11,1.66l0,0c-0.25,0.6-0.39,1.26-0.39,1.96c0,0.41,0.05,0.81,0.13,1.19c0.09,0.39,0.23,0.77,0.4,1.11 c0.18,0.35,0.4,0.69,0.65,0.99c0.26,0.31,0.55,0.59,0.87,0.82c0.45,0.34,0.73,0.83,0.8,1.35c0.07,0.52-0.05,1.07-0.39,1.52 c-0.2,0.26-0.44,0.46-0.71,0.6c-0.26,0.13-0.55,0.21-0.84,0.22l-0.06,0l-0.04,0c-1.37,0.03-2.77,0.08-4.18,0.15 c-1.39,0.07-2.8,0.16-4.25,0.28c-1.4,0.11-2.79,0.24-4.15,0.4C42.99,25.07,41.64,25.24,40.3,25.44L40.3,25.44z M21.51,26.4 c2.34-1.13,5.03-2.12,8.08-2.96c3.03-0.84,6.41-1.53,10.13-2.07c1.39-0.2,2.79-0.38,4.2-0.54c1.43-0.16,2.84-0.3,4.26-0.41 c0.87-0.07,1.78-0.13,2.71-0.19c0.64-0.04,1.3-0.07,1.96-0.1c-0.25-0.55-0.45-1.13-0.59-1.72c-0.16-0.68-0.25-1.39-0.25-2.12 c0-1.25,0.25-2.44,0.7-3.53c0.47-1.13,1.16-2.15,2.01-3c0.85-0.85,1.87-1.54,3-2c1.09-0.45,2.28-0.7,3.53-0.7s2.44,0.25,3.53,0.7 c1.13,0.47,2.15,1.16,3,2c0.85,0.85,1.54,1.87,2.01,3c0.45,1.09,0.7,2.28,0.7,3.53c0,0.74-0.09,1.46-0.26,2.16 c-0.15,0.63-0.37,1.24-0.65,1.82c0.76,0.05,1.5,0.1,2.22,0.16c0.97,0.07,1.98,0.16,3.02,0.26c1.55,0.15,3.09,0.32,4.64,0.52 c1.55,0.19,3.09,0.41,4.62,0.65c3.47,0.54,6.66,1.2,9.54,1.98c2.9,0.79,5.51,1.71,7.79,2.78c2.38,1.11,4.41,2.39,6.05,3.85 c1.66,1.47,2.92,3.12,3.77,4.97c0.07,0.14,0.13,0.29,0.17,0.46c0.04,0.16,0.06,0.32,0.06,0.49c0,0.57-0.23,1.08-0.6,1.45 l-0.03,0.03c-0.37,0.35-0.87,0.57-1.42,0.57H13.09c-0.04,0-0.07,0-0.1-0.01c-0.13-0.01-0.27-0.03-0.39-0.06 c-0.14-0.04-0.28-0.09-0.42-0.16c-0.03-0.01-0.06-0.03-0.09-0.05c-0.47-0.27-0.8-0.7-0.95-1.19c-0.15-0.49-0.12-1.03,0.13-1.51 c0.01-0.03,0.03-0.06,0.05-0.09c0.98-1.81,2.31-3.47,4.01-4.97C17.02,28.92,19.08,27.58,21.51,26.4L21.51,26.4z M81.61,16.39 c0.4,0.4,0.6,0.93,0.6,1.45c0,0.53-0.2,1.05-0.6,1.45c-0.4,0.4-0.93,0.6-1.45,0.6c-0.53,0-1.05-0.2-1.45-0.6 c-1.79-1.79-2.34-3.35-2.25-4.85c0.09-1.47,0.81-2.8,1.57-4.23c1-1.88,2.15-4.02,0.35-7.15l-0.02-0.04 c-0.27-0.48-0.32-1.03-0.18-1.52c0.14-0.51,0.47-0.96,0.96-1.24c0.49-0.28,1.05-0.34,1.55-0.2c0.51,0.14,0.96,0.47,1.24,0.96 c1.47,2.54,1.77,4.63,1.51,6.44c-0.26,1.8-1.05,3.29-1.79,4.67l0,0C80.85,13.65,80.16,14.94,81.61,16.39L81.61,16.39z M97.11,16.39 c0.4,0.4,0.6,0.93,0.6,1.45c0,0.53-0.2,1.05-0.6,1.45c-0.4,0.4-0.93,0.6-1.45,0.6c-0.53,0-1.05-0.2-1.45-0.6 c-1.79-1.79-2.34-3.35-2.25-4.85c0.09-1.47,0.81-2.8,1.57-4.23c0.51-0.96,1.07-1.99,1.25-3.14c0.18-1.14,0.01-2.44-0.9-4.01 c-0.28-0.49-0.34-1.05-0.2-1.55c0.14-0.51,0.47-0.96,0.96-1.24c0.49-0.28,1.05-0.34,1.55-0.2c0.5,0.14,0.96,0.47,1.24,0.96 c1.47,2.54,1.77,4.63,1.51,6.44c-0.26,1.8-1.05,3.29-1.79,4.67c-0.42,0.79-0.82,1.53-0.9,2.22C96.17,15.01,96.38,15.66,97.11,16.39 L97.11,16.39z M41.16,19.3c-0.4,0.4-0.93,0.6-1.45,0.6c-0.53,0-1.05-0.2-1.45-0.6c-0.4-0.4-0.6-0.93-0.6-1.45 c0-0.53,0.2-1.05,0.6-1.45c1.46-1.46,0.77-2.75-0.04-4.25c-0.74-1.39-1.54-2.87-1.79-4.68c-0.26-1.82,0.04-3.91,1.51-6.45 c0.28-0.49,0.74-0.82,1.25-0.95c0.51-0.13,1.06-0.08,1.55,0.21c0.49,0.28,0.82,0.74,0.95,1.25c0.13,0.51,0.08,1.06-0.21,1.55 c-1.8,3.12-0.65,5.27,0.35,7.14l0,0c0.77,1.43,1.48,2.76,1.57,4.23C43.5,15.95,42.94,17.51,41.16,19.3L41.16,19.3z" />
                          </g>
                        </svg>
                        Kitchen
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      {/* <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/forms/form-elements"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Dashboard
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/forms/form-elements"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Food Process
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/forms/form-layout"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Finished Foods
                            </NavLink>
                          </li>
                        </ul>
                      </div> */}
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Kitchen --> */}
              {/* <!-- Menu Item Store --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/forms" || pathname.includes("forms")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/forms" || pathname.includes("forms")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          width="20px"
                          height="20px"
                          viewBox="0 0 60 60"
                          id="Capa_1"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g>
                            <path d="M59,16V2H1v14H0v37.259C0,55.873,2.127,58,4.742,58h50.517C57.873,58,60,55.873,60,53.259V16H59z M56.5,16l-5.18-6.906   L56.414,4H57v12H56.5z M11,16V9c0-0.024-0.012-0.046-0.014-0.07c-0.005-0.064-0.02-0.124-0.036-0.187   c-0.011-0.042-0.01-0.085-0.027-0.125c-0.009-0.022-0.027-0.039-0.037-0.061c-0.027-0.055-0.065-0.102-0.103-0.152   c-0.028-0.036-0.044-0.081-0.077-0.113L6.414,4h47.172l-4.292,4.292c-0.032,0.032-0.049,0.077-0.077,0.113   c-0.038,0.05-0.075,0.097-0.102,0.152c-0.011,0.022-0.028,0.038-0.038,0.061c-0.017,0.04-0.016,0.084-0.027,0.125   c-0.017,0.063-0.032,0.122-0.036,0.187C49.012,8.954,49,8.976,49,9v7H11z M6,16l3-4.001V16H6z M51,11.999L54,16h-3V11.999z M3,4   h0.586L8.68,9.094L3.5,16H3V4z M58,53.259C58,54.771,56.77,56,55.258,56H4.742C3.23,56,2,54.771,2,53.259V18h56V53.259z" />

                            <path d="M42,24c-0.552,0-1,0.447-1,1v6c0,6.065-4.935,11-11,11s-11-4.935-11-11v-6c0-0.553-0.448-1-1-1s-1,0.447-1,1v6   c0,7.168,5.832,13,13,13s13-5.832,13-13v-6C43,24.447,42.552,24,42,24z" />

                            <path d="M20,25c0,0.553,0.448,1,1,1s1-0.447,1-1c0-2.206-1.794-4-4-4s-4,1.794-4,4c0,0.553,0.448,1,1,1s1-0.447,1-1   c0-1.103,0.897-2,2-2S20,23.897,20,25z" />

                            <path d="M42,21c-2.206,0-4,1.794-4,4c0,0.553,0.448,1,1,1s1-0.447,1-1c0-1.103,0.897-2,2-2s2,0.897,2,2c0,0.553,0.448,1,1,1   s1-0.447,1-1C46,22.794,44.206,21,42,21z" />
                          </g>

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />

                          <g />
                        </svg>
                        Store
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      {/* <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/forms/form-elements"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Stock In
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/forms/form-elements"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Stock Out
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/forms/form-layout"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-white')
                              }
                            >
                              Stock List
                            </NavLink>
                          </li>
                        </ul>
                      </div> */}
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Store --> */}
              {/* <!-- Menu Item Report --> */}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/report" || pathname.includes("report")
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                            pathname === "/report" ||
                            pathname.includes("report")
                          }` + (isActive && "!text-white")
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg
                          fill="#f1f1f1"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <g>
                            <g>
                              <path
                                d="M399.929,357.333c-42.35,0-76.8,34.45-76.8,76.8c0,42.35,34.45,76.8,76.8,76.8c42.35,0,76.8-34.45,76.8-76.8
			C476.729,391.783,442.279,357.333,399.929,357.333z M399.929,493.867c-32.933,0-59.733-26.8-59.733-59.733
			s26.8-59.733,59.733-59.733c32.933,0,59.733,26.8,59.733,59.733S432.862,493.867,399.929,493.867z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M439.529,401.975c-3.633-3.008-9-2.525-12.025,1.092l-36.683,44.025L371.829,428.1c-3.333-3.333-8.733-3.333-12.067,0
			c-3.333,3.333-3.333,8.733,0,12.067l25.6,25.6c1.6,1.608,3.775,2.5,6.033,2.5c0.125,0,0.258,0,0.383-0.008
			c2.4-0.108,4.633-1.217,6.175-3.058l42.667-51.2C443.638,410.375,443.146,404.992,439.529,401.975z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M403.229,0H61.979C47.837,0,35.271,10.4,35.271,24.5v460.867c0,14.1,12.542,26.633,26.65,26.633h257.158
			c4.717,0,8.533-3.817,8.533-8.533s-3.817-8.533-8.533-8.533H61.921c-4.7,0-9.583-4.883-9.583-9.567V24.5
			c0-4.683,4.917-7.433,9.642-7.433h341.25c4.65,0,7.508,2.808,7.508,7.4V323.2c0,4.717,3.817,8.533,8.533,8.533
			c4.717,0,8.533-3.817,8.533-8.533V24.467C427.804,10.392,417.371,0,403.229,0z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M275.271,59.733h-85.333c-4.717,0-8.533,3.817-8.533,8.533c0,4.717,3.817,8.533,8.533,8.533h85.333
			c4.717,0,8.533-3.817,8.533-8.533C283.804,63.55,279.987,59.733,275.271,59.733z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M352.071,119.467H113.138c-4.717,0-8.533,3.817-8.533,8.533c0,4.717,3.817,8.533,8.533,8.533h238.933
			c4.717,0,8.533-3.817,8.533-8.533C360.604,123.283,356.787,119.467,352.071,119.467z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M352.071,179.2H113.138c-4.717,0-8.533,3.817-8.533,8.533c0,4.717,3.817,8.533,8.533,8.533h238.933
			c4.717,0,8.533-3.817,8.533-8.533C360.604,183.017,356.787,179.2,352.071,179.2z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M352.071,238.933H113.138c-4.717,0-8.533,3.817-8.533,8.533c0,4.717,3.817,8.533,8.533,8.533h238.933
			c4.717,0,8.533-3.817,8.533-8.533C360.604,242.75,356.787,238.933,352.071,238.933z"
                              />
                            </g>
                          </g>
                          <g>
                            <g>
                              <path
                                d="M352.071,298.667H113.138c-4.717,0-9.6,2.75-9.6,7.467v128c0,4.717,4.883,9.6,9.6,9.6h187.733
			c4.717,0,8.533-3.817,8.533-8.533s-3.817-8.533-8.533-8.533H120.604V315.733h221.867V348.8c0,4.717,3.817,8.533,8.533,8.533
			c4.717,0,8.533-3.817,8.533-8.533v-42.667C359.538,301.417,356.787,298.667,352.071,298.667z"
                              />
                            </g>
                          </g>
                        </svg>
                        Report
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && "rotate-180"
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && "hidden"
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/report/statement"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Statement
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/report/ledger"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Ledger
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/report/activities"
                              className={({ isActive }) =>
                                "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                (isActive && "!text-white")
                              }
                            >
                              Activities
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Report --> */}
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
