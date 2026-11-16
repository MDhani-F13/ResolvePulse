<?php

namespace App\Repositories\Contracts;

use App\Models\Ticket;
use App\Models\TicketAuditLog;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface TicketRepositoryInterface
 * Contract defining persistence operations, decoupling business logic from ORM.
 */
interface TicketRepositoryInterface
{
    public function all(array $filters = []): Collection;

    public function findById(int|string $id): ?Ticket;

    public function create(array $attributes): Ticket;

    public function update(int|string $id, array $attributes): ?Ticket;

    public function delete(int|string $id): bool;

    public function createAuditLog(array $attributes): TicketAuditLog;

    public function getMetrics(): array;
}
