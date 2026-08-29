import "server-only";
import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { db } from "./db";

const STUDENT_COOKIE_NAME = "student_session_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  nim: string | null;
  angkatan: number | null;
  program_studi_id: string | null;
  program_studi_name?: string | null;
  avatar_url: string | null;
  account_status: string;
}

export async function getCurrentStudent(): Promise<StudentProfile | null> {
  try {
    const jar = await cookies();
    const studentId = jar.get(STUDENT_COOKIE_NAME)?.value;
    if (!studentId) return null;

    const user = await db.users.findFirst({
      where: {
        id: studentId,
        role: "MAHASISWA",
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        angkatan: true,
        program_studi_id: true,
        avatar_url: true,
        account_status: true,
        study_program: {
          select: { name: true },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      nim: user.nim,
      angkatan: user.angkatan,
      program_studi_id: user.program_studi_id,
      program_studi_name: user.study_program?.name || null,
      avatar_url: user.avatar_url,
      account_status: user.account_status,
    };
  } catch (err) {
    console.error("getCurrentStudent error:", err);
    return null;
  }
}

export async function registerStudent(input: {
  name: string;
  email: string;
  password: string;
  nim: string;
  angkatan: number;
  program_studi_id: string;
}) {
  const { name, email, password, nim, angkatan, program_studi_id } = input;

  if (!name || !email || !password || !nim || !program_studi_id) {
    throw new Error("Lengkapi seluruh field wajib pendaftaran.");
  }

  // Check email or NIM duplication
  const existing = await db.users.findFirst({
    where: {
      OR: [{ email: email.toLowerCase().trim() }, { nim: nim.trim() }],
    },
    select: { email: true, nim: true },
  });

  if (existing) {
    if (existing.email.toLowerCase() === email.toLowerCase().trim()) {
      throw new Error("Email ini sudah terdaftar sebagai akun mahasiswa.");
    }
    if (existing.nim === nim.trim()) {
      throw new Error("NIM ini sudah terdaftar di sistem.");
    }
  }

  const hashedPassword = await hash(password, 12);

  const newStudent = await db.users.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nim: nim.trim(),
      angkatan: Number(angkatan) || new Date().getFullYear(),
      program_studi_id,
      role: "MAHASISWA",
      account_status: "AKTIF",
      email_verified_at: new Date(),
      must_change_password: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      nim: true,
    },
  });

  // Automatically set session cookie on registration
  const jar = await cookies();
  jar.set(STUDENT_COOKIE_NAME, newStudent.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return newStudent;
}

export async function loginStudent(emailInput: string, passwordInput: string) {
  if (!emailInput || !passwordInput) {
    throw new Error("Email dan password wajib diisi.");
  }

  const user = await db.users.findFirst({
    where: {
      email: emailInput.toLowerCase().trim(),
      role: "MAHASISWA",
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      password: true,
      account_status: true,
    },
  });

  if (!user) {
    throw new Error("Email atau password mahasiswa salah.");
  }

  if (user.account_status === "NONAKTIF") {
    throw new Error("Akun mahasiswa Anda sedang dinonaktifkan. Hubungi pengelola.");
  }

  const isMatch = await compare(passwordInput, user.password);
  if (!isMatch) {
    throw new Error("Email atau password mahasiswa salah.");
  }

  // Set session cookie
  const jar = await cookies();
  jar.set(STUDENT_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return { id: user.id, name: user.name };
}

export async function logoutStudent() {
  const jar = await cookies();
  jar.set(STUDENT_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { success: true };
}
