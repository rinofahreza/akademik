<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class TahunAjaran extends Model
{
    use LogsActivity;

    protected $table = 'tahun_ajarans';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->setDescriptionForEvent(fn(string $eventName) => "Tahun Ajaran {$eventName}")
            ->useLogName('tahun-ajaran');
    }

    protected $fillable = ['nama_tahun_ajaran', 'tanggal_mulai', 'tanggal_selesai', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }

    public function siswas()
    {
        return $this->hasMany(Siswa::class);
    }
}
