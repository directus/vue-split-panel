<script setup lang="ts">
const title = "Vue Split Panel";
const description = "A split panel component based on Reka-UI and Web Awesome Split Panel";

definePageMeta({
	layout: false,
	header: false,
	footer: false,
});

const links = [
	{
		label: "Get started",
		color: "neutral" as const,
		size: "xl" as const,
		to: "/getting-started/installation",
		trailingIcon: "i-lucide-arrow-right",
	},
	{
		label: "Star on GitHub",
		color: "neutral" as const,
		icon: "simple-icons-github",
		size: "xl" as const,
		to: "https://github.com/directus/vue-split-panel",
		variant: "outline" as const,
	},
];

const features = [
	{
		title: "Accessible",
		icon: "lucide-person-standing",
		description: "Uses the Window Splitter WAI-ARIA design pattern",
	},
	{
		title: "Keyboard Interaction",
		icon: "lucide-keyboard",
		description: "Supports keyboard interactions for resizing and collapsing panes",
	},
	{
		title: "Text Direction",
		icon: "lucide-arrow-left-right",
		description: "Works in either LTR or RTL text directions",
	},
	{
		title: "Nested Layouts",
		icon: "lucide-layout-panel-left",
		description: "Create rich layouts by nesting split panel components",
	},
	{
		title: "Transitions",
		icon: "lucide-send-to-back",
		description: "Support for transitions when collapsing/expanding the primary panel",
	},
];

useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
});

defineOgImageComponent("Landing", {
	title,
	description,
});
</script>

<template>
	<main class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
		<section class="flex flex-col justify-center">
			<h1 class="text-4xl font-bold text-gray-950 sm:text-5xl dark:text-white">
				{{ title }}
			</h1>
			<p class="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
				{{ description }}
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<NuxtLink
					v-for="link in links"
					:key="link.label"
					:to="link.to"
					class="inline-flex min-h-11 items-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900"
				>
					{{ link.label }}
				</NuxtLink>
			</div>
		</section>

		<div class="flex flex-col gap-4">
			<section
				v-for="feature in features"
				:key="feature.title"
				class="rounded-md border border-gray-200 p-5 dark:border-gray-800"
			>
				<h2 class="text-base font-semibold text-gray-950 dark:text-white">
					{{ feature.title }}
				</h2>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
					{{ feature.description }}
				</p>
			</section>
		</div>
	</main>
</template>
