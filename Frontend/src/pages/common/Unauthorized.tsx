import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-danger/10 rounded-full">
            <ShieldAlert className="text-danger" size={64} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-text-primary mb-4">Access Restricted</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Oops! You don't have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>

        <div className="flex flex-col space-y-3">
          <Link to="/login">
            <Button variant="primary" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" className="w-full">
              Sign in as Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
