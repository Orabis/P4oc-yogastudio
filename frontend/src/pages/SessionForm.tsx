import { ChangeEvent, SubmitEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useSaveSession, useSession } from '../hooks/useSessions.ts';
import { useTeachers } from '../hooks/useTeachers.ts';
import { SessionFormData } from '../types';

function SessionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const isAdmin = authService.getCurrentUser()?.admin;

  const [edits, setEdits] = useState<Partial<SessionFormData>>({});
  const { data: teachers = [] } = useTeachers();
  const { data: session, isError: isSessionError } = useSession(id);
  const { mutate: saveSession, isPending, error: saveError } = useSaveSession(id);

  const error = saveError
    ? saveError.response?.data.message ?? 'Failed to save session'
    : isSessionError && 'Failed to load session';

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/sessions');
    }
  }, [isAdmin, navigate]);

  const formData: SessionFormData = {
    name: session?.name ?? '',
    date: session ? new Date(session.date).toISOString().split('T')[0] : '',
    description: session?.description ?? '',
    teacherId: session?.teacher.id ?? 0,
    ...edits,
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdits({
      ...edits,
      [name]: name === 'teacherId' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    saveSession(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {isEditMode ? 'Edit Session' : 'Create New Session'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Session Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Teacher
              </label>
              <select
                name="teacherId"
                value={formData.teacherId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isPending ? 'Saving...' : isEditMode ? 'Update Session' : 'Create Session'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/sessions')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SessionForm;
