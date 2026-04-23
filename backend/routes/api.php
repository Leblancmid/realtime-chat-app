<?php

use App\Http\Controllers\MessageController;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/messages/{userId}', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);

    Route::post('/typing', function (Request $request) {
        broadcast(new \App\Events\UserTyping(
            Auth::id(),           // sender
            $request->receiver_id // receiver
        ));
    });

    Route::post('/online', function () {
        Cache::put('user-online-' . Auth::id(), true, now()->addSeconds(10));
    });

    Route::get('/users', function () {
        return \App\Models\User::where('id', '!=', Auth::id())
            ->get()
            ->map(function ($user) {
                $user->is_online = Cache::has('user-online-' . $user->id);
                return $user;
            });
    });

    Route::post('/messages/seen', function (Request $request) {
        Message::where('sender_id', $request->user_id)
            ->where('receiver_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    });
});
