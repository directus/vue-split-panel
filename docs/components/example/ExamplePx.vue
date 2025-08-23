<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel
		class="w-full"
		size-unit="px"
		:min-size="300"
		:size="400"
		:max-size="500"
	>
		<template #start>
			<div class="h-16 bg-orange-100 dark:bg-orange-900 flex items-center justify-center">Panel A</div>
		</template>
		
		<template #end>
			<div class="h-16 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>
