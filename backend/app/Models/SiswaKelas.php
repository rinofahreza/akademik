<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class SiswaKelas extends Model
{
    use LogsActivity;

    protected $table = 'siswa_kelas';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $e) => "Penempatan Kelas Siswa {$e}")->useLogName('siswa-kelas');
    }

    protected $fillable = [
        'siswa_id',
        'kelas_id',
        'tahun_ajaran_id',
    ];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }
}
