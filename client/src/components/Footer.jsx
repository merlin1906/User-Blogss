
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <h2>USER-BLOGSS<span>.</span></h2>
          <p>
            Discover technology, explore innovation and
            stay updated with the digital world.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/blogs">All Articles</Link>
          <a href="/#categories">Categories</a>
          <a href="/#trending">Trending</a>
        </div>

        <div>
          <h3>Connect With Us</h3>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
          <a href="mailto:info@USER-BLOGSScom">Email Us</a>
        </div>
      </div>

      <div className="footer-bottom">
      </div>
    </footer>
  );
}

export default Footer;
