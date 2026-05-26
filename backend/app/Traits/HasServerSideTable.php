<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasServerSideTable
{
    protected function paginateQuery(Builder $query, Request $request, int $defaultPerPage = 20): array
    {
        $perPage   = (int) $request->get('per_page', $defaultPerPage);
        $page      = (int) $request->get('page', 1);
        $sortField = $request->get('sort_field', 'created_at');
        $sortDir   = $request->get('sort_dir', 'desc');

        $allowedSortDirs = ['asc', 'desc'];
        if (!in_array($sortDir, $allowedSortDirs)) {
            $sortDir = 'desc';
        }

        $query->orderBy($sortField, $sortDir);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
            ],
        ];
    }
}
