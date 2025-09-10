import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch } from '../useAppDispatch';

// Mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      // Empty reducer for testing
    },
  });
};

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('useAppDispatch Hook', () => {
  it('should return a dispatch function', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    
    expect(typeof result.current).toBe('function');
    expect(result.current).toBeDefined();
  });

  it('should dispatch actions correctly', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    
    const mockAction = { type: 'TEST_ACTION', payload: 'test' };
    const dispatchResult = result.current(mockAction);
    
    expect(dispatchResult).toBeDefined();
  });

  it('should handle async actions', async () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    
    const asyncAction = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { type: 'ASYNC_ACTION', payload: 'async' };
    };
    
    const dispatchResult = result.current(asyncAction());
    expect(dispatchResult).toBeDefined();
  });

  it('should work with Redux Toolkit actions', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    
    const action = { type: 'TEST_ACTION', payload: { data: 'test' } };
    const dispatchResult = result.current(action);
    
    expect(dispatchResult).toBeDefined();
  });
}); 