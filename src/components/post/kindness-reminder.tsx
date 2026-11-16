"use client";

import { HandHeartIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import axios from "axios";

import { Button } from "../button";

export type KindnessReason =
  | "OFFENSIVE_LANGUAGE"
  | "THREAT"
  | "PROFILING"
  | "VAGUE_SUSPICION"
  | "SHOUTING";

export interface KindnessCheck {
  flagged: boolean;
  reasons: KindnessReason[];
  terms: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const REASON_COPY: Record<KindnessReason, { title: string; body: string }> = {
  PROFILING: {
    title: "Conte o que a pessoa fez, não como ela é",
    body: 'Cor da pele, origem ou jeito de se vestir não tornam ninguém suspeito. Diga o que você viu acontecer, como "tentou abrir o portão", e, se ajudar, a roupa e para onde a pessoa foi.',
  },
  VAGUE_SUSPICION: {
    title: "O que te deixou preocupado?",
    body: "Estar na rua não é crime. Conte o que a pessoa fez, como tentar abrir um carro ou pular um muro, para os vizinhos saberem como agir.",
  },
  OFFENSIVE_LANGUAGE: {
    title: "Que tal dizer de outro jeito?",
    body: "Xingamentos costumam virar briga e afastam quem poderia ajudar. Fale do problema, não da pessoa.",
  },
  THREAT: {
    title: "Deixe a ação com as autoridades",
    body: "Ameaças e chamados para fazer justiça com as próprias mãos colocam vizinhos em risco. Em uma emergência, ligue 190.",
  },
  SHOUTING: {
    title: "Parece que você está gritando",
    body: "Texto todo em letras maiúsculas soa como grito. Em letras normais fica mais fácil de ler.",
  },
};

/**
 * Pergunta ao backend se o texto merece o lembrete de gentileza.
 * Se a checagem falhar (rede, servidor fora), devolve null e o post segue:
 * o lembrete nunca pode impedir alguém de avisar a vizinhança.
 */
export async function checkKindness(
  content: string,
  token: string | undefined,
): Promise<KindnessCheck | null> {
  try {
    const { data } = await axios.post<KindnessCheck>(
      `${API_URL}/post/kindness-check`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      },
    );
    return data;
  } catch {
    return null;
  }
}

interface KindnessReminderProps {
  check: KindnessCheck;
  onEdit: () => void;
  onPublishAnyway: () => void;
}

export function KindnessReminder({
  check,
  onEdit,
  onPublishAnyway,
}: KindnessReminderProps) {
  return (
    <div className="flex flex-col items-center pt-6">
      <HandHeartIcon size={48} weight="duotone" className="text-green-700" />
      <h2 className="mt-2 font-semibold text-xl text-neutral-800 text-center text-balance">
        Antes de publicar, que tal revisar?
      </h2>
      <p className="mt-1 text-neutral-600 text-center text-balance">
        O Neybor é feito por vizinhos. Um post respeitoso ajuda mais gente e
        evita que alguém seja acusado à toa.
      </p>

      <ul className="mt-6 flex flex-col gap-3 w-full">
        {check.reasons.map((reason) => (
          <li key={reason} className="rounded-2xl bg-neutral-50 p-4 text-left">
            <strong className="block font-semibold text-neutral-800">
              {REASON_COPY[reason]?.title ?? "Vale a pena revisar o texto"}
            </strong>
            {REASON_COPY[reason] && (
              <p className="mt-1 text-sm text-neutral-600">
                {REASON_COPY[reason].body}
              </p>
            )}
          </li>
        ))}
      </ul>

      {check.terms.length > 0 && (
        <div className="mt-4 w-full text-sm text-neutral-600">
          <p className="font-semibold">Trechos que chamaram atenção:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {check.terms.map((term) => (
              <span
                key={term}
                className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 font-semibold"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-8 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between w-full">
        <Button variant="ghost" onClick={onPublishAnyway}>
          Publicar assim mesmo
        </Button>
        <Button
          onClick={onEdit}
          icon={PencilSimpleIcon}
          iconPlacement="leading"
        >
          Editar post
        </Button>
      </footer>
    </div>
  );
}
