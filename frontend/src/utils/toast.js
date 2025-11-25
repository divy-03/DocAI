import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#a6e3a1', // mocha-green
        color: '#11111b', // mocha-crust
        fontWeight: '500',
        borderRadius: '0.75rem',
        padding: '1rem',
      },
    });
  },
  
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f38ba8', // mocha-red
        color: '#11111b', // mocha-crust
        fontWeight: '500',
        borderRadius: '0.75rem',
        padding: '1rem',
      },
    });
  },
  
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#89b4fa', // mocha-blue
        color: '#11111b', // mocha-crust
        fontWeight: '500',
        borderRadius: '0.75rem',
        padding: '1rem',
      },
    });
  },
  
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: 'top-right',
        style: {
          borderRadius: '0.75rem',
          padding: '1rem',
        },
        success: {
          style: {
            background: '#a6e3a1',
            color: '#11111b',
          },
        },
        error: {
          style: {
            background: '#f38ba8',
            color: '#11111b',
          },
        },
        loading: {
          style: {
            background: '#89b4fa',
            color: '#11111b',
          },
        },
      }
    );
  },
};
