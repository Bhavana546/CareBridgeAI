"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navbar.css";

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Compare Policies",
    href: "/compare-policies",
  },
  {
    name: "Coverage Checker",
    href: "/coverage-checker",
  },
  {
    name: "Cost Estimator",
    href: "/cost-estimator",
  },
  {
    name: "Hospital Network",
    href: "/hospital-network",
  },
  {
    name: "Procedures",
    href: "/procedure-explorer",
  },
  {
    name: "Claim Assistant",
    href: "/claim-assistant",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="logo-icon">+</div>

          <div>
            <div className="logo-name">CareBridge AI</div>
            <div className="logo-tagline">
              Smart Healthcare Decisions
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
