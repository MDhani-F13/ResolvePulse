<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class TicketPolicy
 * Single Responsibility: Authorization rules for Ticket actions.
 * Enforces Role-Based Access Control (RBAC) across Customer, Support Engineer, and Lead Admin.
 */
class TicketPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->isLeadAdmin() || $user->isSupportEngineer()) {
            return true;
        }
        return strtolower($ticket->customer_email) === strtolower($user->email);
    }

    public function create(User $user): bool
    {
        return true; // Any authenticated user can create an incident
    }

    public function updateStatus(User $user, Ticket $ticket, string $targetStatus): bool
    {
        if ($user->isCustomer()) {
            return false;
        }

        if ($user->isLeadAdmin()) {
            return true;
        }

        if ($user->isSupportEngineer()) {
            // Engineers can advance open -> in_progress -> resolved, but only admins close
            return $targetStatus !== 'closed';
        }

        return false;
    }

    public function escalate(User $user, Ticket $ticket, string $targetTier): bool
    {
        if ($user->isCustomer()) {
            return false;
        }

        if ($user->isLeadAdmin()) {
            return true; // Admins can authorize any tier
        }

        if ($user->isSupportEngineer()) {
            // Engineers can escalate to Tier 2, but Tier 3 SRE requires Lead Admin
            return $targetTier === 'tier_2';
        }

        return false;
    }

    public function assign(User $user, Ticket $ticket): bool
    {
        return !$user->isCustomer();
    }

    public function addNote(User $user, Ticket $ticket): bool
    {
        return true;
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->isLeadAdmin();
    }
}
