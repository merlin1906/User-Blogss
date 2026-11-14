
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <img
          src="/favicon-192%20(1).png"
          alt="UB Logo"
          className="website-logo"
        />
        <span className="brand-name">USER-BLOGSS</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/blogs">Articles</NavLink>
        <a href="/#categories">Categories</a>
        <a href="/#trending">Trending</a>
      </nav>

      <Link to="/blogs" className="contact-btn">
        Explore Blogs
      </Link>
    </header>
  );
}

export default Navbar;
