import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MultiStepOnboarding from '../../components/forms/MultiStepOnboarding';
import { useAuthStore } from '../../store/authStore';

const OnboardClient: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!userId) {
    return (
      <div className="p-8 text-center bg-danger/5 text-danger rounded-xl">
        Error: User ID is required to perform onboarding.
      </div>
    );
  }

  const handleComplete = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/users');
    } else {
      navigate('/manager/clients');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <MultiStepOnboarding 
        userId={userId} 
        title="Administrative Client Onboarding" 
        onComplete={handleComplete} 
      />
    </div>
  );
};

export default OnboardClient;
