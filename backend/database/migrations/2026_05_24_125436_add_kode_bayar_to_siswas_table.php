<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->string('kode_bayar', 7)->unique()->after('user_id');
            $table->string('nomor_induk', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('siswas', function (Blueprint $table) {
            $table->dropColumn('kode_bayar');
            $table->string('nomor_induk', 50)->nullable(false)->change();
        });
    }
};
