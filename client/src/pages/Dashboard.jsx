import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">PrepForge</h1>
        <div className="flex items-center gap-4">
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
      </div>
    </div>
  );
}