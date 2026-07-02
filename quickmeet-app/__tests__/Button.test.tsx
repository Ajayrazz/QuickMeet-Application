import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/components/ui/Button';

describe('Button', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<Button label="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading is true', () => {
    const onPressMock = jest.fn();
    // Use testID to target the Pressable since text is hidden when loading
    const { getByTestId } = render(
      <Button label="Load" loading={true} onPress={onPressMock} testID="btn" />
    );
    
    fireEvent.press(getByTestId('btn'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
