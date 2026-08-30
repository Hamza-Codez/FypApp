# Tailwind Theme Requirements

## tailwind.config.js — Extend These

```js
theme: {
  extend: {
    colors: {
      bg:        '#FFFFFF',
      surface:   '#F7F7F5',
      dark:      '#0F0F0E',
      primary:   '#111111',
      secondary: '#6B6B6B',
      muted:     '#AAAAAA',
      border:    '#E5E5E5',
      accent: {
        green:     '#E8F5E3',
        greenText: '#2E7D32',
      },
    },
    fontFamily: {
      serif: ['"Playfair Display"', 'Georgia', 'serif'],
      sans:  ['"DM Sans"', 'Helvetica Neue', 'sans-serif'],
    },
    maxWidth: {
      content: '1100px',
    },
  },
}
```

---

## Color Usage

| Purpose | Tailwind Class |
|---|---|
| Page background | `bg-white` |
| Card / section bg | `bg-[#F7F7F5]` |
| Dark CTA section | `bg-[#0F0F0E]` |
| Heading text | `text-[#111111]` |
| Body text | `text-[#6B6B6B]` |
| Muted / label text | `text-[#AAAAAA]` |
| Dividers / borders | `border-[#E5E5E5]` |
| Green badge | `bg-[#E8F5E3] text-[#2E7D32]` |

---

## Typography Classes

```html
<!-- Hero headline -->
<h1 class="font-serif text-5xl md:text-7xl font-bold leading-[1.1] text-[#111111]">

<!-- Section heading -->
<h2 class="font-serif text-4xl md:text-5xl font-bold leading-tight text-[#111111]">

<!-- Eyebrow label -->
<p class="uppercase text-xs tracking-widest text-[#AAAAAA] font-sans">

<!-- Body text -->
<p class="font-sans text-base leading-relaxed text-[#6B6B6B]">

<!-- Large stat / number -->
<span class="font-serif text-6xl font-bold text-[#111111]">
```

---

## Layout Patterns

```html
<!-- Page wrapper -->
<main class="max-w-[1100px] mx-auto px-6">

<!-- Standard section -->
<section class="py-24 md:py-32">

<!-- Two-column alternating -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

<!-- Card -->
<div class="bg-[#F7F7F5] rounded-xl p-6 border border-[#E5E5E5] shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
```

---

## Component Snippets

```html
<!-- Primary button -->
<button class="bg-[#111111] text-white text-sm font-sans px-6 py-2.5 rounded-full hover:bg-black transition-colors">

<!-- Ghost button -->
<button class="border border-[#E5E5E5] text-[#111111] text-sm px-6 py-2.5 rounded-full hover:bg-[#F7F7F5] transition-colors">

<!-- Badge / tag -->
<span class="bg-[#E8F5E3] text-[#2E7D32] text-xs font-sans px-3 py-1 rounded-full">

<!-- Progress bar -->
<div class="h-1.5 w-full bg-[#E5E5E5] rounded-full">
  <div class="h-1.5 bg-[#111111] rounded-full w-[70%]"></div>
</div>

<!-- Nav bar -->
<nav class="border-b border-[#E5E5E5] py-4 px-6 flex items-center justify-between">
```

---

## Dark Footer / CTA Section

```html
<section class="bg-[#0F0F0E] py-24 text-center">
  <h2 class="font-serif text-4xl text-white font-bold">...</h2>
  <p class="text-[#888888] font-sans mt-4">...</p>
  <button class="bg-white text-[#111111] px-8 py-3 rounded-full mt-8 font-sans text-sm font-medium">
    Get started
  </button>
</section>
```

---

## Fonts — Add to `<head>`

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```