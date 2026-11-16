"use client";

import { FlagPennantIcon } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { FounderStatus } from "@/interfaces/invites";
import { fetcherWithToken } from "@/lib/swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** Selo "Fundador do bairro" para um dos primeiros moradores da área no Neybor. */
export function FounderBadge({ profileId }: { profileId: number }) {
  const { data: session } = useSession();
  const token = session?.user.token;
  const { data } = useSWR<FounderStatus>(
    token ? [`${API_URL}/invites/founders/${profileId}`, token] : null,
    fetcherWithToken,
    { revalidateOnFocus: false },
  );

  if (!data?.founder) return null;

  return <FounderPill number={data.number} />;
}

export function FounderPill({ number }: { number: number | null }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-sm font-semibold"
      title={
        number ? `${number}º vizinho a entrar no Neybor nesta área` : undefined
      }
    >
      <FlagPennantIcon weight="fill" />
      Fundador do bairro
      {number ? <span className="text-amber-600">#{number}</span> : null}
    </span>
  );
}
