import {useNavigate} from 'react-router-dom';
import {authService} from '../services/auth.service';
import {useDeleteAccount, useFetchUserInfo, usePromoteAdmin} from "../hooks/useUsers.ts";
import InfoField from "../components/InfoField.tsx";


function Profile() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isDev = import.meta.env.DEV;

  const { data: userInfo, isLoading, isError, error } = useFetchUserInfo(user?.id)
  const { mutate: promoteAdmin, isPending: promoteLoading, isError: promoteError } = usePromoteAdmin();
  const { mutate: deleteAccount } = useDeleteAccount();

  const handleDeleteAccount = () => {
    if (user && window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (isError || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error + 'Failed to load profile'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

          <div className="space-y-4 mb-8">
            <InfoField labelName="First Name" labelValue={userInfo.firstName}/>
            <InfoField labelName="Last Name" labelValue={userInfo.lastName}/>
            <InfoField labelName="Email" labelValue={userInfo.email}/>
            <div className="border-b pb-4">
              <label className="block text-gray-600 text-sm font-semibold mb-1">
                Account Type
              </label>
              <p className="text-lg text-gray-800">
                {userInfo.admin ? (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Administrator
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    User
                  </span>
                )}
              </p>
              {isDev && !userInfo.admin && (
                <div className="mt-3">
                  <button
                    onClick={() => promoteAdmin()}
                    disabled={promoteLoading}
                    className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {promoteLoading ? 'Promoting...' : 'Promote to Admin (Dev)'}
                  </button>
                  {promoteError && (
                    <div className="mt-2 text-sm text-red-600">Failed to promote to admin</div>
                  )}
                </div>
              )}
            </div>
            <InfoField labelName="Member Since" labelValue={
              new Date(userInfo.createdAt).toLocaleDateString('en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
              )}/>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/sessions')}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Back to Sessions
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
