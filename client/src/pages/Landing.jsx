import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Globe,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import heroImage from '../assets/hero.png';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="GramSeva Logo" className="h-10 w-auto rounded-lg shadow-sm" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                GramSeva
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
              <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login/citizen" className="text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors px-2">
                Citizen
              </Link>
              <Link to="/login/authority" className="text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors border-l border-gray-200 pl-2 sm:pl-4">
                Authority
              </Link>
              <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-200 ml-1">
                Join
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Empowering Rural Governance</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                Bridging the Gap Between <span className="text-emerald-600">Citizens</span> and <span className="text-teal-600">Administration.</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                GramSeva is a modern digital platform designed to simplify local governance. Report issues, stay updated, and participate in your community's growth—all in one place.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 group active:scale-95">
                Get Started for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login/citizen" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl text-lg font-bold border-2 border-gray-100 transition-all flex items-center justify-center active:scale-95">
                Login
              </Link>
            </div>
            </div>

            <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/50 to-teal-100/50 blur-3xl rounded-[3rem]"></div>
              <img 
                src={heroImage} 
                alt="GramSeva Digital Governance" 
                className="relative rounded-3xl shadow-2xl border border-gray-100 w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-base font-bold text-emerald-600 uppercase tracking-widest">Our Core Features</h2>
            <p className="text-4xl lg:text-5xl font-extrabold text-gray-900">Everything you need to stay connected.</p>
            <p className="text-lg text-gray-500">Powerful tools designed for transparency, speed, and ease of use.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="Grievance Reporting"
              description="Report local issues like water supply, roads, or electricity instantly with photo evidence and location tracking."
              color="emerald"
            />
            <FeatureCard 
              icon={<Bell className="w-6 h-6" />}
              title="Official Announcements"
              description="Get real-time updates directly from your ward members and higher authorities regarding local development."
              color="blue"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Track Progress"
              description="Stay informed about the status of your reported issues with transparent administrative feedback and tracking."
              color="teal"
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="MGNREGA Services"
              description="Seamlessly apply for and track your MGNREGA employment requests and work status digitally."
              color="orange"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Community Pulse"
              description="Upvote and comment on issues that matter most to your ward, ensuring collective community action."
              color="indigo"
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6" />}
              title="Mobile First"
              description="Accessible on any device, ensuring that every citizen can connect with authorities regardless of where they are."
              color="rose"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                Simpler Governance, <br />
                <span className="text-emerald-600 text-5xl">Better Communities.</span>
              </h2>
              <p className="text-lg text-gray-600">
                We've simplified the process of interaction between citizens and authorities. No more physical queues or lost paperwork.
              </p>
              
              <div className="space-y-6">
                <Step 
                  number="01"
                  title="Create your Profile"
                  description="Register with your phone number and ward details to join your digital community."
                />
                <Step 
                  number="02"
                  title="Report or Request"
                  description="Submit grievances with photos or request services like MGNREGA employment."
                />
                <Step 
                  number="03"
                  title="Get Resolution"
                  description="Authorities review and act on your requests, keeping you updated every step of the way."
                />
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
               <div className="bg-emerald-600 rounded-[3rem] p-8 lg:p-12 text-white shadow-2xl relative z-10">
                  <h3 className="text-2xl font-bold mb-6">Transparency Matters</h3>
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-4 border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                          {i}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-white/30 rounded mb-2"></div>
                          <div className="h-2 w-full bg-white/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-6 bg-white text-gray-900 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase">Current Status</p>
                      <p className="font-extrabold">Issue Resolved Successfully</p>
                    </div>
                    <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                  </div>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20"></div>
            <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Ready to transform your village?
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of citizens who are already making a difference in their communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/20">
                  Register as Citizen
                </Link>
                <Link to="/login/authority" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-10 py-4 rounded-2xl font-bold text-lg transition-all">
                  Authority Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <img src="/logo.jpeg" alt="GramSeva Logo" className="h-8 w-auto rounded shadow-sm" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  GramSeva
                </span>
              </div>
              <p className="text-gray-500 max-w-sm leading-relaxed">
                Empowering every citizen with digital tools to improve rural governance and community services.
              </p>
              <div className="flex gap-4">
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Grievances</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Announcements</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">MGNREGA</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Statistics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2026 GramSeva. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <Globe size={14} /> <span>Available across 12 States in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
};

const Step = ({ number, title, description }) => (
  <div className="flex gap-6 group">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
      {number}
    </div>
    <div className="space-y-1">
      <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const SocialIcon = () => (
  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
    <div className="w-5 h-5 bg-current rounded-sm"></div>
  </div>
);

export default Landing;
