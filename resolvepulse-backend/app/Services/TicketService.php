<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketAuditLog;
use App\Repositories\Contracts\TicketRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Service TicketService
 * Single Responsibility: Encapsulates business domain operations, state machine invariants,
 * and coordinates data persistence with the repository contract.
 */
class TicketService
{
    public function __construct(
        protected TicketRepositoryInterface $ticketRepository
    ) {}

    public function listTickets(array $filters = []): Collection
    {
        return $this->ticketRepository->all($filters);
    }

    public function getTicket(int|string $id): ?Ticket
    {
        $ticket = $this->ticketRepository->findById($id);
        if (!$ticket) {
            throw new NotFoundHttpException("Ticket {$id} was not found.");
        }
        return $ticket;
    }

    public function createTicket(array $data): Ticket
    {
        $now = now();
        $targetHours = SlaEvaluationService::getTargetHours($data['priority']);
        $slaDueAt = SlaEvaluationService::calculateDueDate($now, $data['priority']);

        // Generate sequential ticket number
        $nextNumber = 'TCK-' . (1000 + Ticket::count() + 1);

        $ticket = $this->ticketRepository->create([
            'ticket_number' => $nextNumber,
            'title' => trim($data['title']),
            'description' => trim($data['description']),
            'customer_name' => trim($data['customer_name']),
            'customer_email' => trim($data['customer_email']),
            'priority' => $data['priority'],
            'status' => 'open',
            'tier' => 'tier_1',
            'assigned_to' => $data['assigned_to'] ?? 'Unassigned',
            'assigned_email' => null,
            'sla_target_hours' => $targetHours,
            'sla_due_at' => $slaDueAt,
            'resolved_at' => null,
            'tags' => $data['tags'] ?? ['Support', 'General'],
        ]);

        $this->ticketRepository->createAuditLog([
            'ticket_id' => $ticket->id,
            'action' => 'created',
            'actor' => $data['customer_name'],
            'details' => "Incident submitted with {$ticket->priority} priority (SLA target: {$targetHours}h).",
        ]);

        return $ticket;
    }

    public function updateStatus(int|string $id, array $data): Ticket
    {
        $ticket = $this->getTicket($id);

        if ($ticket->status === $data['status']) {
            return $ticket;
        }

        if ($ticket->status === 'closed') {
            throw ValidationException::withMessages([
                'status' => 'Closed tickets cannot be modified or reopened.',
            ]);
        }

        if ($data['status'] === 'resolved' && $ticket->assigned_to === 'Unassigned') {
            throw ValidationException::withMessages([
                'status' => 'A ticket must be assigned to an engineer before being marked as resolved.',
            ]);
        }

        if ($data['status'] === 'closed' && $ticket->status !== 'resolved') {
            throw ValidationException::withMessages([
                'status' => 'Tickets must be verified in Resolved status before being closed.',
            ]);
        }

        $previousStatus = $ticket->status;
        $resolvedAt = $data['status'] === 'resolved' ? now() : $ticket->resolved_at;

        $updated = $this->ticketRepository->update($id, [
            'status' => $data['status'],
            'resolved_at' => $resolvedAt,
        ]);

        $this->ticketRepository->createAuditLog([
            'ticket_id' => $updated->id,
            'action' => 'status_changed',
            'actor' => $data['actor'],
            'from_state' => $previousStatus,
            'to_state' => $data['status'],
            'details' => !empty($data['reason']) ? "Status changed to {$data['status']}. Note: {$data['reason']}" : "Status transitioned from {$previousStatus} to {$data['status']}.",
        ]);

        return $updated;
    }

    public function escalateTicket(int|string $id, array $data): Ticket
    {
        $ticket = $this->getTicket($id);

        if (in_array($ticket->status, ['resolved', 'closed'])) {
            throw ValidationException::withMessages([
                'status' => 'Cannot escalate a resolved or closed ticket.',
            ]);
        }

        $previousTier = $ticket->tier;
        $previousStatus = $ticket->status;

        $updated = $this->ticketRepository->update($id, [
            'status' => 'escalated',
            'tier' => $data['target_tier'],
        ]);

        $this->ticketRepository->createAuditLog([
            'ticket_id' => $updated->id,
            'action' => 'escalated',
            'actor' => $data['actor'],
            'from_state' => "{$previousTier} ({$previousStatus})",
            'to_state' => "{$data['target_tier']} (escalated)",
            'details' => "Escalation Reason: {$data['reason']}",
        ]);

        return $updated;
    }

    public function assignTicket(int|string $id, array $data): Ticket
    {
        $ticket = $this->getTicket($id);
        $previousAssignee = $ticket->assigned_to;
        $nextStatus = $ticket->status === 'open' ? 'in_progress' : $ticket->status;

        $updated = $this->ticketRepository->update($id, [
            'assigned_to' => $data['assigned_to'],
            'assigned_email' => $data['assigned_email'] ?? strtolower(str_replace(' ', '.', $data['assigned_to'])) . '@resolvepulse.internal',
            'status' => $nextStatus,
        ]);

        $this->ticketRepository->createAuditLog([
            'ticket_id' => $updated->id,
            'action' => 'assigned',
            'actor' => $data['actor'],
            'from_state' => $previousAssignee,
            'to_state' => $data['assigned_to'],
            'details' => "Reassigned to {$data['assigned_to']}." . ($ticket->status === 'open' ? ' Status shifted to In Progress.' : ''),
        ]);

        return $updated;
    }

    public function addNote(int|string $id, array $data): TicketAuditLog
    {
        $ticket = $this->getTicket($id);

        return $this->ticketRepository->createAuditLog([
            'ticket_id' => $ticket->id,
            'action' => 'note_added',
            'actor' => $data['actor'],
            'details' => $data['note'],
        ]);
    }

    public function getMetrics(): array
    {
        return $this->ticketRepository->getMetrics();
    }
}
