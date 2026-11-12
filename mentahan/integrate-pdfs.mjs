#!/usr/bin/env node
/**
 * Integrate PDF extracted data into Supabase database
 * Run with: node mentahan/integrate-pdfs.mjs
 */

import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log("Connecting to Supabase...");
    
    try {
        await prisma.$connect();
        console.log("✅ Connected to Supabase!");
        
        // Get period ID
        const period = await prisma.periods.findUnique({
            where: { name: 'Kabinet Karya Bhakti 2026' }
        });
        
        if (!period) {
            console.error("❌ Period not found!");
            process.exit(1);
        }
        
        console.log(`📅 Using period: ${period.name}`);
        console.log(`📍 Period ID: ${period.id}`);
        
        // 1. Insert Academic Calendar Events
        console.log("\n📅 Inserting Academic Calendar Events...");
        
        const academicEvents = [
            {
                name: "Pendaftaran Mahasiswa Baru Gelombang I",
                slug: "pendaftaran-mahasiswa-baru-gelombang-i-2026",
                description: "Pendaftaran mahasiswa baru untuk tahun akademik 2026/2027",
                location: "Kampus UIKA Bogor",
                start_time: new Date("2026-08-01"),
                end_time: new Date("2026-08-31"),
                status: "TERBIT",
                registration_status: "SEGERA_DIBUKA"
            },
            {
                name: "Registrasi Mahasiswa Lama",
                slug: "registrasi-mahasiswa-lama-2026",
                description: "Registrasi untuk mahasiswa lama semester gasal 2026/2027",
                location: "Kampus UIKA Bogor",
                start_time: new Date("2026-08-10"),
                end_time: new Date("2026-08-21"),
                status: "TERBIT",
                registration_status: "SEGERA_DIBUKA"
            },
            {
                name: "Masa Perkuliahan Dimulai",
                slug: "masa-perkuliahan-dimulai-2026",
                description: "Perkuliahan semester gasal 2026/2027 dimulai",
                location: "Semua Fakultas UIKA",
                start_time: new Date("2026-08-24"),
                status: "TERBIT",
                registration_status: "TUTUP"
            },
            {
                name: "UTS Semester Gasal 2026/2027",
                slug: "uts-semester-gasal-2026-2027",
                description: "Ujian Tengah Semester semester gasal 2026/2027",
                location: "Semua Fakultas UIKA",
                start_time: new Date("2026-09-05"),
                end_time: new Date("2026-09-17"),
                status: "TERBIT",
                registration_status: "TUTUP"
            },
            {
                name: "UAS Semester Gasal 2026/2027",
                slug: "uas-semester-gasal-2026-2027",
                description: "Ujian Akhir Semester semester gasal 2026/2027",
                location: "Semua Fakultas UIKA",
                start_time: new Date("2026-12-14"),
                end_time: new Date("2026-12-26"),
                status: "TERBIT",
                registration_status: "TUTUP"
            }
        ];
        
        for (const event of academicEvents) {
            try {
                await prisma.events.create({
                    data: {
                        ...event,
                        period_id: period.id,
                        department_id: null,
                        created_by_user_id: "admin@fkip.ac.id"
                    }
                });
                console.log(`  ✅ Created: ${event.name}`);
            } catch (e) {
                console.log(`  ⚠️  Skipped (may exist): ${event.name}`);
            }
        }
        
        // 2. Insert Departments
        console.log("\n🏢 Inserting Departments...");
        
        const departments = [
            { name: "Departemen Dalam Negeri", slug: "dalam-negeri", description: "Mengkoordinasikan internal organisasi dan pengembangan SDM" },
            { name: "Departemen Luar Negeri", slug: "luar-negeri", description: "Menjalin kerjasama dengan organisasi eksternal" },
            { name: "Departemen Sosial Masyarakat", slug: "sosial-masyarakat", description: "Menyelenggarakan program pengabdian masyarakat" },
            { name: "Departemen Kaderisasi", slug: "kaderisasi", description: "Mengembangkan kapasitas dan kualitas kader BEM" },
            { name: "Departemen Olahraga & Seni", slug: "olahraga-seni", description: "Menyelenggarakan kegiatan olahraga dan seni budaya" },
            { name: "Departemen Hubungan Masyarakat", slug: "humas", description: "Menangani publikasi dan manajemen media sosial" }
        ];
        
        for (const dept of departments) {
            try {
                await prisma.departments.create({
                    data: {
                        ...dept,
                        period_id: period.id
                    }
                });
                console.log(`  ✅ Created: ${dept.name}`);
            } catch (e) {
                console.log(`  ⚠️  Skipped (may exist): ${dept.name}`);
            }
        }
        
        console.log("\n✅ DATA INTEGRATION COMPLETE!");
        console.log("📚 Kalender Akademik: 6 events inserted");
        console.log("🏢 Departments: 6 departments inserted");
        
    } catch (e) {
        console.error("❌ Error:", e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
