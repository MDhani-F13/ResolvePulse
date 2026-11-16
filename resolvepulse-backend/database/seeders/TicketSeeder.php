<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketAuditLog;
use App\Services\SlaEvaluationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $tickets = [
            [
                'ticket_number' => 'TCK-1001',
                'title' => 'Production PostgreSQL connection pool exhausted during peak billing cycle',
                'description' => 'Customer reports 500 error spikes on /api/v1/checkout. PgBouncer pool connections peaked at 100 max capacity. Need immediate read-replica failover or pool configuration tuning.',
                'customer_name' => 'Elena Rostova',
                'customer_email' => 'elena.rostova@fintechscale.io',
                'priority' => 'urgent',
                'status' => 'escalated',
                'tier' => 'tier_3',
                'assigned_to' => 'Marcus Vance',
                'assigned_email' => 'marcus.v@resolvepulse.internal',
                'sla_target_hours' => 2,
                'created_at' => $now->copy()->subHours(2)->subMinutes(30),
                'tags' => ['Database', 'Postgres', 'P0-Outage', 'Infrastructure'],
            ],
            [
                'ticket_number' => 'TCK-1002',
                'title' => 'Single Sign-On (SAML/Okta) handshake timing out for enterprise tenant',
                'description' => 'Enterprise tenant AcmeCorp SSO integration fails intermittently with "Assertion consumer service timeout". Logs indicate clock drift on auth gateway.',
                'customer_name' => 'David Kalu',
                'customer_email' => 'dkalu@acmecorp.com',
                'priority' => 'high',
                'status' => 'in_progress',
                'tier' => 'tier_2',
                'assigned_to' => 'Sarah Chen',
                'assigned_email' => 'sarah.c@resolvepulse.internal',
                'sla_target_hours' => 4,
                'created_at' => $now->copy()->subHours(3)->subMinutes(15),
                'tags' => ['Authentication', 'SAML', 'Enterprise', 'Security'],
            ],
            [
                'ticket_number' => 'TCK-1003',
                'title' => 'Webhook delivery retries failing silently on 429 backoff',
                'description' => 'Webhook dispatcher enters infinite backoff loop when recipient responds with 429 Too Many Requests without Retry-After header. Events remain queued indefinitely.',
                'customer_name' => 'Maya Lin',
                'customer_email' => 'mlin@datastream.tech',
                'priority' => 'high',
                'status' => 'open',
                'tier' => 'tier_1',
                'assigned_to' => 'Unassigned',
                'assigned_email' => null,
                'sla_target_hours' => 4,
                'created_at' => $now->copy()->subMinutes(50),
                'tags' => ['Webhooks', 'Queue', 'API'],
            ],
            [
                'ticket_number' => 'TCK-1004',
                'title' => 'Stripe webhook signature validation mismatch in staging sandbox',
                'description' => 'Stripe webhook signing secret updated in test environment, but staging service still cache-reads legacy webhook secret key from Redis.',
                'customer_name' => 'Liam O’Connor',
                'customer_email' => 'loconnor@paymesh.dev',
                'priority' => 'medium',
                'status' => 'in_progress',
                'tier' => 'tier_1',
                'assigned_to' => 'Sarah Chen',
                'assigned_email' => 'sarah.c@resolvepulse.internal',
                'sla_target_hours' => 8,
                'created_at' => $now->copy()->subHours(6)->subMinutes(45),
                'tags' => ['Billing', 'Stripe', 'Redis'],
            ],
        ];

        foreach ($tickets as $ticketData) {
            $created = $ticketData['created_at'];
            $slaDueAt = SlaEvaluationService::calculateDueDate($created, $ticketData['priority']);

            $ticket = Ticket::create([
                ...$ticketData,
                'sla_due_at' => $slaDueAt,
            ]);

            TicketAuditLog::create([
                'ticket_id' => $ticket->id,
                'action' => 'created',
                'actor' => $ticket->customer_name,
                'details' => "Incident submitted with {$ticket->priority} priority.",
                'created_at' => $created,
            ]);
        }
    }
}
