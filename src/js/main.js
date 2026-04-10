document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  setTimeout(() => {
    // Спочатку тільки opacity
    preloader.style.opacity = '0';
    
    // Display none тільки після того як transition завершився
    preloader.addEventListener('transitionend', () => {
      preloader.style.display = 'none';
    }, { once: true });
    
  }, 3000);
});


// HEADER 
document.addEventListener("DOMContentLoaded", () => {
  const contactBtn = document.querySelector(".social__contact");
  const content = document.querySelector(".social__content");

  contactBtn.addEventListener("click", () => {
    content.classList.toggle("show");
  });
});

function showSocialIcons() {
  const socialContact = document.querySelector('.social__contact');
  const socialContent = document.querySelector('.social__content');
  [socialContact, socialContent].forEach(el => {
    if (!el) return;
    el.style.transition = 'opacity 0.6s ease';
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  });
}

function hideSocialIcons() {
  const socialContact = document.querySelector('.social__contact');
  const socialContent = document.querySelector('.social__content');
  [socialContact, socialContent].forEach(el => {
    if (!el) return;
    el.style.transition = 'opacity 0.6s ease';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOutQuint(t) {
  return t < 0.5
    ? 16 * t ** 5
    : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

function isVisible(el) {
  return el.style.display !== 'none'
    && el.style.opacity !== '0'
    && el.style.zIndex !== '-1'
    && el.style.visibility !== 'hidden';
}

// ============================================================
// ПЛАВНИЙ ZOOM ДО КІНЦЯ
// ============================================================

function animateZoomToEnd(callback) {
  const duration = 1000;
  const startProgress = scrollProgress;
  let startTime = null;

  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    let t = Math.min((timestamp - startTime) / duration, 1);
    t = easeInOut(t);
    scrollProgress = startProgress + (maxScroll - startProgress) * t;
    updateZoomEffect();
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      scrollProgress = maxScroll;
      if (callback) callback();
    }
  }

  requestAnimationFrame(animate);
}

// ============================================================
// ПОВЕРНЕННЯ НА HOME
// ============================================================

function _resetSectionStyles(sec) {
  sec.style.display = 'none';
  sec.style.visibility = 'hidden';
  sec.style.opacity = '0';
  sec.style.zIndex = '-1';
  sec.style.position = '';
  sec.style.top = '';
  sec.style.left = '';
  sec.style.width = '';
  sec.style.height = '';
  sec.style.overflowY = '';
  sec.style.pointerEvents = '';
  sec.style.transform = '';
}

function _doZoomBack() {
  aboutSection.removeEventListener('wheel', handleAboutScroll);
  projectsSection.removeEventListener('wheel', handleProjectsScroll);
  footerSection.removeEventListener('wheel', handleContactsScroll);

  _resetSectionStyles(projectsSection);
  _resetSectionStyles(footerSection);

  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';

  isAboutMeLocked = false;
  isTransitioningToProjects = false;
  isTransitioningToContacts = false;

  const startGlobeX = globeGroup ? globeGroup.position.x : 0;
  const startGlobeY = globeGroup ? globeGroup.position.y : 0;
  const bannerPos = globeSectionPositions.banner;

  header.style.transition = 'none';
  header.style.transform = 'scale(1.5)';
  header.style.opacity = '0';
  header.style.pointerEvents = 'auto';

  showSocialIcons();

  // Спочатку плавно ховаємо about
  const fadeDuration = 400;
  let fadeStart = null;
  const startOpacity = parseFloat(aboutSection.style.opacity) || 1;

  function fadeAboutOut(timestamp) {
    if (!fadeStart) fadeStart = timestamp;
    let t = Math.min((timestamp - fadeStart) / fadeDuration, 1);
    t = easeInOut(t);
    aboutSection.style.opacity = String(startOpacity * (1 - t));

    if (t < 1) {
      requestAnimationFrame(fadeAboutOut);
    } else {
      // Після зникнення — скидаємо about і запускаємо zoom
      aboutSection.style.display = '';
      aboutSection.style.visibility = '';
      aboutSection.style.position = '';
      aboutSection.style.top = '';
      aboutSection.style.left = '';
      aboutSection.style.width = '';
      aboutSection.style.height = '';
      aboutSection.style.overflowY = '';
      aboutSection.style.zIndex = '';
      aboutSection.style.opacity = '0';
      aboutSection.style.transform = 'translateY(100px)';
      aboutSection.style.pointerEvents = 'none';

      const zoomDuration = 1200;
      let zoomStart = null;

      function animateBack(timestamp) {
        if (!zoomStart) zoomStart = timestamp;
        let t = Math.min((timestamp - zoomStart) / zoomDuration, 1);
        t = easeInOut(t);

        header.style.transform = `scale(${1 + (1 - t) * 0.5})`;
        header.style.opacity = String(Math.min(t * 1.5, 1));

        if (globeGroup) {
          globeGroup.position.x = startGlobeX + (bannerPos.x - startGlobeX) * t;
          globeGroup.position.y = startGlobeY + (bannerPos.y - startGlobeY) * t;
        }

        if (t < 1) {
          requestAnimationFrame(animateBack);
        } else {
          header.style.transition = '';
          header.style.transform = 'scale(1)';
          header.style.opacity = '1';
          scrollProgress = 0;
          setActiveMenu('home');

          window.addEventListener('wheel', handleWheel, { passive: false });
          window.addEventListener('touchstart', handleTouchStart, { passive: false });
          window.addEventListener('touchmove', handleTouchMove, { passive: false });
        }
      }

      requestAnimationFrame(animateBack);
    }
  }

  // Якщо about видима — плавно ховаємо, інакше одразу zoom
  if (parseFloat(aboutSection.style.opacity) > 0) {
    requestAnimationFrame(fadeAboutOut);
  } else {
    aboutSection.style.display = '';
    aboutSection.style.visibility = '';
    aboutSection.style.position = '';
    aboutSection.style.top = '';
    aboutSection.style.left = '';
    aboutSection.style.width = '';
    aboutSection.style.height = '';
    aboutSection.style.overflowY = '';
    aboutSection.style.zIndex = '';
    aboutSection.style.opacity = '0';
    aboutSection.style.transform = 'translateY(100px)';
    aboutSection.style.pointerEvents = 'none';

    const zoomDuration = 1200;
    let zoomStart = null;

    function animateBack(timestamp) {
      if (!zoomStart) zoomStart = timestamp;
      let t = Math.min((timestamp - zoomStart) / zoomDuration, 1);
      t = easeInOut(t);

      header.style.transform = `scale(${1 + (1 - t) * 0.5})`;
      header.style.opacity = String(Math.min(t * 1.5, 1));

      if (globeGroup) {
        globeGroup.position.x = startGlobeX + (bannerPos.x - startGlobeX) * t;
        globeGroup.position.y = startGlobeY + (bannerPos.y - startGlobeY) * t;
      }

      if (t < 1) {
        requestAnimationFrame(animateBack);
      } else {
        header.style.transition = '';
        header.style.transform = 'scale(1)';
        header.style.opacity = '1';
        scrollProgress = 0;
        setActiveMenu('home');

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
      }
    }

    requestAnimationFrame(animateBack);
  }
}

function navigateToHome() {
  const contactsVis = isVisible(footerSection);
  const projectsVis = isVisible(projectsSection);
  const aboutVis    = isVisible(aboutSection);

  if (contactsVis) {
    _transitionFromContactsToProjects(() => {
      _transitionBackToAbout(() => {
        _doZoomBack();
      });
    });
  } else if (projectsVis) {
    _transitionBackToAbout(() => {
      _doZoomBack();
    });
  } else if (aboutVis) {
    _doZoomBack();
  }
}
// ============================================================
// НАВІГАЦІЯ
// ============================================================

function navigateTo(targetSection) {
  // Закриваємо бургер
  nav.classList.remove('active');
  setTimeout(() => nav.classList.remove('show'), 300);
  overlay.classList.remove('active');
  setActiveMenu(targetSection);

  const aboutVis    = isVisible(aboutSection);
  const projectsVis = isVisible(projectsSection);
  const contactsVis = isVisible(footerSection);
  const bannerVis   = !isAboutMeLocked;

  if (targetSection === 'home') {
    navigateToHome();
    return;
  }

  if (targetSection === 'about-me') {
    if (bannerVis) {
      animateZoomToEnd(() => {});
    } else if (projectsVis) {
      _transitionBackToAbout();
    } else if (contactsVis) {
      _transitionFromContactsToAbout();
    }
    return;
  }

  if (targetSection === 'projects') {
    if (bannerVis) {
      animateZoomToEnd(() => {
        setTimeout(() => startTransitionToProjects(), 100);
      });
    } else if (aboutVis) {
      startTransitionToProjects();
    } else if (contactsVis) {
      _transitionFromContactsToProjects();
    }
    return;
  }

  if (targetSection === 'contacts') {
    if (bannerVis) {
      animateZoomToEnd(() => {
        setTimeout(() => startTransitionToProjects(), 100);
        setTimeout(() => startTransitionToContacts(), 2000);
      });
    } else if (aboutVis) {
      startTransitionToProjects();
      setTimeout(() => startTransitionToContacts(), 1900);
    } else if (projectsVis) {
      startTransitionToContacts();
    }
    return;
  }
}

// ============================================================
// ЗВОРОТНІ ПЕРЕХОДИ МІЖ СЕКЦІЯМИ
// ============================================================

function _transitionBackToAbout(onComplete) {
  if (isTransitioningToProjects) return;
  isTransitioningToProjects = true;

  aboutSection.style.display = 'block';
  aboutSection.style.visibility = 'visible';
  aboutSection.style.opacity = '0';
  aboutSection.style.position = 'fixed';
  aboutSection.style.top = '-100vh';
  aboutSection.style.left = '0';
  aboutSection.style.width = '100%';
  aboutSection.style.height = '100vh';
  aboutSection.style.zIndex = '25';
  aboutSection.style.overflowY = 'auto';
  aboutSection.style.transform = '';
  aboutSection.style.backgroundColor = 'transparent';

  const duration = 1800;
  let startTime = null;
  const globeStart = { x: globeGroup.position.x, y: globeGroup.position.y };
  const globeEnd = { ...globeSectionPositions.about };

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    let p = Math.min((timestamp - startTime) / duration, 1);
    p = easeOutQuint(p);

    aboutSection.style.top = (-100 + 100 * p) + 'vh';
    // opacity плавно з'являється в першій половині анімації
    aboutSection.style.opacity = String(Math.min(p * 2, 1));

    projectsSection.style.top = (100 * p) + 'vh';

    globeGroup.position.x = globeStart.x + (globeEnd.x - globeStart.x) * p;
    globeGroup.position.y = globeStart.y + (globeEnd.y - globeStart.y) * p;

    if (p < 1) {
      requestAnimationFrame(animate);
    } else {
      projectsSection.style.display = 'none';
      projectsSection.style.visibility = 'hidden';
      projectsSection.style.opacity = '0';
      projectsSection.style.zIndex = '-1';
      projectsSection.style.top = '0';

      aboutSection.style.top = '0';
      aboutSection.style.opacity = '1';
      aboutSection.style.zIndex = '20';

      projectsSection.removeEventListener('wheel', handleProjectsScroll);
      aboutSection.addEventListener('wheel', handleAboutScroll, { passive: false });
      addSectionTouch(
        aboutSection,
        () => { if (aboutSection.scrollTop + aboutSection.clientHeight >= aboutSection.scrollHeight - 10) startTransitionToProjects(); },
        () => { if (aboutSection.scrollTop === 0) {
          isTransitioningToProjects = true;
          const fadeDuration = 400;
          let st = null;
          function fadeOut(ts) {
            if (!st) st = ts;
            let t = Math.min((ts - st) / fadeDuration, 1);
            t = easeInOut(t);
            aboutSection.style.opacity = String(1 - t);
            if (t < 1) requestAnimationFrame(fadeOut);
            else { isTransitioningToProjects = false; _doZoomBack(); }
          }
          requestAnimationFrame(fadeOut);
        }}
      );

      showSocialIcons();
      isTransitioningToProjects = false;
      if (onComplete) onComplete();
      setActiveMenu('about-me');
    }
  }

  requestAnimationFrame(animate);
}

function _transitionFromContactsToAbout() {
  _transitionFromContactsToProjects(() => {
    _transitionBackToAbout();
  });
}

function _transitionFromContactsToProjects(onComplete) {
  if (isTransitioningToContacts) return;
  isTransitioningToContacts = true;

  projectsSection.style.display = 'flex';
  projectsSection.style.visibility = 'visible';
  projectsSection.style.position = 'fixed';
  projectsSection.style.top = '0';
  projectsSection.style.left = '-100%';
  projectsSection.style.width = '100%';
  projectsSection.style.height = '100vh';
  projectsSection.style.zIndex = '25';
  projectsSection.style.opacity = '1';

  const duration = 1800;
  let startTime = null;
  const globeStart = { x: globeGroup.position.x, y: globeGroup.position.y };
  const globeEnd = { ...globeSectionPositions.projects };

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    let p = Math.min((timestamp - startTime) / duration, 1);
    p = easeOutQuint(p);

    projectsSection.style.left = (-100 + 100 * p) + '%';
    footerSection.style.left = (100 * p) + '%';

    globeGroup.position.x = globeStart.x + (globeEnd.x - globeStart.x) * p;
    globeGroup.position.y = globeStart.y + (globeEnd.y - globeStart.y) * p;

    if (p < 1) {
      requestAnimationFrame(animate);
    } else {
      footerSection.style.display = 'none';
      footerSection.style.visibility = 'hidden';
      footerSection.style.opacity = '0';
      footerSection.style.zIndex = '-1';
      footerSection.style.left = '0';

      projectsSection.style.left = '0';
      projectsSection.style.zIndex = '20';
      projectsSection.style.overflowY = 'auto';

      footerSection.removeEventListener('wheel', handleContactsScroll);
      projectsSection.addEventListener('wheel', handleProjectsScroll, { passive: false });

      showSocialIcons();
      isTransitioningToContacts = false;
      if (onComplete) onComplete();
      setActiveMenu('projects');
    }
  }

  requestAnimationFrame(animate);
}

