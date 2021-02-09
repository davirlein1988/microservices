import { Subjects, Publisher, PaymentCreatedEvent } from "@leintickets/common"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}