import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../components/Common/Button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Access Denied
        </h1>
        
        <p className="mt-4 text-gray-600">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="mt-8">
          <Button
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;