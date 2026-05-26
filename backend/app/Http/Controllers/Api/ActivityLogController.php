<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer')
            ->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('causer', fn($q2) => $q2->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%'));
            });
        }

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = (int) $request->get('per_page', 20);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => collect($paginator->items())->map(fn($item) => [
                'id'           => $item->id,
                'log_name'     => $item->log_name,
                'description'  => $item->description,
                'subject_type' => $item->subject_type ? class_basename($item->subject_type) : null,
                'subject_id'   => $item->subject_id,
                'causer'       => $item->causer ? [
                    'id'    => $item->causer->id,
                    'name'  => $item->causer->name,
                    'email' => $item->causer->email,
                ] : null,
                'properties'   => $item->properties,
                'attribute_changes' => $item->attribute_changes,
                'created_at'   => $item->created_at,
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }

    public function logNames()
    {
        $names = Activity::distinct()->pluck('log_name')->filter()->values();
        return response()->json(['data' => $names]);
    }
}
