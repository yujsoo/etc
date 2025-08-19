document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* … (헤더/모바일 메뉴 코드는 그대로 두세요) … */

  // ── Business: 스크롤 진행도에 따라 슬라이드 이동 ─────────────
  const business = document.querySelector(".business");
  const globalSection = document.querySelector(".global");
  if (!business || !globalSection) return;

  // 탭 & con
  const tabWrap = business.querySelector(".bu_slide_tab");
  const tabBtns = Array.from(tabWrap.querySelectorAll("button"));
  const conEls = Array.from(
    business.querySelectorAll(".bu_slide_tab_con .con")
  );

  // 첫 con만 스크롤 연동 대상
  const firstCon = business.querySelector(".bu_slide_tab_con .con");
  const container = firstCon.querySelector(".bu_slide.swiper");
  const next = firstCon.querySelector(".next");
  const prev = firstCon.querySelector(".prev");
  const scrollbar = firstCon.querySelector(".swiper-scrollbar");

  // 공통 Swiper
  let swiper = new Swiper(container, {
    loop: false,
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 500,
    allowTouchMove: window.innerWidth <= 1024,
    navigation: { nextEl: next, prevEl: prev },
    scrollbar: { el: scrollbar, draggable: true },
    observer: true,
    observeParents: true,
  });

  // ----- 핵심: 반응형으로 애니메이션 on/off -----
  let st;
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1200px)", () => {
    // 데스크톱: pin + 스크롤 진행도 → 슬라이드 인덱스
    const slidesCount = container.querySelectorAll(".swiper-slide").length;
    const steps = Math.max(slidesCount - 1, 1);
    const pinDistance = window.innerHeight * steps;

    swiper.allowTouchMove = false;

    st = ScrollTrigger.create({
      trigger: business,
      start: "top top",
      end: `+=${pinDistance}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate(self) {
        const targetIndex = Math.round(self.progress * steps);
        swiper.slideTo(targetIndex, undefined, false);
      },
    });

    // 이 미디어쿼리를 벗어날 때 자동 정리
    return () => {
      st && st.kill();
      st = null;
    };
  });

  mm.add("(max-width: 1199px)", () => {
    // 모바일: 애니메이션/핀 없음. 일반 슬라이드만.
    if (st) {
      st.kill();
      st = null;
    }
    swiper.allowTouchMove = true;
    gsap.set(firstCon, { clearProps: "all" });
  });

  const bg = document.querySelector(".global .oval-reveal .reveal-bg");

  // 데스크톱: 스크롤 진행도에 따라 타원 확장 + pin
  mm.add("(min-width: 1025px)", () => {
    // 시작/끝 크기(퍼센트). 세로를 더 크게 주면 '타원' 느낌이 강함
    const fromX = "0%",
      fromY = "0%";
    const toX = "180%",
      toY = "230%";

    // 시작값 세팅
    gsap.set(bg, { "--mx": fromX, "--my": fromY });

    // 스크롤 → 변수 애니메이션 (scrub)
    const anim = gsap.to(bg, {
      duration: 1,
      ease: "none",
      "--mx": toX,
      "--my": toY,
      scrollTrigger: {
        trigger: ".global",
        start: "top top",
        end: "+=120vh", // 핀 구간 길이 (필요 시 조절)
        pin: true, // 고정
        scrub: true,
        anticipatePin: 1,
      },
    });

    // 이 미디어쿼리 벗어나면 정리
    return () => anim.kill();
  });

  // 모바일: 애니메이션 끄고 펼친 상태로
  mm.add("(max-width: 1024px)", () => {
    gsap.set(bg, { "--mx": "140%", "--my": "180%" });
  });
});
