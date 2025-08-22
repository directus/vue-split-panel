<script lang="ts" setup>
import { SplitPanel } from '../../src';
</script>

<template>
	<SplitPanel id="panels-root" :snap-points="[25, 50]">
		<template #start>
			<div id="a" class="panel">
				Panel A
			</div>
		</template>

		<template #divider>
			<div class="divider" />
		</template>

		<template #end>
			<div id="b" class="panel">
				Panel B
			</div>
		</template>
	</SplitPanel>
</template>

<style scoped>
#panels-root {
	width: 80vw;
	height: 80vh;
}

#panels-nested {
	width: 100%;
	height: 100%;
}

.panel {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

#a {
	background: papayawhip;
}

#b {
	background: tomato;
}

#b {
	background: skyblue;
}

.divider {
	height: 12px;
	background-color: black;
	width: 100%;
}
</style>
