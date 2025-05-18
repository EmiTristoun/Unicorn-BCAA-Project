import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ListPage() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setCurrentUserId(JSON.parse(atob(token.split('.')[1])).id);
      } catch {
        setCurrentUserId(null);
      }
    }

    async function fetchList() {
      try {
        const response = await fetch(`https://backend-absolute-cinema.onrender.com/list/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch list');
        }
        const data = await response.json();
        setList(data);
      } catch (err) {
        setError('Error fetching list');
      }
    }
    fetchList();
  }, [id]);

  const handleRemoveFilm = async (filmId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://backend-absolute-cinema.onrender.com/list/${id}/film/${filmId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
      const updatedList = { ...list, films: list.films.filter(film => film.id !== filmId) };
      setList(updatedList);
    } catch (err) {
      setError('Failed to remove film from the list.');
    }
  };

  if (error) {
    return <div style={{ paddingTop: '60px', color: 'red' }}>{error}</div>;
  }

  if (!list) {
    return <div style={{ paddingTop: '60px' }}>Loading list...</div>;
  }

  return (
    <div style={{ paddingTop: '60px', maxWidth: 600, margin: '0 auto' }}>
      <h1>{list.name}</h1>
      <h2>Films in this list</h2>
      {(!list.films || list.films.length === 0) ? (
        <p>No films in this list.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.films.map(film => (
            <li
              key={film.id}
              style={{
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={e => {
                if (e.target.tagName !== 'BUTTON') {
                  navigate(`/film/${film.id}`);
                }
              }}
            >
              <div>
                <strong>{film.title}</strong>
                <div>{film.description}</div>
                <div>Release Date: {film.release_date}</div>
              </div>
              {currentUserId && currentUserId === list.user_id && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveFilm(film.id);
                  }}
                  style={{
                    marginLeft: '20px',
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListPage;