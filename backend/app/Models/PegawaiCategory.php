<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class PegawaiCategory extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $e) => "Unit Pegawai {$e}")->useLogName('pegawai-category');
    }

    protected $fillable = ['name', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function positions()
    {
        return $this->hasMany(PegawaiPosition::class);
    }

    public function pegawais()
    {
        return $this->hasMany(Pegawai::class);
    }
}
