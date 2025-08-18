<script setup lang="ts">
import { SplitPanel } from '../../src';
</script>

<template>
	<SplitPanel class="split" min="150px" :size="200" size-unit="px" max="500px" primary="end">
		<template #start>
			<div class="panel">
				<p>Panel A</p>
			</div>
		</template>

		<template #divider>
			<div class="resize-handle" />
		</template>

		<template #end>
			<div class="panel">
				<p>Panel B</p>
			</div>
		</template>
	</SplitPanel>
</template>

<style scoped>
.split {
	width: 100%;
}

.panel {
	background-color: lightblue;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 500px;
}

.resize-handle {
	width: 5px;
}
</style>
