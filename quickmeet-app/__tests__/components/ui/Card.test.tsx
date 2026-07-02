import React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from '../../../src/components/ui/Card';
import { Text } from 'react-native';

describe('Card Component', () => {
  it('renders children correctly', async () => {
    const { getByText } = await render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('applies custom className', async () => {
    const { getByTestId } = await render(
      <Card testID="my-card" className="bg-red-500" />
    );
    const card = getByTestId('my-card');
    // Using testID to query the component, we verify it doesn't crash with className
    expect(card).toBeTruthy();
  });
});
