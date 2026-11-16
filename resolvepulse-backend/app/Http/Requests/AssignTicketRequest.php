<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => 'required|string|min:2|max:60',
            'actor' => 'required|string|min:2|max:50',
            'assigned_email' => 'nullable|email|max:100',
        ];
    }
}
