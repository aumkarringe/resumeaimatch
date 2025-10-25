import { Link, useLocation } from "react-router-dom";
import { FileText, GitCompare, FileEdit, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Analyze Resume", icon: FileText },
    { path: "/compare", label: "Compare Resumes", icon: GitCompare },
    { path: "/builder", label: "Resume Builder", icon: FileEdit },
    { path: "/cover-letter", label: "Cover Letter", icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary p-2 rounded-lg">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">ResumeAI</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 rounded-lg transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm hidden md:inline">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent rounded-lg -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
