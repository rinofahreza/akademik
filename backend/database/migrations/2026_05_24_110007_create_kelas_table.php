<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tingkat_pendidikan_id')->constrained('tingkat_pendidikans');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans');
            $table->string('nama_kelas');
            $table->foreignId('wali_kelas_id')->nullable()->constrained('pegawais')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
