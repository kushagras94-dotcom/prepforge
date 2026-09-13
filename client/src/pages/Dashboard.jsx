import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/scorecard/analytics');
        setAnalytics(res.data);
      } catch (err) {
        // silently ignore — analytics is a nice-to-have, not critical
      }
    };
    fetchAnalytics();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">PrepForge</h1>
        <div className="flex items-center gap-4">
          <Link to="/history" className="text-gray-600 hover:text-blue-600 text-sm">
            History
          </Link>
          <Link to="/resume" className="text-gray-600 hover:text-blue-600 text-sm">
            Resume
          </Link>
          <span className="text-gray-600">Hi, {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:underline text-sm">
            Logout
          </button>
        </div>
        
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-md p-10 text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Ready for your next interview?</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Practice with an AI interviewer that adapts to your answers, then get
            instant, detailed feedback on your performance.
          </p>
          <Link
            to="/interview"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Start Mock Interview
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Adaptive Questions</h3>
            <p className="text-sm text-gray-600">
              Follow-ups based on your actual answers, not a fixed script.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Detailed Scoring</h3>
            <p className="text-sm text-gray-600">
              Communication, technical depth, problem solving, and confidence.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant Feedback</h3>
            <p className="text-sm text-gray-600">
              Get strengths and areas to improve right after your interview.
            </p>
          </div>
        </div>
      
      {analytics && analytics.count > 0 && (
          <div className="mt-10 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Progress</h2>

            <p className="text-sm text-gray-500 mb-6">
              Based on {analytics.count} completed interview{analytics.count > 1 ? 's' : ''}
            </p>

            <h3 className="text-sm font-semibold text-gray-600 mb-2">Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="interview" label={{ value: 'Interview #', position: 'insideBottom', offset: -5 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="communication" stroke="#3b82f6" name="Communication" />
                <Line type="monotone" dataKey="technicalAccuracy" stroke="#10b981" name="Technical" />
                <Line type="monotone" dataKey="problemSolving" stroke="#f59e0b" name="Problem Solving" />
                <Line type="monotone" dataKey="confidence" stroke="#ef4444" name="Confidence" />
              </LineChart>
            </ResponsiveContainer>

            <h3 className="text-sm font-semibold text-gray-600 mb-2 mt-8">Average Scores</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { category: 'Communication', score: analytics.averages.communication },
                  { category: 'Technical', score: analytics.averages.technicalAccuracy },
                  { category: 'Problem Solving', score: analytics.averages.problemSolving },
                  { category: 'Confidence', score: analytics.averages.confidence },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {analytics && analytics.count === 0 && (
          <div className="mt-10 bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
            Complete an interview to see your progress analytics here.
          </div>
        )}
        </div>
    </div>
  );
}