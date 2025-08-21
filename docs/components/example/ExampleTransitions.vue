<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel
		class="w-full"
		collapsible
		size-unit="px"
		:min-size="250"
		:size="350"
		:max-size="500"
		:collapse-threshold="50"
		transition-duration="150ms"
	>
		<template #start>
			<div class="h-16 bg-orange-50 flex items-center justify-center">Panel A</div>
		</template>

		<template #end>
			<div class="h-16 bg-blue-50 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>
