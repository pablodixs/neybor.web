"use client";

import {
  ArrowRightIcon,
  FlagPennantIcon,
  MapPinLineIcon,
} from "@phosphor-icons/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

import { Button } from "@/components/button";
import { rememberInvite } from "@/components/invites/pending-invite";
import { Spinner } from "@/components/spinner";
import { InvitePreview } from "@/interfaces/invites";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const fetchPreview = (url: string) =>
  axios.get<InvitePreview>(url).then((res) => res.data);

/** Página aberta pelo link de convite que o vizinho mandou no WhatsApp. */
export default function InviteLandingPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { status } = useSession();
  const { data, error, isLoading } = useSWR(
    code ? `${API_URL}/public/invites/${encodeURIComponent(code)}` : null,
    fetchPreview,
    { revalidateOnFocus: false },
  );

  // guarda o convite já na chegada: vale mesmo se a pessoa sair e voltar
  useEffect(() => {
    if (code && data) rememberInvite(code);
  }, [code, data]);

  const place = data?.neighborhood
    ? `${data.neighborhood}${data.city ? `, ${data.city}` : ""}`
    : data?.city;

  return (
    <main className="bg-neutral-100 flex justify-center items-center min-h-dvh px-4 py-6">
      <section className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col items-center text-center">
        <h1 className="text-green-600 font-semibold text-2xl">Neybor</h1>

        {isLoading && (
          <div className="py-12">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="py-8">
            <p className="font-semibold text-neutral-800 text-lg">
              Esse convite não existe mais.
            </p>
            <p className="mt-1 text-neutral-600">
              Você ainda pode criar sua conta e encontrar seus vizinhos.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3"
            >
              Criar minha conta
              <ArrowRightIcon weight="bold" />
            </Link>
          </div>
        )}

        {data && (
          <>
            <Image
              className="mt-6 rounded-full aspect-square object-cover w-20 h-20 bg-neutral-100"
              src={data.inviterAvatarUrl || "/images/default-avatar.png"}
              alt=""
              width={80}
              height={80}
            />
            <p className="mt-3 text-xl font-semibold text-neutral-800 text-balance">
              {data.inviterName} te convidou para a vizinhança no Neybor
            </p>
            {place && (
              <p className="mt-1 inline-flex items-center gap-1 font-semibold text-green-800">
                <MapPinLineIcon weight="bold" />
                {place}
              </p>
            )}
            <p className="mt-4 text-neutral-600 text-balance">
              Alertas de segurança, avisos da Defesa Civil e indicações de
              serviços, só de quem mora perto de você.
            </p>

            {data.neighborsInArea > 0 && (
              <p className="mt-4 text-sm font-semibold text-neutral-700">
                {data.neighborsInArea === 1
                  ? "1 vizinho já está aqui"
                  : `${data.neighborsInArea} vizinhos já estão aqui`}
              </p>
            )}
            {data.foundersSpotsLeft > 0 && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-sm font-semibold">
                <FlagPennantIcon weight="fill" />
                Entre agora e seja um dos fundadores do bairro
              </p>
            )}

            <div className="mt-6 w-full flex flex-col gap-2">
              {status === "authenticated" ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => router.replace("/feed")}
                >
                  Ir para minha vizinhança
                </Button>
              ) : (
                <>
                  <Button
                    fullWidth
                    size="lg"
                    icon={ArrowRightIcon}
                    onClick={() => router.push("/auth/signin")}
                  >
                    Criar minha conta
                  </Button>
                  <Link
                    href="/auth/login"
                    className="py-2 font-semibold text-neutral-700 hover:text-green-700"
                  >
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
