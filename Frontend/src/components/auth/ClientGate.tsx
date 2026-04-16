import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ClientGateProps {
  children: React.ReactNode;
}

const ClientGate: React.FC<ClientGateProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Gate only applies to CLIENT role
  if (user.role !== 'CLIENT') {
    return <>{children}</>;
  }

  const isApproved = user.onboardingStatus === 'APPROVED';
  const isOnboardingPage = location.pathname === '/client/onboarding';

  if (!isApproved && !isOnboardingPage) {
    // Redirect unapproved clients to onboarding
    return <Navigate to="/client/onboarding" replace />;
  }

  if (isApproved && isOnboardingPage) {
    // Redirect already approved clients away from onboarding back to dashboard
    return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ClientGate;
