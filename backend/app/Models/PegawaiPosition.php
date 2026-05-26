<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class PegawaiPosition extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $e) => "Posisi Pegawai {$e}")->useLogName('pegawai-position');
    }

    protected $fillable = ['pegawai_category_id', 'name', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function category()
    {
        return $this->belongsTo(PegawaiCategory::class, 'pegawai_category_id');
    }

    public function pegawais()
    {
        return $this->hasMany(Pegawai::class);
    }
}
