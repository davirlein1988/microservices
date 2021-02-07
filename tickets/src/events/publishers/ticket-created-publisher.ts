import { Publisher, Subjects, TicketCreatedEvent } from "@leintickets/common";


export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}