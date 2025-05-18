import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import FilmPage from './film';
import Hotbar from './Hotbar';
import Login from './Login';
import absoluteCinemaImage from './assets/absolute-cinema.jpg';
import SearchResults from './SearchResults';
import Profile from './profile';
import ListPage from './list';

function HomePage() {
  return (
    <div style={{ paddingTop: '60px' }}>
      <img
        src={absoluteCinemaImage}
        alt="Absolute Cinema"
        style={{ display: 'block', margin: '20px auto', maxWidth: '20%', height: 'auto' }}
      />
      <h1 style={{ textAlign: 'center' }}>Welcome to the Homepage</h1>
      <p>This is the homepage of Absolute Cinema.</p>
    </div>
  );
}

function InexistentPage() {
  return (
    <div style={{ paddingTop: '60px' }}>
      <h1>404 : page not found</h1>
      <p>Get back on the tracks</p>
    </div>
  );
}

function FilmPageWrapper() {
  const { id } = useParams();
  return (
    <div style={{ paddingTop: '60px' }}>
      <FilmPage id={id} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Hotbar />
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" replace />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/film/:id" element={<FilmPageWrapper />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<InexistentPage />} />
        <Route path="/list/:id" element={<ListPage />} />
      </Routes>
    </Router>
  );
}

export default App;