import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Scorecard() {
  const { transcriptId } = useParams();
  const [scorecard, setScorecard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await api.get(`/scorecard/${transcriptId}`);
        setScorecard(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load scorecard');
      }
    };
    fetchScorecard();
  }, [transcriptId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading scorecard...</p>
      </div>
    );
  }

  const { scores, overallFeedback, strengths, areasToImprove } = scorecard;

  const ScoreBar = ({ label, value }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Interview Scorecard</h1>

        <ScoreBar label="Communication" value={scores.communication} />
        <ScoreBar label="Technical Accuracy" value={scores.technicalAccuracy} />
        <ScoreBar label="Problem Solving" value={scores.problemSolving} />
        <ScoreBar label="Confidence" value={scores.confidence} />

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2">Overall Feedback</h2>
          <p className="text-gray-700">{overallFeedback}</p>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2 text-green-700">Strengths</h2>
          <ul className="list-disc list-inside text-gray-700">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2 text-orange-700">Areas to Improve</h2>
          <ul className="list-disc list-inside text-gray-700">
            {areasToImprove.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        <Link
          to="/dashboard"
          className="block text-center mt-8 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}