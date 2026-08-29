import "server-only";
import { hash, compare } from "bcryptjs";
import { db } from "./db";
import { getActivePeriod } from "./data";

export async function getStudentDashboardData(userId: string) {
  try {
    const period = await getActivePeriod();

    const [registeredEventsCount, aspirationsCount, recentEvents, recentAspirations] = await Promise.all([
      db.event_registrations.count({
        where: { user_id: userId },
      }),
      db.aspirations.count({
        where: { user_id: userId, deleted_at: null },
      }),
      db.event_registrations.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          status: true,
          created_at: true,
          event: {
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
              start_time: true,
              poster_url: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 3,
      }),
      db.aspirations.findMany({
        where: { user_id: userId, deleted_at: null },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          created_at: true,
          response: true,
          responded_at: true,
        },
        orderBy: { created_at: "desc" },
        take: 3,
      }),
    ]);

    return {
      registeredEventsCount,
      aspirationsCount,
      recentEvents,
      recentAspirations,
    };
  } catch (err) {
    console.error("getStudentDashboardData error:", err);
    return {
      registeredEventsCount: 0,
      aspirationsCount: 0,
      recentEvents: [],
      recentAspirations: [],
    };
  }
}

export async function getStudentEventRegistrations(userId: string) {
  try {
    return await db.event_registrations.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        status: true,
        decision_note: true,
        registration_data: true,
        created_at: true,
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            start_time: true,
            end_time: true,
            poster_url: true,
            department: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    console.error("getStudentEventRegistrations error:", err);
    return [];
  }
}

export async function getStudentAspirations(userId: string) {
  try {
    return await db.aspirations.findMany({
      where: { user_id: userId, deleted_at: null },
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        status: true,
        response: true,
        is_anonymous: true,
        responded_at: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
  } catch (err) {
    console.error("getStudentAspirations error:", err);
    return [];
  }
}

export async function submitStudentAspiration(userId: string, input: {
  title: string;
  body: string;
  category: "AKADEMIK" | "FASILITAS" | "LAYANAN_KAMPUS" | "LAINNYA";
  is_anonymous?: boolean;
}) {
  const { title, body, category, is_anonymous = false } = input;

  if (!title || !body || !category) {
    throw new Error("Judul, kategori, dan isi aspirasi wajib diisi.");
  }

  const period = await getActivePeriod();

  return await db.aspirations.create({
    data: {
      title: title.trim(),
      body: body.trim(),
      category,
      is_anonymous: Boolean(is_anonymous),
      user_id: userId,
      period_id: period.id,
      status: "MASUK",
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      created_at: true,
    },
  });
}

export async function updateStudentProfile(userId: string, input: {
  name?: string;
  avatar_url?: string;
}) {
  const dataToUpdate: any = {};
  if (input.name && input.name.trim()) dataToUpdate.name = input.name.trim();
  if (typeof input.avatar_url === "string") dataToUpdate.avatar_url = input.avatar_url.trim() || null;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("Tidak ada data yang diubah.");
  }

  return await db.users.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      avatar_url: true,
    },
  });
}

export async function changeStudentPassword(userId: string, input: {
  currentPassword: string;
  newPassword: string;
}) {
  const { currentPassword, newPassword } = input;
  if (!currentPassword || !newPassword) {
    throw new Error("Password lama dan password baru wajib diisi.");
  }

  if (newPassword.length < 8) {
    throw new Error("Password baru minimal 8 karakter.");
  }

  const user = await db.users.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) throw new Error("Mahasiswa tidak ditemukan.");

  const isMatch = await compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Password lama Anda salah.");

  const newHash = await hash(newPassword, 12);
  await db.users.update({
    where: { id: userId },
    data: { password: newHash },
  });

  return { success: true };
}
