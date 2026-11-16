"use client";

import {
  CheckIcon,
  CopyIcon,
  ShareNetworkIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useState, useSyncExternalStore } from "react";
import useSWR from "swr";

import { Button } from "@/components/button";
import { FounderPill } from "@/components/invites/founder-badge";
import { Navigation } from "@/components/navigation";
import { Spinner } from "@/components/spinner";
import { MyInvite } from "@/interfaces/invites";
import { fetcherWithToken } from "@/lib/swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const noopSubscribe = () => () => {};

function shareText(link: string) {
  return `Oi! Estou usando o Neybor para saber o que acontece no nosso bairro: alertas de segurança, avisos da Defesa Civil e indicação de serviços entre vizinhos. Entra pelo meu convite: ${link}`;
}

export default function InvitePage() {
  const { data: session } = useSession();
  const token = session?.user.token;
  const { data, error, isLoading } = useSWR<MyInvite>(
    token ? [`${API_URL}/invites/me`, token] : null,
    fetcherWithToken,
  );
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);

  const link = data && origin ? `${origin}/convite/${data.code}` : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleShare() {
    navigator
      .share({ title: "Convite para o Neybor", text: shareText(link) })
      .catch(() => {});
  }

  const spotsLeft = data
    ? Math.max(0, data.foundersLimit - data.neighborsInArea)
    : 0;

  return (
    <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
      <Navigation title="Convidar vizinhos" />

      <section className="flex flex-col items-center text-center py-4">
        <UsersThreeIcon size={48} weight="duotone" className="text-green-700" />
        <h1 className="mt-2 font-semibold text-2xl text-neutral-800 text-balance">
          O Neybor fica melhor com seus vizinhos
        </h1>
        <p className="mt-1 text-neutral-600 text-balance max-w-md">
          Quanto mais gente da rua estiver aqui, mais rápido chegam os alertas e
          as indicações. Mande seu convite no grupo do prédio ou da rua.
        </p>
      </section>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-red-700 font-semibold py-4">
          Não conseguimos carregar seu convite agora. Tente de novo em
          instantes.
        </p>
      )}

      {data && (
        <>
          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText(link))}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!link}
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold px-5 py-3 text-lg transition"
            >
              <WhatsappLogoIcon size={22} weight="fill" />
              Convidar pelo WhatsApp
            </a>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 flex items-center rounded-full bg-neutral-100 px-4 text-neutral-700 font-medium">
                <span className="truncate">{link}</span>
              </div>
              <Button
                variant="secondary"
                onClick={handleCopy}
                icon={copied ? CheckIcon : CopyIcon}
                iconPlacement="leading"
                disabled={!link}
              >
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            {canShare && (
              <Button
                variant="bordered"
                fullWidth
                onClick={handleShare}
                icon={ShareNetworkIcon}
                iconPlacement="leading"
              >
                Compartilhar de outro jeito
              </Button>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <dt className="text-sm text-neutral-600 font-semibold">
                Entraram pelo seu convite
              </dt>
              <dd className="text-3xl font-semibold text-neutral-800">
                {data.invitedCount}
              </dd>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <dt className="text-sm text-neutral-600 font-semibold">
                Vizinhos na sua área
              </dt>
              <dd className="text-3xl font-semibold text-neutral-800">
                {data.neighborsInArea}
              </dd>
            </div>
          </dl>

          <section className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            {data.founder.founder ? (
              <>
                <FounderPill number={data.founder.number} />
                <p className="mt-2 text-neutral-700">
                  Você foi{" "}
                  {data.founder.number
                    ? `o ${data.founder.number}º vizinho`
                    : "um dos primeiros vizinhos"}{" "}
                  a entrar no Neybor na sua área. O selo aparece no seu perfil.
                </p>
              </>
            ) : (
              <>
                <strong className="font-semibold text-neutral-800">
                  Fundadores do bairro
                </strong>
                <p className="mt-1 text-neutral-700">
                  Os {data.foundersLimit} primeiros vizinhos de cada área ganham
                  o selo de fundador no perfil.{" "}
                  {spotsLeft > 0
                    ? `Ainda ${spotsLeft === 1 ? "resta 1 vaga" : `restam ${spotsLeft} vagas`} perto de você: convide quem mora aí.`
                    : "Na sua área as vagas já foram preenchidas, mas cada convite ainda fortalece a rede."}
                </p>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
