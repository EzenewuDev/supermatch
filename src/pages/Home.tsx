import { Link } from "react-router";
import { ArrowRight, BookOpen, Users, Zap, CheckCircle2, GraduationCap } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-indigo-950 dark:text-indigo-50">Supermatch</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Link to="/login" className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/campus.png')] bg-cover bg-center bg-no-repeat opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 dark:from-indigo-950/80 via-white dark:via-slate-950 to-white dark:to-slate-950 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Revolutionizing Academic Matching
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">academic match</span> in seconds.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Supermatch is the ultimate platform for students and supervisors to connect, collaborate, and create groundbreaking research together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900 flex items-center justify-center gap-2 group"
              >
                Start for free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-md flex items-center justify-center"
              >
                Sign in to account
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
            <img 
              src="/images/campus.png" 
              alt="University Campus" 
              className="rounded-2xl w-full object-cover shadow-sm h-[400px] md:h-[600px]"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">Our platform is designed to make the allocation process seamless, fair, and efficient for everyone involved.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Matching</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our advanced algorithm ensures optimal pairing between students and supervisors based on research interests and capacity.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 transition-all duration-300">
                <BookOpen className="w-7 h-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Project Management</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Keep track of project milestones, submissions, and feedback all in one centralized dashboard.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300">
                <Zap className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Updates</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Stay informed with instant notifications about allocation status, message replies, and approaching deadlines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image & Text Section */}
      <section id="how-it-works" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Empowering the next generation of researchers
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                We believe that the best research comes from the best partnerships. Supermatch eliminates the friction of finding the right supervisor, so you can focus on what truly matters: making an impact.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Streamlined preference selection',
                  'Fair and transparent allocation',
                  'Direct communication channels',
                  'Comprehensive reporting tools'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="mt-10">
                <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 group">
                  Learn more about our process
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 dark:from-indigo-900/50 to-violet-100 dark:to-violet-900/50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
              <img 
                src="/images/students.png" 
                alt="Students collaborating" 
                className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950"></div>
        <div className="absolute inset-0 bg-[url('/images/campus.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to find your match?</h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Join thousands of students and supervisors already using Supermatch to streamline their academic journey.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Create your free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-xl text-slate-900 dark:text-white">Supermatch</span>
            </div>
            <div className="flex gap-6 text-slate-500 dark:text-slate-400 text-sm">
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Support</a>
            </div>
            <div className="text-slate-400 dark:text-slate-500 text-sm">
              © {new Date().getFullYear()} Supermatch. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
