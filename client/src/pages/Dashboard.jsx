import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <button onClick={logout} className="text-red-500 hover:underline">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Ready to practice?</h2>
          <p className="text-gray-600 mb-6">
            Start a mock interview and get instant AI-powered feedback.
          </p>
          <Link
            to="/interview"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Start Mock Interview
          </Link>
        </div>
      </div>
    </div>
  );
}