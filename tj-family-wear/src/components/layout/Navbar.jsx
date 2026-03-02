import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./navbar.css";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo">
          <Link to="/">TJ</Link>
        </div>

        {/* Desktop Links */}
        <div className="nav-links desktop">
          <Link to="/">{t("home")}</Link>
          <Link to="/login">{t("login")}</Link>
          <Link to="/signup">{t("signup")}</Link>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === "ar" ? "EN" : "AR"}
          </button>

          <div className="cart-icon">🛒</div>

          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>
            {t("home")}
          </Link>
          <Link to="/login" onClick={() => setOpen(false)}>
            {t("login")}
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            {t("signup")}
          </Link>
        </div>
      )}
    </nav>
  );
}
