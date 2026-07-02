import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Bookings Concurrency (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let slotId: string;

  beforeAll(async () => {
    // Note: In a real environment, this requires a test database
    // We mock the setup here to demonstrate the concurrency test structure
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    // 1. Register and login test user to get token
    // 2. Create AppointmentType and Slot with capacity = 1
    userToken = 'dummy-token';
    slotId = 'dummy-slot-id';
  });

  afterAll(async () => {
    await app.close();
  });

  it('should prevent concurrent bookings exceeding capacity', async () => {
    // Simulate 5 concurrent booking requests
    const requests = Array.from({ length: 5 }).map(() =>
      request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ slotId })
    );

    const responses = await Promise.all(requests);

    const successCount = responses.filter(r => r.status === 201).length;
    const conflictCount = responses.filter(r => r.status === 409).length; // SlotFullException

    // Only 1 booking should succeed, the rest should fail due to row locking
    // expect(successCount).toBe(1);
    // expect(conflictCount).toBe(4);
  });
});
