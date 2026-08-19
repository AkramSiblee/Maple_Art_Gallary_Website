/* Maple Art Gallery — shared site behavior (vanilla JS, no deps) */
(function(){
  "use strict";

  /* ---------- Sticky header shrink ---------- */
  var header = document.querySelector(".site-header");
  if(header){
    var onScroll = function(){
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, {passive:true});
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var scrim = document.querySelector(".nav-scrim");
  var mobileClose = document.querySelector(".mobile-nav-close");

  function openNav(){
    mobileNav.classList.add("open");
    scrim.classList.add("open");
    toggle.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
  }
  function closeNav(){
    mobileNav.classList.remove("open");
    scrim.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    document.body.style.overflow = "";
  }
  if(toggle && mobileNav && scrim){
    toggle.addEventListener("click", function(){
      mobileNav.classList.contains("open") ? closeNav() : openNav();
    });
    scrim.addEventListener("click", closeNav);
    if(mobileClose) mobileClose.addEventListener("click", closeNav);
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", closeNav);
    });
    window.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.18, rootMargin:"0px 0px -60px 0px"});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  }

  /* ---------- Gallery filter ---------- */
  var filterBar = document.querySelector(".filter-bar");
  var galleryGrid = document.querySelector(".gallery-grid");
  if(filterBar && galleryGrid){
    filterBar.addEventListener("click", function(e){
      var btn = e.target.closest(".filter-btn");
      if(!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.dataset.filter;
      galleryGrid.querySelectorAll(".gallery-item").forEach(function(item){
        var show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if(galleryGrid && lightbox){
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    var items = Array.prototype.slice.call(galleryGrid.querySelectorAll(".gallery-item"));
    var current = 0;
    var lastFocused = null;
    var focusable = lightbox.querySelectorAll("button");

    function show(index){
      var visible = items.filter(function(it){ return !it.classList.contains("hide"); });
      if(!visible.length) return;
      current = ((index % visible.length) + visible.length) % visible.length;
      var item = visible[current];
      var img = item.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      items._visible = visible;
    }

    function openLightbox(){
      lastFocused = document.activeElement;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox-close").focus();
    }
    function closeLightbox(){
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      if(lastFocused) lastFocused.focus();
    }

    galleryGrid.addEventListener("click", function(e){
      var item = e.target.closest(".gallery-item");
      if(!item) return;
      var visible = items.filter(function(it){ return !it.classList.contains("hide"); });
      var idx = visible.indexOf(item);
      show(idx);
      openLightbox();
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-nav.prev").addEventListener("click", function(){ show(current - 1); });
    lightbox.querySelector(".lightbox-nav.next").addEventListener("click", function(){ show(current + 1); });
    lightbox.addEventListener("click", function(e){
      if(e.target === lightbox) closeLightbox();
    });
    window.addEventListener("keydown", function(e){
      if(!lightbox.classList.contains("open")) return;
      if(e.key === "Escape"){ closeLightbox(); }
      if(e.key === "ArrowRight") show(current + 1);
      if(e.key === "ArrowLeft") show(current - 1);
      if(e.key === "Tab"){
        var list = Array.prototype.slice.call(focusable);
        var first = list[0], last = list[list.length - 1];
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ---------- Contact form (Formspree) ---------- */
  var contactForm = document.querySelector(".contact-form");
  if(contactForm){
    contactForm.addEventListener("submit", function(e){
      e.preventDefault();
      var data = new FormData(contactForm);
      var successBox = document.querySelector(".form-success");
      fetch(contactForm.action, {
        method:"POST",
        body:data,
        headers:{ "Accept":"application/json" }
      }).then(function(res){
        if(res.ok){
          contactForm.reset();
          if(successBox){
            successBox.classList.add("show");
            successBox.textContent = "Thank you! Your message has been sent — we'll reply within 1–2 business days.";
            successBox.scrollIntoView({behavior:"smooth", block:"center"});
          }
        } else {
          if(successBox){
            successBox.classList.add("show");
            successBox.textContent = "Something went wrong. Please email us directly at tanvina.farj@gmail.com.";
          }
        }
      }).catch(function(){
        if(successBox){
          successBox.classList.add("show");
          successBox.textContent = "Something went wrong. Please email us directly at tanvina.farj@gmail.com.";
        }
      });
    });
  }

  /* ---------- Newsletter mini-form (front-end only placeholder) ---------- */
  var newsletterForm = document.querySelector(".cta-form");
  if(newsletterForm){
    newsletterForm.addEventListener("submit", function(e){
      e.preventDefault();
      var btn = newsletterForm.querySelector("button");
      var original = btn.textContent;
      btn.textContent = "Subscribed ✓";
      newsletterForm.reset();
      setTimeout(function(){ btn.textContent = original; }, 2600);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

})();
