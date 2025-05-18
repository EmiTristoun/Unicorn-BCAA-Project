import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';
import loginIcon from './assets/login.png';
import SearchBar from './search';

function Hotbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      userId = JSON.parse(atob(token.split('.')[1])).id;
    } catch {
      userId = null;
    }
  }
  const isLoggedIn = !!token;

  return (
    <div style={hotbarStyle}>
      <Link to="/homepage" style={logoLinkStyle}>
        <img src={logo} alt="Logo" style={logoStyle} />
      </Link>

      <div style={searchBarWrapperStyle}>
        <SearchBar />
      </div>

      <div>
        <button
          onClick={() => {
            if (isLoggedIn && userId) {
              navigate(`/profile/${userId}`);
            } else {
              navigate('/login');
            }
          }}
          style={loginButtonStyle}
        >
          <img src={loginIcon} alt="Login" style={loginIconStyle} />
          {isLoggedIn ? 'Profile' : 'Login'}
        </button>
      </div>
    </div>
  );
}

const hotbarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '60px',
  backgroundColor: '#333',
  color: 'white',
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
  zIndex: 1000,
};

const logoStyle = {
  height: '40px',
  width: 'auto',
};

const logoLinkStyle = {
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '150px',
};

const searchBarWrapperStyle = {
  flex: 1,
  maxWidth: '600px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 20px',
};

const loginButtonStyle = {
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '150px',
};

const loginIconStyle = {
  height: '30px',
  width: '30px', 
  cursor: 'pointer',
  margin: '0',
  padding: '0',
  objectFit: 'contain',
};

export default Hotbar;