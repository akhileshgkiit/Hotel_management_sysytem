import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../context/AuthContext';
import { CheckCircle2, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in the URL.');
        return;
      }

      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          // Redirect to login after 4 seconds
          setTimeout(() => {
            navigate('/login');
          }, 4000);
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full text-center space-y-6">
          
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="h-14 w-14 text-primary-655 animate-spin mx-auto" />
              <h2 className="text-2xl font-bold">Verifying Your Account</h2>
              <p className="text-slate-500 text-sm">Please hold on while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100">Verification Successful!</h2>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">{message}</p>
              <p className="text-slate-500 text-xs">You will be automatically redirected to the login page shortly.</p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <span>Login Now</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold">Verification Failed</h2>
              <p className="text-red-605 text-sm">{message}</p>
              <p className="text-slate-500 text-xs">Please verify the link address or sign up again to receive a fresh verification link.</p>
              <div className="pt-4 flex flex-col space-y-2">
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  to="/"
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default VerifyEmail;
