# Vue Split Panel

Splitter component based on the usage syntax of Reka UI but using the internal rendering logic of Web Awesome's Split Panel.

## Installation

```
pnpm add @directus/vue-split-panel
```

```vue
<script lang="ts" setup>
import { SplitPanel } from "@directus/vue-split-panel";
import "@directus/vue-split-panel/index.css";
</script>

<template>
	<SplitPanel>
		<template #start> Panel A </template>

		<template #end> Panel B </template>
	</SplitPanel>
</template>
```

## Usage

Please refer to [the documentation](https://directus.github.io/vue-split-panel/) for the full usage guide.

## License

MIT

This project also incorporates third-party software licensed under the MIT
License. See [`ATTRIBUTIONS.md`](https://github.com/directus/vue-split-panel/blob/main/attributions.md) for details.
