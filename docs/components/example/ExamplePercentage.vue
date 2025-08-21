<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel
		class="w-full"
		size-unit="%"
		:min-size="20"
		:size="30"
		:max-size="40"
	>
		<template #start>
			<div class="h-16 bg-orange-50 flex items-center justify-center">Panel A</div>
		</template>
		
		<template #end>
			<div class="h-16 bg-blue-50 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>
