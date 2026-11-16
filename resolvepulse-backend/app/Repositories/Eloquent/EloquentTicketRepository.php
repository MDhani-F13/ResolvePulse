<?php

namespace App\Repositories\Eloquent;

use App\Models\Ticket;
use App\Models\TicketAuditLog;
use App\Repositories\Contracts\TicketRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentTicketRepository
 * Concrete Eloquent ORM implementation of the repository contract.
 */
class EloquentTicketRepository implements TicketRepositoryInterface
{
    public function all(array $filters = []): Collection
    {
        $query = Ticket::query()->with('auditLogs');

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['tier']) && $filters['tier'] !== 'all') {
            $query->where('tier', $filters['tier']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', $search)
                  ->orWhere('title', 'like', $search)
                  ->orWhere('customer_name', 'like', $search)
                  ->orWhere('customer_email', 'like', $search);
            });
        }

        return $query->orderByRaw("
            CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
                ELSE 5
            END
        ")
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int|string $id): ?Ticket
    {
        return Ticket::with('auditLogs')->where('id', $id)
            ->orWhere('ticket_number', $id)
            ->first();
    }

    public function create(array $attributes): Ticket
    {
        return Ticket::create($attributes);
    }

    public function update(int|string $id, array $attributes): ?Ticket
    {
        $ticket = $this->findById($id);
        if (!$ticket) {
            return null;
        }

        $ticket->update($attributes);
        return $ticket->fresh(['auditLogs']);
    }

    public function delete(int|string $id): bool
    {
        $ticket = $this->findById($id);
        if (!$ticket) {
            return false;
        }

        return (bool) $ticket->delete();
    }

    public function createAuditLog(array $attributes): TicketAuditLog
    {
        return TicketAuditLog::create($attributes);
    }

    public function getMetrics(): array
    {
        $total = Ticket::count();
        $open = Ticket::where('status', 'open')->count();
        $inProgress = Ticket::where('status', 'in_progress')->count();
        $escalated = Ticket::where('status', 'escalated')->count();
        $resolved = Ticket::whereIn('status', ['resolved', 'closed'])->count();

        // Breached: Due date in past and not yet resolved/closed
        $breached = Ticket::whereNotIn('status', ['resolved', 'closed'])
            ->where('sla_due_at', '<', now())
            ->count();

        // Warning: Due date within next 2 hours
        $warning = Ticket::whereNotIn('status', ['resolved', 'closed'])
            ->where('sla_due_at', '>=', now())
            ->where('sla_due_at', '<=', now()->addHours(2))
            ->count();

        return compact('total', 'open', 'inProgress', 'escalated', 'resolved', 'breached', 'warning');
    }
}
