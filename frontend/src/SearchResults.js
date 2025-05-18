import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SearchResults() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the search query from the URL
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    async function fetchSearchResults() {
      try {
        const response = await fetch(`https://backend-absolute-cinema.onrender.com/film/*`);
        const data = await response.json();

        // Filter results based on the query
        const filteredResults = data.filter((film) =>
          film.title.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filteredResults);
      } catch (err) {
        setError('Error fetching search results');
      }
    }

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const handleFilmClick = (id) => {
    navigate(`/film/${id}`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ paddingTop: '60px', textAlign: 'center' }}>
      <h1>Search Results for "{query}"</h1>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map((film) => (
            <li
              key={film.id}
              style={{
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={() => handleFilmClick(film.id)}
            >
              <h2>{film.title}</h2>
              <p>{film.description}</p>
              <p>Release Date: {film.release_date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchResults;