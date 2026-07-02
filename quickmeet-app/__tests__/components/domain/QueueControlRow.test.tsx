import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueueControlRow } from '../../../src/components/domain/QueueControlRow';
import { Booking } from '../../../src/api/bookings.api';

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const MockView = (props: any) => <View {...props} />;
  MockView.displayName = 'AnimatedComponent';
  return {
    __esModule: true,
    default: {
      View: MockView,
      Text: MockView,
      createAnimatedComponent: (c: any) => c,
    },
    FadeIn: { duration: jest.fn().mockReturnThis() },
    FadeOut: { duration: jest.fn().mockReturnThis() },
    Layout: { springify: jest.fn().mockReturnThis() },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
  };
});
describe('QueueControlRow', () => {
  const mockQueueData = {
    bookingId: '1',
    userId: 'user1',
    position: 1,
    etaMinutes: 5,
    status: 'WAITING' as const
  };

  it('renders user details and queue position', async () => {
    const { getByText } = await render(
      <QueueControlRow item={mockQueueData as any} isNext={true} onCallNext={() => {}} onNoShow={() => {}} isProcessing={false} />
    );
    expect(getByText(/User USER/i)).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('calls onCallNext when Serve Next is pressed', async () => {
    const onCallNextMock = jest.fn();
    const { getByTestId } = await render(
      <QueueControlRow item={mockQueueData as any} isNext={true} onCallNext={onCallNextMock} onNoShow={() => {}} isProcessing={false} />
    );
    fireEvent.press(getByTestId('call-next-button'));
    expect(onCallNextMock).toHaveBeenCalledTimes(1);
  });

  it('calls onNoShow when No Show is pressed', async () => {
    const onNoShowMock = jest.fn();
    const { getByTestId } = await render(
      <QueueControlRow item={mockQueueData as any} isNext={true} onCallNext={() => {}} onNoShow={onNoShowMock} isProcessing={false} />
    );
    fireEvent.press(getByTestId('no-show-button'));
    expect(onNoShowMock).toHaveBeenCalledTimes(1);
  });
});
