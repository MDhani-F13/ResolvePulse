<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EscalateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_tier' => 'required|in:tier_2,tier_3',
            'actor' => 'required|string|min:2|max:50',
            'reason' => 'required|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'reason.min' => 'Escalation to senior tiers requires a documented justification (min 10 characters).',
        ];
    }
}
