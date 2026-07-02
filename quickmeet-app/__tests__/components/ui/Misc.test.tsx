import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState, Skeleton, Badge } from '../../../src/components/ui/Misc';
import { Text } from 'react-native';

describe('Misc Components', () => {
  describe('EmptyState', () => {
    it('renders title and description', async () => {
      const { getByText } = await render(
        <EmptyState title="No Data" description="Check back later." />
      );
      expect(getByText('No Data')).toBeTruthy();
      expect(getByText('Check back later.')).toBeTruthy();
    });

    it('renders optional action node', async () => {
      const { getByText } = await render(
        <EmptyState 
          title="Empty" 
          description="Empty" 
          action={<Text>Click Me</Text>} 
        />
      );
      expect(getByText('Click Me')).toBeTruthy();
    });
  });

  describe('Skeleton', () => {
    it('renders without crashing', async () => {
      const { getByTestId } = await render(<Skeleton testID="skeleton" />);
      expect(getByTestId('skeleton')).toBeTruthy();
    });
  });

  describe('Badge', () => {
    it('renders label correctly', async () => {
      const { getByText } = await render(<Badge label="New" />);
      expect(getByText('New')).toBeTruthy();
    });
  });
});