// ============================================================
// ОБРОБНИКИ КЛІКІВ НА НАВІГАЦІЮ
// ============================================================

document.querySelectorAll('.item__link[data-section]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.section);
  });
});

// burger
const burger = document.getElementById("burger");
const nav = document.querySelector(".navigation");
const body = document.body;

// створюємо overlay лише для фону під меню
let overlay = document.createElement("div");
overlay.classList.add("overlay");
body.appendChild(overlay);

burger.addEventListener("click", () => {
  const isOpen = nav.classList.contains("active");

  if (!isOpen) {
    // відкриваємо меню
    overlay.classList.add("active"); // blur + затемнення фону
    nav.classList.add("show");
    setTimeout(() => nav.classList.add("active"), 10);
    nav.style.zIndex = "108"; // меню поверх overlay
    burger.style.zIndex = "110"; // бургер поверх overlay
  } else {
    // закриваємо меню
    nav.classList.remove("active");
    setTimeout(() => nav.classList.remove("show"), 300);
    overlay.classList.remove("active");
  }
});

// active
const sections = document.querySelectorAll("section, header, footer");
const menuItems = document.querySelectorAll(".list li.item");

function setActiveMenu(sectionId) {
  menuItems.forEach((item) => {
    const link = item.querySelector(".item__link");
    if (link.dataset.section.toLowerCase() === sectionId.toLowerCase()) {
      item.classList.add("active");
      link.classList.add("active");
    } else {
      item.classList.remove("active");
      link.classList.remove("active");
    }
  });
}
window.addEventListener("scroll", () => {
  if (!isAboutMeLocked) {
    setActiveMenu('home');
  }
});

