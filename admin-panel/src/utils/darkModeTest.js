// Test script to verify dark mode is working
// Run this in browser console to test

export const testDarkMode = () => {
  console.log('Testing Dark Mode...');
  
  // Check if dark class exists
  const hasDarkClass = document.documentElement.classList.contains('dark');
  console.log('Dark class on HTML:', hasDarkClass);
  
  // Check localStorage
  const saved = localStorage.getItem('darkMode');
  console.log('localStorage darkMode:', saved);
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  console.log('System prefers dark:', prefersDark);
  
  // Toggle test
  const root = document.documentElement;
  root.classList.toggle('dark');
  console.log('Toggled dark class. Current state:', root.classList.contains('dark'));
  
  return {
    hasDarkClass,
    saved,
    prefersDark,
    currentState: root.classList.contains('dark')
  };
};

