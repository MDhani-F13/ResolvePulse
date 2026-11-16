<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\EscalateTicketRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Services\SlaEvaluationService;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(protected TicketService $ticketService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'priority', 'tier', 'search']);
        $tickets = $this->ticketService->listTickets($filters)->map(function ($ticket) {
            $payload = $ticket->toArray();
            $payload['sla_evaluation'] = SlaEvaluationService::evaluate($ticket);
            return $payload;
        });
        $slaState = $request->query('sla_state');
        if ($slaState && $slaState !== 'all') {
            $tickets = $tickets->filter(fn ($ticket) => ($ticket['sla_evaluation']['badge_state'] ?? '') === $slaState)->values();
        }
        return response()->json(['data' => $tickets->values(), 'meta' => ['total' => $tickets->count()]]);
    }

    public function show(string|int $id): JsonResponse
    {
        $ticket = $this->ticketService->getTicket($id);
        $payload = $ticket->toArray();
        $payload['sla_evaluation'] = SlaEvaluationService::evaluate($ticket);
        $payload['audit_logs'] = $ticket->auditLogs;
        return response()->json(['data' => $payload]);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        if ($user) {
            $data['customer_name'] = $user->name;
            $data['customer_email'] = $user->email;
        }
        $ticket = $this->ticketService->createTicket($data);
        $payload = $ticket->toArray();
        $payload['sla_evaluation'] = SlaEvaluationService::evaluate($ticket);
        return response()->json(['message' => 'Ticket registered successfully.', 'data' => $payload], 201);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, string|int $id): JsonResponse
    {
        $data = $request->validated();
        $data['actor'] = $request->user()?->name ?? $data['actor'];
        $ticket = $this->ticketService->updateStatus($id, $data);
        return $this->ticketResponse($ticket, "Ticket status updated to {$ticket->status}.");
    }

    public function escalate(EscalateTicketRequest $request, string|int $id): JsonResponse
    {
        $data = $request->validated();
        $data['actor'] = $request->user()?->name ?? $data['actor'];
        $ticket = $this->ticketService->escalateTicket($id, $data);
        return $this->ticketResponse($ticket, "Ticket escalated to {$ticket->tier}.");
    }

    public function assign(AssignTicketRequest $request, string|int $id): JsonResponse
    {
        $data = $request->validated();
        $data['actor'] = $request->user()?->name ?? $data['actor'];
        $ticket = $this->ticketService->assignTicket($id, $data);
        return $this->ticketResponse($ticket, "Ticket assigned to {$ticket->assigned_to}.");
    }

    public function addNote(Request $request, string|int $id): JsonResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'min:1', 'max:2000'], 'actor' => ['nullable', 'string', 'max:50']]);
        $log = $this->ticketService->addNote($id, [
            'note' => $data['note'],
            'actor' => $request->user()?->name ?? ($data['actor'] ?? 'Demo user'),
        ]);
        return response()->json(['message' => 'Note added.', 'data' => $log], 201);
    }

    public function metrics(): JsonResponse
    {
        $metrics = $this->ticketService->getMetrics();
        $metrics['in_progress'] = $metrics['inProgress'] ?? 0;
        unset($metrics['inProgress']);
        return response()->json(['data' => $metrics]);
    }

    private function ticketResponse($ticket, string $message): JsonResponse
    {
        $payload = $ticket->toArray();
        $payload['sla_evaluation'] = SlaEvaluationService::evaluate($ticket);
        $payload['audit_logs'] = $ticket->auditLogs;
        return response()->json(['message' => $message, 'data' => $payload]);
    }
}
