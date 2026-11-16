<?php

use App\Http\Controllers\Api\ArchitectureController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Demo persona shortcuts are disabled unless local demo mode is explicitly enabled.
    Route::get('/auth/personas', [AuthController::class, 'personas']);
    Route::post('/auth/switch-persona', [AuthController::class, 'switchPersona']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/tickets/metrics/summary', [TicketController::class, 'metrics']);
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::post('/tickets', [TicketController::class, 'store']);
        Route::get('/tickets/{id}', [TicketController::class, 'show']);
        Route::patch('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
        Route::post('/tickets/{id}/escalate', [TicketController::class, 'escalate']);
        Route::patch('/tickets/{id}/assign', [TicketController::class, 'assign']);
        Route::post('/tickets/{id}/notes', [TicketController::class, 'addNote']);
    });

    Route::get('/architecture/layers', [ArchitectureController::class, 'layers']);
    Route::get('/architecture/file', [ArchitectureController::class, 'file']);
    Route::get('/architecture/export-manifest', [ArchitectureController::class, 'exportManifest']);
});
