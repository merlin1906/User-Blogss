
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        USER-BLOGSS<span>.</span>
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
