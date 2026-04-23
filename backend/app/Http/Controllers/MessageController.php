<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent; // 🔥 ADD THIS
use App\Events\UserTyping; // 🔥 ADD THIS


class MessageController extends Controller
{
    public function index($userId)
    {
        return Message::where(function ($q) use ($userId) {
            $q->where('sender_id', Auth::id())
                ->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($userId) {
            $q->where('sender_id', $userId)
                ->where('receiver_id', Auth::id());
        })->get();
    }

    public function store(Request $request)
    {
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        // 👇 ADD IT HERE
        logger('Broadcast fired', ['message' => $message]);

        // broadcast event
        broadcast(new MessageSent($message));

        return $message;
    }
}
