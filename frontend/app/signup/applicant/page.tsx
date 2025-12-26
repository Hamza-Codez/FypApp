"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Phone, Briefcase, GraduationCap, Link as LinkIcon, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function SignupApplicant() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    skills: '',
    experienceYears: '',
    education: '',
    portfolio: '',
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
        description: "Welcome to Alexander.Ai. Let's find your dream job.",
      });
      router.push('/dashboard/applicant');
    }, 1500);
  };

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
            Join as an Applicant
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? 'Create your account to get started' : 'Complete your professional profile'}
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
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
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
                {/* Skills */}
                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills</Label>
                  <Textarea
                    id="skills"
                    placeholder="e.g., JavaScript, React, Node.js, Python, Project Management"
                    value={formData.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.experienceYears}
                      onChange={(e) => updateField('experienceYears', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="education"
                      placeholder="Bachelor's in Computer Science"
                      value={formData.education}
                      onChange={(e) => updateField('education', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Portfolio */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio / LinkedIn (optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.portfolio}
                      onChange={(e) => updateField('portfolio', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Resume Upload Placeholder */}
                <div className="space-y-2">
                  <Label>Resume (optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop your resume or <span className="text-accent">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC up to 5MB</p>
                  </div>
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
            <Link href="/signup/hr" className="text-accent hover:underline text-sm">
              Are you an HR professional? Sign up here →
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
          <User className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-4">
            Find Your Dream Job
          </h2>
          <p className="text-primary-foreground/70">
            Our AI matches you with opportunities that align with your skills and career aspirations.
          </p>
        </div>
      </div>
    </div>
  );
}


