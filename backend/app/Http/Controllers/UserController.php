<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Models\User;

class UserController extends Controller
{
    public function online(): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user) {
            $user->last_seen = now();
            $user->save();
        }

        return response()->json([
            'status' => 'ok',
        ]);
    }
}
