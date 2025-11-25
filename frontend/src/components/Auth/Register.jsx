import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { showToast } from '../../utils/toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      showToast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      showToast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      showToast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const errorMsg = error || 'Registration failed';
      setFormError(errorMsg);
      showToast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mocha-base dark:bg-mocha-base light:bg-latte-base px-4">
      <div className="max-w-md w-full space-y-8 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle p-8 rounded-2xl shadow-xl border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
            Start creating AI-powered documents
          </p>
        </div>
        
        {(formError || error) && (
          <div className="bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red px-4 py-3 rounded-lg text-sm">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
              placeholder="johndoe"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-mocha-crust dark:text-mocha-crust light:text-latte-base bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:ring-offset-mocha-base dark:focus:ring-offset-mocha-base light:focus:ring-offset-latte-base font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-5 h-5 border-2"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve hover:text-mocha-lavender dark:hover:text-mocha-lavender light:hover:text-latte-lavender"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
