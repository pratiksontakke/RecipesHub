
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Lock, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const EmailVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or user object
  useEffect(() => {
    const email = location.state?.email || user?.email || '';
    setUserEmail(email);
    
    // If user is already verified, redirect to home
    if (user && user.email_confirmed_at) {
      navigate('/');
    }
  }, [user, location.state, navigate]);

  // Start cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'Enter' && otp.every(digit => digit !== '')) {
      handleVerifyOtp(otp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Auto-submit
      setTimeout(() => handleVerifyOtp(pastedData), 100);
    }
  };

  const handleVerifyOtp = async (otpCode: string = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otpCode,
        type: 'email'
      });

      if (error) {
        if (error.message.includes('expired')) {
          setError('Your OTP has expired. Please request a new one.');
        } else if (error.message.includes('invalid')) {
          setError('Invalid code. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('Your email is verified! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      });

      if (error) {
        setError('Failed to resend OTP. Please try again.');
      } else {
        setSuccess('New verification code sent to your email!');
        setResendCooldown(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a 6-digit verification code to:
              <br />
              <span className="font-medium text-gray-900">{userEmail}</span>
              <br />
              Please enter the code below to complete your registration.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input Fields */}
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
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

            {/* Verify Button */}
            <Button
              onClick={() => handleVerifyOtp()}
              disabled={!isOtpComplete || isVerifying}
              className="w-full"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  ✅ Verify Email
                </>
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <Button
                variant="outline"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend OTP (${resendCooldown}s)`
                ) : (
                  <>
                    🔁 Resend OTP
                  </>
                )}
              </Button>
            </div>

            {/* Change Email */}
            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
              >
                Change email address
              </Link>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <Lock className="h-3 w-3" />
              <span>Your email is only used for login and secure access. We never spam.</span>
            </div>

            {/* Support */}
            <div className="text-center">
              <a
                href="mailto:support@recipehub.com"
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Need help? Contact support
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
