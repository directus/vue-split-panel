<script lang="ts" setup>
import { SplitPanel } from '@directus/vue-split-panel';
</script>

<template>
	<SplitPanel class="w-full">
		<template #start>
			<div class="h-16 bg-orange-50 flex items-center justify-center">Panel A</div>
		</template>
		
		<template #end>
			<div class="h-16 bg-blue-50 flex items-center justify-center">Panel B</div>
		</template>
	</SplitPanel>
</template>