<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class TingkatPendidikan extends Model
{
    use LogsActivity;

    protected $table = 'tingkat_pendidikans';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $e) => "Tingkat Pendidikan {$e}")->useLogName('tingkat-pendidikan');
    }

    protected $fillable = ['name', 'status'];

    protected $casts = ['status' => 'boolean'];

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }

    public function siswas()
    {
        return $this->hasMany(Siswa::class);
    }
}
