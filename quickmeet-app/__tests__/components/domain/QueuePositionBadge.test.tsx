import React from 'react';
import { render } from '@testing-library/react-native';
import { QueuePositionBadge } from '../../../src/components/domain/QueuePositionBadge';

describe('QueuePositionBadge', () => {
  it('renders position and eta when provided', async () => {
    const { getByText } = await render(<QueuePositionBadge position={3} eta={15} />);
    expect(getByText('3')).toBeTruthy();
    expect(getByText(/15/)).toBeTruthy();
  });

  it('renders unavailable state when position is null', async () => {
    const { getByText } = await render(<QueuePositionBadge position={null} eta={0} />);
    expect(getByText('Queue information unavailable')).toBeTruthy();
  });

  it('renders loading indicator when isLoading is true', async () => {
    const { getByTestId, queryByText } = await render(<QueuePositionBadge position={3} eta={15} isLoading={true} />);
    expect(queryByText('Your Position')).toBeNull();
  });
});
