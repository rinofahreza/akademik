<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = $request->user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Akun Anda tidak aktif.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        activity()
            ->causedBy($user)
            ->withProperties([
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->useLog('auth')
            ->log('User login');

        return response()->json([
            'message' => 'Login berhasil.',
            'token'   => $token,
            'user'    => $this->userData($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        activity()
            ->causedBy($user)
            ->withProperties([
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->useLog('auth')
            ->log('User logout');

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $this->userData($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:200',
            'email' => 'required|email|max:200|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $this->userData($user),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama tidak sesuai.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    private function userData(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'is_active'   => $user->is_active,
            'roles'       => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ];
    }
}
