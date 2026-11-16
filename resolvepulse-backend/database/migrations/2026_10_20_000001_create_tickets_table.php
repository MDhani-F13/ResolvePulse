<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->enum('priority', ['urgent', 'high', 'medium', 'low'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'escalated', 'resolved', 'closed'])->default('open');
            $table->enum('tier', ['tier_1', 'tier_2', 'tier_3'])->default('tier_1');
            $table->string('assigned_to')->default('Unassigned');
            $table->string('assigned_email')->nullable();
            $table->unsignedInteger('sla_target_hours')->default(8);
            $table->timestamp('sla_due_at');
            $table->timestamp('resolved_at')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();

            // Indexes for fast SLA and queue querying
            $table->index(['status', 'priority']);
            $table->index('sla_due_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
