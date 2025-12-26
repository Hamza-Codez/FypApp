"use client";

import { useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import {
  Upload,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ResumeAnalysis } from "@/lib/types";

const mockAnalysis: ResumeAnalysis = {
  overallScore: 87,
  skillsMatch: 92,
  experienceMatch: 85,
  educationMatch: 78,
  highlights: [
    "Strong technical skills in React and TypeScript",
    "Excellent leadership experience",
    "5+ years in senior roles",
    "Relevant industry certifications",
  ],
  gaps: [
    "Limited cloud infrastructure experience",
    "No project management certification",
  ],
  recommendations: [
    "Consider AWS or Azure certification",
    "Highlight team leadership achievements more prominently",
    "Add quantifiable project outcomes",
  ],
};

const AIAssistant = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis(mockAnalysis);
    }, 2500);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(files.map((f) => f.name).slice(0, 2));
  };

  const ScoreRing = ({
    score,
    label,
    color,
  }: {
    score: number;
    label: string;
    color: string;
  }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset =
      circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {score}%
            </span>
          </div>
        </div>
        <span className="mt-2 text-sm text-muted-foreground">
          {label}
        </span>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>AI Resume Analyzer - Alexander.Ai</title>
        <meta
          name="description"
          content="Analyze resumes with AI-powered insights, skill matching, and personalized recommendations."
        />
      </Head>

      <Layout>
        {/* Hero */}
        <section className="py-16 md:py-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium">
                  AI-Powered Analysis
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Resume <span className="text-gradient-gold">Analyzer</span>
              </h1>

              <p className="text-lg text-primary-foreground/70">
                Upload resumes to get instant AI insights and recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* Main */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {!analysis && (
                <div className="mb-8">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-card hover:border-accent/50 transition cursor-pointer"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-serif text-xl font-semibold mb-2">
                      Upload Resumes
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Drag & drop or browse files
                    </p>
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="space-y-8 animate-fade-up">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-card rounded-xl border">
                    <ScoreRing
                      score={analysis.overallScore}
                      label="Overall"
                      color="hsl(var(--accent))"
                    />
                    <ScoreRing
                      score={analysis.skillsMatch}
                      label="Skills"
                      color="hsl(var(--chart-1))"
                    />
                    <ScoreRing
                      score={analysis.experienceMatch}
                      label="Experience"
                      color="hsl(var(--chart-3))"
                    />
                    <ScoreRing
                      score={analysis.educationMatch}
                      label="Education"
                      color="hsl(var(--chart-5))"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default AIAssistant;
