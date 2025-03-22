import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UrlList = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5001/api';
  const SHORTENER_BASE_URL = 'http://localhost:5001';

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      // If there's no token, set a custom error message and stop loading
      setError('You must be logged in to view your URLs. Please log in or register.');
      setLoading(false);
      return;
    }
    const fetchUrls = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/urls`, {
          headers: { 'x-auth-token': token }
        });
        setUrls(res.data);
      } catch (err) {
        setError('Failed to fetch URLs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateUrl = (url, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  if (loading) {
    return <div className="loading">Loading URLs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="url-list-container">
      <h2>Your Shortened URLs</h2>
      
      {urls.length === 0 ? (
        <p className="no-urls">You haven't shortened any URLs yet.</p>
      ) : (
        <table className="url-table">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short URL</th>
              <th>Created</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url) => (
              <tr key={url._id}>
                <td>
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={url.originalUrl}
                  >
                    {truncateUrl(url.originalUrl)}
                  </a>
                </td>
                <td>
                  <a
                    href={`${SHORTENER_BASE_URL}/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${SHORTENER_BASE_URL}/${url.shortCode}`}
                  </a>
                </td>
                <td>{formatDate(url.createdAt)}</td>
                <td>{url.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UrlList;