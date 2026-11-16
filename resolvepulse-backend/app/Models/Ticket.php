<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'customer_name',
        'customer_email',
        'priority',
        'status',
        'tier',
        'assigned_to',
        'assigned_email',
        'sla_target_hours',
        'sla_due_at',
        'resolved_at',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'sla_due_at' => 'datetime',
        'resolved_at' => 'datetime',
        'sla_target_hours' => 'integer',
    ];

    public function auditLogs(): HasMany
    {
        return $this->hasMany(TicketAuditLog::class)->orderBy('created_at', 'desc');
    }
}
