import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  // Initialize state from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Check if dark class is already on HTML (from inline script)
    const hasDarkClass = document.documentElement.classList.contains('dark');
    if (hasDarkClass) {
      return true;
    }
    
    // Check localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    
    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  });

  // Sync dark mode state with DOM and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Update DOM class
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Toggle function
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      
      // Update DOM immediately for instant feedback
      const root = document.documentElement;
      if (newValue) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Update localStorage immediately
      localStorage.setItem('darkMode', newValue.toString());
      
      return newValue;
    });
  };

  return { darkMode, toggleDarkMode };
};

