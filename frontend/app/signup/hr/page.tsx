"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Mail, Lock, Building2, Phone, Users, DollarSign, Factory, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function SignupHR() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    phone: '',
    industry: '',
    teamSize: '',
    budgetRange: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to Alexander.Ai. Start building your dream team.",
      });
      router.push('/dashboard/hr');
    }, 1500);
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Other',
  ];

  const teamSizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+',
  ];

  const budgetRanges = [
    'Under $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000 - $500,000',
    '$500,000+',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
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
            Join as an HR Professional
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? 'Create your account to get started' : 'Tell us about your company'}
          </p>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
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

                <Button type="button" variant="hero" size="lg" className="w-full" onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateField('industry', value)}>
                    <SelectTrigger className="w-full">
                      <Factory className="w-5 h-5 text-muted-foreground mr-2" />
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry.toLowerCase()}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Size */}
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Select value={formData.teamSize} onValueChange={(value) => updateField('teamSize', value)}>
                    <SelectTrigger className="w-full">
                      <Users className="w-5 h-5 text-muted-foreground mr-2" />
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">Annual Hiring Budget (optional)</Label>
                  <Select value={formData.budgetRange} onValueChange={(value) => updateField('budgetRange', value)}>
                    <SelectTrigger className="w-full">
                      <DollarSign className="w-5 h-5 text-muted-foreground mr-2" />
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>
                  <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-center text-muted-foreground mt-4">
            <Link href="/signup/applicant" className="text-accent hover:underline text-sm">
              Looking for a job? Sign up as an applicant →
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <Building2 className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
            Build Your Dream Team
          </h2>
          <p className="text-primary-foreground/70">
            Access our AI-powered platform to find candidates that perfectly match your requirements.
          </p>
        </div>
      </div>
    </div>
  );
}


