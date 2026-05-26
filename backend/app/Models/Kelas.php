<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Kelas extends Model
{
    use LogsActivity;

    protected $table = 'kelas';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->setDescriptionForEvent(fn(string $eventName) => "Kelas {$eventName}")
            ->useLogName('kelas');
    }

    protected $fillable = [
        'tingkat_pendidikan_id',
        'tahun_ajaran_id',
        'nama_kelas',
        'wali_kelas_id',
        'status',
    ];

    protected $casts = ['status' => 'boolean'];

    public function tingkatPendidikan()
    {
        return $this->belongsTo(TingkatPendidikan::class);
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function waliKelas()
    {
        return $this->belongsTo(Pegawai::class, 'wali_kelas_id');
    }

    public function siswaKelas()
    {
        return $this->hasMany(SiswaKelas::class);
    }
}