// translate
const translatable = document.querySelectorAll("[data-en][data-uk]");
function setLanguage(lang) {
  localStorage.setItem("selectedLang", lang);

  translatable.forEach((el) => {
    el.textContent = el.dataset[lang];
  });

  currentLang = lang;
  renderProject(); // ✅ тут оновлюється карточка

  document.querySelector("#langCustom .selected-text").textContent = lang;
  document.querySelector(".native-select").value = lang;
}
// Встановлення мови при кліку по кастомному елементу
document
  .querySelectorAll("#langCustom .custom-options li")
  .forEach((option) => {
    option.addEventListener("click", () => {
      setLanguage(option.dataset.value);
    });
  });

// Встановлення мови при зміні native select
document.querySelector(".native-select").addEventListener("change", (e) => {
  setLanguage(e.target.value);
});

// change lang UI
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".lang-wrapper");
  const custom = wrapper.querySelector(".custom-select");
  const btn = custom.querySelector(".custom-selected");
  const list = custom.querySelector(".custom-options");
  const items = Array.from(list.querySelectorAll("li"));
  const selectedText = custom.querySelector(".selected-text");
  const native = wrapper.querySelector(".native-select");

  function openMenu() {
    list.hidden = false;
    custom.setAttribute("aria-expanded", "true");
    const first = list.querySelector('[role="option"]');
    first && first.focus();
  }

  function closeMenu() {
    list.hidden = true;
    custom.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (list.hidden) openMenu();
    else closeMenu();
  }

  function setValue(value, skipNative = false) {
    const prev = list.querySelector('[aria-selected="true"]');
    if (prev) prev.removeAttribute("aria-selected");
    const li = list.querySelector(`li[data-value="${value}"]`);
    if (li) li.setAttribute("aria-selected", "true");
    selectedText.textContent = value;

    if (!skipNative) {
      if (native.value !== value) {
        native.value = value;
      }
    }

    // Зберігаємо мову в localStorage
    localStorage.setItem("selectedLang", value);

    // Міняємо тексти на сторінці
    translatable.forEach((el) => {
      el.textContent = el.dataset[value];
    });
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  items.forEach((li) => {
    li.tabIndex = -1;
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      setValue(li.dataset.value);
      closeMenu();
    });
  });

  document.addEventListener("click", (e) => {
    if (!custom.contains(e.target)) closeMenu();
  });

  custom.addEventListener("keydown", (e) => {
    const focusedIndex = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (list.hidden) openMenu();
      else if (focusedIndex < items.length - 1) items[focusedIndex + 1].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!list.hidden && focusedIndex > 0) items[focusedIndex - 1].focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (document.activeElement.tagName === "LI") {
        setValue(document.activeElement.dataset.value);
        closeMenu();
        btn.focus();
      } else {
        toggleMenu();
      }
    } else if (e.key === "Escape") {
      closeMenu();
      btn.focus();
    }
  });

  native.addEventListener("change", () => {
    setValue(native.value, true);
  });

  // ✅ Отримуємо мову з localStorage при завантаженні сторінки
  const savedLang =
    localStorage.getItem("selectedLang") ||
    native.value ||
    native.options[native.selectedIndex].value;
  setValue(savedLang, true);
  closeMenu();
});

// carousel header
const skills = document.getElementById("skillsCarousel");

// дублюємо контент для плавного нескінченного скролу
skills.innerHTML += skills.innerHTML;

let scrollPosition = 0;
const speed = 0.7;

function animateSkills() {
  scrollPosition += speed;
  if (scrollPosition >= skills.scrollWidth / 2) {
    scrollPosition = 0;
  }
  skills.style.transform = `translateX(${-scrollPosition}px)`;
  requestAnimationFrame(animateSkills);
}

animateSkills();

// === MUSIC TOAST + SOUND INTEGRATION ===
const toast = document.getElementById("musicToast");
const enableBtn = document.getElementById("enableMusic");
const closeBtn = document.getElementById("closeToast");
const audio = document.getElementById("bgMusic");
const soundControl = document.querySelector(".sound");
const soundBtn = document.getElementById("soundBtn");
const slider = document.getElementById("volumeSlider");
const wrapper = document.getElementById("volumeWrapper");
const icon = document.getElementById("soundIcon");
const musicIcon = document.querySelector(".music"); // 🎵 іконка "music"

let musicEnabled = false;
let toastClosed = false;

