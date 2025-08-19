"use server";

import { db } from "../_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";

interface UpdateData {
  id: string;
  value: string;
}

export async function updateData(data: UpdateData): Promise<{ id: string; name: string; value: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Usuário não autenticado.");
  }

  try {
    const dataValue = await db.data.findUnique({
      where: { id: data.id },
      select: { id: true, name: true, value: true },
    });

    if (!dataValue) {
      throw new Error("Registro não encontrado.");
    }

    const updatedData = await db.data.update({
      where: { id: data.id },
      data: {
        value: data.value,
      },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });

    return updatedData;
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    throw new Error("Não foi possível atualizar os dados.");
  }
}