import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => navigate('/sign-up')}
              className="font-medium text-primary hover:text-primary/90"
            >
              create a new account
            </button>
          </p>
        </div>
        <div className="mt-8">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-md rounded-lg',
                headerTitle: 'text-2xl font-bold',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formButtonPrimary: 'bg-primary hover:bg-primary/90',
                footerAction: 'text-gray-600',
                footerActionLink: 'text-primary hover:text-primary/90',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
} 