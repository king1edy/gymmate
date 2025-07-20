// lib/utils/formatters.ts
// Data formatting utilities

export const formatters = {
    currency: (amount: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
    },
  
    date: (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      }).format(new Date(date));
    },
  
    time: (date: string | Date) => {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(date));
    },
  
    duration: (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    },
  
    percentage: (value: number, decimals = 1) => {
      return `${value.toFixed(decimals)}%`;
    },
  };
  