<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeen implements ShouldBroadcast
{
    public $senderId;

    public function __construct($senderId)
    {
        $this->senderId = $senderId;
    }

    public function broadcastOn()
    {
        return new Channel('chat.' . $this->senderId);
    }

    public function broadcastAs()
    {
        return 'MessageSeen';
    }
}
