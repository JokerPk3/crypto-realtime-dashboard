import { redisPublisher, redisSubscriber } from '../config/redis';

// // Setup logic for tests
// beforeAll(() => {
//   // No database setup needed
// });

afterAll(async () => {
  redisPublisher.disconnect();
  redisSubscriber.disconnect();
});
