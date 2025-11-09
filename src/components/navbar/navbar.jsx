"use client";
import React from "react";
import Link from "next/link";
import "./navbar.css"; // optional for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faChalkboard, faUser } from "@fortawesome/free-solid-svg-icons";


const Navbar = () => {
  console.log("Navbar rendered");
  return (
    <nav className="navbar">
      <ul className="nav-links top-links">
        <li><Link href="/" ><FontAwesomeIcon icon={faHouse} size="2x" /></Link></li>
        <hr className="divider" />
        <li><Link href="/learn"><FontAwesomeIcon icon={faChalkboard} size="2x" /></Link></li>
      </ul>
      <ul className="nav-links bottom-links">
        <li><Link href="/profile"><FontAwesomeIcon icon={faUser} size="2x" /></Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;