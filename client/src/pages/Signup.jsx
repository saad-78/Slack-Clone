import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};

    if (!username || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }

    if (!email) {
      errors.email = 'Email is required.';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const result = await signup(username, email, password);

    if (result?.success === false) {
      setFormError(result.message || 'Signup failed');
      if (result.errors) setFieldErrors(result.errors);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className={`mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm ${
                fieldErrors.username
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-primary'
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. saad_khan"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className={`mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm ${
                fieldErrors.email
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-primary'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="[email protected]"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className={`mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm ${
                fieldErrors.password
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-primary'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Global error */}
          {formError && (
            <p className="text-sm text-red-500 text-center mt-1">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition text-sm font-medium"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
