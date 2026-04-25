<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * ✅ FIX: put ALL casts here (single source)
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_seen' => 'datetime', // ✅ IMPORTANT
        ];
    }

    protected $appends = ['is_online'];

    /**
     * ✅ Online status (fixed threshold)
     */
    public function getIsOnlineAttribute(): bool
    {
        return $this->last_seen &&
            $this->last_seen->gt(now()->subMinutes(1)); // ✅ FIXED
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
    ];
}
