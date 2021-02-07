import { Publisher, Subjects, TicketUpdatedEvent } from "@leintickets/common";


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}