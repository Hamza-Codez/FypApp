import { Brain, Target, Zap, Shield, LineChart, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Resume Analysis',
    description: 'Our advanced AI analyzes resumes to find the perfect candidate-job match with unprecedented accuracy.',
  },
  {
    icon: Target,
    title: 'Smart Matching',
    description: 'Intelligent algorithms connect candidates with roles that match their skills, experience, and career goals.',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Get real-time analytics and insights on candidate pools, hiring trends, and recruitment performance.',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade security ensures your sensitive hiring data and candidate information stays protected.',
  },
  {
    icon: LineChart,
    title: 'Performance Metrics',
    description: 'Track and optimize your hiring process with comprehensive dashboards and actionable metrics.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Seamless collaboration tools for HR teams to review, discuss, and decide on candidates together.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to <span className="text-accent">Hire Smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed to transform your recruitment process from start to finish.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 md:p-8 rounded-xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
