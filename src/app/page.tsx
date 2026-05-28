import Link from 'next/link';

const PROBLEMS = [
  {
    icon: '😵',
    title: '압도감',
    desc: '할 일이 너무 많아서 어디서부터 시작해야 할지 모르는 느낌',
  },
  {
    icon: '🧭',
    title: '방향 부재',
    desc: '매일 바쁜데 정작 중요한 목표에 가까워지지 않는 느낌',
  },
  {
    icon: '⏳',
    title: '미루는 습관',
    desc: '중요한 일일수록 시작하기 어렵고 계속 뒤로 밀리는 패턴',
  },
];

const FEATURES = [
  {
    icon: '🟢',
    title: '쉬운 일부터',
    desc: '에너지가 낮은 날도 할 수 있는 작은 목표로 시작',
  },
  {
    icon: '🎯',
    title: '난이도 분류',
    desc: '쉬움 / 보통 / 어려움 세 단계로 오늘 할 일 정리',
  },
  {
    icon: '📊',
    title: '진행률 추적',
    desc: 'Progress bar로 하루 성취를 눈으로 확인',
  },
  {
    icon: '📅',
    title: '달력 시각화',
    desc: '한 달 단위로 루틴과 목표 달성 현황 확인',
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="text-center pt-12 pb-4 space-y-6">
        <div className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
          에너지 기반 생산성 앱
        </div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
          Overwhelmed?<br />
          <span className="text-indigo-600">Start with what your<br />energy allows today.</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
          에너지 수준에 맞는 작은 목표부터 시작해<br />
          미루는 습관을 줄이고 삶의 방향성을 되찾도록 돕는 생산성 앱.
        </p>
        <Link
          href="/app"
          className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
        >
          Start Small Today
        </Link>
      </section>

      {/* Problem */}
      <section className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Problem</p>
          <h2 className="text-xl font-bold text-gray-800">이런 경험 있으신가요?</h2>
        </div>
        <div className="space-y-3">
          {PROBLEMS.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-5 border border-gray-200 flex items-start gap-4"
            >
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Features</p>
          <h2 className="text-xl font-bold text-gray-800">핵심 기능</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2"
            >
              <span className="text-xl">{icon}</span>
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-indigo-50 rounded-3xl p-8 text-center space-y-4 border border-indigo-100">
        <p className="text-lg font-semibold text-indigo-900 leading-snug">
          오늘 모든 걸 끝낼 필요는 없어요.
        </p>
        <p className="text-sm text-indigo-500">
          You do not need to finish everything today.
        </p>
        <Link
          href="/app"
          className="inline-block bg-indigo-600 text-white font-semibold px-7 py-3 rounded-full hover:bg-indigo-700 active:scale-95 transition-all"
        >
          오늘 할 일 확인하기
        </Link>
      </section>
    </div>
  );
}
