import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@ddytickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
