<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class EmploymentStatus extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $e) => "Status Kepegawaian {$e}")->useLogName('employment-status');
    }

    protected $fillable = ['code', 'name', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function pegawais()
    {
        return $this->hasMany(Pegawai::class);
    }
}
