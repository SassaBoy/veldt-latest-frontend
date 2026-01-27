import React from "react";
import { AuthProvider } from "./context/AuthContext";
import StackNavigator from "./navigation/StackNavigator";

// Completely removed SplashScreen and appIsReady logic
export default function App() {
  return (
    <AuthProvider>
      <StackNavigator />
    </AuthProvider>
  );
}