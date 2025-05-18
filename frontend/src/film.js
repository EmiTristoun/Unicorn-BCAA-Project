import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FilmPage({ id }) {
  const [film, setFilm] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [showAddToList, setShowAddToList] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [userNames, setUserNames] = useState({});
  const navigate = useNavigate();

  async function fetchReviews() {
    try {
      const response = await fetch(`https://backend-absolute-cinema.onrender.com/review/*?film_id=${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching reviews: ${response.statusText}`);
      }
      const data = await response.json();
      setReviews(data);

      const uniqueUserIds = [...new Set(data.map(r => r.user_id))];
      const names = {};
      await Promise.all(uniqueUserIds.map(async (userId) => {
        if (!userNames[userId]) {
          try {
            const res = await fetch(`https://backend-absolute-cinema.onrender.com/user/${userId}`);
            if (res.ok) {
              const userData = await res.json();
              names[userId] = userData.name;
            }
          } catch {}
        }
      }));
      setUserNames(prev => ({ ...prev, ...names }));

      if (data.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating((totalRating / data.length).toFixed(1));
      } else {
        setAverageRating(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    async function fetchFilm() {
      try {
        const response = await fetch(`https://backend-absolute-cinema.onrender.com/film/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching film: ${response.statusText}`);
        }
        const data = await response.json();
        setFilm(data);
      } catch (err) {
        setError(err.message);
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      setCurrentUserId(userId);

      fetch(`https://backend-absolute-cinema.onrender.com/list/*`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch lists'))
        .then(data => setUserLists(data.filter(list => list.user_id === userId)))
        .catch(() => setUserLists([]));
    }

    fetchFilm();
    fetchReviews();
  }, [id]);

  const handleAddToList = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!selectedListId) return;
    try {
      const response = await fetch(`https://backend-absolute-cinema.onrender.com/list/${selectedListId}/film`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ film_id: id }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
      alert('Film added to the list!');
      setShowAddToList(false);
      setSelectedListId('');
    } catch (err) {
      alert('Failed to add film to the list.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to submit a review.');
      return;
    }

    try {
      const response = await fetch('https://backend-absolute-cinema.onrender.com/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          film_id: id,
          rating,
          review: comment,
          user_id: JSON.parse(atob(token.split('.')[1])).id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setRating(1);
      setComment('');
      fetchReviews();
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`https://backend-absolute-cinema.onrender.com/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      alert('Review deleted successfully!');
      fetchReviews();
    } catch (err) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!film) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {isLoggedIn && (
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button
            onClick={() => setShowAddToList(!showAddToList)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showAddToList ? 'Cancel' : 'Add to List'}
          </button>
          {showAddToList && (
            <form onSubmit={handleAddToList} style={{ marginTop: 10, background: '#fff', padding: 10, borderRadius: 4, boxShadow: '0 2px 8px #ccc' }}>
              <select
                value={selectedListId}
                onChange={e => setSelectedListId(e.target.value)}
                required
                style={{ marginRight: 10, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select a list</option>
                {userLists.map(list => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
              <button
                type="submit"
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Add
              </button>
            </form>
          )}
        </div>
      )}

      <h1>{film.title}</h1>
      <p>{film.description}</p>
      <p>Release Date: {film.release_date}</p>

      <h2>Average Rating: {averageRating ? '★'.repeat(Math.round(averageRating)) : 'No ratings yet'}</h2>

      <h3>Reviews:</h3>
      {reviews.length === 0 ? (
        <p>No reviews available for this film.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reviews.map((review) => (
            <li
              key={review.id}
              style={{
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              <p>
                <strong>Rating:</strong> {'★'.repeat(review.rating)}
              </p>
              <p>
                <strong>Review:</strong> {review.review}
              </p>
              <p>
                <strong>By: </strong>
                <span
                  style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/profile/${review.user_id}`)}
                >
                  {userNames[review.user_id] || 'Loading...'}
                </span>
              </p>
              {isLoggedIn && currentUserId === review.user_id && (
                <div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isLoggedIn && (
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showReviewForm ? 'Cancel' : 'Add Review'}
        </button>
      )}

      {showReviewForm && (
        <form onSubmit={handleReviewSubmit} style={{ marginTop: '20px' }}>
          <div>
            <label>
              Rating:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ marginLeft: '10px' }}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '5px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                rows="4"
              />
            </label>
          </div>
          <button
            type="submit"
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}

export default FilmPage;