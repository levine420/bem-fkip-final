import "server-only";
import { db } from "./db";

export async function registerForEvent(input: {
  slug: string;
  name: string;
  nim: string;
  email: string;
  prodi?: string;
  notes?: string;
}) {
  const { slug, name, nim, email, prodi = "Pendidikan Bahasa Inggris", notes } = input;

  // 1. Find event by slug or fallback to first active event in DB
  // Note: don't try to match id directly since slug may be a non-UUID string
  let event = await db.events.findFirst({
    where: {
      OR: [
        { slug: slug },
        { name: { contains: slug, mode: "insensitive" } },
      ],
      deleted_at: null,
    },
    select: { id: true, name: true, max_participants: true },
  });

  if (!event) {
    // Fallback: get the first available event in the database
    event = await db.events.findFirst({
      where: { deleted_at: null },
      select: { id: true, name: true, max_participants: true },
    });
  }

  if (!event) {
    throw new Error("Kegiatan tidak ditemukan di database.");
  }

  // 2. Find or create a study program for constraint compliance
  let studyProgram = await db.study_programs.findFirst({
    where: { deleted_at: null },
    select: { id: true },
  });

  if (!studyProgram) {
    studyProgram = await db.study_programs.create({
      data: {
        code: "PBI",
        name: "Pendidikan Bahasa Inggris",
      },
      select: { id: true },
    });
  }

  // 3. Find or create user for student
  let user = await db.users.findFirst({
    where: {
      OR: [{ email: email }, { nim: nim }],
    },
    select: { id: true },
  });

  if (!user) {
    user = await db.users.create({
      data: {
        name,
        email,
        nim,
        angkatan: 2023,
        program_studi_id: studyProgram.id,
        role: "MAHASISWA",
        account_status: "AKTIF",
        email_verified_at: new Date(),
        password: "$2a$12$K8p5aJ5UfL8Z1M1r5X5Q1.6Q1n9m1r5X5Q1.6Q1n9m1r5X5Q1.6Q1", // default hash
        must_change_password: false,
      },
      select: { id: true },
    });
  } else {
    await db.users.update({
      where: { id: user.id },
      data: { name, nim, email_verified_at: new Date() },
    });
  }

  // 4. Create or update registration in event_registrations table
  const registration = await db.event_registrations.upsert({
    where: {
      user_id_event_id: {
        user_id: user.id,
        event_id: event.id,
      },
    },
    create: {
      user_id: user.id,
      event_id: event.id,
      status: "MENUNGGU",
      decision_note: notes || null,
      registration_data: {
        name,
        nim,
        email,
        prodi,
        notes,
        registered_at: new Date().toISOString(),
      },
    },
    update: {
      status: "MENUNGGU",
      decision_note: notes || null,
      registration_data: {
        name,
        nim,
        email,
        prodi,
        notes,
        updated_at: new Date().toISOString(),
      },
    },
  });

  // 5. Return success data
  return {
    success: true,
    registration_id: registration.id,
    event_id: event.id,
    event_name: event.name,
    status: registration.status,
  };
}
