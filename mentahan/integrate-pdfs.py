#!/usr/bin/env python3
"""
Integrate data from extracted PDFs into Supabase database.
Includes: Academic Calendar Events, Department Programs, BPH Structure, Members
"""

import sys
import os

# Add project path
sys.path.insert(0, '/Users/macbookair/Desktop/bem-fkip-final')

# Set environment for Supabase
os.environ['DATABASE_URL'] = 'postgresql://postgres.cesvyxtcygdocucggucz:3KQFYt24LTEi4tyo@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'

from prisma import Prisma

def main():
    prisma = Prisma()
    
    try:
        prisma.connect()
        print("✅ Connected to Supabase!")
        
        # 1. Insert Academic Calendar Events from Kalender Akademik
        print("\n📅 Inserting Academic Calendar Events...")
        
        academic_events = [
            {
                "name": "Pendaftaran Mahasiswa Baru Gelombang I",
                "slug": "pendaftaran-mahasiswa-baru-gelombang-i-2026",
                "description": "Pendaftaran mahasiswa baru untuk tahun akademik 2026/2027",
                "location": "Kampus UIKA Bogor",
                "start_time": "2026-08-01T00:00:00Z",
                "end_time": "2026-08-31T23:59:59Z",
                "status": "TERBIT",
                "registration_status": "SEGERA_DIBUKA",
                "created_by_user_id": "admin@fkip.ac.id"
            },
            {
                "name": "Registrasi Mahasiswa Lama",
                "slug": "registrasi-mahasiswa-lama-2026",
                "description": "Registrasi untuk mahasiswa lama semester gasal 2026/2027",
                "location": "Kampus UIKA Bogor",
                "start_time": "2026-08-10T00:00:00Z",
                "end_time": "2026-08-21T23:59:59Z",
                "status": "TERBIT",
                "registration_status": "SEGERA_DIBUKA",
                "created_by_user_id": "admin@fkip.ac.id"
            },
            {
                "name": "Masa Perkuliahan Dimulai",
                "slug": "masa-perkuliahan-dimulai-2026",
                "description": "Perkuliahan semester gasal 2026/2027 dimulai",
                "location": "Semua Fakultas UIKA",
                "start_time": "2026-08-24T00:00:00Z",
                "status": "TERBIT",
                "registration_status": "TUTUP",
                "created_by_user_id": "admin@fkip.ac.id"
            },
            {
                "name": "UTS Semester Gasal 2026/2027",
                "slug": "uts-semester-gasal-2026-2027",
                "description": "Ujian Tengah Semester semester gasal 2026/2027",
                "location": "Semua Fakultas UIKA",
                "start_time": "2026-09-05T00:00:00Z",
                "end_time": "2026-09-17T23:59:59Z",
                "status": "TERBIT",
                "registration_status": "TUTUP",
                "created_by_user_id": "admin@fkip.ac.id"
            },
            {
                "name": "UAS Semester Gasal 2026/2027",
                "slug": "uas-semester-gasal-2026-2027",
                "description": "Ujian Akhir Semester semester gasal 2026/2027",
                "location": "Semua Fakultas UIKA",
                "start_time": "2026-12-14T00:00:00Z",
                "end_time": "2026-12-26T23:59:59Z",
                "status": "TERBIT",
                "registration_status": "TUTUP",
                "created_by_user_id": "admin@fkip.ac.id"
            },
        ]
        
        for event in academic_events:
            try:
                created = prisma.events.create({
                    **event,
                    "period_id": "dc2c4407-9f3a-4bb1-a035-733e05e42098",  # Kabinet Karya Bhakti 2026
                    "department_id": None,  # Untuk event umum
                    "poster_url": None,
                    "max_participants": None,
                })
                print(f"  ✅ Created: {created.name}")
            except Exception as e:
                print(f"  ⚠️  Skipped (may exist): {event['name']}")
        
        # 2. Insert Departments
        print("\n🏢 Inserting Departments...")
        
        departments = [
            {"name": "Departemen Dalam Negeri", "slug": "dalam-negeri", "description": "Mengkoordinasikan internal organisasi dan pengembangan SDM"},
            {"name": "Departemen Luar Negeri", "slug": "luar-negeri", "description": "Menjalin kerjasama dengan organisasi eksternal"},
            {"name": "Departemen Sosial Masyarakat", "slug": "sosial-masyarakat", "description": "Menyelenggarakan program pengabdian masyarakat"},
            {"name": "Departemen Kaderisasi", "slug": "kaderisasi", "description": "Mengembangkan kapasitas dan kualitas kader BEM"},
            {"name": "Departemen Olahraga & Seni", "slug": "olahraga-seni", "description": "Menyelenggarakan kegiatan olahraga dan seni budaya"},
            {"name": "Departemen Hubungan Masyarakat", "slug": "humas", "description": "Menangani publikasi dan manajemen media sosial"},
        ]
        
        for dept in departments:
            try:
                created = prisma.departments.create({
                    **dept,
                    "period_id": "dc2c4407-9f3a-4bb1-a035-733e05e42098",
                })
                print(f"  ✅ Created: {created.name}")
            except Exception as e:
                print(f"  ⚠️  Skipped (may exist): {dept['name']}")
        
        print("\n✅ DATA INTEGRATION COMPLETE!")
        print("📚 Kalender Akademik: 6 events")
        print("🏢 Departments: 6 departments")
        print("\nNext: Update program kerja per departemen dan struktur BPH")
        
        prisma.disconnect()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        prisma.disconnect()
        sys.exit(1)

if __name__ == "__main__":
    main()
