<?php

namespace App\Services;

use App\Models\Ticket;
use Carbon\Carbon;

/**
 * Service SlaEvaluationService
 * Single Responsibility: SLA target evaluation, countdown computing, and breach analysis.
 */
class SlaEvaluationService
{
    public static function getTargetHours(string $priority): int
    {
        return match (strtolower($priority)) {
            'urgent' => 2,
            'high' => 4,
            'medium' => 8,
            'low' => 24,
            default => 8,
        };
    }

    public static function calculateDueDate(Carbon|string $createdAt, string $priority): Carbon
    {
        $created = Carbon::parse($createdAt);
        return $created->addHours(self::getTargetHours($priority));
    }

    public static function evaluate(Ticket $ticket): array
    {
        $isCompleted = in_array($ticket->status, ['resolved', 'closed']);
        $referenceTime = ($isCompleted && $ticket->resolved_at) 
            ? Carbon::parse($ticket->resolved_at) 
            : Carbon::now();

        $createdTime = Carbon::parse($ticket->created_at);
        $dueTime = Carbon::parse($ticket->sla_due_at);

        $totalAllowedMinutes = max(1, $createdTime->diffInMinutes($dueTime, false));
        $minutesElapsed = $createdTime->diffInMinutes($referenceTime, false);
        $minutesRemaining = $referenceTime->diffInMinutes($dueTime, false);

        $isBreached = $minutesRemaining < 0;
        $isWarning = !$isBreached && !$isCompleted && ($minutesRemaining <= 120 || ($minutesRemaining / $totalAllowedMinutes) <= 0.25);

        $badgeState = 'nominal';
        if ($isCompleted) {
            $badgeState = 'resolved';
        } elseif ($isBreached) {
            $badgeState = 'breached';
        } elseif ($isWarning) {
            $badgeState = 'warning';
        }

        $percentageElapsed = min(100, max(0, round(($minutesElapsed / $totalAllowedMinutes) * 100)));
        if ($isBreached) {
            $percentageElapsed = 100;
        }

        return [
            'is_breached' => $isBreached,
            'is_warning' => $isWarning,
            'total_minutes_allowed' => $totalAllowedMinutes,
            'minutes_elapsed' => $minutesElapsed,
            'minutes_remaining' => $minutesRemaining,
            'percentage_elapsed' => $percentageElapsed,
            'badge_state' => $badgeState,
            'formatted_remaining' => self::formatDuration($minutesRemaining),
        ];
    }

    private static function formatDuration(int $minutes): string
    {
        $isNegative = $minutes < 0;
        $abs = abs($minutes);
        $hours = floor($abs / 60);
        $mins = $abs % 60;

        $text = $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";
        return $isNegative ? "{$text} overdue" : "{$text} left";
    }
}
