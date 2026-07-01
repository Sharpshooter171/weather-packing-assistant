import type { Prisma } from "@prisma/client";

import { prisma } from "../db/prisma.js";
import type {
  CreateWeatherRequestData,
  ListWeatherRequestsFilters,
  UpdateWeatherRequestData
} from "../types/weatherRequest.types.js";

export async function createWeatherRequest(data: CreateWeatherRequestData) {
  const createData: Prisma.WeatherRequestCreateInput = {
    aiStatus: "not_requested",
    ...data
  };

  return prisma.weatherRequest.create({
    data: createData
  });
}

export async function listWeatherRequests(filters: ListWeatherRequestsFilters = {}) {
  const { country, limit = 50, location, offset = 0 } = filters;

  return prisma.weatherRequest.findMany({
    where: {
      ...(country ? { country } : {}),
      ...(location
        ? {
            resolvedLocationName: {
              contains: location
            }
          }
        : {})
    },
    orderBy: {
      createdAt: "desc"
    },
    skip: offset,
    take: limit
  });
}

export async function listAllWeatherRequestsForExport() {
  return prisma.weatherRequest.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getWeatherRequestById(id: string) {
  return prisma.weatherRequest.findUnique({
    where: {
      id
    }
  });
}

export async function updateWeatherRequest(id: string, data: UpdateWeatherRequestData) {
  return prisma.weatherRequest.update({
    where: {
      id
    },
    data
  });
}

export async function deleteWeatherRequest(id: string) {
  return prisma.weatherRequest.delete({
    where: {
      id
    }
  });
}
