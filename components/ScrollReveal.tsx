'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    const observe = (el: HTMLElement) => {
      if (el.classList.contains('visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    };

    document.querySelectorAll<HTMLElement>('.reveal').forEach(observe);

    requestAnimationFrame(() => {
      document.documentElement.classList.add('js-ready');
    });

    const retry = () => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(observe);
    };

    const t1 = setTimeout(retry, 300);
    const t2 = setTimeout(retry, 1000);
    const t3 = setTimeout(retry, 2500);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('reveal')) {
              observe(node);
            }
            node.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(observe);
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
