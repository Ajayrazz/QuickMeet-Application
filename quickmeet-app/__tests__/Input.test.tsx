import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../src/components/ui/Input';

describe('Input', () => {
  it('renders label correctly', async () => {
    const { getByText } = await render(<Input label="Email Address" />);
    expect(getByText('Email Address')).toBeTruthy();
  });

  it('displays error message', async () => {
    const { getByText } = await render(<Input label="Email" error="Invalid email" />);
    expect(getByText('Invalid email')).toBeTruthy();
  });

  it('allows typing and updates value', async () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = await render(
      <Input placeholder="Type here..." onChangeText={onChangeTextMock} />
    );
    
    fireEvent.changeText(getByPlaceholderText('Type here...'), 'hello');
    expect(onChangeTextMock).toHaveBeenCalledWith('hello');
  });
});
