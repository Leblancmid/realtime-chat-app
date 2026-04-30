<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;
use App\Models\MessageReaction;

class MessageController extends Controller
{
    public function index($userId)
    {
        $messages = Message::with('reactions') // ✅ ADD THIS
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', Auth::id())
                    ->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                    ->where('receiver_id', Auth::id());
            })
            ->orderBy('created_at')
            ->get();

        // ✅ mark delivered
        Message::where('receiver_id', Auth::id())
            ->where('sender_id', $userId)
            ->whereNull('delivered_at')
            ->update(['delivered_at' => now()]);

        return $messages;
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'nullable|string',
            'image' => 'nullable', // supports file OR URL (gif)
        ]);

        $data = [
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ];

        // ✅ HANDLE IMAGE FILE UPLOAD
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('messages', 'public');
            $data['image'] = '/storage/' . $path;
        }

        // ✅ HANDLE GIF / STICKER URL
        if ($request->image && !$request->hasFile('image')) {
            $data['image'] = $request->image;
        }

        $message = Message::create($data);

        // debug log
        logger('Broadcast fired', ['message' => $message]);

        // broadcast
        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }

    public function react(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:messages,id',
            'reaction' => 'required|string',
        ]);

        $existing = MessageReaction::where('message_id', $request->message_id)
            ->where('user_id', Auth::id())
            ->first();

        // ✅ If same reaction → remove (toggle off)
        if ($existing && $existing->reaction === $request->reaction) {
            $existing->delete();

            return response()->json([
                'removed' => true
            ]);
        }

        // ✅ Otherwise update or create
        $reaction = MessageReaction::updateOrCreate(
            [
                'message_id' => $request->message_id,
                'user_id' => Auth::id(),
            ],
            [
                'reaction' => $request->reaction,
            ]
        );

        return response()->json($reaction);
    }
}
