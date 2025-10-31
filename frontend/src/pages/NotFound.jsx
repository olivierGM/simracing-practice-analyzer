import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1>404</h1>
        <p>La page demandée n'existe pas.</p>
        <Link to="/" className="notfound-home-button">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}



