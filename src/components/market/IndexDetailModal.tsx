"use client";

import { useEffect, useRef } from "react";
import type { MarketIndex } from "@/lib/market";
import { getCurrencyPrefix, getCurrencySuffix, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import PriceChart from "./PriceChart";

/** 지수 설명 데이터 */
const INDEX_DESCRIPTIONS: Record<string, { desc: string; detail: string }> = {
  "^IXIC": {
    desc: "나스닥 종합 지수",
    detail: "미국 나스닥 거래소에 상장된 모든 종목의 시가총액 가중 지수입니다. 기술주 비중이 높아 IT/성장주 시장의 바로미터로 사용됩니다. 약 3,000개 이상의 종목이 포함되어 있으며, Apple, Microsoft, Amazon, NVIDIA 등 대형 기술주가 주요 구성종목입니다.",
  },
  "^GSPC": {
    desc: "S&P 500 지수",
    detail: "미국 대형주 500개로 구성된 시가총액 가중 지수로, 미국 주식시장 전체의 약 80%를 대표합니다. 가장 널리 사용되는 미국 시장 벤치마크이며, 대부분의 인덱스 펀드와 ETF가 이 지수를 추종합니다.",
  },
  "^DJI": {
    desc: "다우존스 산업평균 지수",
    detail: "미국을 대표하는 우량 대기업 30개로 구성된 가격 가중 지수입니다. 1896년에 시작된 가장 오래된 주가지수 중 하나로, 미국 경제의 전반적인 건전성을 나타냅니다. 주가 가중 방식이라 고가주의 영향이 큽니다.",
  },
  "^RUT": {
    desc: "러셀 2000 지수",
    detail: "미국 소형주 2,000개로 구성된 지수입니다. 대형주 중심의 S&P 500과 달리 소규모 기업의 성과를 추적하며, 미국 내수경제의 건전성을 가늠하는 지표로 활용됩니다. 소형주는 경기 민감도가 높아 경기 선행 지표로도 사용됩니다.",
  },
  "^SOX": {
    desc: "필라델피아 반도체 지수",
    detail: "미국에 상장된 주요 반도체 기업 30개로 구성된 지수입니다. NVIDIA, AMD, Intel, Broadcom 등 반도체 설계·제조·장비 기업이 포함되며, AI/데이터센터 수요와 밀접한 관계가 있어 기술 섹터의 핵심 지표입니다.",
  },
  "NQ=F": {
    desc: "나스닥 100 선물",
    detail: "나스닥 100 지수를 기초자산으로 하는 선물 계약입니다. 정규 시장 마감 후에도 거래되어 다음 거래일의 나스닥 방향성을 가늠하는 데 사용됩니다. 프리마켓·애프터마켓 시간대에 시장 심리를 파악하는 핵심 지표입니다.",
  },
  "ES=F": {
    desc: "S&P 500 E-mini 선물",
    detail: "S&P 500 지수를 기초자산으로 하는 선물 계약으로, 세계에서 가장 거래량이 많은 주가지수 선물입니다. 24시간 거래되어 글로벌 이벤트에 대한 미국 시장의 반응을 실시간으로 반영합니다.",
  },
  "YM=F": {
    desc: "다우존스 E-mini 선물",
    detail: "다우존스 산업평균 지수를 기초자산으로 하는 선물 계약입니다. 정규 시장 외 시간에 다우지수의 방향성을 확인할 수 있으며, 기관 투자자들의 헤지 수단으로 활발히 사용됩니다.",
  },
  "^KS11": {
    desc: "코스피 지수",
    detail: "한국거래소(KRX)에 상장된 대형주 중심의 종합주가지수입니다. 삼성전자, SK하이닉스, 현대차 등 한국 대표 기업이 포함되며, 한국 주식시장 전체의 흐름을 대표합니다. 시가총액 가중 방식으로 산출됩니다.",
  },
  "^KQ11": {
    desc: "코스닥 지수",
    detail: "한국 코스닥 시장에 상장된 중소·벤처 기업 중심의 지수입니다. 바이오, IT, 게임 등 성장산업 기업이 많이 포함되어 있으며, 코스피보다 변동성이 높고 성장주 투자 심리를 반영합니다.",
  },
  "^KS200": {
    desc: "코스피 200 지수",
    detail: "한국거래소 상장 대형주 200개로 구성된 시가총액 가중 지수입니다. 코스피의 핵심 종목만 포함하여 한국 대표 기업의 성과를 추적합니다. 선물·옵션의 기초자산으로 사용되며, 기관 투자자들의 벤치마크 지수입니다.",
  },
  "EWY": {
    desc: "iShares MSCI South Korea ETF (야간선물 대용)",
    detail: "미국 NYSE에 상장된 한국 시장 추종 ETF로, 삼성전자·SK하이닉스·현대차 등 한국 대표주를 포함합니다. 미국 장 시간(한국 야간 23:30~06:00)에 거래되어 코스피 야간선물의 대용 지표로 활용됩니다. 한국 시장이 닫힌 후에도 글로벌 이벤트에 대한 한국 주식의 반응을 실시간으로 확인할 수 있습니다.",
  },
  "KRW=X": {
    desc: "달러/원 환율",
    detail: "1 미국 달러(USD)에 대한 원화(KRW) 가격입니다. 환율이 상승하면 원화 약세(달러 강세), 하락하면 원화 강세를 의미합니다. 한국 수출기업, 해외투자, 물가에 직접적인 영향을 미치는 핵심 경제 지표입니다.",
  },
  "EURUSD=X": {
    desc: "유로/달러 환율",
    detail: "1 유로(EUR)에 대한 미국 달러(USD) 가격입니다. 세계에서 가장 거래량이 많은 통화쌍으로, 유럽과 미국의 상대적 경제 강도를 반영합니다. ECB와 연준의 금리 정책에 민감하게 반응합니다.",
  },
  "JPY=X": {
    desc: "달러/엔 환율",
    detail: "1 미국 달러(USD)에 대한 일본 엔(JPY) 가격입니다. 엔화는 전통적인 안전자산으로, 글로벌 불확실성이 높아지면 엔 강세(수치 하락)가 나타나는 경향이 있습니다. 일본은행(BOJ)의 통화정책에 큰 영향을 받습니다.",
  },
  "^VIX": {
    desc: "VIX 공포 지수",
    detail: "S&P 500 옵션의 내재 변동성을 측정하는 지수로, '공포 지수'로 불립니다. 20 이하면 시장 안정, 30 이상이면 높은 불확실성, 40 이상이면 극도의 공포를 나타냅니다. 주가와 역의 상관관계를 보이는 경향이 있습니다.",
  },
  "GC=F": {
    desc: "금 선물",
    detail: "COMEX에서 거래되는 금 선물 가격(트로이온스당 USD)입니다. 대표적인 안전자산으로, 인플레이션 헤지·지정학적 리스크 회피 수단으로 사용됩니다. 달러 약세, 금리 하락 시 금 가격이 상승하는 경향이 있습니다.",
  },
  "CL=F": {
    desc: "WTI 원유 선물",
    detail: "서부 텍사스 중질유(WTI) 선물 가격(배럴당 USD)으로, 국제 유가의 기준이 됩니다. 글로벌 경기, OPEC 생산량, 지정학적 갈등에 민감하게 반응하며, 에너지 비용과 인플레이션에 직접적인 영향을 미칩니다.",
  },
  "SI=F": {
    desc: "은 선물",
    detail: "COMEX에서 거래되는 은 선물 가격(트로이온스당 USD)입니다. 귀금속이자 산업용 금속의 이중적 성격을 가지며, 금과 유사하게 안전자산 역할을 하면서도 산업 수요(전자·태양광)의 영향도 받습니다.",
  },
  "BTC-USD": {
    desc: "비트코인",
    detail: "세계 최초이자 최대 시가총액의 암호화폐입니다. 탈중앙화 디지털 자산으로, 2,100만 개의 공급 상한이 있어 '디지털 금'으로 불립니다. 기관 투자, ETF 승인, 규제 변화에 민감하며 높은 변동성을 보입니다.",
  },
  "ETH-USD": {
    desc: "이더리움",
    detail: "스마트 컨트랙트 플랫폼 기반의 암호화폐로, 비트코인 다음으로 큰 시가총액을 보유합니다. DeFi, NFT, 레이어2 생태계의 기반이 되며, 스테이킹(PoS) 전환 이후 공급 감소 효과가 나타나고 있습니다.",
  },
  "^TNX": {
    desc: "미국 10년 국채 금리",
    detail: "미국 정부가 발행하는 10년 만기 국채의 수익률입니다. 글로벌 금융시장의 '무위험 수익률' 기준으로, 주택담보대출 금리·기업 대출 금리의 벤치마크가 됩니다. 금리 상승 시 성장주에 불리하고, 가치주에 유리한 경향이 있습니다.",
  },
  "^TYX": {
    desc: "미국 30년 국채 금리",
    detail: "미국 정부가 발행하는 30년 만기 장기 국채의 수익률입니다. 장기 인플레이션 기대와 경제 성장 전망을 반영하며, 10년물과의 스프레드(장단기 금리차)는 경기 침체 예측 지표로 활용됩니다.",
  },
};

interface IndexDetailModalProps {
  idx: MarketIndex | null;
  onClose: () => void;
}

export default function IndexDetailModal({ idx, onClose }: IndexDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!idx) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      // 포커스 트랩 — Tab 키로 모달 외부 이동 방지
      // Focus trap — prevent Tab from leaving modal
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // 모달 열리면 닫기 버튼에 포커스
    // Focus close button when modal opens
    const closeBtn = modalRef.current?.querySelector<HTMLElement>("button[aria-label]");
    closeBtn?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [idx, onClose]);

  if (!idx) return null;

  const isUp = idx.change > 0;
  const isDown = idx.change < 0;
  const info = INDEX_DESCRIPTIONS[idx.symbol];
  const prefix = getCurrencyPrefix(idx.symbol);
  const suffix = getCurrencySuffix(idx.symbol);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up p-2 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="index-detail-title"
    >
      <div ref={modalRef} className="relative w-full max-w-2xl lg:max-w-4xl rounded-2xl border border-border/40 bg-card p-4 sm:p-6 lg:p-8 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="mb-5">
          <h3 id="index-detail-title" className="text-lg font-bold text-foreground">{idx.nameKo}</h3>
          <p className="text-[12px] text-muted-foreground/60">{idx.name} · {idx.symbol}</p>
        </div>

        {/* 가격 정보 */}
        <div className="rounded-xl border border-border/30 bg-muted/20 p-4 mb-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground/60 mb-1">현재가</p>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {prefix}{formatPrice(idx.price, idx.symbol)}{suffix}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-[15px] font-bold tabular-nums",
                  isUp && "text-red-400",
                  isDown && "text-blue-400",
                  !isUp && !isDown && "text-muted-foreground"
                )}
              >
                {isUp ? "+" : ""}{idx.change.toFixed(2)}
              </p>
              <p
                className={cn(
                  "text-[13px] font-semibold tabular-nums",
                  isUp && "text-red-400/80",
                  isDown && "text-blue-400/80",
                  !isUp && !isDown && "text-muted-foreground/60"
                )}
              >
                {isUp ? "+" : ""}{idx.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/20 flex justify-between text-[12px]">
            <span className="text-muted-foreground/50">전일 종가</span>
            <span className="text-muted-foreground tabular-nums">
              {prefix}{formatPrice(idx.previousClose, idx.symbol)}{suffix}
            </span>
          </div>
        </div>

        {/* 가격 차트 (2일간 인트라데이) */}
        {/* Price chart (2-day intraday) */}
        <PriceChart symbol={idx.symbol} />

        {/* 지수 설명 */}
        {info && (
          <div className="space-y-2">
            <h4 className="text-[13px] font-semibold text-foreground/80 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              {info.desc}
            </h4>
            <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
              {info.detail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