// === Іконки звуку ===
const icons = {
  mute: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4A.7.7 0 0 0 11 19.3z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`,
  low: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4A.7.7 0 0 0 11 19.3z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>`,
  high: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4A.7.7 0 0 0 11 19.3z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/></svg>`,
};

// === Оновлення іконки залежно від гучності ===
const updateIcon = (vol) => {
  if (vol === 0) icon.innerHTML = icons.mute;
  else if (vol < 0.6) icon.innerHTML = icons.low;
  else icon.innerHTML = icons.high;
};

// === Показ toast ===
function showToast() {
  toast.style.display = "flex";
  requestAnimationFrame(() => toast.classList.add("show"));
}

// === Приховування toast ===
function hideToast() {
  toast.classList.remove("show");
  setTimeout(() => (toast.style.display = "none"), 400);
}

// === Оновлення видимості іконок ===
function updateIcons() {
  if (musicEnabled) {
    musicIcon.classList.remove("visible");
    soundControl.classList.add("visible");
  } else if (toastClosed) {
    musicIcon.classList.add("visible");
    soundControl.classList.remove("visible");
  } else {
    musicIcon.classList.remove("visible");
    soundControl.classList.remove("visible");
  }
}

// === Натискання PLAY ===
enableBtn.addEventListener("click", () => {
  musicEnabled = true;
  toastClosed = false;

  audio.volume = 0.15;
  slider.value = 15;
  updateIcon(0.15);

  audio.play().catch((err) => console.log("Audio error:", err));
  hideToast();
  updateIcons();
});

// === Натискання × (закриття toast) ===
closeBtn.addEventListener("click", () => {
  toastClosed = true;
  hideToast();
  updateIcons();
});

// === Натискання на іконку music ===
musicIcon.addEventListener("click", () => {
  if (!musicEnabled) showToast();
});

// === Автоматичне показування toast через 1.5с ===
setTimeout(() => {
  if (!musicEnabled && !toastClosed) showToast();
}, 4500);

// === Автоматичне ховання toast через 20с ===
setTimeout(() => {
  if (!musicEnabled && toast.classList.contains("show")) {
    toastClosed = true;
    hideToast();
    updateIcons();
  }
}, 15000);

// === SOUND CONTROL ===
soundBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  wrapper.classList.toggle("active");
});

// Закриття повзунка при кліку поза ним
document.addEventListener("click", (e) => {
  if (!e.target.closest(".sound")) wrapper.classList.remove("active");
});

// Зміна гучності
slider.addEventListener("input", () => {
  const vol = slider.value / 100;
  audio.volume = vol;
  updateIcon(vol);
});

// change color
const themeColors = [
  {
    name: "white",
    "--nav-bg": "rgba(255,255,255,0.1)",
    "--nav-border": "white",
    "--nav-shadow": "0 0 30px rgba(227, 228, 237, 0.37)",
    "--theme-backdrop": "blur(30px)",
  },
  {
    name: "blue",
    "--nav-bg": "rgba(79,195,247,0.2)",
    "--nav-border": "#4fc3f7",
    "--nav-shadow": "0 0 30px rgba(79,195,247,0.5)",
    "--theme-backdrop": "blur(30px)",
  },
  {
    name: "green",
    "--nav-bg": "rgba(164,255,131,0.2)",
    "--nav-border": "#00c50d",
    "--nav-shadow": "0 0 30px rgba(164,255,131,0.5)",
    "--theme-backdrop": "blur(30px)",
  },
];

const themeContainer = document.querySelector(".theme");
const themeItems = document.querySelectorAll(".theme__content");

// спочатку активна перша тема (білий)
let activeTheme = themeItems[0];
themeContainer.classList.add("collapsed");
activeTheme.classList.add("active");

// логіка кліків
themeItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    const theme = themeColors[i];
    Object.keys(theme).forEach((key) => {
      if (key !== "name")
        document.documentElement.style.setProperty(key, theme[key]);
    });

    activeTheme.classList.remove("active");
    item.classList.add("active");
    activeTheme = item;

    // Перемикаємо стан списку
    themeContainer.classList.toggle("collapsed");
  });
});

// star
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("starfield");
  let scene, camera, renderer, starfield;
  const clock = new THREE.Clock();
  const positions = [];

  function init() {
    // Сцена
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.z = 1;

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Створюємо зірки
    createStarfield(100000);

    // Resize
    window.addEventListener("resize", onWindowResize);
  }

  function createStarfield(numStars) {
    const verts = [];
    const colors = [];

    // Генеруємо зірки
    for (let i = 0; i < numStars; i++) {
      const x = (Math.random() - 0.5) * 2500;
      const y = (Math.random() - 0.5) * 2500;
      const z = (Math.random() - 0.5) * 2500;

      const rate = Math.random() * 1;
      const prob = Math.random();
      const light = Math.random() * 0.6 + 0.4;

      function update(t) {
        const lightness = prob > 0.8 ? light + Math.sin(t * rate) * 0.3 : light;
        return lightness;
      }

      positions.push({ update, light });

      const col = new THREE.Color().setHSL(0.6, 0.2, light);
      verts.push(x, y, z);
      colors.push(col.r, col.g, col.b);
    }

    // Геометрія
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Текстура для зірок
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    // Матеріал
    const mat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
    });

    // Points
    starfield = new THREE.Points(geo, mat);
    starfield.userData.geometry = geo;
    starfield.userData.positions = positions;
    scene.add(starfield);
  }

  function updateStarfield(t) {
    const geo = starfield.userData.geometry;
    const positions = starfield.userData.positions;
    const newColors = [];

    // Повільне обертання
    starfield.rotation.y -= 0.0001;

    // Оновлення кольорів (мерехтіння)
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const bright = p.update(t);
      const col = new THREE.Color().setHSL(0.6, 0.2, bright);
      newColors.push(col.r, col.g, col.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3));
    geo.attributes.color.needsUpdate = true;
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (starfield) {
      updateStarfield(elapsedTime);
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init();
  animate();
});

// earth
// === Відстань камери залежно від ширини ===
function getResponsiveCameraDistance() {
  const width = window.innerWidth;
  let distance = 0.3;

  if (width < 768) {
    distance = 0.9;
  } else if (width < 1024) {
    distance = 0.5;
  }

  return distance;
}

// === Ініціалізація Globe ===
const GlobeLib = window.Globe;
const container = document.getElementById("globeViz");

// Можеш на всяк випадок задати прозорість тут, якщо не в CSS
// container.style.opacity = "0";

const globe = GlobeLib()(container)
  .globeImageUrl("./src/image/header/earth.jpg")
  .bumpImageUrl(null)
  .width(window.innerWidth)
  .height(window.innerHeight);

// === Встановлюємо POV ДО першого рендеру ===
const initialPOV = { altitude: getResponsiveCameraDistance() };
globe.pointOfView(initialPOV, 0); // без анімації

// === Змінна для групи об'єкта (земля) ===
let globeGroup = null;

// === Позиції для різних секцій (тут керуєш як хочеш) ===
const globeSectionPositions = {
  banner:   { x: 0,   y: -95 }, 
  about:    { x: -130,  y: 0 },
  projects: { x: 0, y: 130 },
  contacts:  { x: 120,  y: 90 }, 
};

// === Функція для зміни позиції землі залежно від секції ===
function setGlobeSection(sectionKey) {
  if (!globeGroup) return;
  const pos = globeSectionPositions[sectionKey];
  if (!pos) return;

  globeGroup.position.x = pos.x;
  globeGroup.position.y = pos.y;
}

// щоб можна було викликати цю функцію з іншого коду
window.setGlobeSection = setGlobeSection;

// === Плавний перехід між позиціями банера та "про мене" ===
window.updateGlobeTransition = function(progress) {
  if (!globeGroup) return;

  // Діапазон, у якому рухається планета
  const MOVE_START = 0; // коли почати рух
  const MOVE_END   = 1; // коли закінчити

  // Нормалізуємо progress в [0,1] тільки в цьому діапазоні
  let t = (progress - MOVE_START) / (MOVE_END - MOVE_START);
  t = Math.min(Math.max(t, 0), 1); // clamp

  const from = globeSectionPositions.banner;
  const to   = globeSectionPositions.about;

  globeGroup.position.x = from.x + (to.x - from.x) * t;
  globeGroup.position.y = from.y + (to.y - from.y) * t;
};


// === Чекаємо на ініціалізацію сцени та знаходимо групу землі ===
function waitForGlobeReady() {
  const group = globe.scene().children.find((obj) => obj.type === "Group");

  if (group) {
    globeGroup = group;

    // Початкова позиція — банер
    const bannerPos = globeSectionPositions.banner;
    globeGroup.position.x = bannerPos.x;
    globeGroup.position.y = bannerPos.y;

    // Плавно показуємо контейнер
    requestAnimationFrame(() => {
      container.style.opacity = "1";
    });

    // Запускаємо обертання
    startRotation();
  } else {
    requestAnimationFrame(waitForGlobeReady);
  }
}
waitForGlobeReady();

// === Реакція на зміну розміру ===
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    globe.width(window.innerWidth);
    globe.height(window.innerHeight);

    const currentPov = globe.pointOfView();
    globe.pointOfView(
      {
        ...currentPov,
        altitude: getResponsiveCameraDistance(),
      },
      500
    );
  }, 100);
});

// === Обертання планети ===
function startRotation() {
  function animateRotation() {
    if (globeGroup) {
      globeGroup.rotation.y += -0.0002;
    }
    requestAnimationFrame(animateRotation);
  }
  animateRotation();
}



// ABOUT 
document.querySelector('.me__cv').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = './src/cv/резюме-ІТ.docx';
    link.download = './src/cv/резюме-ІТ.docx';
    link.click()
})

// PROJECTS 
let currentLang = localStorage.getItem("selectedLang") || "en";
const projects = [
  {
    img: "./src/image/projects/Receipt2JSON.png" ,
    title: "Receipt2JSON bot",
    category: {
      en: "commercial",
      uk: "комерційний"
    },
    subtitle:  {
      en: "Receipt2JSON is a Telegram bot that accepts invoices or receipt images, recognizes them using AI, and converts them into JSON format. The data is automatically sent to your 1C database. Access is available only to registered users after payment and admin approval.",
      uk: "Receipt2JSON — це Telegram-бот, який приймає накладні або фото квитанцій, розпізнає їх за допомогою AI та конвертує у формат JSON. Дані автоматично передаються у вашу базу 1С. Користування доступне лише для зареєстрованих користувачів після оплати та додавання адміністратором."
    },
    technologies: ["Node.js", "vibecoding"],
    demo: "https://t.me/Receipt2JSON_bot",
    repo: "https://github.com/AnastasiiaKobtseva/Receipt2JSON.git"
  },
  {
    img: "./src/image/projects/feedback-bot.png",
    title: "feedback bot",
    category: {
      en: "commercial",
      uk: "комерційний"
    },
    subtitle:  {
      en: "A Telegram feedback collection bot (Node.js) that captures employee-submitted client data and automatically compiles it into Google Sheets for easy tracking and reporting.",
      uk: "Telegram-бот для збору відгуків, який фіксує дані клієнтів, надані співробітниками, і автоматично зводить їх у Google Sheets для зручного відстеження та звітності."
    },
    technologies: ["Node.js", "vibecoding"],
    demo: "https://t.me/feedbackDetailedInformation_bot",
    repo: "https://github.com/AnastasiiaKobtseva/feedbackBot"
  },
  {
    img: "./src/image/projects/Lab01TaskBot.png",
    title: "Lab01TaskBot",
    category: {
      en: "commercial",
      uk: "комерційний"
    },
    subtitle:  {
      en: "A deadline-focused task-management bot (Node.js) that sends daily 18:00 summary reports to supervisors (done / in progress / not taken / rejected) and reminder notifications to assignees.",
      uk: "Бот для керування завданнями з контролем термінів, який щодня о 18:00 надсилає підсумкові звіти керівникам (виконано / у процесі / не взято / відхилено) та нагадування виконавцям."
    },
    technologies: ["Node.js", "vibecoding"],
    demo: "https://t.me/Lab01TaskBot_bot",
    repo: "https://github.com/AnastasiiaKobtseva/Lab01TaskBot"
  },
  {
    img: "./src/image/projects/skynetix.png",
    title: "skynetix",
    category: {
      en: "commercial",
      uk: "комерційний"
    },
    subtitle:  {
      en: "A corporate site for radio-electronic solutions showcasing RF equipment and control systems, with a technical, information-first layout and responsive presentation.",
      uk: "Корпоративний сайт для радіоелектронних рішень, що демонструє РЧ-обладнання та системи управління, з технічним, інформаційно-орієнтованим макетом та адаптивною презентацією."
    },
    technologies: ["html5", "css3", "sass", "javascript", "responsive design", "desktop-first", "css grid", "vibecoding"],
    demo: "https://www.skynetix.org/",
    repo: "https://github.com/AnastasiiaKobtseva/skynetix"
  },
  {
    img: "./src/image/projects/asmb.png",
    title: "asmb",
    category: {
      en: "commercial",
      uk: "комерційний"
    },
    subtitle:  {
      en: "A platform for the Association of Small and Medium-Sized Businesses — highlights events, meetings and courses with a clear, professional landing experience.",
      uk: "Платформа для Асоціації малих та середніх підприємств — висвітлює події, зустрічі та курси з чітким і професійним оформленням лендингу."
    },
    technologies: ["html5", "css3", "sass", "javascript", "aos.js", "responsive design", "desktop-first", "flexbox", "tailwind", "vibecoding"],
    demo: "https://www.asmb.com.ua/",
    repo: "https://github.com/AnastasiiaKobtseva/asmb"
  },
  {
    img: "./src/image/projects/nft.png",
    title: "nft marketplace",
    category: {
      en: "individual",
      uk: "індивідуальний",
    },
    subtitle:  {
      en: "A stylish NFT showcase built to present, browse and explore digital artworks — visual prototype for discovery and listing (no transaction backend).",
      uk: "Стильна платформа для демонстрації NFT, створена для перегляду та дослідження цифрових творів мистецтва — візуальний прототип для відкриття та перегляду лістингів (без бекенду для транзакцій)."
    },
    technologies: ["html5", "css3", "sass", "javascript", "responsive design", "desktop-first", "flexbox", "bootstrap"],
    demo: "https://anastasiiakobtseva.github.io/NFT-Marketplace/",
    repo: "https://github.com/AnastasiiaKobtseva/NFT-Marketplace"
  },
  {
    img: "./src/image/projects/chocolate.png",
    title: "chocolate",
    category: {
      en: "group",
      uk: "командний",
    },
    subtitle:  {
      en: "A modern landing page for a chocolate brand, crafted with HTML, SASS, and JavaScript. Designed to evoke warmth and indulgence through elegant visuals, smooth transitions, and a responsive layout.",
      uk: "Сучасний лендинг для шоколадного бренду, створений з використанням HTML, SASS та JavaScript. Дизайн передає тепло та насолоду через елегантну візуалізацію, плавні переходи та адаптивний макет."
    },
    technologies: ["html5", "css3", "sass", "javascript", "responsive design", "desktop-first", "flexbox", "bootstrap", "vite"],
    demo: "https://nastyakobtseva.github.io/chocolate/",
    repo: "https://github.com/NastyaKobtseva/chocolate"
  },
  {
    img: "./src/image/projects/ice-cream.png",
    title: "ice-cream",
    category: {
      en: "group",
      uk: "командний",
    },
    subtitle:  {
      en: "A playful landing page for an ice-cream brand featuring soft animations, pastel styling and joyful interactions — visual-first design to entice users (no sales backend).",
      uk: "Грайливий лендинг для бренду морозива з плавною анімацією, пастельним оформленням та веселими інтеракціями — візуальний дизайн для залучення користувачів (без бекенду для продажів)."
    },
    technologies: ["html5", "css3", "sass", "javascript", "responsive design", "desktop-first", "flexbox", "bootstrap", "vite"],
    demo: "https://egorkancir.github.io/Ice_cream/",
    repo: "https://github.com/EgorKancir/Ice_cream"
  },
  {
    img: "./src/image/projects/explore-indonesia.png",
    title: "explore indonesia",
    category: {
      en: "individual",
      uk: "індивідуальний",
    },
    subtitle:  {
      en: "A visually immersive travel landing page developed with HTML, SASS, and JavaScript. It highlights Indonesia’s beauty through rich imagery, flowing animations, and an inspiring design.",
      uk: "Візуально захоплюючий лендинг для подорожей, створений на HTML, SASS та JavaScript. Підкреслює красу Індонезії через яскраві зображення, плавну анімацію та надихаючий дизайн."
    },
    technologies: ["html5", "css3", "sass", "javascript", "responsive design", "desktop-first", "flexbox", "bootstrap"],
    demo: "https://anastasiiakobtseva.github.io/Explore-Indonesia/",
    repo: "https://github.com/AnastasiiaKobtseva/Explore-Indonesia"
  },
  {
    img: "./src/image/projects/webovio.png",
    title: "webovio",
    category: {
      en: "individual",
      uk: "індивідуальний",
    },
    subtitle:  {
      en: "A visual concept for product discovery and scoping — presents development and estimation services to help kickstart product ideas (prototype-only).",
      uk: "Візуальна концепція для дослідження продукту та оцінки обсягів робіт — демонструє послуги з розробки та оцінки, щоб допомогти започаткувати ідеї продуктів (тільки прототип)."
    },
    technologies: ["html5", "css3", "sass", "no responsive design", "flexbox"],
    demo: "https://anastasiiakobtseva.github.io/project-for-myself14/",
    repo: "https://github.com/AnastasiiaKobtseva/project-for-myself14"
  },
  {
    img: "./src/image/projects/hydra.png",
    title: "hydra",
    category: {
      en: "individual",
      uk: "індивідуальний",
    },
    subtitle:  {
      en: "An atmospheric, VR-inspired landing page concept that invites users to dive into virtual depths with bold visuals and immersive design (visual prototype).",
      uk: "Атмосферний лендинг з VR-естетикою, що запрошує користувачів зануритися у віртуальні глибини завдяки яскравій візуалізації та іммерсивному дизайну (візуальний прототип)."
    },
    technologies: ["html5", "css3", "no responsive design", "flexbox"],
    demo: "https://anastasiiakobtseva.github.io/project-for-myself11/",
    repo: "https://github.com/AnastasiiaKobtseva/project-for-myself11"
  }
];
const projectsContainer = document.getElementById("projectsContainer");
const upArrow = document.querySelector(".projects-carousel__arrows-one");
const downArrow = document.querySelector(".projects-carousel__arrows-two");
const counter = document.querySelector(".counts");
const totalCount = document.querySelector(".everything");

let currentIndex = 0;

// Функція для створення HTML проєкту
function createProjectHTML(project) {
  const techHTML = project.technologies
    .map(tech => `<span class="tech-item">${tech}</span>`)
    .join("");

  return `
    <div class="work__content">
      <img src="${project.img}" alt="${project.title[currentLang]}" class="work__content-img">
      <div class="work__name">
        <h3 class="work__name-title">${project.title}</h3>
        <p class="work__name-category ${project.category.en}">
          ${project.category[currentLang]}
        </p>
      </div>
    </div>

    <p class="work__subtitle">${project.subtitle[currentLang]}</p>

    <div class="technologies">${techHTML}</div>

    <div class="work__btns">
      <a href="${project.demo}" class="work__btns-btn" target="_blank">Demo</a>
      ${project.repo ? `<a href="${project.repo}" class="work__btns-btn" target="_blank">Repo</a>` : ""}
    </div>
  `;
}


// Функція для відображення поточного проєкту
function renderProject() {
  projectsContainer.innerHTML = '';

  const work = document.createElement("div");
  work.classList.add("work");
  work.innerHTML = createProjectHTML(projects[currentIndex]);
  projectsContainer.appendChild(work);

  // невелика затримка, щоб transition спрацював
  requestAnimationFrame(() => {
    work.classList.add("show");
  });

  counter.textContent = currentIndex + 1;
  totalCount.textContent = `| ${projects.length}`;
}

// Функція для переходу до наступного проєкту (вниз)
function nextProject() {
  currentIndex = (currentIndex + 1) % projects.length;
  renderProject();
}

// Функція для переходу до попереднього проєкту (вгору)
function prevProject() {
  currentIndex = (currentIndex - 1 + projects.length) % projects.length;
  renderProject();
}

// Обробники подій для стрілочок
upArrow.addEventListener("click", prevProject);
downArrow.addEventListener("click", nextProject);

// Модальне вікно для зображень
const imageModal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.querySelector(".image-modal__close");

projectsContainer.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("work__content-img")) {
    modalImg.src = target.src;
    modalImg.alt = target.alt;
    imageModal.style.display = "block";

    document.body.classList.add("modal-open");
  }
});

closeModal.addEventListener("click", () => {
  imageModal.style.display = "none";
  document.body.classList.remove("modal-open");
});

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
    document.body.classList.remove("modal-open");
  }
});

// Підтримка клавіатури (стрілки вгору/вниз)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    prevProject();
  } else if (e.key === "ArrowDown") {
    nextProject();
  }
});

// Ініціалізація першого проєкту
renderProject();










// === SCROLL ZOOM EFFECT ===
let scrollProgress = 0;
const maxScroll = 100;
let isAboutMeLocked = false;
let isTransitioningToProjects = false;
let isTransitioningToContacts = false;
let isTransitioningToBanner = false;

const header = document.querySelector('#home');
const aboutSection = document.querySelector('#about-me');
const projectsSection = document.querySelector('#projects');
const footerSection = document.querySelector('#contacts');
const globeViz = document.getElementById('globeViz');
const starfield = document.getElementById('starfield');

// Показуємо секцію "Про мене" одразу, але робимо невидимою
aboutSection.style.opacity = '0';
aboutSection.style.transform = 'translateY(100px)';

// === ОСНОВНІ ОБРОБНИКИ СКРОЛУ ===
function handleWheel(e) {
  e.preventDefault();
  
  if (e.deltaY < 0 && scrollProgress === 0) {
    // Скролимо вгору на головній — йдемо на contacts
    _goFromHomeToContacts();
    return;
  }
  
  if (e.deltaY > 0) {
    scrollProgress = Math.min(scrollProgress + 2, maxScroll);
  } else {
    scrollProgress = Math.max(scrollProgress - 2, 0);
  }
  
  updateZoomEffect();
}
function _goFromHomeToContacts() {
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);

  // Одразу показуємо contacts зліва
  footerSection.style.display = 'flex';
  footerSection.style.visibility = 'visible';
  footerSection.style.position = 'fixed';
  footerSection.style.top = '0';
  footerSection.style.left = '-100%'; // починає зліва
  footerSection.style.width = '100%';
  footerSection.style.height = '100vh';
  footerSection.style.zIndex = '30';
  footerSection.style.opacity = '1';
  footerSection.style.overflowY = 'auto';

  // Ховаємо header
  header.style.opacity = '0';
  header.style.pointerEvents = 'none';

  // Скидаємо прапорці та блокуємо скрол
  isAboutMeLocked = true;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  // Переміщуємо глобус на позицію contacts
  const startGlobeX = globeGroup ? globeGroup.position.x : 0;
  const startGlobeY = globeGroup ? globeGroup.position.y : 0;
  const globeEnd = { ...globeSectionPositions.contacts };

  const duration = 1000;
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    let t = Math.min((timestamp - startTime) / duration, 1);
    t = easeInOut(t);

    footerSection.style.left = (-100 + 100 * t) + '%';

    if (globeGroup) {
      globeGroup.position.x = startGlobeX + (globeEnd.x - startGlobeX) * t;
      globeGroup.position.y = startGlobeY + (globeEnd.y - startGlobeY) * t;
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      footerSection.style.left = '0';
      footerSection.style.zIndex = '20';

      hideSocialIcons();
      footerSection.addEventListener('wheel', handleContactsScroll, { passive: false });
      addSectionTouch(
        footerSection,
        () => {
          if (footerSection.scrollTop + footerSection.clientHeight >= footerSection.scrollHeight - 10) {
            if (isTransitioningToContacts) return;
            isTransitioningToContacts = true;
            const duration = 800;
            let st = null;
            function slideOut(ts) {
              if (!st) st = ts;
              let t = Math.min((ts - st) / duration, 1);
              t = easeInOut(t);
              footerSection.style.left = (t * 100) + '%';
              if (t < 1) requestAnimationFrame(slideOut);
              else { isTransitioningToContacts = false; footerSection.removeEventListener('wheel', handleContactsScroll); _doZoomBack(); }
            }
            requestAnimationFrame(slideOut);
          }
        },
        () => { if (footerSection.scrollTop === 0) _transitionFromContactsToProjects(); }
      );
      setActiveMenu('contacts');
      scrollProgress = maxScroll;
    }
  }

  requestAnimationFrame(animate);
}
let touchStartY = 0;
let touchStartX = 0;
let isSwiping = false;
function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  isSwiping = false;
}

// === ОНОВЛЕННЯ ZOOM ЕФЕКТУ ===
function handleTouchMove(e) {
  e.preventDefault();
  const touchY = e.touches[0].clientY;
  const delta = touchStartY - touchY;

  if (Math.abs(delta) < 3) return;

  isSwiping = true;

  if (delta < -30 && scrollProgress === 0) {
    _goFromHomeToContacts();
    return;
  }

  if (delta > 0) {
    scrollProgress = Math.min(scrollProgress + 1.5, maxScroll);
  } else {
    scrollProgress = Math.max(scrollProgress - 1.5, 0);
  }

  touchStartY = touchY;
  updateZoomEffect();
}

function updateZoomEffect() {
  const progress = scrollProgress / maxScroll;
  
  // Оновлюємо глобус
  if (window.updateGlobeTransition) {
    window.updateGlobeTransition(progress);
  }
  
  // Ефект масштабування для хедера
  const scale = 1 + (progress * 0.5);
  header.style.transform = `scale(${scale})`;
  
  const headerOpacity = Math.max(1 - progress * 1.5, 0);
  header.style.opacity = headerOpacity;
  
  if (starfield) {
    starfield.style.opacity = '1';
  }
  
  // Показуємо секцію "Про мене"
  if (progress > 0.3) {
    const aboutProgress = (progress - 0.3) / 0.7;
    aboutSection.style.opacity = aboutProgress;
    aboutSection.style.transform = `translateY(${(1 - aboutProgress) * 100}px)`;
    aboutSection.style.pointerEvents = 'auto';
    
    if (progress >= 0.95) {
      enableNormalScroll();
    }
  } else {
    aboutSection.style.opacity = '0';
    aboutSection.style.transform = 'translateY(100px)';
    aboutSection.style.pointerEvents = 'none';
  }
}
function addSectionTouch(element, onSwipeUp, onSwipeDown) {
  // Видаляємо старі обробники якщо є
  if (element._touchStart) element.removeEventListener('touchstart', element._touchStart);
  if (element._touchEnd) element.removeEventListener('touchend', element._touchEnd);

  let startY = 0;
  let startX = 0;

  element._touchStart = (e) => {
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
  };

  element._touchEnd = (e) => {
    const deltaY = startY - e.changedTouches[0].clientY;
    const deltaX = Math.abs(startX - e.changedTouches[0].clientX);

    if (deltaX > Math.abs(deltaY) * 0.8) return;
    if (Math.abs(deltaY) < 60) return;

    if (deltaY > 0 && onSwipeUp) onSwipeUp();
    if (deltaY < 0 && onSwipeDown) onSwipeDown();
  };

  element.addEventListener('touchstart', element._touchStart, { passive: true });
  element.addEventListener('touchend', element._touchEnd, { passive: true });
}
// === ПЕРЕХІД ДО ЗВИЧАЙНОГО СКРОЛУ ===
function enableNormalScroll() {
  if (isAboutMeLocked) return;
  
  isAboutMeLocked = true;
  
  // Видаляємо обробники zoom-ефекту
  window.removeEventListener('wheel', handleWheel);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  
  // Блокуємо скрол на всій сторінці
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  // Додаємо обробники для блокування скролу
  window.addEventListener('wheel', lockScrollOnAbout, { passive: false });
  window.addEventListener('touchmove', lockScrollOnAbout, { passive: false });
  window.addEventListener('scroll', lockScrollOnAbout, { passive: false });
  
  // Фіксуємо позицію
  window.scrollTo(0, 0);
  
  // Фіксуємо фон
  if (globeViz) {
    globeViz.style.position = 'fixed';
    globeViz.style.top = '0';
  }
  
  if (starfield) {
    starfield.style.position = 'fixed';
    starfield.style.top = '0';
    starfield.style.opacity = '1';
  }
  
  // Ховаємо хедер
  header.style.opacity = '0';
  header.style.pointerEvents = 'none';
  
  // Ховаємо інші секції
  if (projectsSection) {
    projectsSection.style.display = 'none';
    projectsSection.style.visibility = 'hidden';
    projectsSection.style.opacity = '0';
    projectsSection.style.zIndex = '-1';
  }
  if (footerSection) {
    footerSection.style.display = 'none';
    footerSection.style.visibility = 'hidden';
    footerSection.style.opacity = '0';
    footerSection.style.zIndex = '-1';
  }
  
  // Налаштовуємо секцію "Про мене"
  aboutSection.style.opacity = '1';
  aboutSection.style.transform = 'translateY(0)';
  aboutSection.style.position = 'fixed';
  aboutSection.style.top = '0';
  aboutSection.style.left = '0';
  aboutSection.style.overflowY = 'auto';
  aboutSection.style.height = '100vh';
  aboutSection.style.width = '100%';
  aboutSection.style.zIndex = '20';
  aboutSection.style.backgroundColor = 'transparent';
  
  // Додаємо обробник для переходу до проєктів
  aboutSection.addEventListener('wheel', handleAboutScroll, { passive: false });
  addSectionTouch(
    aboutSection,
    () => {
      if (aboutSection.scrollTop + aboutSection.clientHeight >= aboutSection.scrollHeight - 10) {
        startTransitionToProjects();
      }
    },
    () => {
      if (aboutSection.scrollTop === 0) {
        if (isTransitioningToProjects) return;
        isTransitioningToProjects = true;
        const fadeDuration = 400;
        let st = null;
        function fadeOut(ts) {
          if (!st) st = ts;
          let t = Math.min((ts - st) / fadeDuration, 1);
          t = easeInOut(t);
          aboutSection.style.opacity = String(1 - t);
          if (t < 1) requestAnimationFrame(fadeOut);
          else { isTransitioningToProjects = false; _doZoomBack(); }
        }
        requestAnimationFrame(fadeOut);
      }
    }
  );

  const socialContact = document.querySelector('.social__contact');
  const socialContent = document.querySelector('.social__content');

  [socialContact, socialContent].forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    }
  });
  setActiveMenu('about-me');
}

// === ОБРОБНИКИ СКРОЛУ ДЛЯ СЕКЦІЙ ===
function handleAboutScroll(e) {
  if (isTransitioningToProjects) {
    e.preventDefault();
    return;
  }
  
  const atTop = aboutSection.scrollTop === 0;
  const atBottom = aboutSection.scrollTop + aboutSection.clientHeight >= aboutSection.scrollHeight - 1;
  
  if (atTop && e.deltaY < 0) {
    e.preventDefault();
    if (isTransitioningToProjects) return;
  isTransitioningToProjects = true;

  const fadeDuration = 400;
  let startTime = null;

  function fadeOut(timestamp) {
    if (!startTime) startTime = timestamp;
    let t = Math.min((timestamp - startTime) / fadeDuration, 1);
    t = easeInOut(t);
    aboutSection.style.opacity = String(1 - t);

    if (t < 1) {
      requestAnimationFrame(fadeOut);
    } else {
      isTransitioningToProjects = false;
      _doZoomBack();
    }
  }

  requestAnimationFrame(fadeOut);
  return;
  }
  
  if (atBottom && e.deltaY > 0) {
    e.preventDefault();
    startTransitionToProjects();
  }
}

function handleProjectsScroll(e) {
  if (isTransitioningToContacts) {
    e.preventDefault();
    return;
  }
  
  const atTop = projectsSection.scrollTop === 0;
  const atBottom = projectsSection.scrollTop + projectsSection.clientHeight >= projectsSection.scrollHeight - 1;
  
  if (atTop && e.deltaY < 0) {
    e.preventDefault();
    _transitionBackToAbout();
    return;
  }
  
  if (atBottom && e.deltaY > 0) {
    e.preventDefault();
    startTransitionToContacts();
  }
}

function handleContactsScroll(e) {
  const atTop = footerSection.scrollTop === 0;
  const atBottom = footerSection.scrollTop + footerSection.clientHeight >= footerSection.scrollHeight - 1;
  
  if (atTop && e.deltaY < 0) {
    e.preventDefault();
    _transitionFromContactsToProjects();
    return;
  }
  
  if (atBottom && e.deltaY > 0) {
    e.preventDefault();
    if (isTransitioningToContacts) return;
    isTransitioningToContacts = true;

    const duration = 800;
    let startTime = null;

    function slideOut(timestamp) {
      if (!startTime) startTime = timestamp;
      let t = Math.min((timestamp - startTime) / duration, 1);
      t = easeInOut(t);
      footerSection.style.left = (t * 100) + '%';

      if (t < 1) {
        requestAnimationFrame(slideOut);
      } else {
        isTransitioningToContacts = false;
        footerSection.removeEventListener('wheel', handleContactsScroll);
        _doZoomBack();
      }
    }

    requestAnimationFrame(slideOut);
    return;
  }
}

// === ПЕРЕХІД ДО ПРОЄКТІВ ===
function startTransitionToProjects() {
  if (isTransitioningToProjects) return;
  isTransitioningToProjects = true;

  projectsSection.style.display = 'flex';
  projectsSection.style.visibility = 'visible';
  projectsSection.style.position = 'fixed';
  projectsSection.style.left = '0';
  projectsSection.style.width = '100%';
  projectsSection.style.height = '100vh';
  projectsSection.style.zIndex = '25';
  projectsSection.style.opacity = '1';

  let startTime = null;
  const duration = 1800;
  const startAbout = 0;
  const endAbout = 100;
  const startProjects = -100;
  const endProjects = 0;

  let globeStartPos = {
    x: globeGroup.position.x,
    y: globeGroup.position.y
  };
  let globeEndPos = { ...globeSectionPositions.projects };

  function animateGlobe(progress) {
    if (!globeGroup) return;
    globeGroup.position.x = globeStartPos.x + (globeEndPos.x - globeStartPos.x) * progress;
    globeGroup.position.y = globeStartPos.y + (globeEndPos.y - globeStartPos.y) * progress;
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1);

    progress = progress < 0.5
      ? 16 * progress ** 5
      : 1 - Math.pow(-2 * progress + 2, 5) / 2;

    const currentAbout = startAbout + (endAbout - startAbout) * progress;
    const currentProjects = startProjects + (endProjects - startProjects) * progress;

    aboutSection.style.top = currentAbout + 'vh';
    projectsSection.style.top = currentProjects + 'vh';

    animateGlobe(progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      completeTransitionToProjects();
    }
  }

  requestAnimationFrame(animate);
}

function completeTransitionToProjects() {
  window.removeEventListener('wheel', lockScrollOnAbout, false);
  window.removeEventListener('touchmove', lockScrollOnAbout, false);
  window.removeEventListener('scroll', lockScrollOnAbout, false);

  aboutSection.style.display = 'none';
  aboutSection.style.visibility = 'hidden';
  aboutSection.style.opacity = '0';
  aboutSection.style.zIndex = '-1';
  
  projectsSection.style.position = 'fixed';
  projectsSection.style.top = '0';
  projectsSection.style.left = '0';
  projectsSection.style.width = '100%';
  projectsSection.style.height = '100vh';
  projectsSection.style.overflowY = 'auto';
  projectsSection.style.zIndex = '20';
  
  if (footerSection) {
    footerSection.style.display = 'none';
    footerSection.style.visibility = 'hidden';
    footerSection.style.opacity = '0';
    footerSection.style.zIndex = '-1';
  }
  
  projectsSection.addEventListener('wheel', handleProjectsScroll, { passive: false });
  addSectionTouch(
    projectsSection,
    () => { if (projectsSection.scrollTop + projectsSection.clientHeight >= projectsSection.scrollHeight - 10) startTransitionToContacts(); },
    () => { if (projectsSection.scrollTop === 0) _transitionBackToAbout(); }
  );
  
  isTransitioningToProjects = false;

  const socialContact = document.querySelector('.social__contact');
  const socialContent = document.querySelector('.social__content');

  [socialContact, socialContent].forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    }
  });
  setActiveMenu('projects');
}

// === ПЕРЕХІД ДО КОНТАКТІВ ===
function startTransitionToContacts() {
  if (isTransitioningToContacts) return;
  isTransitioningToContacts = true;

  footerSection.style.display = 'flex';
  footerSection.style.visibility = 'visible';
  footerSection.style.position = 'fixed';
  footerSection.style.top = '0';
  footerSection.style.left = '100%'; // Починаємо справа за межами екрана
  footerSection.style.width = '100%';
  footerSection.style.height = '100vh';
  footerSection.style.zIndex = '30';
  footerSection.style.opacity = '1';

  let startTime = null;
  const duration = 1800;
  const startProjectsLeft = 0;
  const endProjectsLeft = -100; // Проєкти йдуть вліво
  const startContactsLeft = 100;
  const endContactsLeft = 0; // Контакти приїжджають справа

  let globeStartPos = {
    x: globeGroup.position.x,
    y: globeGroup.position.y
  };
  let globeEndPos = { ...globeSectionPositions.contacts };

  function animateGlobe(progress) {
    if (!globeGroup) return;
    globeGroup.position.x = globeStartPos.x + (globeEndPos.x - globeStartPos.x) * progress;
    globeGroup.position.y = globeStartPos.y + (globeEndPos.y - globeStartPos.y) * progress;
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1);

    progress = progress < 0.5
      ? 16 * progress ** 5
      : 1 - Math.pow(-2 * progress + 2, 5) / 2;

    const currentProjectsLeft = startProjectsLeft + (endProjectsLeft - startProjectsLeft) * progress;
    const currentContactsLeft = startContactsLeft + (endContactsLeft - startContactsLeft) * progress;

    projectsSection.style.left = currentProjectsLeft + '%'; // Зміщення по горизонталі
    footerSection.style.left = currentContactsLeft + '%'; // Зміщення по горизонталі

    animateGlobe(progress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      completeTransitionToContacts();
    }
  }

  requestAnimationFrame(animate);
}

function completeTransitionToContacts() {
  projectsSection.style.display = 'none';
  projectsSection.style.visibility = 'hidden';
  projectsSection.style.opacity = '0';
  projectsSection.style.zIndex = '-1';
  
  footerSection.style.position = 'fixed';
  footerSection.style.top = '0';
  footerSection.style.left = '0'; // Фіксуємо на місці
  footerSection.style.width = '100%';
  footerSection.style.height = '100vh';
  footerSection.style.overflowY = 'auto';
  footerSection.style.zIndex = '20';
  
  projectsSection.removeEventListener('wheel', handleProjectsScroll);
  footerSection.addEventListener('wheel', handleContactsScroll, { passive: false });
  addSectionTouch(
  footerSection,
    () => {
      if (footerSection.scrollTop + footerSection.clientHeight >= footerSection.scrollHeight - 10) {
        if (isTransitioningToContacts) return;
        isTransitioningToContacts = true;
        const duration = 800;
        let st = null;
        function slideOut(ts) {
          if (!st) st = ts;
          let t = Math.min((ts - st) / duration, 1);
          t = easeInOut(t);
          footerSection.style.left = (t * 100) + '%';
          if (t < 1) requestAnimationFrame(slideOut);
          else { isTransitioningToContacts = false; footerSection.removeEventListener('wheel', handleContactsScroll); _doZoomBack(); }
        }
        requestAnimationFrame(slideOut);
      }
    },
    () => { if (footerSection.scrollTop === 0) _transitionFromContactsToProjects(); }
  );
  
  isTransitioningToContacts = false;
  const socialContact = document.querySelector('.social__contact');
  const socialContent = document.querySelector('.social__content');
  
  [socialContact, socialContent].forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    }
  });
  setActiveMenu('contacts');
}

// === БЛОКУВАННЯ СКРОЛУ ===
function lockScrollOnAbout(e) {
  const isInsideAbout = aboutSection.contains(e.target);
  const isInsideProjects = projectsSection.contains(e.target);
  const isInsideFooter = footerSection.contains(e.target);
  
  if (!isInsideAbout && !isInsideProjects && !isInsideFooter && 
      !isTransitioningToProjects && !isTransitioningToContacts) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

// === ІНІЦІАЛІЗАЦІЯ ===
[aboutSection, projectsSection, footerSection].forEach(sec => {
  sec.style.scrollbarWidth = 'none';
  sec.style.msOverflowStyle = 'none';
});
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('touchstart', handleTouchStart, { passive: false });
window.addEventListener('touchmove', handleTouchMove, { passive: false });

// Початковий стан хедера
header.style.transformOrigin = 'center center';
header.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';