<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pegawais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nip')->nullable()->unique();
            $table->string('nama_lengkap');
            $table->string('email')->nullable();
            $table->string('nomor_hp')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->foreignId('pegawai_category_id')->constrained('pegawai_categories');
            $table->foreignId('pegawai_position_id')->constrained('pegawai_positions');
            $table->foreignId('employment_status_id')->constrained('employment_statuses');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawais');
    }
};
