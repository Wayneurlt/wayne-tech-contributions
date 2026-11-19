<template>
  <footer class="mt-24 border-t border-line">
    <div class="container-page flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span class="text-fg">{{ profile.name }}</span> · Technical contribution report · Confidential, for internal management review only.
      </p>
      <p>
        Figures come from git history and are classified as Verified, Documented, Self-reported or Pending.
        <NuxtLink to="/evidence" class="link">How evidence is classified</NuxtLink>
      </p>
    </div>
  </footer>
</template>
