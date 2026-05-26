<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Siswa extends Model
{
    use LogsActivity;

    protected $table = 'siswas';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->setDescriptionForEvent(fn(string $eventName) => "Siswa {$eventName}")
            ->useLogName('siswa');
    }

    protected $fillable = [
        'user_id',
        'kode_bayar',
        'nomor_induk',
        'nisn',
        'no_kk',
        'nik',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'telepon_orang_tua',
        'tingkat_pendidikan_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'tanggal_lahir' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tingkatPendidikan()
    {
        return $this->belongsTo(TingkatPendidikan::class);
    }

    public function kelasRecords()
    {
        return $this->hasMany(SiswaKelas::class);
    }

    public function kelasAktif()
    {
        return $this->hasOne(SiswaKelas::class)->whereHas('tahunAjaran', fn($q) => $q->where('is_active', true));
    }
}
