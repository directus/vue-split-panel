<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel
		class="w-full"
		collapsible
		size-unit="px"
		:min-size="200"
		:size="350"
		:max-size="500"
	>
		<template #start>
			<div class="h-16 bg-orange-100 dark:bg-orange-900 flex items-center justify-center">Panel A</div>
		</template>

		<template #divider>
			<div class="h-full bg-muted hover:bg-primary w-4" />
		</template>

		<template #end>
			<div class="h-16 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>
