"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('applicant');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - replace with actual auth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      router.push(role === 'applicant' ? '/dashboard/applicant' : '/dashboard/hr');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground">
              Alexander<span className="text-accent">.Ai</span>
            </span>
          </Link>

          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to continue to your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">I am a</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="applicant" id="applicant" />
                  <Label htmlFor="applicant" className="cursor-pointer">Job Seeker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hr" id="hr" />
                  <Label htmlFor="hr" className="cursor-pointer">HR Professional</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link href="/signup/applicant" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
            AI-Powered Hiring
          </h2>
          <p className="text-primary-foreground/70">
            Experience the future of recruitment with intelligent matching and comprehensive analytics.
          </p>
        </div>
      </div>
    </div>
  );
}


