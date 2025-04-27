import React from 'react';
import './AuthButton.css';

/**
 * AuthButton component - Displays either Sign In or Sign Out button
 * based on the current authentication status
 * 
 * @param {boolean} isAuthenticated - Whether the user is currently authenticated
 * @param {function} onSignIn - Function to call when sign in button is clicked
 * @param {function} onSignOut - Function to call when sign out button is clicked
 */
const AuthButton = ({ isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <div className="auth-button-container">
      {isAuthenticated ? (
        <button 
          className="auth-button sign-out-button"
          onClick={onSignOut}
          title="Sign out of Google Calendar"
        >
          <span className="auth-button-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5V5zm16 7l-4-4v3H9v2h8v3l4-4z" fill="currentColor"/>
            </svg>
          </span>
          <span className="auth-button-text">Sign Out</span>
        </button>
      ) : (
        <button 
          className="auth-button sign-in-button"
          onClick={onSignIn}
          title="Sign in with Google Calendar"
        >
          <span className="auth-button-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
            </svg>
          </span>
          <span className="auth-button-text">Sign in with Google</span>
        </button>
      )}
    </div>
  );
};

export default AuthButton;
