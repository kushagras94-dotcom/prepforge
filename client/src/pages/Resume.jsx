import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function Resume() {
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get('/resume/me');
        setResume(res.data.resume);
      } catch (err) {
        // no resume uploaded yet — that's fine
      }
    };
    fetchResume();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await api.post('/resume/upload', formData);
      setResume(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Resume Analyzer</h1>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
        {error && <p className="text-red-600 mt-3">{error}</p>}

        {resume && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-700">Summary</h2>
              <p className="text-gray-600">{resume.summary}</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-700">Skills</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {resume.skills?.map((s, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-700">Experience</h2>
              <ul className="list-disc list-inside text-gray-600">
                {resume.experience?.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-gray-700">Projects</h2>
              <ul className="list-disc list-inside text-gray-600">
                {resume.projects?.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}