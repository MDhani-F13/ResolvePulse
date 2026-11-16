<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArchitectureController extends Controller
{
    private function files(): array
    {
        return [
            'app/Http/Controllers/Api/AuthController.php' => base_path('app/Http/Controllers/Api/AuthController.php'),
            'app/Http/Controllers/Api/TicketController.php' => base_path('app/Http/Controllers/Api/TicketController.php'),
            'app/Http/Requests/StoreTicketRequest.php' => base_path('app/Http/Requests/StoreTicketRequest.php'),
            'app/Services/TicketService.php' => base_path('app/Services/TicketService.php'),
            'app/Services/SlaEvaluationService.php' => base_path('app/Services/SlaEvaluationService.php'),
            'app/Repositories/Contracts/TicketRepositoryInterface.php' => base_path('app/Repositories/Contracts/TicketRepositoryInterface.php'),
            'app/Repositories/Eloquent/EloquentTicketRepository.php' => base_path('app/Repositories/Eloquent/EloquentTicketRepository.php'),
            'resources/js/resolvepulse/src/api/authClient.ts' => base_path('resources/js/resolvepulse/src/api/authClient.ts'),
            'resources/js/resolvepulse/src/api/ticketClient.ts' => base_path('resources/js/resolvepulse/src/api/ticketClient.ts'),
            'resources/js/resolvepulse/src/App.tsx' => base_path('resources/js/resolvepulse/src/App.tsx'),
        ];
    }

    public function layers(): JsonResponse
    {
        return response()->json([
            'pattern' => 'Clean Architecture + Repository Pattern + SOLID',
            'layers' => [
                ['id' => 'presentation', 'name' => 'Presentation (Controllers)', 'description' => 'HTTP input/output orchestration and JSON responses.', 'typescript_file' => 'resources/js/resolvepulse/src/api/ticketClient.ts', 'laravel_file' => 'app/Http/Controllers/Api/TicketController.php', 'rules_demonstrated' => ['Single Responsibility Principle', 'Thin controllers']],
                ['id' => 'validation', 'name' => 'Validation (Form Requests)', 'description' => 'Validates incoming request data before business logic runs.', 'typescript_file' => 'resources/js/resolvepulse/src/components/CreateTicketModal.tsx', 'laravel_file' => 'app/Http/Requests/StoreTicketRequest.php', 'rules_demonstrated' => ['Request validation', 'Separation of concerns']],
                ['id' => 'services', 'name' => 'Domain Services', 'description' => 'Coordinates ticket workflows and SLA business rules.', 'typescript_file' => 'resources/js/resolvepulse/src/api/ticketClient.ts', 'laravel_file' => 'app/Services/TicketService.php', 'rules_demonstrated' => ['Single Responsibility Principle', 'Business rules']],
                ['id' => 'contracts', 'name' => 'Repository Contract', 'description' => 'Defines persistence operations independently from Eloquent.', 'typescript_file' => 'resources/js/resolvepulse/src/types/ticket.ts', 'laravel_file' => 'app/Repositories/Contracts/TicketRepositoryInterface.php', 'rules_demonstrated' => ['Dependency inversion', 'Interface segregation']],
                ['id' => 'persistence', 'name' => 'Eloquent Repository', 'description' => 'Implements ticket persistence and query operations.', 'typescript_file' => 'resources/js/resolvepulse/src/api/ticketClient.ts', 'laravel_file' => 'app/Repositories/Eloquent/EloquentTicketRepository.php', 'rules_demonstrated' => ['Repository pattern', 'Persistence isolation']],
            ],
        ]);
    }

    public function file(Request $request): JsonResponse
    {
        $validated = $request->validate(['path' => ['required', 'string', 'max:255']]);
        $files = $this->files();
        $path = $validated['path'];
        abort_unless(isset($files[$path]) && is_file($files[$path]), 404, 'File is not available in the architecture explorer.');
        return response()->json(['path' => $path, 'language' => pathinfo($path, PATHINFO_EXTENSION), 'content' => file_get_contents($files[$path])]);
    }

    public function exportManifest(): JsonResponse
    {
        $manifest = [];
        foreach ($this->files() as $relative => $absolute) {
            if (is_file($absolute)) $manifest[$relative] = file_get_contents($absolute);
        }
        return response()->json(['files' => $manifest, 'total_files' => count($manifest)]);
    }
}
