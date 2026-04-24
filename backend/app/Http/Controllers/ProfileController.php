<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(ProfileRequest $request)
    {
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = asset('storage/' . $path);
        }

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('banners', 'public');
            $user->banner = asset('storage/' . $path);
        }

        $user->name = $request->name;
        $user->save();

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current' => 'required',
            'new' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current, $user->password)) {
            return response()->json(['error' => 'Wrong password'], 400);
        }

        $user->password = Hash::make($request->new);
        $user->save();

        return response()->json(['success' => true]);
    }
}
