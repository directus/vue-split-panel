<script setup lang="ts">
import { ref } from 'vue';
import { SplitPanel } from '../../src';

const collapsed = ref(false);
</script>

<template>
	<SplitPanel class="split" collapsible :collapsed :min-size="30" :collapse-threshold="80">
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

	<button @click="collapsed = !collapsed">
		Collapse
	</button>
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
	height: 100%;
	background-color: black;
}
</style>
