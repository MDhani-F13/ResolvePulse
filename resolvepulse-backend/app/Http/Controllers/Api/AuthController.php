<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:60'],
            'email' => ['required', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'organization' => ['nullable', 'string', 'max:100'],
        ]);

        // Public registration must never grant a staff or administrator role.
        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'organization' => $validated['organization'] ?? 'Independent',
        ]);

        return $this->tokenResponse($user, 'User registered successfully.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', strtolower($validated['email']))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid email or password.']]);
        }

        return $this->tokenResponse($user, 'Signed in successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Signed out successfully.']);
    }

    public function personas(): JsonResponse
    {
        abort_unless(config('app.env') === 'local' && config('resolvepulse.demo_mode'), 404);
        $users = User::whereIn('email', [
            'elena.rostova@fintechscale.io',
            'sarah.c@resolvepulse.internal',
            'marcus.v@resolvepulse.internal',
        ])->get(['id', 'name', 'email', 'role', 'organization', 'created_at']);
        return response()->json(['data' => $users]);
    }

    public function switchPersona(Request $request): JsonResponse
    {
        abort_unless(config('app.env') === 'local' && config('resolvepulse.demo_mode'), 404);
        $validated = $request->validate(['email' => ['required', 'email']]);
        $allowed = [
            'elena.rostova@fintechscale.io',
            'sarah.c@resolvepulse.internal',
            'marcus.v@resolvepulse.internal',
        ];
        abort_unless(in_array(strtolower($validated['email']), $allowed, true), 403, 'Persona is not available in demo mode.');
        $user = User::where('email', strtolower($validated['email']))->firstOrFail();
        return $this->tokenResponse($user, 'Demo persona activated.');
    }

    private function tokenResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => [
                'user' => $user,
                'token' => $user->createToken('resolvepulse-web')->plainTextToken,
            ],
        ], $status);
    }
}
