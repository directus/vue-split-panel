<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel
		orientation="vertical"
		class="h-128 w-full"
	>
		<template #start>
			<div class="w-full h-full bg-orange-50 flex items-center justify-center">Panel A</div>
		</template>

		<template #end>
			<div class="w-full h-full bg-blue-50 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>
