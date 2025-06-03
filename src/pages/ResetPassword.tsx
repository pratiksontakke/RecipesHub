
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('ResetPassword component mounted');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    const handlePasswordReset = async () => {
      try {
        // Get the hash fragment from the URL (this is where Supabase puts the tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));
        
        // Also check search params (sometimes tokens are here)
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        
        console.log('Extracted tokens:', { 
          accessToken: accessToken ? 'found' : 'missing', 
          refreshToken: refreshToken ? 'found' : 'missing', 
          type 
        });
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Valid recovery tokens found, setting session...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          console.log('Session set result:', { session: !!data.session, error });
          
          if (data.session && !error) {
            setIsValidSession(true);
            console.log('Valid session established for password reset');
          } else {
            console.error('Failed to establish session:', error);
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          console.log('Missing required tokens or invalid type');
          setError('Invalid reset link. Please request a new password reset from the login page.');
        }
      } catch (err) {
        console.error('Error processing reset link:', err);
        setError('Invalid reset link. Please request a new password reset from the login page.');
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordReset();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset form submitted');
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!isValidSession) {
      setError('Invalid session. Please request a new password reset.');
      return;
    }

    setIsLoading(true);
    console.log('Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      console.log('Password update result:', { error });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
      } else {
        console.log('Password updated successfully');
        setSuccess('Password updated successfully! Redirecting to login...');
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });
        
        // Sign out to ensure clean state and redirect to login
        await supabase.auth.signOut();
        
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-4">
            <ChefHat className="h-8 w-8" />
            <span className="text-xl font-bold">RecipeHub</span>
          </Link>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Lock className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {success ? 'Password Updated!' : 'Reset Your Password'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {success 
                ? 'Your password has been successfully updated.' 
                : 'Enter your new password below to complete the reset process.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!success && isValidSession && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    showPasswordToggle={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    showPasswordToggle={true}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !password || !confirmPassword}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
