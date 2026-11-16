<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Elena Rostova',
                'email' => 'elena.rostova@fintechscale.io',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'organization' => 'FinTechScale Inc.',
            ],
            [
                'name' => 'Sarah Chen',
                'email' => 'sarah.c@resolvepulse.internal',
                'password' => Hash::make('password123'),
                'role' => 'support_engineer',
                'organization' => 'ResolvePulse Core Engineering',
            ],
            [
                'name' => 'Marcus Vance',
                'email' => 'marcus.v@resolvepulse.internal',
                'password' => Hash::make('password123'),
                'role' => 'lead_admin',
                'organization' => 'ResolvePulse Operations Lead',
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
