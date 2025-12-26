"use client";

import { useState } from "react";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import {
  Search,
  Filter,
  ChevronDown,
  Mail,
  FileText,
  Star,
  Clock,
  GraduationCap,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Applicant } from "@/lib/types";

const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    skills: ["React", "TypeScript", "Node.js", "AWS"],
    matchScore: 96,
    experienceYears: 6,
    education: "M.S. Computer Science",
    appliedDate: "1 day ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "mchen@email.com",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    matchScore: 89,
    experienceYears: 4,
    education: "B.S. Software Engineering",
    appliedDate: "2 days ago",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    skills: ["JavaScript", "Vue.js", "GraphQL", "MongoDB"],
    matchScore: 84,
    experienceYears: 3,
    education: "B.S. Computer Science",
    appliedDate: "3 days ago",
  },
  {
    id: "4",
    name: "David Kim",
    email: "dkim@email.com",
    skills: ["React", "Redux", "Node.js", "Firebase"],
    matchScore: 78,
    experienceYears: 2,
    education: "Bootcamp Graduate",
    appliedDate: "4 days ago",
  },
];

const HRDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shortlisted, setShortlisted] = useState<string[]>([]);

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent";
    if (score >= 75) return "text-chart-3";
    return "text-muted-foreground";
  };

  return (
    <>
      <Head>
        <title>HR Dashboard - Alexander.Ai</title>
        <meta
          name="description"
          content="Review AI-matched candidates and manage your hiring pipeline efficiently."
        />
      </Head>

      <Layout>
        {/* Header */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold">
                  Candidate Pipeline
                </h1>
                <p className="text-muted-foreground">
                  {mockApplicants.length} candidates for Senior Developer position
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Total Applicants", value: mockApplicants.length },
                { label: "Shortlisted", value: shortlisted.length },
                { label: "Avg Match Score", value: "87%" },
                { label: "This Week", value: 12 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 bg-card rounded-lg border"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Applicants */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6">
              {mockApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className={`p-6 bg-card rounded-xl border transition-all ${
                    shortlisted.includes(applicant.id)
                      ? "border-accent shadow-gold"
                      : "hover:border-accent/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-lg font-semibold">
                            {applicant.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {applicant.email}
                          </p>
                        </div>

                        {shortlisted.includes(applicant.id) && (
                          <Badge className="bg-accent/10 text-accent">
                            <Star className="w-3 h-3 mr-1" />
                            Shortlisted
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {applicant.experienceYears} yrs
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {applicant.education}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {applicant.appliedDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-[140px] text-center space-y-2">
                      <div className={`text-3xl font-bold ${getScoreColor(applicant.matchScore)}`}>
                        {applicant.matchScore}%
                      </div>
                      <Progress value={applicant.matchScore} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={
                            shortlisted.includes(applicant.id)
                              ? "hero"
                              : "outline"
                          }
                          onClick={() => toggleShortlist(applicant.id)}
                        >
                          {shortlisted.includes(applicant.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More Candidates
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default HRDashboard;
