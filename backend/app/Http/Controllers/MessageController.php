<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent; // 🔥 ADD THIS

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

        // 🔥 THIS IS THE IMPORTANT PART
        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }
}
