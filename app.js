/**
 * ==============================================================================
 * 국악 타악 연주가 방승환 공식 웹사이트 메인 스크립트 (app.js)
 * ==============================================================================
 * - 빌드 도구 없이 브라우저에서 직접(file:// 포함) 완벽하게 동작
 * - data.js의 데이터를 기반으로 UI 동적 렌더링
 * - 갤러리 탭 필터링, 이미지/영상 라이트박스 모달
 * - 문의 폼 유효성 검사 및 정직한 백엔드 피드백 (mailto / 클립보드 복사 연계)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.SITE_DATA;
  if (!data) {
    console.error('SITE_DATA를 찾을 수 없습니다. data.js 파일이 올바르게 로드되었는지 확인하세요.');
    return;
  }

  // --- SVG 아이콘 맵 (시각적 풍성함과 로컬 환경 독립성 보장) ---
  const SVG_ICONS = {
    drum: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zm0 2c4.42 0 8 1.43 8 2.5S16.42 9 12 9 4 7.57 4 6.5 7.58 4 12 4zm8 13.5c0 .36-.61 1.05-2.22 1.63-1.63.59-3.72.87-5.78.87s-4.15-.28-5.78-.87C4.61 18.55 4 17.86 4 17.5v-2.28c1.88 1.13 4.77 1.78 8 1.78s6.12-.65 8-1.78v2.28zm0-4.5c0 .36-.61 1.05-2.22 1.63-1.63.59-3.72.87-5.78.87s-4.15-.28-5.78-.87C4.61 14.05 4 13.36 4 13v-2.28c1.88 1.13 4.77 1.78 8 1.78s6.12-.65 8-1.78v2.28z"/></svg>`,
    scholar: `<svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
    education: `<svg viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>`,
    collaboration: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:currentColor;"><path d="M8 5v14l11-7z"/></svg>`,
    zoom: `<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    koreanPattern: `<svg viewBox="0 0 100 100" style="width:64px;height:64px;fill:var(--color-gold);"><circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="2"/><path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 0 50 50 A22 22 0 0 1 50 6 Z" fill="currentColor" opacity="0.3"/><circle cx="50" cy="28" r="6" fill="currentColor"/><circle cx="50" cy="72" r="6" fill="currentColor"/></svg>`
  };

  // --- 1. 네비게이션 & 스크롤 관리 ---
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }

    // 섹션 활성 상태 체크
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // 모바일 메뉴 토글
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
  }

  // 메뉴 링크 클릭 시 모바일 메뉴 닫기
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  });

  // 위로 가기 버튼
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 2. 프로필 섹션 렌더링 ---
  const strengthsContainer = document.getElementById('profile-strengths');
  if (strengthsContainer && data.profile.strengths) {
    strengthsContainer.innerHTML = data.profile.strengths.map(item => `
      <div class="strength-card">
        <div class="strength-icon-box">
          ${SVG_ICONS[item.icon] || SVG_ICONS.drum}
        </div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `).join('');
  }

  const philosophyContainer = document.getElementById('profile-philosophies');
  if (philosophyContainer && data.profile.philosophies) {
    philosophyContainer.innerHTML = data.profile.philosophies.map(item => `
      <div class="philosophy-card">
        <span class="philosophy-hanja">${item.keyword}</span>
        <h4>${item.title}</h4>
        <p>"${item.quote}"</p>
      </div>
    `).join('');
  }

  // --- 3. 경력 타임라인 렌더링 ---
  const timelineContainer = document.getElementById('career-timeline-list');
  if (timelineContainer && data.careerTimeline) {
    timelineContainer.innerHTML = data.careerTimeline.map(item => `
      <div class="timeline-item ${item.confirmed ? 'confirmed' : 'placeholder'}">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-header">
            <div class="timeline-badge-group">
              <span class="timeline-year">${item.year}</span>
              <span class="timeline-category">${item.category}</span>
            </div>
            <span class="timeline-status ${item.confirmed ? 'verified' : 'placeholder'}">
              ${item.confirmed ? '✓ 공식 확인 이력' : '✎ 편집 안내'}
            </span>
          </div>
          <h4 class="timeline-title">${item.title}</h4>
          <p class="timeline-desc">${item.description}</p>
          ${!item.confirmed ? `<div class="timeline-edit-hint">data.js에서 실제 경력으로 손쉽게 교체할 수 있습니다.</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // --- 4. 강의 및 교육 프로그램 렌더링 ---
  const programsContainer = document.getElementById('programs-grid');
  if (programsContainer && data.educationPrograms) {
    programsContainer.innerHTML = data.educationPrograms.map(item => `
      <div class="program-card" data-program-id="${item.id}">
        <div class="program-card-header">
          <div class="program-tag-row">
            <span class="program-tag">${item.tag}</span>
            <span class="program-badge">${item.badgeText}</span>
          </div>
          <h4 class="program-title">${item.title}</h4>
          <p class="program-summary">${item.summary}</p>
        </div>
        <div class="program-body">
          <div class="program-meta-item">
            <h5>교육 대상</h5>
            <p>${item.target}</p>
          </div>
          <div class="program-meta-item">
            <h5>주요 커리큘럼</h5>
            <ul class="program-curriculum-list">
              ${item.curriculum.map(curr => `<li>${curr}</li>`).join('')}
            </ul>
          </div>
          <div class="program-meta-item">
            <h5>진행 방식</h5>
            <p>${item.format}</p>
          </div>
        </div>
        <div class="program-footer">
          <button type="button" class="btn btn-outline btn-sm program-inquiry-btn" style="width:100%;" data-title="${item.title}">
            이 교육과정 문의하기 →
          </button>
        </div>
      </div>
    `).join('');

    // 프로그램 문의 버튼 클릭 시 문의 폼 연동
    document.querySelectorAll('.program-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        selectInquiryTopic('강의 및 교육 문의', `[강의 문의] ${title} 과정에 대한 커리큘럼 및 일정 상담을 신청합니다.`);
      });
    });
  }

  // --- 5. 공연 및 협업 렌더링 ---
  const collabContainer = document.getElementById('collab-grid');
  if (collabContainer && data.collaborations) {
    collabContainer.innerHTML = data.collaborations.map(item => `
      <div class="collab-card">
        <span class="collab-category">${item.category}</span>
        <h4 class="collab-title">${item.title}</h4>
        <p class="collab-desc">${item.description}</p>
        <div class="collab-examples">
          <p><strong>주요 협업 예시:</strong> ${item.examples}</p>
        </div>
        <button type="button" class="btn btn-outline-white btn-sm collab-inquiry-btn" data-title="${item.title}">
          ${item.buttonText} →
        </button>
      </div>
    `).join('');

    // 협업 문의 버튼 클릭 시 문의 폼 연동
    document.querySelectorAll('.collab-inquiry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        selectInquiryTopic('공연 및 협업 제안', `[협업 제안] ${title} 관련하여 프로젝트 일정 및 상세 내용을 제안드립니다.`);
      });
    });
  }

  // --- 6. 갤러리 렌더링 & 탭 필터링 ---
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryTabs = document.querySelectorAll('.tab-btn');

  function renderGallery(filter = 'all') {
    if (!galleryGrid || !data.gallery) return;

    const filtered = data.gallery.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'photo') return item.type === 'photo';
      if (filter === 'video') return item.type === 'video';
      return true;
    });

    galleryGrid.innerHTML = filtered.map((item, index) => {
      const isVideo = item.type === 'video';
      return `
        <div class="gallery-card" data-gallery-id="${item.id}" data-type="${item.type}">
          <div class="gallery-media-wrap">
            <span class="gallery-badge ${isVideo ? 'video' : ''}">
              ${isVideo ? '▶ 영상' : '📷 사진'} | ${item.category}
            </span>
            
            ${item.imageSrc ? `
              <img src="${item.imageSrc}" alt="${item.title}" class="gallery-card-img" />
            ` : `
              <div class="placeholder-art">
                ${SVG_ICONS.koreanPattern}
                <div class="placeholder-art-title">${item.title}</div>
                <div class="placeholder-art-tag">방승환 국악 타악 아카이브</div>
              </div>
            `}
            
            ${isVideo ? `
              <div class="gallery-play-icon">${SVG_ICONS.play}</div>
            ` : `
              <div class="gallery-play-icon" style="background:rgba(28,30,36,0.7);">${SVG_ICONS.zoom}</div>
            `}
          </div>
          <div class="gallery-card-content">
            <div class="gallery-card-meta">
              <span>${item.datePlaceholder}</span>
              <span>자세히 보기</span>
            </div>
            <h4 class="gallery-card-title">${item.title}</h4>
            <p class="gallery-card-desc">${item.description}</p>
            <div class="gallery-card-footer">
              <span>${item.noticeText}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 갤러리 카드 클릭 시 라이트박스 오픈
    document.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-gallery-id');
        const item = data.gallery.find(g => g.id === id);
        if (item) {
          openLightbox(item);
        }
      });
    });
  }

  // 초기 렌더링
  renderGallery('all');

  // 탭 클릭 이벤트
  galleryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const filter = e.currentTarget.getAttribute('data-filter');
      renderGallery(filter);
    });
  });

  // --- 7. 라이트박스 모달 핸들러 ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMediaBox = document.getElementById('lightbox-media-box');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxHint = document.getElementById('lightbox-hint');

  function openLightbox(item) {
    if (!lightboxModal) return;

    lightboxTitle.textContent = item.title;
    lightboxCaption.textContent = item.description;
    lightboxHint.textContent = item.noticeText;

    if (item.type === 'video') {
      lightboxMediaBox.innerHTML = `
        <iframe src="${item.videoUrl}" title="${item.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else {
      if (item.imageSrc) {
        lightboxMediaBox.innerHTML = `<img src="${item.imageSrc}" alt="${item.title}" />`;
      } else {
        lightboxMediaBox.innerHTML = `
          <div class="placeholder-art" style="min-height:360px;width:100%;">
            ${SVG_ICONS.koreanPattern}
            <div class="placeholder-art-title" style="font-size:1.4rem;margin-top:12px;">${item.title}</div>
            <div class="placeholder-art-tag" style="margin-top:6px;">국악 타악 연주가 방승환 | 공식 아카이브 사진</div>
            <p style="font-size:0.85rem;color:#8a909d;margin-top:16px;max-width:400px;">
              현재는 안내용 그래픽이 표시되고 있습니다.<br>
              <strong>data.js</strong> 파일에서 실제 고해상도 사진 파일 경로(imageSrc)를 지정하시면 이 영역에 실제 사진이 바로 표시됩니다.
            </p>
          </div>
        `;
      }
    }

    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // --- 8. 범용 모달 닫기 로직 ---
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close') || e.target.closest('.modal-close-btn')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        // 비디오 iframe 정지
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = iframe.src;
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.src = iframe.src;
      });
    }
  });

  // --- 9. 문의 폼 로직 및 정직한 백엔드 피드백 ---
  const contactForm = document.getElementById('contact-form');
  const inquiryTypeSelect = document.getElementById('inquiry-type');
  const inquiryDetails = document.getElementById('inquiry-details');
  const categoryBtns = document.querySelectorAll('.form-category-btn');
  const feedbackModal = document.getElementById('feedback-modal');
  const copyDetailsBox = document.getElementById('copy-details-box');
  const mailtoBtn = document.getElementById('mailto-action-btn');
  const copyBtn = document.getElementById('copy-action-btn');

  // 상단 탭으로 문의 유형 자동 선택
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const val = e.currentTarget.getAttribute('data-value');
      if (inquiryTypeSelect) inquiryTypeSelect.value = val;
    });
  });

  function selectInquiryTopic(type, defaultMessage) {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    if (inquiryTypeSelect) {
      inquiryTypeSelect.value = type;
    }

    categoryBtns.forEach(btn => {
      if (btn.getAttribute('data-value') === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (inquiryDetails && !inquiryDetails.value.trim()) {
      inquiryDetails.value = defaultMessage;
    }
  }

  // 폼 제출 이벤트
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // 필드 검증
      const nameInput = document.getElementById('inquiry-name');
      const contactInput = document.getElementById('inquiry-contact');
      const privacyCheck = document.getElementById('privacy-agree');

      function validateField(input, errorId, condition) {
        const errorEl = document.getElementById(errorId);
        if (!condition) {
          input.classList.add('error');
          if (errorEl) errorEl.classList.add('show');
          isValid = false;
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('show');
        }
      }

      validateField(nameInput, 'err-name', nameInput.value.trim().length > 0);
      validateField(contactInput, 'err-contact', contactInput.value.trim().length > 0);
      validateField(inquiryDetails, 'err-details', inquiryDetails.value.trim().length > 0);
      
      const privacyErr = document.getElementById('err-privacy');
      if (!privacyCheck.checked) {
        if (privacyErr) privacyErr.classList.add('show');
        isValid = false;
      } else {
        if (privacyErr) privacyErr.classList.remove('show');
      }

      if (!isValid) {
        return;
      }

      // 제출 데이터 정리
      const formData = {
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        email: document.getElementById('inquiry-email').value.trim() || '미입력',
        type: inquiryTypeSelect.value,
        date: document.getElementById('inquiry-date').value.trim() || '일정 협의 가능',
        location: document.getElementById('inquiry-location').value.trim() || '미정',
        attendees: document.getElementById('inquiry-attendees').value.trim() || '미정',
        message: inquiryDetails.value.trim()
      };

      const mailBodyText = `[방승환 국악 타악 연주가 웹사이트 문의]
-------------------------------------------
■ 성명/기관명: ${formData.name}
■ 연락처: ${formData.contact}
■ 이메일: ${formData.email}
■ 문의 유형: ${formData.type}
■ 희망 일정: ${formData.date}
■ 행사/교육 장소: ${formData.location}
■ 예상 인원: ${formData.attendees}
-------------------------------------------
[문의 상세 내용]
${formData.message}
-------------------------------------------
(접수 일시: ${new Date().toLocaleString('ko-KR')})`;

      // 정직한 백엔드 모달에 내용 반영
      if (copyDetailsBox) {
        copyDetailsBox.textContent = mailBodyText;
      }

      // mailto 버튼 연결
      if (mailtoBtn) {
        const targetEmail = data.contactInfo.email || 'contact@bangseunghwan-art.com';
        const subject = encodeURIComponent(`[웹사이트 문의] ${formData.name}님의 ${formData.type} 신청`);
        const body = encodeURIComponent(mailBodyText);
        mailtoBtn.setAttribute('href', `mailto:${targetEmail}?subject=${subject}&body=${body}`);
      }

      // 클립보드 복사 버튼 설정
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(mailBodyText).then(() => {
            copyBtn.textContent = '✓ 복사 완료! (원하는 곳에 붙여넣으세요)';
            setTimeout(() => {
              copyBtn.textContent = '📋 문의 내용 전체 복사하기';
            }, 3000);
          }).catch(() => {
            alert('클립보드 복사에 실패했습니다. 위 박스의 텍스트를 직접 드래그하여 복사해 주세요.');
          });
        };
      }

      // 결과 안내 모달 열기
      if (feedbackModal) {
        feedbackModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // --- 10. 안내 모달 (개인정보 처리방침 & 데이터 수정 가이드) ---
  const privacyLink = document.getElementById('open-privacy-link');
  const privacyModal = document.getElementById('privacy-modal');
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const guideBtn = document.getElementById('open-guide-btn');
  const guideModal = document.getElementById('guide-modal');
  if (guideBtn && guideModal) {
    guideBtn.addEventListener('click', (e) => {
      e.preventDefault();
      guideModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
});
