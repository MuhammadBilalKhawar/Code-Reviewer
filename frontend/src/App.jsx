import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground";
import { Button } from "./components/ui";
import { ErrorAlert } from "./components/ui/Alert";

function App() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get("error");
    if (errorMsg) {
      setError(errorMsg);
      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGitHubLogin = () => {
    const api =
      import.meta.env.VITE_API_URL || "https://code-review-szuc.onrender.com";
    window.location.href = `${api}/auth/github`;
  };

  const features = [
    {
      icon: "🔒",
      label: "Security",
      desc: "Vulnerability detection",
    },
    { 
      icon: "⚡", 
      label: "Performance", 
      desc: "Optimization tips" 
    },
    { 
      icon: "✨", 
      label: "Quality", 
      desc: "Code improvements" 
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header Logo Section */}
          <div className="text-center mb-16 animate-fadeIn">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div 
                className="p-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300" 
                style={{ 
                  background: 'linear-gradient(135deg, #C47A3A, #D4A574)',
                  boxShadow: '0 0 40px rgba(196, 122, 58, 0.5)' 
                }}
              >
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="#0F1F1C"
                >
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold" style={{ color: '#E8F1EE' }}>CodeReview</h1>
                <p className="text-lg mt-1" style={{ color: '#6DB1A2' }}>AI-Powered Analysis</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: '#9DBFB7' }}>
              Intelligent code review powered by Groq AI • Instant security & quality insights
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative backdrop-blur-md rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2"
                style={{ 
                  backgroundColor: 'rgba(23, 48, 42, 0.7)', 
                  border: '1px solid rgba(196, 122, 58, 0.2)',
                  overflow: 'hidden'
                }}
              >
                {/* Animated background on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(196, 122, 58, 0.1), rgba(109, 177, 162, 0.1))',
                    zIndex: -1
                  }}
                ></div>
                
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                <p className="font-bold text-lg mb-2" style={{ color: '#E8F1EE' }}>
                  {feature.label}
                </p>
                <p className="text-sm" style={{ color: '#9DBFB7' }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="space-y-4 mb-8">
            <Button
              onClick={handleGitHubLogin}
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(196, 122, 58, 0.15)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold" style={{ color: '#6DB1A2' }}>
                <span className="px-4" style={{ backgroundColor: 'rgba(15, 31, 28, 0.9)' }}>or explore demo</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              size="lg"
              className="w-full group"
            >
              <span className="group-hover:mr-2 transition-all">Try Demo Account</span>
              <span className="inline-block opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert 
              message={error}
              onClose={() => setError("")}
              className="mb-8"
            />
          )}

          {/* Footer Links */}
          <div className="text-center pt-8 border-t" style={{ borderColor: 'rgba(196, 122, 58, 0.1)' }}>
            <p className="text-xs mb-4" style={{ color: '#9DBFB7' }}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
            <div className="flex items-center justify-center gap-6">
              <a href="#" className="hover:text-amber-500 transition-colors text-xs" style={{ color: '#6DB1A2' }}>Documentation</a>
              <a href="#" className="hover:text-amber-500 transition-colors text-xs" style={{ color: '#6DB1A2' }}>GitHub</a>
              <a href="#" className="hover:text-amber-500 transition-colors text-xs" style={{ color: '#6DB1A2' }}>Support</a>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;
