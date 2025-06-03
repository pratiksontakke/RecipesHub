
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onModeChange: (mode: 'signin' | 'signup' | 'reset') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in to RecipeHub.",
          });
          navigate('/');
        }
      } else if (mode === 'signup') {
        const { error, needsVerification } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else if (needsVerification) {
          setSuccess("Please check your email and click the confirmation link to verify your account!");
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to RecipeHub!",
          });
          navigate('/');
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Check your email for password reset instructions!");
          toast({
            title: "Reset link sent!",
            description: "Check your email for password reset instructions.",
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome back';
      case 'signup': return 'Join RecipeHub';
      case 'reset': return 'Reset password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account to continue cooking';
      case 'signup': return 'Create an account to start sharing recipes';
      case 'reset': return 'Enter your email to reset your password';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <ChefHat className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                showPasswordToggle={true}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => onModeChange('reset')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </button>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => onModeChange('signin')}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
