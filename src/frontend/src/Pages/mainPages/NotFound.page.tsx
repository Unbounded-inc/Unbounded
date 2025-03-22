import { useNavigate } from 'react-router-dom';
import '../../Styles/NotFound.css';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="notfound-wrapper">
      <div className="notfound-content">
        <div className="notfound-emoji">🧭</div>
        <h1 className="notfound-title">Oops! Page Not Found</h1>
        <p className="notfound-text">
          Looks like you wandered off the map.
          <br />
          But don’t worry — you’re still Unbounded.
        </p>
        <button className="notfound-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
