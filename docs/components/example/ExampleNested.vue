<script lang="ts" setup>
import { SplitPanel } from "@directus/vue-split-panel";
</script>

<template>
	<SplitPanel primary="start" class="h-128 w-full">
		<template #start>
			<div class="w-full h-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
				Panel A
			</div>
		</template>

		<template #end>
			<SplitPanel orientation="vertical" class="h-full">
				<template #start>
					<div class="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
						Panel B
					</div>
				</template>

				<template #end>
					<div
						class="w-full h-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
					>
						Panel C
					</div>
				</template>
			</SplitPanel>
		</template>
	</SplitPanel>
</template>
