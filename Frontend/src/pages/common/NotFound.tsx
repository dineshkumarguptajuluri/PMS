import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-primary-blue/10 rounded-full">
            <SearchX className="text-primary-blue" size={64} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-text-secondary mb-4">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link to="/">
          <Button variant="primary" className="px-8">
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
