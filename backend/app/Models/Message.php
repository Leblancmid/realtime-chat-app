<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public function reactions()
    {
        return $this->hasMany(MessageReaction::class);
    }


    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'image',
        'delivered_at',
        'read_at',
    ];
}
