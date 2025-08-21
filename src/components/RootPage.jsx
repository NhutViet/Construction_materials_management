import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page when accessing dashboard root
    navigate('/dashboard/home');
  }, [navigate]);

  return <div>Redirecting...</div>;
}
