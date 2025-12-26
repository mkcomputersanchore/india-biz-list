import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePlatform } from '@/contexts/PlatformContext';
import { Building2, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const confirmPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'signup' | 'login-otp-verify' | 'signup-otp-verify' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn, sendLoginOtp, verifyLoginOtp, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  const { settings } = usePlatform();
  
  const initialMode = searchParams.get('mode') as AuthMode || 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode === 'reset-password' ? 'reset-password' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (searchParams.get('mode') === 'reset-password') {
      setMode('reset-password');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && mode !== 'reset-password') {
      navigate('/dashboard');
    }
  }, [user, navigate, mode]);

  // Handle signup - create account then send OTP
  const handleSignup = async () => {
    setErrors({});
    
    try {
      emailSchema.parse({ email });
      passwordSchema.parse({ password });
      confirmPasswordSchema.parse({ password, confirmPassword });
      
      if (!fullName.trim()) {
        setErrors({ fullName: 'Full name is required' });
        return;
      }
      
      setIsLoading(true);
      
      // First create the account
      const { error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered')) {
          toast({
            title: 'Account Exists',
            description: 'This email is already registered. Please login instead.',
            variant: 'destructive',
          });
          setMode('login');
        } else {
          toast({
            title: 'Error',
            description: signUpError.message,
            variant: 'destructive',
          });
        }
        return;
      }
      
      // Send OTP for verification
      const { error: otpError } = await sendLoginOtp(email);
      
      if (otpError) {
        toast({
          title: 'Account Created',
          description: 'Account created but could not send OTP. Please try logging in.',
        });
        setMode('login');
      } else {
        toast({
          title: 'OTP Sent!',
          description: 'Please check your email for the verification code.',
        });
        setMode('signup-otp-verify');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login - verify password then send OTP
  const handleLogin = async () => {
    setErrors({});
    
    try {
      emailSchema.parse({ email });
      passwordSchema.parse({ password });
      
      setIsLoading(true);
      
      // First verify credentials
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        toast({
          title: 'Error',
          description: signInError.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Credentials valid - now sign out and send OTP for 2FA
      // We need to sign out first because signIn succeeded
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }).catch(() => {});
      
      // Send OTP
      const { error: otpError } = await sendLoginOtp(email);
      
      if (otpError) {
        toast({
          title: 'Error',
          description: 'Could not send OTP. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'OTP Sent!',
          description: 'Please check your email for the verification code.',
        });
        setMode('login-otp-verify');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP for both login and signup
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await verifyLoginOtp(email, otpCode);
      
      if (error) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect or has expired.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'You have been logged in successfully.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    
    const { error } = await sendLoginOtp(email);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Could not resend OTP. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'OTP Sent!',
        description: 'A new verification code has been sent to your email.',
      });
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    setErrors({});
    
    try {
      emailSchema.parse({ email });
      setIsLoading(true);
      
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Link Sent!',
          description: 'Please check your email for the password reset link.',
        });
        setMode('login');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrors({});
    
    try {
      confirmPasswordSchema.parse({ password, confirmPassword });
      setIsLoading(true);
      
      const { error } = await updatePassword(password);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Updated!',
          description: 'Your password has been reset successfully.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderOtpVerify = (isSignup: boolean) => (
    <>
      <CardHeader className="text-center">
        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold">
            {settings?.app_name || 'Near India'}
          </span>
        </Link>
        <CardTitle className="font-display text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => setOtpCode(value)}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errors.otp && (
            <p className="text-sm text-destructive text-center">{errors.otp}</p>
          )}
          <Button 
            onClick={handleVerifyOtp} 
            className="w-full" 
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Didn't receive the code? Resend
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? 'signup' : 'login');
                setOtpCode('');
              }}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to {isSignup ? 'signup' : 'login'}
            </button>
          </div>
        </div>
      </CardContent>
    </>
  );

  const renderContent = () => {
    switch (mode) {
      case 'login-otp-verify':
        return renderOtpVerify(false);
        
      case 'signup-otp-verify':
        return renderOtpVerify(true);

      case 'forgot-password':
        return (
          <>
            <CardHeader className="text-center">
              <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold">
                  {settings?.app_name || 'Near India'}
                </span>
              </Link>
              <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <Button 
                  onClick={handleForgotPassword} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </button>
                </div>
              </div>
            </CardContent>
          </>
        );

      case 'reset-password':
        return (
          <>
            <CardHeader className="text-center">
              <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold">
                  {settings?.app_name || 'Near India'}
                </span>
              </Link>
              <CardTitle className="font-display text-2xl">Set New Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                <Button 
                  onClick={handleResetPassword} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'signup':
        return (
          <>
            <CardHeader className="text-center">
              <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold">
                  {settings?.app_name || 'Near India'}
                </span>
              </Link>
              <CardTitle className="font-display text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Sign up to list your business and manage your listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
                
                <Button 
                  onClick={handleSignup} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </>
        );

      default: // login
        return (
          <>
            <CardHeader className="text-center">
              <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold">
                  {settings?.app_name || 'Near India'}
                </span>
              </Link>
              <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to manage your business listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    Forgot your password?
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </CardContent>
          </>
        );
    }
  };

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          {renderContent()}
        </Card>
      </div>
    </Layout>
  );
}
