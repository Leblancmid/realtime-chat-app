<?php

use App\Http\Controllers\MessageController;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;


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

    Route::post('/online', [UserController::class, 'online']);

    Route::get('/users', function () {
        return \App\Models\User::where('id', '!=', Auth::id())->get();
    });

    Route::post('/messages/seen', function (Request $request) {
        Message::where('sender_id', $request->user_id)
            ->where('receiver_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'ok']);
    });

    Route::post('/profile', [ProfileController::class, 'update']);

    Route::post('/change-password', [ProfileController::class, 'changePassword']);
});
