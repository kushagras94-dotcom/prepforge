import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function History() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interview/history');
        setTranscripts(res.data.transcripts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load history');
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Interview History</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && transcripts.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No interviews yet.{' '}
            <Link to="/interview" className="text-blue-600 hover:underline">
              Start your first one.
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {transcripts.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-gray-800">
                  {t.targetRole}
                  {t.targetCompany ? ` @ ${t.targetCompany}` : ''}
                </h2>
                <p className="text-sm text-gray-500">
                  {t.difficulty || 'Medium'} difficulty &middot;{' '}
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    t.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {t.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
                {t.status === 'completed' && (
                  <Link
                    to={`/scorecard/${t._id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Scorecard
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}