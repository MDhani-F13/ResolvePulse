<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|min:5|max:120',
            'description' => 'required|string|min:15|max:2000',
            'customer_name' => 'required|string|min:2|max:60',
            'customer_email' => 'required|email|max:100',
            'priority' => 'required|in:urgent,high,medium,low',
            'assigned_to' => 'nullable|string|max:60',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:30',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A descriptive incident title is mandatory.',
            'title.min' => 'The title must have at least 5 characters for clarity.',
            'description.min' => 'Please provide comprehensive reproduction steps (min 15 characters).',
            'customer_email.email' => 'A valid customer email is required for SLA notifications.',
            'priority.in' => 'Priority must be one of: urgent, high, medium, low.',
        ];
    }
}
