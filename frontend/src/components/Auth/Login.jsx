import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { showToast } from '../../utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login(formData.username, formData.password);
      showToast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      showToast.error(error || 'Login failed');
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
            Login to continue to your documents
          </p>
        </div>
        
        {error && (
          <div className="bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-mocha-crust dark:text-mocha-crust light:text-latte-base bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:ring-offset-mocha-base dark:focus:ring-offset-mocha-base light:focus:ring-offset-latte-base font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-5 h-5 border-2"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve hover:text-mocha-lavender dark:hover:text-mocha-lavender light:hover:text-latte-lavender"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
