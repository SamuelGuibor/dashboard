"use server";

import { db } from "@/app/_lib/prisma";

interface DataValue {
  id: string;
  name: string;
  value: string;
}

export async function GetValue(name: string): Promise<DataValue[]> {
  try {
    const values = await db.data.findMany({
      where: {
        name: name,
      },
      select: {
        id: true,
        name: true,
        value: true,
      },
    });
    return values;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data.");
  }
}