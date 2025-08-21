<script lang="ts" setup>
import { SplitPanel } from '../../src';
</script>

<template>
	<SplitPanel id="panels-root">
		<template #start>
			<div id="a" class="panel">
				Panel A
			</div>
		</template>

		<template #end>
			<SplitPanel id="panels-nested" orientation="vertical">
				<template #start>
					<div id="b" class="panel">
						Panel B
					</div>
				</template>

				<template #end>
					<div id="c" class="panel">
						Panel C
					</div>
				</template>
			</SplitPanel>
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

#c {
	background: skyblue;
}
</style>
