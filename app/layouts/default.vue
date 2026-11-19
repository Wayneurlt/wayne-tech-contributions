<template>
  <div class="min-h-screen lg:grid lg:grid-cols-[17rem_1fr] lg:gap-5 lg:p-4">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-[#04121a]">
      Skip to content
    </a>
    <AppSidebar class="hidden lg:flex" />
    <div class="flex min-w-0 flex-col">
      <AppHeader class="lg:hidden" />
      <main id="main" class="flex-1">
        <slot />
      </main>
      <AppFooter />
    </div>
  </div>
</template>
