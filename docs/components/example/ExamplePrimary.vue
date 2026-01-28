<script lang="ts" setup>
import { SplitPanel } from "@directus/vue-split-panel";
</script>

<template>
	<SplitPanel class="w-full" primary="start" :size="350" size-unit="px">
		<template #start>
			<div class="w-full h-16 bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
				Panel A
			</div>
		</template>

		<template #end>
			<div class="w-full h-16 bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
				Panel B
			</div>
		</template>
	</SplitPanel>
</template>
