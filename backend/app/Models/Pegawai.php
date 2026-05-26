<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Pegawai extends Model
{
    use LogsActivity;

    protected $table = 'pegawais';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->setDescriptionForEvent(fn(string $eventName) => "Pegawai {$eventName}")
            ->useLogName('pegawai');
    }

    protected $fillable = [
        'user_id',
        'nig',
        'nama_lengkap',
        'email',
        'nomor_hp',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'pegawai_category_id',
        'pegawai_position_id',
        'employment_status_id',
        'subject_id',
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

    public function category()
    {
        return $this->belongsTo(PegawaiCategory::class, 'pegawai_category_id');
    }

    public function position()
    {
        return $this->belongsTo(PegawaiPosition::class, 'pegawai_position_id');
    }

    public function employmentStatus()
    {
        return $this->belongsTo(EmploymentStatus::class, 'employment_status_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function tingkatPendidikan()
    {
        return $this->belongsTo(TingkatPendidikan::class);
    }

    public function kelasWali()
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }
}
