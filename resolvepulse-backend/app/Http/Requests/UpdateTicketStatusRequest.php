<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:open,in_progress,escalated,resolved,closed',
            'actor' => 'required|string|min:2|max:50',
            'reason' => 'nullable|string|max:500',
        ];
    }
}
