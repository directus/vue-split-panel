<script setup lang="ts">
import { SplitPanel } from '../../src';
</script>

<template>
	<SplitPanel class="split" min="150px" max="500px" primary="start">
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
	background-color: gray;
	display: flex;
	align-items: center;
	justify-content: center;
}

.resize-handle {
	width: 2px;
}
</style>
