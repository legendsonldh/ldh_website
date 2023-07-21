declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"ar/concepts/why-astro.mdx": {
	id: "ar/concepts/why-astro.mdx";
  slug: "ar/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ar/editor-setup.mdx": {
	id: "ar/editor-setup.mdx";
  slug: "ar/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ar/getting-started.mdx": {
	id: "ar/getting-started.mdx";
  slug: "ar/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/concepts/islands.mdx": {
	id: "de/concepts/islands.mdx";
  slug: "de/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/concepts/mpa-vs-spa.mdx": {
	id: "de/concepts/mpa-vs-spa.mdx";
  slug: "de/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/concepts/why-astro.mdx": {
	id: "de/concepts/why-astro.mdx";
  slug: "de/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/astro-components.mdx": {
	id: "de/core-concepts/astro-components.mdx";
  slug: "de/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/astro-pages.mdx": {
	id: "de/core-concepts/astro-pages.mdx";
  slug: "de/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/endpoints.mdx": {
	id: "de/core-concepts/endpoints.mdx";
  slug: "de/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/framework-components.mdx": {
	id: "de/core-concepts/framework-components.mdx";
  slug: "de/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/layouts.mdx": {
	id: "de/core-concepts/layouts.mdx";
  slug: "de/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/project-structure.mdx": {
	id: "de/core-concepts/project-structure.mdx";
  slug: "de/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/routing.mdx": {
	id: "de/core-concepts/routing.mdx";
  slug: "de/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/core-concepts/sharing-state.mdx": {
	id: "de/core-concepts/sharing-state.mdx";
  slug: "de/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/editor-setup.mdx": {
	id: "de/editor-setup.mdx";
  slug: "de/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/getting-started.mdx": {
	id: "de/getting-started.mdx";
  slug: "de/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/aliases.mdx": {
	id: "de/guides/aliases.mdx";
  slug: "de/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/client-side-scripts.mdx": {
	id: "de/guides/client-side-scripts.mdx";
  slug: "de/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/cms.mdx": {
	id: "de/guides/cms.mdx";
  slug: "de/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/configuring-astro.mdx": {
	id: "de/guides/configuring-astro.mdx";
  slug: "de/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/data-fetching.mdx": {
	id: "de/guides/data-fetching.mdx";
  slug: "de/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy.mdx": {
	id: "de/guides/deploy.mdx";
  slug: "de/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/aws.mdx": {
	id: "de/guides/deploy/aws.mdx";
  slug: "de/guides/deploy/aws";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/buddy.mdx": {
	id: "de/guides/deploy/buddy.mdx";
  slug: "de/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/cleavr.mdx": {
	id: "de/guides/deploy/cleavr.mdx";
  slug: "de/guides/deploy/cleavr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/cloudflare.mdx": {
	id: "de/guides/deploy/cloudflare.mdx";
  slug: "de/guides/deploy/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/deno.mdx": {
	id: "de/guides/deploy/deno.mdx";
  slug: "de/guides/deploy/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/edgio.mdx": {
	id: "de/guides/deploy/edgio.mdx";
  slug: "de/guides/deploy/edgio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/flightcontrol.mdx": {
	id: "de/guides/deploy/flightcontrol.mdx";
  slug: "de/guides/deploy/flightcontrol";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/github.mdx": {
	id: "de/guides/deploy/github.mdx";
  slug: "de/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/gitlab.mdx": {
	id: "de/guides/deploy/gitlab.mdx";
  slug: "de/guides/deploy/gitlab";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/google-cloud.mdx": {
	id: "de/guides/deploy/google-cloud.mdx";
  slug: "de/guides/deploy/google-cloud";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/google-firebase.mdx": {
	id: "de/guides/deploy/google-firebase.mdx";
  slug: "de/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/heroku.mdx": {
	id: "de/guides/deploy/heroku.mdx";
  slug: "de/guides/deploy/heroku";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/kinsta.mdx": {
	id: "de/guides/deploy/kinsta.mdx";
  slug: "de/guides/deploy/kinsta";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/microsoft-azure.mdx": {
	id: "de/guides/deploy/microsoft-azure.mdx";
  slug: "de/guides/deploy/microsoft-azure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/netlify.mdx": {
	id: "de/guides/deploy/netlify.mdx";
  slug: "de/guides/deploy/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/render.mdx": {
	id: "de/guides/deploy/render.mdx";
  slug: "de/guides/deploy/render";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/sst.mdx": {
	id: "de/guides/deploy/sst.mdx";
  slug: "de/guides/deploy/sst";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/surge.mdx": {
	id: "de/guides/deploy/surge.mdx";
  slug: "de/guides/deploy/surge";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/deploy/vercel.mdx": {
	id: "de/guides/deploy/vercel.mdx";
  slug: "de/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/environment-variables.mdx": {
	id: "de/guides/environment-variables.mdx";
  slug: "de/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/fonts.mdx": {
	id: "de/guides/fonts.mdx";
  slug: "de/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/images.mdx": {
	id: "de/guides/images.mdx";
  slug: "de/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/imports.mdx": {
	id: "de/guides/imports.mdx";
  slug: "de/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/integrations-guide.mdx": {
	id: "de/guides/integrations-guide.mdx";
  slug: "de/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/markdown-content.mdx": {
	id: "de/guides/markdown-content.mdx";
  slug: "de/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/migrate-to-astro.mdx": {
	id: "de/guides/migrate-to-astro.mdx";
  slug: "de/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/rss.mdx": {
	id: "de/guides/rss.mdx";
  slug: "de/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/server-side-rendering.mdx": {
	id: "de/guides/server-side-rendering.mdx";
  slug: "de/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/styling.mdx": {
	id: "de/guides/styling.mdx";
  slug: "de/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/testing.mdx": {
	id: "de/guides/testing.mdx";
  slug: "de/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/troubleshooting.mdx": {
	id: "de/guides/troubleshooting.mdx";
  slug: "de/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/typescript.mdx": {
	id: "de/guides/typescript.mdx";
  slug: "de/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/guides/upgrade-to/v2.mdx": {
	id: "de/guides/upgrade-to/v2.mdx";
  slug: "de/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/install/auto.mdx": {
	id: "de/install/auto.mdx";
  slug: "de/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/install/manual.mdx": {
	id: "de/install/manual.mdx";
  slug: "de/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/integrations/integrations.mdx": {
	id: "de/integrations/integrations.mdx";
  slug: "de/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/reference/adapter-reference.mdx": {
	id: "de/reference/adapter-reference.mdx";
  slug: "de/reference/adapter-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/reference/api-reference.mdx": {
	id: "de/reference/api-reference.mdx";
  slug: "de/reference/api-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/reference/configuration-reference.mdx": {
	id: "de/reference/configuration-reference.mdx";
  slug: "de/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"de/reference/integrations-reference.mdx": {
	id: "de/reference/integrations-reference.mdx";
  slug: "de/reference/integrations-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/concepts/islands.mdx": {
	id: "en/concepts/islands.mdx";
  slug: "en/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/concepts/mpa-vs-spa.mdx": {
	id: "en/concepts/mpa-vs-spa.mdx";
  slug: "en/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/concepts/why-astro.mdx": {
	id: "en/concepts/why-astro.mdx";
  slug: "en/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/contribute.mdx": {
	id: "en/contribute.mdx";
  slug: "en/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/astro-components.mdx": {
	id: "en/core-concepts/astro-components.mdx";
  slug: "en/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/astro-pages.mdx": {
	id: "en/core-concepts/astro-pages.mdx";
  slug: "en/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/astro-syntax.mdx": {
	id: "en/core-concepts/astro-syntax.mdx";
  slug: "en/core-concepts/astro-syntax";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/endpoints.mdx": {
	id: "en/core-concepts/endpoints.mdx";
  slug: "en/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/framework-components.mdx": {
	id: "en/core-concepts/framework-components.mdx";
  slug: "en/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/layouts.mdx": {
	id: "en/core-concepts/layouts.mdx";
  slug: "en/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/project-structure.mdx": {
	id: "en/core-concepts/project-structure.mdx";
  slug: "en/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/routing.mdx": {
	id: "en/core-concepts/routing.mdx";
  slug: "en/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/core-concepts/sharing-state.mdx": {
	id: "en/core-concepts/sharing-state.mdx";
  slug: "en/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/editor-setup.mdx": {
	id: "en/editor-setup.mdx";
  slug: "en/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/getting-started.mdx": {
	id: "en/getting-started.mdx";
  slug: "en/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/aliases.mdx": {
	id: "en/guides/aliases.mdx";
  slug: "en/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/assets.mdx": {
	id: "en/guides/assets.mdx";
  slug: "en/guides/assets";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend.mdx": {
	id: "en/guides/backend.mdx";
  slug: "en/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend/appwriteio.mdx": {
	id: "en/guides/backend/appwriteio.mdx";
  slug: "en/guides/backend/appwriteio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend/google-firebase.mdx": {
	id: "en/guides/backend/google-firebase.mdx";
  slug: "en/guides/backend/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend/supabase.mdx": {
	id: "en/guides/backend/supabase.mdx";
  slug: "en/guides/backend/supabase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend/tigris.mdx": {
	id: "en/guides/backend/tigris.mdx";
  slug: "en/guides/backend/tigris";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/backend/xata.mdx": {
	id: "en/guides/backend/xata.mdx";
  slug: "en/guides/backend/xata";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/client-side-scripts.mdx": {
	id: "en/guides/client-side-scripts.mdx";
  slug: "en/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms.mdx": {
	id: "en/guides/cms.mdx";
  slug: "en/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/builderio.mdx": {
	id: "en/guides/cms/builderio.mdx";
  slug: "en/guides/cms/builderio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/buttercms.mdx": {
	id: "en/guides/cms/buttercms.mdx";
  slug: "en/guides/cms/buttercms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/cloudcannon.mdx": {
	id: "en/guides/cms/cloudcannon.mdx";
  slug: "en/guides/cms/cloudcannon";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/contentful.mdx": {
	id: "en/guides/cms/contentful.mdx";
  slug: "en/guides/cms/contentful";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/crystallize.mdx": {
	id: "en/guides/cms/crystallize.mdx";
  slug: "en/guides/cms/crystallize";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/datocms.mdx": {
	id: "en/guides/cms/datocms.mdx";
  slug: "en/guides/cms/datocms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/decap-cms.mdx": {
	id: "en/guides/cms/decap-cms.mdx";
  slug: "en/guides/cms/decap-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/directus.mdx": {
	id: "en/guides/cms/directus.mdx";
  slug: "en/guides/cms/directus";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/frontmatter-cms.mdx": {
	id: "en/guides/cms/frontmatter-cms.mdx";
  slug: "en/guides/cms/frontmatter-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/ghost.mdx": {
	id: "en/guides/cms/ghost.mdx";
  slug: "en/guides/cms/ghost";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/keystonejs.mdx": {
	id: "en/guides/cms/keystonejs.mdx";
  slug: "en/guides/cms/keystonejs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/payload.mdx": {
	id: "en/guides/cms/payload.mdx";
  slug: "en/guides/cms/payload";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/prismic.mdx": {
	id: "en/guides/cms/prismic.mdx";
  slug: "en/guides/cms/prismic";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/sanity.mdx": {
	id: "en/guides/cms/sanity.mdx";
  slug: "en/guides/cms/sanity";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/spinal.mdx": {
	id: "en/guides/cms/spinal.mdx";
  slug: "en/guides/cms/spinal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/statamic.mdx": {
	id: "en/guides/cms/statamic.mdx";
  slug: "en/guides/cms/statamic";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/storyblok.mdx": {
	id: "en/guides/cms/storyblok.mdx";
  slug: "en/guides/cms/storyblok";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/strapi.mdx": {
	id: "en/guides/cms/strapi.mdx";
  slug: "en/guides/cms/strapi";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/tina-cms.mdx": {
	id: "en/guides/cms/tina-cms.mdx";
  slug: "en/guides/cms/tina-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/cms/wordpress.mdx": {
	id: "en/guides/cms/wordpress.mdx";
  slug: "en/guides/cms/wordpress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/configuring-astro.mdx": {
	id: "en/guides/configuring-astro.mdx";
  slug: "en/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/content-collections.mdx": {
	id: "en/guides/content-collections.mdx";
  slug: "en/guides/content-collections";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/content.mdx": {
	id: "en/guides/content.mdx";
  slug: "en/guides/content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/data-fetching.mdx": {
	id: "en/guides/data-fetching.mdx";
  slug: "en/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy.mdx": {
	id: "en/guides/deploy.mdx";
  slug: "en/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/aws.mdx": {
	id: "en/guides/deploy/aws.mdx";
  slug: "en/guides/deploy/aws";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/buddy.mdx": {
	id: "en/guides/deploy/buddy.mdx";
  slug: "en/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/cleavr.mdx": {
	id: "en/guides/deploy/cleavr.mdx";
  slug: "en/guides/deploy/cleavr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/cloudflare.mdx": {
	id: "en/guides/deploy/cloudflare.mdx";
  slug: "en/guides/deploy/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/deno.mdx": {
	id: "en/guides/deploy/deno.mdx";
  slug: "en/guides/deploy/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/edgio.mdx": {
	id: "en/guides/deploy/edgio.mdx";
  slug: "en/guides/deploy/edgio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/flightcontrol.mdx": {
	id: "en/guides/deploy/flightcontrol.mdx";
  slug: "en/guides/deploy/flightcontrol";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/github.mdx": {
	id: "en/guides/deploy/github.mdx";
  slug: "en/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/gitlab.mdx": {
	id: "en/guides/deploy/gitlab.mdx";
  slug: "en/guides/deploy/gitlab";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/google-cloud.mdx": {
	id: "en/guides/deploy/google-cloud.mdx";
  slug: "en/guides/deploy/google-cloud";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/google-firebase.mdx": {
	id: "en/guides/deploy/google-firebase.mdx";
  slug: "en/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/heroku.mdx": {
	id: "en/guides/deploy/heroku.mdx";
  slug: "en/guides/deploy/heroku";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/kinsta.mdx": {
	id: "en/guides/deploy/kinsta.mdx";
  slug: "en/guides/deploy/kinsta";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/microsoft-azure.mdx": {
	id: "en/guides/deploy/microsoft-azure.mdx";
  slug: "en/guides/deploy/microsoft-azure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/netlify.mdx": {
	id: "en/guides/deploy/netlify.mdx";
  slug: "en/guides/deploy/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/render.mdx": {
	id: "en/guides/deploy/render.mdx";
  slug: "en/guides/deploy/render";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/space.mdx": {
	id: "en/guides/deploy/space.mdx";
  slug: "en/guides/deploy/space";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/sst.mdx": {
	id: "en/guides/deploy/sst.mdx";
  slug: "en/guides/deploy/sst";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/surge.mdx": {
	id: "en/guides/deploy/surge.mdx";
  slug: "en/guides/deploy/surge";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/deploy/vercel.mdx": {
	id: "en/guides/deploy/vercel.mdx";
  slug: "en/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/environment-variables.mdx": {
	id: "en/guides/environment-variables.mdx";
  slug: "en/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/fonts.mdx": {
	id: "en/guides/fonts.mdx";
  slug: "en/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/images.mdx": {
	id: "en/guides/images.mdx";
  slug: "en/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/imports.mdx": {
	id: "en/guides/imports.mdx";
  slug: "en/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide.mdx": {
	id: "en/guides/integrations-guide.mdx";
  slug: "en/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/alpinejs.mdx": {
	id: "en/guides/integrations-guide/alpinejs.mdx";
  slug: "en/guides/integrations-guide/alpinejs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/cloudflare.mdx": {
	id: "en/guides/integrations-guide/cloudflare.mdx";
  slug: "en/guides/integrations-guide/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/deno.mdx": {
	id: "en/guides/integrations-guide/deno.mdx";
  slug: "en/guides/integrations-guide/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/image.mdx": {
	id: "en/guides/integrations-guide/image.mdx";
  slug: "en/guides/integrations-guide/image";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/lit.mdx": {
	id: "en/guides/integrations-guide/lit.mdx";
  slug: "en/guides/integrations-guide/lit";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/markdoc.mdx": {
	id: "en/guides/integrations-guide/markdoc.mdx";
  slug: "en/guides/integrations-guide/markdoc";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/mdx.mdx": {
	id: "en/guides/integrations-guide/mdx.mdx";
  slug: "en/guides/integrations-guide/mdx";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/netlify.mdx": {
	id: "en/guides/integrations-guide/netlify.mdx";
  slug: "en/guides/integrations-guide/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/node.mdx": {
	id: "en/guides/integrations-guide/node.mdx";
  slug: "en/guides/integrations-guide/node";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/partytown.mdx": {
	id: "en/guides/integrations-guide/partytown.mdx";
  slug: "en/guides/integrations-guide/partytown";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/preact.mdx": {
	id: "en/guides/integrations-guide/preact.mdx";
  slug: "en/guides/integrations-guide/preact";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/prefetch.mdx": {
	id: "en/guides/integrations-guide/prefetch.mdx";
  slug: "en/guides/integrations-guide/prefetch";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/react.mdx": {
	id: "en/guides/integrations-guide/react.mdx";
  slug: "en/guides/integrations-guide/react";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/sitemap.mdx": {
	id: "en/guides/integrations-guide/sitemap.mdx";
  slug: "en/guides/integrations-guide/sitemap";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/solid-js.mdx": {
	id: "en/guides/integrations-guide/solid-js.mdx";
  slug: "en/guides/integrations-guide/solid-js";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/svelte.mdx": {
	id: "en/guides/integrations-guide/svelte.mdx";
  slug: "en/guides/integrations-guide/svelte";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/tailwind.mdx": {
	id: "en/guides/integrations-guide/tailwind.mdx";
  slug: "en/guides/integrations-guide/tailwind";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/vercel.mdx": {
	id: "en/guides/integrations-guide/vercel.mdx";
  slug: "en/guides/integrations-guide/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/integrations-guide/vue.mdx": {
	id: "en/guides/integrations-guide/vue.mdx";
  slug: "en/guides/integrations-guide/vue";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/markdown-content.mdx": {
	id: "en/guides/markdown-content.mdx";
  slug: "en/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/middleware.mdx": {
	id: "en/guides/middleware.mdx";
  slug: "en/guides/middleware";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro.mdx": {
	id: "en/guides/migrate-to-astro.mdx";
  slug: "en/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-docusaurus.mdx": {
	id: "en/guides/migrate-to-astro/from-docusaurus.mdx";
  slug: "en/guides/migrate-to-astro/from-docusaurus";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-eleventy.mdx": {
	id: "en/guides/migrate-to-astro/from-eleventy.mdx";
  slug: "en/guides/migrate-to-astro/from-eleventy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-gatsby.mdx": {
	id: "en/guides/migrate-to-astro/from-gatsby.mdx";
  slug: "en/guides/migrate-to-astro/from-gatsby";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-gitbook.mdx": {
	id: "en/guides/migrate-to-astro/from-gitbook.mdx";
  slug: "en/guides/migrate-to-astro/from-gitbook";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-gridsome.mdx": {
	id: "en/guides/migrate-to-astro/from-gridsome.mdx";
  slug: "en/guides/migrate-to-astro/from-gridsome";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-hugo.mdx": {
	id: "en/guides/migrate-to-astro/from-hugo.mdx";
  slug: "en/guides/migrate-to-astro/from-hugo";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-jekyll.mdx": {
	id: "en/guides/migrate-to-astro/from-jekyll.mdx";
  slug: "en/guides/migrate-to-astro/from-jekyll";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-nextjs.mdx": {
	id: "en/guides/migrate-to-astro/from-nextjs.mdx";
  slug: "en/guides/migrate-to-astro/from-nextjs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-nuxtjs.mdx": {
	id: "en/guides/migrate-to-astro/from-nuxtjs.mdx";
  slug: "en/guides/migrate-to-astro/from-nuxtjs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-pelican.mdx": {
	id: "en/guides/migrate-to-astro/from-pelican.mdx";
  slug: "en/guides/migrate-to-astro/from-pelican";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-sveltekit.mdx": {
	id: "en/guides/migrate-to-astro/from-sveltekit.mdx";
  slug: "en/guides/migrate-to-astro/from-sveltekit";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-vuepress.mdx": {
	id: "en/guides/migrate-to-astro/from-vuepress.mdx";
  slug: "en/guides/migrate-to-astro/from-vuepress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/migrate-to-astro/from-wordpress.mdx": {
	id: "en/guides/migrate-to-astro/from-wordpress.mdx";
  slug: "en/guides/migrate-to-astro/from-wordpress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/rss.mdx": {
	id: "en/guides/rss.mdx";
  slug: "en/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/server-side-rendering.mdx": {
	id: "en/guides/server-side-rendering.mdx";
  slug: "en/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/styling.mdx": {
	id: "en/guides/styling.mdx";
  slug: "en/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/testing.mdx": {
	id: "en/guides/testing.mdx";
  slug: "en/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/troubleshooting.mdx": {
	id: "en/guides/troubleshooting.mdx";
  slug: "en/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/typescript.mdx": {
	id: "en/guides/typescript.mdx";
  slug: "en/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/upgrade-to/v1.mdx": {
	id: "en/guides/upgrade-to/v1.mdx";
  slug: "en/guides/upgrade-to/v1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/guides/upgrade-to/v2.mdx": {
	id: "en/guides/upgrade-to/v2.mdx";
  slug: "en/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/install/auto.mdx": {
	id: "en/install/auto.mdx";
  slug: "en/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/install/manual.mdx": {
	id: "en/install/manual.mdx";
  slug: "en/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/integrations/integrations.mdx": {
	id: "en/integrations/integrations.mdx";
  slug: "en/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes.mdx": {
	id: "en/recipes.mdx";
  slug: "en/recipes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/add-yaml-support.mdx": {
	id: "en/recipes/add-yaml-support.mdx";
  slug: "en/recipes/add-yaml-support";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/build-forms-api.mdx": {
	id: "en/recipes/build-forms-api.mdx";
  slug: "en/recipes/build-forms-api";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/build-forms.mdx": {
	id: "en/recipes/build-forms.mdx";
  slug: "en/recipes/build-forms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/bun.mdx": {
	id: "en/recipes/bun.mdx";
  slug: "en/recipes/bun";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/captcha.mdx": {
	id: "en/recipes/captcha.mdx";
  slug: "en/recipes/captcha";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/docker.mdx": {
	id: "en/recipes/docker.mdx";
  slug: "en/recipes/docker";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/external-links.mdx": {
	id: "en/recipes/external-links.mdx";
  slug: "en/recipes/external-links";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/i18n.mdx": {
	id: "en/recipes/i18n.mdx";
  slug: "en/recipes/i18n";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/recipes/reading-time.mdx": {
	id: "en/recipes/reading-time.mdx";
  slug: "en/recipes/reading-time";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/adapter-reference.mdx": {
	id: "en/reference/adapter-reference.mdx";
  slug: "en/reference/adapter-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/api-reference.mdx": {
	id: "en/reference/api-reference.mdx";
  slug: "en/reference/api-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/cli-reference.mdx": {
	id: "en/reference/cli-reference.mdx";
  slug: "en/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/configuration-reference.mdx": {
	id: "en/reference/configuration-reference.mdx";
  slug: "en/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/directives-reference.mdx": {
	id: "en/reference/directives-reference.mdx";
  slug: "en/reference/directives-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/error-reference.mdx": {
	id: "en/reference/error-reference.mdx";
  slug: "en/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/astro-glob-no-match.mdx": {
	id: "en/reference/errors/astro-glob-no-match.mdx";
  slug: "en/reference/errors/astro-glob-no-match";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/astro-glob-used-outside.mdx": {
	id: "en/reference/errors/astro-glob-used-outside.mdx";
  slug: "en/reference/errors/astro-glob-used-outside";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/client-address-not-available.mdx": {
	id: "en/reference/errors/client-address-not-available.mdx";
  slug: "en/reference/errors/client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/collection-does-not-exist-error.mdx": {
	id: "en/reference/errors/collection-does-not-exist-error.mdx";
  slug: "en/reference/errors/collection-does-not-exist-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/config-legacy-key.mdx": {
	id: "en/reference/errors/config-legacy-key.mdx";
  slug: "en/reference/errors/config-legacy-key";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/config-not-found.mdx": {
	id: "en/reference/errors/config-not-found.mdx";
  slug: "en/reference/errors/config-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/content-collection-type-mismatch-error.mdx": {
	id: "en/reference/errors/content-collection-type-mismatch-error.mdx";
  slug: "en/reference/errors/content-collection-type-mismatch-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/content-schema-contains-slug-error.mdx": {
	id: "en/reference/errors/content-schema-contains-slug-error.mdx";
  slug: "en/reference/errors/content-schema-contains-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/csssyntax-error.mdx": {
	id: "en/reference/errors/csssyntax-error.mdx";
  slug: "en/reference/errors/csssyntax-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/data-collection-entry-parse-error.mdx": {
	id: "en/reference/errors/data-collection-entry-parse-error.mdx";
  slug: "en/reference/errors/data-collection-entry-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/duplicate-content-entry-slug-error.mdx": {
	id: "en/reference/errors/duplicate-content-entry-slug-error.mdx";
  slug: "en/reference/errors/duplicate-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/expected-image-options.mdx": {
	id: "en/reference/errors/expected-image-options.mdx";
  slug: "en/reference/errors/expected-image-options";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/expected-image.mdx": {
	id: "en/reference/errors/expected-image.mdx";
  slug: "en/reference/errors/expected-image";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/failed-to-find-page-map-ssr.mdx": {
	id: "en/reference/errors/failed-to-find-page-map-ssr.mdx";
  slug: "en/reference/errors/failed-to-find-page-map-ssr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/failed-to-load-module-ssr.mdx": {
	id: "en/reference/errors/failed-to-load-module-ssr.mdx";
  slug: "en/reference/errors/failed-to-load-module-ssr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/generate-content-types-error.mdx": {
	id: "en/reference/errors/generate-content-types-error.mdx";
  slug: "en/reference/errors/generate-content-types-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/get-static-paths-expected-params.mdx": {
	id: "en/reference/errors/get-static-paths-expected-params.mdx";
  slug: "en/reference/errors/get-static-paths-expected-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/get-static-paths-invalid-route-param.mdx": {
	id: "en/reference/errors/get-static-paths-invalid-route-param.mdx";
  slug: "en/reference/errors/get-static-paths-invalid-route-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/get-static-paths-removed-rsshelper.mdx": {
	id: "en/reference/errors/get-static-paths-removed-rsshelper.mdx";
  slug: "en/reference/errors/get-static-paths-removed-rsshelper";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/get-static-paths-required.mdx": {
	id: "en/reference/errors/get-static-paths-required.mdx";
  slug: "en/reference/errors/get-static-paths-required";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/image-missing-alt.mdx": {
	id: "en/reference/errors/image-missing-alt.mdx";
  slug: "en/reference/errors/image-missing-alt";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-component-args.mdx": {
	id: "en/reference/errors/invalid-component-args.mdx";
  slug: "en/reference/errors/invalid-component-args";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-content-entry-frontmatter-error.mdx": {
	id: "en/reference/errors/invalid-content-entry-frontmatter-error.mdx";
  slug: "en/reference/errors/invalid-content-entry-frontmatter-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-content-entry-slug-error.mdx": {
	id: "en/reference/errors/invalid-content-entry-slug-error.mdx";
  slug: "en/reference/errors/invalid-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-dynamic-route.mdx": {
	id: "en/reference/errors/invalid-dynamic-route.mdx";
  slug: "en/reference/errors/invalid-dynamic-route";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-frontmatter-injection-error.mdx": {
	id: "en/reference/errors/invalid-frontmatter-injection-error.mdx";
  slug: "en/reference/errors/invalid-frontmatter-injection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-get-static-path-param.mdx": {
	id: "en/reference/errors/invalid-get-static-path-param.mdx";
  slug: "en/reference/errors/invalid-get-static-path-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-get-static-paths-return.mdx": {
	id: "en/reference/errors/invalid-get-static-paths-return.mdx";
  slug: "en/reference/errors/invalid-get-static-paths-return";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-glob.mdx": {
	id: "en/reference/errors/invalid-glob.mdx";
  slug: "en/reference/errors/invalid-glob";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-image-service.mdx": {
	id: "en/reference/errors/invalid-image-service.mdx";
  slug: "en/reference/errors/invalid-image-service";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/invalid-prerender-export.mdx": {
	id: "en/reference/errors/invalid-prerender-export.mdx";
  slug: "en/reference/errors/invalid-prerender-export";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/local-image-used-wrongly.mdx": {
	id: "en/reference/errors/local-image-used-wrongly.mdx";
  slug: "en/reference/errors/local-image-used-wrongly";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/locals-not-an-object.mdx": {
	id: "en/reference/errors/locals-not-an-object.mdx";
  slug: "en/reference/errors/locals-not-an-object";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/locals-not-serializable.mdx": {
	id: "en/reference/errors/locals-not-serializable.mdx";
  slug: "en/reference/errors/locals-not-serializable";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/markdown-content-schema-validation-error.mdx": {
	id: "en/reference/errors/markdown-content-schema-validation-error.mdx";
  slug: "en/reference/errors/markdown-content-schema-validation-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/markdown-frontmatter-parse-error.mdx": {
	id: "en/reference/errors/markdown-frontmatter-parse-error.mdx";
  slug: "en/reference/errors/markdown-frontmatter-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/markdown-image-not-found.mdx": {
	id: "en/reference/errors/markdown-image-not-found.mdx";
  slug: "en/reference/errors/markdown-image-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/mdx-integration-missing-error.mdx": {
	id: "en/reference/errors/mdx-integration-missing-error.mdx";
  slug: "en/reference/errors/mdx-integration-missing-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/middleware-no-data-or-next-called.mdx": {
	id: "en/reference/errors/middleware-no-data-or-next-called.mdx";
  slug: "en/reference/errors/middleware-no-data-or-next-called";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/middleware-not-aresponse.mdx": {
	id: "en/reference/errors/middleware-not-aresponse.mdx";
  slug: "en/reference/errors/middleware-not-aresponse";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/missing-image-dimension.mdx": {
	id: "en/reference/errors/missing-image-dimension.mdx";
  slug: "en/reference/errors/missing-image-dimension";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/missing-media-query-directive.mdx": {
	id: "en/reference/errors/missing-media-query-directive.mdx";
  slug: "en/reference/errors/missing-media-query-directive";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/mixed-content-data-collection-error.mdx": {
	id: "en/reference/errors/mixed-content-data-collection-error.mdx";
  slug: "en/reference/errors/mixed-content-data-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-adapter-installed.mdx": {
	id: "en/reference/errors/no-adapter-installed.mdx";
  slug: "en/reference/errors/no-adapter-installed";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-client-entrypoint.mdx": {
	id: "en/reference/errors/no-client-entrypoint.mdx";
  slug: "en/reference/errors/no-client-entrypoint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-client-only-hint.mdx": {
	id: "en/reference/errors/no-client-only-hint.mdx";
  slug: "en/reference/errors/no-client-only-hint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-matching-import.mdx": {
	id: "en/reference/errors/no-matching-import.mdx";
  slug: "en/reference/errors/no-matching-import";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-matching-renderer.mdx": {
	id: "en/reference/errors/no-matching-renderer.mdx";
  slug: "en/reference/errors/no-matching-renderer";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/no-matching-static-path-found.mdx": {
	id: "en/reference/errors/no-matching-static-path-found.mdx";
  slug: "en/reference/errors/no-matching-static-path-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/only-response-can-be-returned.mdx": {
	id: "en/reference/errors/only-response-can-be-returned.mdx";
  slug: "en/reference/errors/only-response-can-be-returned";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/page-number-param-not-found.mdx": {
	id: "en/reference/errors/page-number-param-not-found.mdx";
  slug: "en/reference/errors/page-number-param-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/prerender-dynamic-endpoint-path-collide.mdx": {
	id: "en/reference/errors/prerender-dynamic-endpoint-path-collide.mdx";
  slug: "en/reference/errors/prerender-dynamic-endpoint-path-collide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/redirect-with-no-location.mdx": {
	id: "en/reference/errors/redirect-with-no-location.mdx";
  slug: "en/reference/errors/redirect-with-no-location";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/reserved-slot-name.mdx": {
	id: "en/reference/errors/reserved-slot-name.mdx";
  slug: "en/reference/errors/reserved-slot-name";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/response-sent-error.mdx": {
	id: "en/reference/errors/response-sent-error.mdx";
  slug: "en/reference/errors/response-sent-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/static-client-address-not-available.mdx": {
	id: "en/reference/errors/static-client-address-not-available.mdx";
  slug: "en/reference/errors/static-client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/static-redirect-not-available.mdx": {
	id: "en/reference/errors/static-redirect-not-available.mdx";
  slug: "en/reference/errors/static-redirect-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-clierror.mdx": {
	id: "en/reference/errors/unknown-clierror.mdx";
  slug: "en/reference/errors/unknown-clierror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-compiler-error.mdx": {
	id: "en/reference/errors/unknown-compiler-error.mdx";
  slug: "en/reference/errors/unknown-compiler-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-config-error.mdx": {
	id: "en/reference/errors/unknown-config-error.mdx";
  slug: "en/reference/errors/unknown-config-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-content-collection-error.mdx": {
	id: "en/reference/errors/unknown-content-collection-error.mdx";
  slug: "en/reference/errors/unknown-content-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-csserror.mdx": {
	id: "en/reference/errors/unknown-csserror.mdx";
  slug: "en/reference/errors/unknown-csserror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-markdown-error.mdx": {
	id: "en/reference/errors/unknown-markdown-error.mdx";
  slug: "en/reference/errors/unknown-markdown-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unknown-vite-error.mdx": {
	id: "en/reference/errors/unknown-vite-error.mdx";
  slug: "en/reference/errors/unknown-vite-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unsupported-config-transform-error.mdx": {
	id: "en/reference/errors/unsupported-config-transform-error.mdx";
  slug: "en/reference/errors/unsupported-config-transform-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/errors/unsupported-image-format.mdx": {
	id: "en/reference/errors/unsupported-image-format.mdx";
  slug: "en/reference/errors/unsupported-image-format";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/image-service-reference.mdx": {
	id: "en/reference/image-service-reference.mdx";
  slug: "en/reference/image-service-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/integrations-reference.mdx": {
	id: "en/reference/integrations-reference.mdx";
  slug: "en/reference/integrations-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/reference/publish-to-npm.mdx": {
	id: "en/reference/publish-to-npm.mdx";
  slug: "en/reference/publish-to-npm";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/0-introduction/1.mdx": {
	id: "en/tutorial/0-introduction/1.mdx";
  slug: "en/tutorial/0-introduction/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/0-introduction/index.mdx": {
	id: "en/tutorial/0-introduction/index.mdx";
  slug: "en/tutorial/0-introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/1.mdx": {
	id: "en/tutorial/1-setup/1.mdx";
  slug: "en/tutorial/1-setup/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/2.mdx": {
	id: "en/tutorial/1-setup/2.mdx";
  slug: "en/tutorial/1-setup/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/3.mdx": {
	id: "en/tutorial/1-setup/3.mdx";
  slug: "en/tutorial/1-setup/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/4.mdx": {
	id: "en/tutorial/1-setup/4.mdx";
  slug: "en/tutorial/1-setup/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/5.mdx": {
	id: "en/tutorial/1-setup/5.mdx";
  slug: "en/tutorial/1-setup/5";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/1-setup/index.mdx": {
	id: "en/tutorial/1-setup/index.mdx";
  slug: "en/tutorial/1-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/1.mdx": {
	id: "en/tutorial/2-pages/1.mdx";
  slug: "en/tutorial/2-pages/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/2.mdx": {
	id: "en/tutorial/2-pages/2.mdx";
  slug: "en/tutorial/2-pages/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/3.mdx": {
	id: "en/tutorial/2-pages/3.mdx";
  slug: "en/tutorial/2-pages/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/4.mdx": {
	id: "en/tutorial/2-pages/4.mdx";
  slug: "en/tutorial/2-pages/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/5.mdx": {
	id: "en/tutorial/2-pages/5.mdx";
  slug: "en/tutorial/2-pages/5";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/2-pages/index.mdx": {
	id: "en/tutorial/2-pages/index.mdx";
  slug: "en/tutorial/2-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/3-components/1.mdx": {
	id: "en/tutorial/3-components/1.mdx";
  slug: "en/tutorial/3-components/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/3-components/2.mdx": {
	id: "en/tutorial/3-components/2.mdx";
  slug: "en/tutorial/3-components/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/3-components/3.mdx": {
	id: "en/tutorial/3-components/3.mdx";
  slug: "en/tutorial/3-components/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/3-components/4.mdx": {
	id: "en/tutorial/3-components/4.mdx";
  slug: "en/tutorial/3-components/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/3-components/index.mdx": {
	id: "en/tutorial/3-components/index.mdx";
  slug: "en/tutorial/3-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/4-layouts/1.mdx": {
	id: "en/tutorial/4-layouts/1.mdx";
  slug: "en/tutorial/4-layouts/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/4-layouts/2.mdx": {
	id: "en/tutorial/4-layouts/2.mdx";
  slug: "en/tutorial/4-layouts/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/4-layouts/3.mdx": {
	id: "en/tutorial/4-layouts/3.mdx";
  slug: "en/tutorial/4-layouts/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/4-layouts/index.mdx": {
	id: "en/tutorial/4-layouts/index.mdx";
  slug: "en/tutorial/4-layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/5-astro-api/1.mdx": {
	id: "en/tutorial/5-astro-api/1.mdx";
  slug: "en/tutorial/5-astro-api/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/5-astro-api/2.mdx": {
	id: "en/tutorial/5-astro-api/2.mdx";
  slug: "en/tutorial/5-astro-api/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/5-astro-api/3.mdx": {
	id: "en/tutorial/5-astro-api/3.mdx";
  slug: "en/tutorial/5-astro-api/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/5-astro-api/4.mdx": {
	id: "en/tutorial/5-astro-api/4.mdx";
  slug: "en/tutorial/5-astro-api/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/5-astro-api/index.mdx": {
	id: "en/tutorial/5-astro-api/index.mdx";
  slug: "en/tutorial/5-astro-api";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/6-islands/1.mdx": {
	id: "en/tutorial/6-islands/1.mdx";
  slug: "en/tutorial/6-islands/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/6-islands/2.mdx": {
	id: "en/tutorial/6-islands/2.mdx";
  slug: "en/tutorial/6-islands/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/6-islands/3.mdx": {
	id: "en/tutorial/6-islands/3.mdx";
  slug: "en/tutorial/6-islands/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"en/tutorial/6-islands/index.mdx": {
	id: "en/tutorial/6-islands/index.mdx";
  slug: "en/tutorial/6-islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/concepts/islands.mdx": {
	id: "es/concepts/islands.mdx";
  slug: "es/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/concepts/mpa-vs-spa.mdx": {
	id: "es/concepts/mpa-vs-spa.mdx";
  slug: "es/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/concepts/why-astro.mdx": {
	id: "es/concepts/why-astro.mdx";
  slug: "es/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/contribute.mdx": {
	id: "es/contribute.mdx";
  slug: "es/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/astro-components.mdx": {
	id: "es/core-concepts/astro-components.mdx";
  slug: "es/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/astro-pages.mdx": {
	id: "es/core-concepts/astro-pages.mdx";
  slug: "es/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/astro-syntax.mdx": {
	id: "es/core-concepts/astro-syntax.mdx";
  slug: "es/core-concepts/astro-syntax";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/endpoints.mdx": {
	id: "es/core-concepts/endpoints.mdx";
  slug: "es/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/framework-components.mdx": {
	id: "es/core-concepts/framework-components.mdx";
  slug: "es/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/layouts.mdx": {
	id: "es/core-concepts/layouts.mdx";
  slug: "es/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/project-structure.mdx": {
	id: "es/core-concepts/project-structure.mdx";
  slug: "es/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/routing.mdx": {
	id: "es/core-concepts/routing.mdx";
  slug: "es/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/core-concepts/sharing-state.mdx": {
	id: "es/core-concepts/sharing-state.mdx";
  slug: "es/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/editor-setup.mdx": {
	id: "es/editor-setup.mdx";
  slug: "es/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/getting-started.mdx": {
	id: "es/getting-started.mdx";
  slug: "es/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/aliases.mdx": {
	id: "es/guides/aliases.mdx";
  slug: "es/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/backend.mdx": {
	id: "es/guides/backend.mdx";
  slug: "es/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/backend/google-firebase.mdx": {
	id: "es/guides/backend/google-firebase.mdx";
  slug: "es/guides/backend/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/backend/xata.mdx": {
	id: "es/guides/backend/xata.mdx";
  slug: "es/guides/backend/xata";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/client-side-scripts.mdx": {
	id: "es/guides/client-side-scripts.mdx";
  slug: "es/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms.mdx": {
	id: "es/guides/cms.mdx";
  slug: "es/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/buttercms.mdx": {
	id: "es/guides/cms/buttercms.mdx";
  slug: "es/guides/cms/buttercms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/cloudcannon.mdx": {
	id: "es/guides/cms/cloudcannon.mdx";
  slug: "es/guides/cms/cloudcannon";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/contentful.mdx": {
	id: "es/guides/cms/contentful.mdx";
  slug: "es/guides/cms/contentful";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/crystallize.mdx": {
	id: "es/guides/cms/crystallize.mdx";
  slug: "es/guides/cms/crystallize";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/datocms.mdx": {
	id: "es/guides/cms/datocms.mdx";
  slug: "es/guides/cms/datocms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/decap-cms.mdx": {
	id: "es/guides/cms/decap-cms.mdx";
  slug: "es/guides/cms/decap-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/directus.mdx": {
	id: "es/guides/cms/directus.mdx";
  slug: "es/guides/cms/directus";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/frontmatter-cms.mdx": {
	id: "es/guides/cms/frontmatter-cms.mdx";
  slug: "es/guides/cms/frontmatter-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/ghost.mdx": {
	id: "es/guides/cms/ghost.mdx";
  slug: "es/guides/cms/ghost";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/keystonejs.mdx": {
	id: "es/guides/cms/keystonejs.mdx";
  slug: "es/guides/cms/keystonejs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/payload.mdx": {
	id: "es/guides/cms/payload.mdx";
  slug: "es/guides/cms/payload";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/prismic.mdx": {
	id: "es/guides/cms/prismic.mdx";
  slug: "es/guides/cms/prismic";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/sanity.mdx": {
	id: "es/guides/cms/sanity.mdx";
  slug: "es/guides/cms/sanity";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/spinal.mdx": {
	id: "es/guides/cms/spinal.mdx";
  slug: "es/guides/cms/spinal";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/statamic.mdx": {
	id: "es/guides/cms/statamic.mdx";
  slug: "es/guides/cms/statamic";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/storyblok.mdx": {
	id: "es/guides/cms/storyblok.mdx";
  slug: "es/guides/cms/storyblok";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/strapi.mdx": {
	id: "es/guides/cms/strapi.mdx";
  slug: "es/guides/cms/strapi";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/tina-cms.mdx": {
	id: "es/guides/cms/tina-cms.mdx";
  slug: "es/guides/cms/tina-cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/cms/wordpress.mdx": {
	id: "es/guides/cms/wordpress.mdx";
  slug: "es/guides/cms/wordpress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/configuring-astro.mdx": {
	id: "es/guides/configuring-astro.mdx";
  slug: "es/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/content.mdx": {
	id: "es/guides/content.mdx";
  slug: "es/guides/content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/data-fetching.mdx": {
	id: "es/guides/data-fetching.mdx";
  slug: "es/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy.mdx": {
	id: "es/guides/deploy.mdx";
  slug: "es/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/aws.mdx": {
	id: "es/guides/deploy/aws.mdx";
  slug: "es/guides/deploy/aws";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/buddy.mdx": {
	id: "es/guides/deploy/buddy.mdx";
  slug: "es/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/cleavr.mdx": {
	id: "es/guides/deploy/cleavr.mdx";
  slug: "es/guides/deploy/cleavr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/cloudflare.mdx": {
	id: "es/guides/deploy/cloudflare.mdx";
  slug: "es/guides/deploy/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/deno.mdx": {
	id: "es/guides/deploy/deno.mdx";
  slug: "es/guides/deploy/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/edgio.mdx": {
	id: "es/guides/deploy/edgio.mdx";
  slug: "es/guides/deploy/edgio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/flightcontrol.mdx": {
	id: "es/guides/deploy/flightcontrol.mdx";
  slug: "es/guides/deploy/flightcontrol";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/github.mdx": {
	id: "es/guides/deploy/github.mdx";
  slug: "es/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/gitlab.mdx": {
	id: "es/guides/deploy/gitlab.mdx";
  slug: "es/guides/deploy/gitlab";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/google-cloud.mdx": {
	id: "es/guides/deploy/google-cloud.mdx";
  slug: "es/guides/deploy/google-cloud";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/google-firebase.mdx": {
	id: "es/guides/deploy/google-firebase.mdx";
  slug: "es/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/heroku.mdx": {
	id: "es/guides/deploy/heroku.mdx";
  slug: "es/guides/deploy/heroku";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/kinsta.mdx": {
	id: "es/guides/deploy/kinsta.mdx";
  slug: "es/guides/deploy/kinsta";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/microsoft-azure.mdx": {
	id: "es/guides/deploy/microsoft-azure.mdx";
  slug: "es/guides/deploy/microsoft-azure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/netlify.mdx": {
	id: "es/guides/deploy/netlify.mdx";
  slug: "es/guides/deploy/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/render.mdx": {
	id: "es/guides/deploy/render.mdx";
  slug: "es/guides/deploy/render";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/space.mdx": {
	id: "es/guides/deploy/space.mdx";
  slug: "es/guides/deploy/space";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/sst.mdx": {
	id: "es/guides/deploy/sst.mdx";
  slug: "es/guides/deploy/sst";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/surge.mdx": {
	id: "es/guides/deploy/surge.mdx";
  slug: "es/guides/deploy/surge";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/deploy/vercel.mdx": {
	id: "es/guides/deploy/vercel.mdx";
  slug: "es/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/environment-variables.mdx": {
	id: "es/guides/environment-variables.mdx";
  slug: "es/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/fonts.mdx": {
	id: "es/guides/fonts.mdx";
  slug: "es/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/images.mdx": {
	id: "es/guides/images.mdx";
  slug: "es/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/imports.mdx": {
	id: "es/guides/imports.mdx";
  slug: "es/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide.mdx": {
	id: "es/guides/integrations-guide.mdx";
  slug: "es/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/alpinejs.mdx": {
	id: "es/guides/integrations-guide/alpinejs.mdx";
  slug: "es/guides/integrations-guide/alpinejs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/cloudflare.mdx": {
	id: "es/guides/integrations-guide/cloudflare.mdx";
  slug: "es/guides/integrations-guide/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/deno.mdx": {
	id: "es/guides/integrations-guide/deno.mdx";
  slug: "es/guides/integrations-guide/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/image.mdx": {
	id: "es/guides/integrations-guide/image.mdx";
  slug: "es/guides/integrations-guide/image";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/lit.mdx": {
	id: "es/guides/integrations-guide/lit.mdx";
  slug: "es/guides/integrations-guide/lit";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/markdoc.mdx": {
	id: "es/guides/integrations-guide/markdoc.mdx";
  slug: "es/guides/integrations-guide/markdoc";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/mdx.mdx": {
	id: "es/guides/integrations-guide/mdx.mdx";
  slug: "es/guides/integrations-guide/mdx";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/netlify.mdx": {
	id: "es/guides/integrations-guide/netlify.mdx";
  slug: "es/guides/integrations-guide/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/node.mdx": {
	id: "es/guides/integrations-guide/node.mdx";
  slug: "es/guides/integrations-guide/node";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/partytown.mdx": {
	id: "es/guides/integrations-guide/partytown.mdx";
  slug: "es/guides/integrations-guide/partytown";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/preact.mdx": {
	id: "es/guides/integrations-guide/preact.mdx";
  slug: "es/guides/integrations-guide/preact";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/prefetch.mdx": {
	id: "es/guides/integrations-guide/prefetch.mdx";
  slug: "es/guides/integrations-guide/prefetch";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/react.mdx": {
	id: "es/guides/integrations-guide/react.mdx";
  slug: "es/guides/integrations-guide/react";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/sitemap.mdx": {
	id: "es/guides/integrations-guide/sitemap.mdx";
  slug: "es/guides/integrations-guide/sitemap";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/solid-js.mdx": {
	id: "es/guides/integrations-guide/solid-js.mdx";
  slug: "es/guides/integrations-guide/solid-js";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/svelte.mdx": {
	id: "es/guides/integrations-guide/svelte.mdx";
  slug: "es/guides/integrations-guide/svelte";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/tailwind.mdx": {
	id: "es/guides/integrations-guide/tailwind.mdx";
  slug: "es/guides/integrations-guide/tailwind";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/vercel.mdx": {
	id: "es/guides/integrations-guide/vercel.mdx";
  slug: "es/guides/integrations-guide/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/integrations-guide/vue.mdx": {
	id: "es/guides/integrations-guide/vue.mdx";
  slug: "es/guides/integrations-guide/vue";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/markdown-content.mdx": {
	id: "es/guides/markdown-content.mdx";
  slug: "es/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/middleware.mdx": {
	id: "es/guides/middleware.mdx";
  slug: "es/guides/middleware";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro.mdx": {
	id: "es/guides/migrate-to-astro.mdx";
  slug: "es/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-docusaurus.mdx": {
	id: "es/guides/migrate-to-astro/from-docusaurus.mdx";
  slug: "es/guides/migrate-to-astro/from-docusaurus";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-eleventy.mdx": {
	id: "es/guides/migrate-to-astro/from-eleventy.mdx";
  slug: "es/guides/migrate-to-astro/from-eleventy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-gatsby.mdx": {
	id: "es/guides/migrate-to-astro/from-gatsby.mdx";
  slug: "es/guides/migrate-to-astro/from-gatsby";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-gitbook.mdx": {
	id: "es/guides/migrate-to-astro/from-gitbook.mdx";
  slug: "es/guides/migrate-to-astro/from-gitbook";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-gridsome.mdx": {
	id: "es/guides/migrate-to-astro/from-gridsome.mdx";
  slug: "es/guides/migrate-to-astro/from-gridsome";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-hugo.mdx": {
	id: "es/guides/migrate-to-astro/from-hugo.mdx";
  slug: "es/guides/migrate-to-astro/from-hugo";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-jekyll.mdx": {
	id: "es/guides/migrate-to-astro/from-jekyll.mdx";
  slug: "es/guides/migrate-to-astro/from-jekyll";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-nextjs.mdx": {
	id: "es/guides/migrate-to-astro/from-nextjs.mdx";
  slug: "es/guides/migrate-to-astro/from-nextjs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-nuxtjs.mdx": {
	id: "es/guides/migrate-to-astro/from-nuxtjs.mdx";
  slug: "es/guides/migrate-to-astro/from-nuxtjs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-pelican.mdx": {
	id: "es/guides/migrate-to-astro/from-pelican.mdx";
  slug: "es/guides/migrate-to-astro/from-pelican";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-sveltekit.mdx": {
	id: "es/guides/migrate-to-astro/from-sveltekit.mdx";
  slug: "es/guides/migrate-to-astro/from-sveltekit";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-vuepress.mdx": {
	id: "es/guides/migrate-to-astro/from-vuepress.mdx";
  slug: "es/guides/migrate-to-astro/from-vuepress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/migrate-to-astro/from-wordpress.mdx": {
	id: "es/guides/migrate-to-astro/from-wordpress.mdx";
  slug: "es/guides/migrate-to-astro/from-wordpress";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/rss.mdx": {
	id: "es/guides/rss.mdx";
  slug: "es/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/server-side-rendering.mdx": {
	id: "es/guides/server-side-rendering.mdx";
  slug: "es/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/styling.mdx": {
	id: "es/guides/styling.mdx";
  slug: "es/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/testing.mdx": {
	id: "es/guides/testing.mdx";
  slug: "es/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/troubleshooting.mdx": {
	id: "es/guides/troubleshooting.mdx";
  slug: "es/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/typescript.mdx": {
	id: "es/guides/typescript.mdx";
  slug: "es/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/guides/upgrade-to/v2.mdx": {
	id: "es/guides/upgrade-to/v2.mdx";
  slug: "es/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/install/auto.mdx": {
	id: "es/install/auto.mdx";
  slug: "es/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/install/manual.mdx": {
	id: "es/install/manual.mdx";
  slug: "es/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/integrations/integrations.mdx": {
	id: "es/integrations/integrations.mdx";
  slug: "es/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes.mdx": {
	id: "es/recipes.mdx";
  slug: "es/recipes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/build-forms-api.mdx": {
	id: "es/recipes/build-forms-api.mdx";
  slug: "es/recipes/build-forms-api";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/build-forms.mdx": {
	id: "es/recipes/build-forms.mdx";
  slug: "es/recipes/build-forms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/bun.mdx": {
	id: "es/recipes/bun.mdx";
  slug: "es/recipes/bun";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/captcha.mdx": {
	id: "es/recipes/captcha.mdx";
  slug: "es/recipes/captcha";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/docker.mdx": {
	id: "es/recipes/docker.mdx";
  slug: "es/recipes/docker";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/external-links.mdx": {
	id: "es/recipes/external-links.mdx";
  slug: "es/recipes/external-links";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/i18n.mdx": {
	id: "es/recipes/i18n.mdx";
  slug: "es/recipes/i18n";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/recipes/reading-time.mdx": {
	id: "es/recipes/reading-time.mdx";
  slug: "es/recipes/reading-time";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/adapter-reference.mdx": {
	id: "es/reference/adapter-reference.mdx";
  slug: "es/reference/adapter-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/api-reference.mdx": {
	id: "es/reference/api-reference.mdx";
  slug: "es/reference/api-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/cli-reference.mdx": {
	id: "es/reference/cli-reference.mdx";
  slug: "es/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/configuration-reference.mdx": {
	id: "es/reference/configuration-reference.mdx";
  slug: "es/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/directives-reference.mdx": {
	id: "es/reference/directives-reference.mdx";
  slug: "es/reference/directives-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/error-reference.mdx": {
	id: "es/reference/error-reference.mdx";
  slug: "es/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/astro-glob-no-match.mdx": {
	id: "es/reference/errors/astro-glob-no-match.mdx";
  slug: "es/reference/errors/astro-glob-no-match";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/astro-glob-used-outside.mdx": {
	id: "es/reference/errors/astro-glob-used-outside.mdx";
  slug: "es/reference/errors/astro-glob-used-outside";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/client-address-not-available.mdx": {
	id: "es/reference/errors/client-address-not-available.mdx";
  slug: "es/reference/errors/client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/collection-does-not-exist-error.mdx": {
	id: "es/reference/errors/collection-does-not-exist-error.mdx";
  slug: "es/reference/errors/collection-does-not-exist-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/config-legacy-key.mdx": {
	id: "es/reference/errors/config-legacy-key.mdx";
  slug: "es/reference/errors/config-legacy-key";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/config-not-found.mdx": {
	id: "es/reference/errors/config-not-found.mdx";
  slug: "es/reference/errors/config-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/content-collection-type-mismatch-error.mdx": {
	id: "es/reference/errors/content-collection-type-mismatch-error.mdx";
  slug: "es/reference/errors/content-collection-type-mismatch-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/content-schema-contains-slug-error.mdx": {
	id: "es/reference/errors/content-schema-contains-slug-error.mdx";
  slug: "es/reference/errors/content-schema-contains-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/csssyntax-error.mdx": {
	id: "es/reference/errors/csssyntax-error.mdx";
  slug: "es/reference/errors/csssyntax-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/data-collection-entry-parse-error.mdx": {
	id: "es/reference/errors/data-collection-entry-parse-error.mdx";
  slug: "es/reference/errors/data-collection-entry-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/duplicate-content-entry-slug-error.mdx": {
	id: "es/reference/errors/duplicate-content-entry-slug-error.mdx";
  slug: "es/reference/errors/duplicate-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/expected-image-options.mdx": {
	id: "es/reference/errors/expected-image-options.mdx";
  slug: "es/reference/errors/expected-image-options";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/expected-image.mdx": {
	id: "es/reference/errors/expected-image.mdx";
  slug: "es/reference/errors/expected-image";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/failed-to-find-page-map-ssr.mdx": {
	id: "es/reference/errors/failed-to-find-page-map-ssr.mdx";
  slug: "es/reference/errors/failed-to-find-page-map-ssr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/failed-to-load-module-ssr.mdx": {
	id: "es/reference/errors/failed-to-load-module-ssr.mdx";
  slug: "es/reference/errors/failed-to-load-module-ssr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/generate-content-types-error.mdx": {
	id: "es/reference/errors/generate-content-types-error.mdx";
  slug: "es/reference/errors/generate-content-types-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/get-static-paths-expected-params.mdx": {
	id: "es/reference/errors/get-static-paths-expected-params.mdx";
  slug: "es/reference/errors/get-static-paths-expected-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/get-static-paths-invalid-route-param.mdx": {
	id: "es/reference/errors/get-static-paths-invalid-route-param.mdx";
  slug: "es/reference/errors/get-static-paths-invalid-route-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/get-static-paths-removed-rsshelper.mdx": {
	id: "es/reference/errors/get-static-paths-removed-rsshelper.mdx";
  slug: "es/reference/errors/get-static-paths-removed-rsshelper";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/get-static-paths-required.mdx": {
	id: "es/reference/errors/get-static-paths-required.mdx";
  slug: "es/reference/errors/get-static-paths-required";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/image-missing-alt.mdx": {
	id: "es/reference/errors/image-missing-alt.mdx";
  slug: "es/reference/errors/image-missing-alt";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-component-args.mdx": {
	id: "es/reference/errors/invalid-component-args.mdx";
  slug: "es/reference/errors/invalid-component-args";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-content-entry-frontmatter-error.mdx": {
	id: "es/reference/errors/invalid-content-entry-frontmatter-error.mdx";
  slug: "es/reference/errors/invalid-content-entry-frontmatter-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-content-entry-slug-error.mdx": {
	id: "es/reference/errors/invalid-content-entry-slug-error.mdx";
  slug: "es/reference/errors/invalid-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-dynamic-route.mdx": {
	id: "es/reference/errors/invalid-dynamic-route.mdx";
  slug: "es/reference/errors/invalid-dynamic-route";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-frontmatter-injection-error.mdx": {
	id: "es/reference/errors/invalid-frontmatter-injection-error.mdx";
  slug: "es/reference/errors/invalid-frontmatter-injection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-get-static-path-param.mdx": {
	id: "es/reference/errors/invalid-get-static-path-param.mdx";
  slug: "es/reference/errors/invalid-get-static-path-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-get-static-paths-return.mdx": {
	id: "es/reference/errors/invalid-get-static-paths-return.mdx";
  slug: "es/reference/errors/invalid-get-static-paths-return";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-glob.mdx": {
	id: "es/reference/errors/invalid-glob.mdx";
  slug: "es/reference/errors/invalid-glob";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-image-service.mdx": {
	id: "es/reference/errors/invalid-image-service.mdx";
  slug: "es/reference/errors/invalid-image-service";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/invalid-prerender-export.mdx": {
	id: "es/reference/errors/invalid-prerender-export.mdx";
  slug: "es/reference/errors/invalid-prerender-export";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/local-image-used-wrongly.mdx": {
	id: "es/reference/errors/local-image-used-wrongly.mdx";
  slug: "es/reference/errors/local-image-used-wrongly";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/locals-not-an-object.mdx": {
	id: "es/reference/errors/locals-not-an-object.mdx";
  slug: "es/reference/errors/locals-not-an-object";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/locals-not-serializable.mdx": {
	id: "es/reference/errors/locals-not-serializable.mdx";
  slug: "es/reference/errors/locals-not-serializable";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/markdown-content-schema-validation-error.mdx": {
	id: "es/reference/errors/markdown-content-schema-validation-error.mdx";
  slug: "es/reference/errors/markdown-content-schema-validation-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/markdown-frontmatter-parse-error.mdx": {
	id: "es/reference/errors/markdown-frontmatter-parse-error.mdx";
  slug: "es/reference/errors/markdown-frontmatter-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/markdown-image-not-found.mdx": {
	id: "es/reference/errors/markdown-image-not-found.mdx";
  slug: "es/reference/errors/markdown-image-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/mdx-integration-missing-error.mdx": {
	id: "es/reference/errors/mdx-integration-missing-error.mdx";
  slug: "es/reference/errors/mdx-integration-missing-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/middleware-no-data-or-next-called.mdx": {
	id: "es/reference/errors/middleware-no-data-or-next-called.mdx";
  slug: "es/reference/errors/middleware-no-data-or-next-called";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/middleware-not-aresponse.mdx": {
	id: "es/reference/errors/middleware-not-aresponse.mdx";
  slug: "es/reference/errors/middleware-not-aresponse";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/missing-image-dimension.mdx": {
	id: "es/reference/errors/missing-image-dimension.mdx";
  slug: "es/reference/errors/missing-image-dimension";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/missing-media-query-directive.mdx": {
	id: "es/reference/errors/missing-media-query-directive.mdx";
  slug: "es/reference/errors/missing-media-query-directive";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/mixed-content-data-collection-error.mdx": {
	id: "es/reference/errors/mixed-content-data-collection-error.mdx";
  slug: "es/reference/errors/mixed-content-data-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-adapter-installed.mdx": {
	id: "es/reference/errors/no-adapter-installed.mdx";
  slug: "es/reference/errors/no-adapter-installed";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-client-entrypoint.mdx": {
	id: "es/reference/errors/no-client-entrypoint.mdx";
  slug: "es/reference/errors/no-client-entrypoint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-client-only-hint.mdx": {
	id: "es/reference/errors/no-client-only-hint.mdx";
  slug: "es/reference/errors/no-client-only-hint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-matching-import.mdx": {
	id: "es/reference/errors/no-matching-import.mdx";
  slug: "es/reference/errors/no-matching-import";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-matching-renderer.mdx": {
	id: "es/reference/errors/no-matching-renderer.mdx";
  slug: "es/reference/errors/no-matching-renderer";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/no-matching-static-path-found.mdx": {
	id: "es/reference/errors/no-matching-static-path-found.mdx";
  slug: "es/reference/errors/no-matching-static-path-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/only-response-can-be-returned.mdx": {
	id: "es/reference/errors/only-response-can-be-returned.mdx";
  slug: "es/reference/errors/only-response-can-be-returned";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/page-number-param-not-found.mdx": {
	id: "es/reference/errors/page-number-param-not-found.mdx";
  slug: "es/reference/errors/page-number-param-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/prerender-dynamic-endpoint-path-collide.mdx": {
	id: "es/reference/errors/prerender-dynamic-endpoint-path-collide.mdx";
  slug: "es/reference/errors/prerender-dynamic-endpoint-path-collide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/redirect-with-no-location.mdx": {
	id: "es/reference/errors/redirect-with-no-location.mdx";
  slug: "es/reference/errors/redirect-with-no-location";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/reserved-slot-name.mdx": {
	id: "es/reference/errors/reserved-slot-name.mdx";
  slug: "es/reference/errors/reserved-slot-name";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/response-sent-error.mdx": {
	id: "es/reference/errors/response-sent-error.mdx";
  slug: "es/reference/errors/response-sent-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/static-client-address-not-available.mdx": {
	id: "es/reference/errors/static-client-address-not-available.mdx";
  slug: "es/reference/errors/static-client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/static-redirect-not-available.mdx": {
	id: "es/reference/errors/static-redirect-not-available.mdx";
  slug: "es/reference/errors/static-redirect-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-clierror.mdx": {
	id: "es/reference/errors/unknown-clierror.mdx";
  slug: "es/reference/errors/unknown-clierror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-compiler-error.mdx": {
	id: "es/reference/errors/unknown-compiler-error.mdx";
  slug: "es/reference/errors/unknown-compiler-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-config-error.mdx": {
	id: "es/reference/errors/unknown-config-error.mdx";
  slug: "es/reference/errors/unknown-config-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-content-collection-error.mdx": {
	id: "es/reference/errors/unknown-content-collection-error.mdx";
  slug: "es/reference/errors/unknown-content-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-csserror.mdx": {
	id: "es/reference/errors/unknown-csserror.mdx";
  slug: "es/reference/errors/unknown-csserror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-markdown-error.mdx": {
	id: "es/reference/errors/unknown-markdown-error.mdx";
  slug: "es/reference/errors/unknown-markdown-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unknown-vite-error.mdx": {
	id: "es/reference/errors/unknown-vite-error.mdx";
  slug: "es/reference/errors/unknown-vite-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unsupported-config-transform-error.mdx": {
	id: "es/reference/errors/unsupported-config-transform-error.mdx";
  slug: "es/reference/errors/unsupported-config-transform-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/errors/unsupported-image-format.mdx": {
	id: "es/reference/errors/unsupported-image-format.mdx";
  slug: "es/reference/errors/unsupported-image-format";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/image-service-reference.mdx": {
	id: "es/reference/image-service-reference.mdx";
  slug: "es/reference/image-service-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/integrations-reference.mdx": {
	id: "es/reference/integrations-reference.mdx";
  slug: "es/reference/integrations-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/reference/publish-to-npm.mdx": {
	id: "es/reference/publish-to-npm.mdx";
  slug: "es/reference/publish-to-npm";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/0-introduction/1.mdx": {
	id: "es/tutorial/0-introduction/1.mdx";
  slug: "es/tutorial/0-introduction/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/0-introduction/index.mdx": {
	id: "es/tutorial/0-introduction/index.mdx";
  slug: "es/tutorial/0-introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/1.mdx": {
	id: "es/tutorial/1-setup/1.mdx";
  slug: "es/tutorial/1-setup/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/2.mdx": {
	id: "es/tutorial/1-setup/2.mdx";
  slug: "es/tutorial/1-setup/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/3.mdx": {
	id: "es/tutorial/1-setup/3.mdx";
  slug: "es/tutorial/1-setup/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/4.mdx": {
	id: "es/tutorial/1-setup/4.mdx";
  slug: "es/tutorial/1-setup/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/5.mdx": {
	id: "es/tutorial/1-setup/5.mdx";
  slug: "es/tutorial/1-setup/5";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/1-setup/index.mdx": {
	id: "es/tutorial/1-setup/index.mdx";
  slug: "es/tutorial/1-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/1.mdx": {
	id: "es/tutorial/2-pages/1.mdx";
  slug: "es/tutorial/2-pages/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/2.mdx": {
	id: "es/tutorial/2-pages/2.mdx";
  slug: "es/tutorial/2-pages/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/3.mdx": {
	id: "es/tutorial/2-pages/3.mdx";
  slug: "es/tutorial/2-pages/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/4.mdx": {
	id: "es/tutorial/2-pages/4.mdx";
  slug: "es/tutorial/2-pages/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/5.mdx": {
	id: "es/tutorial/2-pages/5.mdx";
  slug: "es/tutorial/2-pages/5";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/2-pages/index.mdx": {
	id: "es/tutorial/2-pages/index.mdx";
  slug: "es/tutorial/2-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/3-components/1.mdx": {
	id: "es/tutorial/3-components/1.mdx";
  slug: "es/tutorial/3-components/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/3-components/2.mdx": {
	id: "es/tutorial/3-components/2.mdx";
  slug: "es/tutorial/3-components/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/3-components/3.mdx": {
	id: "es/tutorial/3-components/3.mdx";
  slug: "es/tutorial/3-components/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/3-components/4.mdx": {
	id: "es/tutorial/3-components/4.mdx";
  slug: "es/tutorial/3-components/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/3-components/index.mdx": {
	id: "es/tutorial/3-components/index.mdx";
  slug: "es/tutorial/3-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/4-layouts/1.mdx": {
	id: "es/tutorial/4-layouts/1.mdx";
  slug: "es/tutorial/4-layouts/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/4-layouts/2.mdx": {
	id: "es/tutorial/4-layouts/2.mdx";
  slug: "es/tutorial/4-layouts/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/4-layouts/3.mdx": {
	id: "es/tutorial/4-layouts/3.mdx";
  slug: "es/tutorial/4-layouts/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/4-layouts/index.mdx": {
	id: "es/tutorial/4-layouts/index.mdx";
  slug: "es/tutorial/4-layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/5-astro-api/1.mdx": {
	id: "es/tutorial/5-astro-api/1.mdx";
  slug: "es/tutorial/5-astro-api/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/5-astro-api/2.mdx": {
	id: "es/tutorial/5-astro-api/2.mdx";
  slug: "es/tutorial/5-astro-api/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/5-astro-api/3.mdx": {
	id: "es/tutorial/5-astro-api/3.mdx";
  slug: "es/tutorial/5-astro-api/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/5-astro-api/4.mdx": {
	id: "es/tutorial/5-astro-api/4.mdx";
  slug: "es/tutorial/5-astro-api/4";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/5-astro-api/index.mdx": {
	id: "es/tutorial/5-astro-api/index.mdx";
  slug: "es/tutorial/5-astro-api";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/6-islands/1.mdx": {
	id: "es/tutorial/6-islands/1.mdx";
  slug: "es/tutorial/6-islands/1";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/6-islands/2.mdx": {
	id: "es/tutorial/6-islands/2.mdx";
  slug: "es/tutorial/6-islands/2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/6-islands/3.mdx": {
	id: "es/tutorial/6-islands/3.mdx";
  slug: "es/tutorial/6-islands/3";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"es/tutorial/6-islands/index.mdx": {
	id: "es/tutorial/6-islands/index.mdx";
  slug: "es/tutorial/6-islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/concepts/islands.mdx": {
	id: "fr/concepts/islands.mdx";
  slug: "fr/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/concepts/mpa-vs-spa.mdx": {
	id: "fr/concepts/mpa-vs-spa.mdx";
  slug: "fr/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/concepts/why-astro.mdx": {
	id: "fr/concepts/why-astro.mdx";
  slug: "fr/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/contribute.mdx": {
	id: "fr/contribute.mdx";
  slug: "fr/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/astro-components.mdx": {
	id: "fr/core-concepts/astro-components.mdx";
  slug: "fr/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/astro-pages.mdx": {
	id: "fr/core-concepts/astro-pages.mdx";
  slug: "fr/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/endpoints.mdx": {
	id: "fr/core-concepts/endpoints.mdx";
  slug: "fr/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/framework-components.mdx": {
	id: "fr/core-concepts/framework-components.mdx";
  slug: "fr/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/layouts.mdx": {
	id: "fr/core-concepts/layouts.mdx";
  slug: "fr/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/project-structure.mdx": {
	id: "fr/core-concepts/project-structure.mdx";
  slug: "fr/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/routing.mdx": {
	id: "fr/core-concepts/routing.mdx";
  slug: "fr/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/core-concepts/sharing-state.mdx": {
	id: "fr/core-concepts/sharing-state.mdx";
  slug: "fr/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/editor-setup.mdx": {
	id: "fr/editor-setup.mdx";
  slug: "fr/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/getting-started.mdx": {
	id: "fr/getting-started.mdx";
  slug: "fr/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/aliases.mdx": {
	id: "fr/guides/aliases.mdx";
  slug: "fr/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/backend.mdx": {
	id: "fr/guides/backend.mdx";
  slug: "fr/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/client-side-scripts.mdx": {
	id: "fr/guides/client-side-scripts.mdx";
  slug: "fr/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/cms.mdx": {
	id: "fr/guides/cms.mdx";
  slug: "fr/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/configuring-astro.mdx": {
	id: "fr/guides/configuring-astro.mdx";
  slug: "fr/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/data-fetching.mdx": {
	id: "fr/guides/data-fetching.mdx";
  slug: "fr/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy.mdx": {
	id: "fr/guides/deploy.mdx";
  slug: "fr/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/buddy.mdx": {
	id: "fr/guides/deploy/buddy.mdx";
  slug: "fr/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/github.mdx": {
	id: "fr/guides/deploy/github.mdx";
  slug: "fr/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/google-firebase.mdx": {
	id: "fr/guides/deploy/google-firebase.mdx";
  slug: "fr/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/netlify.mdx": {
	id: "fr/guides/deploy/netlify.mdx";
  slug: "fr/guides/deploy/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/render.mdx": {
	id: "fr/guides/deploy/render.mdx";
  slug: "fr/guides/deploy/render";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/deploy/vercel.mdx": {
	id: "fr/guides/deploy/vercel.mdx";
  slug: "fr/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/environment-variables.mdx": {
	id: "fr/guides/environment-variables.mdx";
  slug: "fr/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/fonts.mdx": {
	id: "fr/guides/fonts.mdx";
  slug: "fr/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/images.mdx": {
	id: "fr/guides/images.mdx";
  slug: "fr/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/imports.mdx": {
	id: "fr/guides/imports.mdx";
  slug: "fr/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/integrations-guide.mdx": {
	id: "fr/guides/integrations-guide.mdx";
  slug: "fr/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/markdown-content.mdx": {
	id: "fr/guides/markdown-content.mdx";
  slug: "fr/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/migrate-to-astro.mdx": {
	id: "fr/guides/migrate-to-astro.mdx";
  slug: "fr/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/rss.mdx": {
	id: "fr/guides/rss.mdx";
  slug: "fr/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/server-side-rendering.mdx": {
	id: "fr/guides/server-side-rendering.mdx";
  slug: "fr/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/styling.mdx": {
	id: "fr/guides/styling.mdx";
  slug: "fr/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/testing.mdx": {
	id: "fr/guides/testing.mdx";
  slug: "fr/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/troubleshooting.mdx": {
	id: "fr/guides/troubleshooting.mdx";
  slug: "fr/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/guides/typescript.mdx": {
	id: "fr/guides/typescript.mdx";
  slug: "fr/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/install/auto.mdx": {
	id: "fr/install/auto.mdx";
  slug: "fr/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/install/manual.mdx": {
	id: "fr/install/manual.mdx";
  slug: "fr/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/integrations/integrations.mdx": {
	id: "fr/integrations/integrations.mdx";
  slug: "fr/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/cli-reference.mdx": {
	id: "fr/reference/cli-reference.mdx";
  slug: "fr/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/configuration-reference.mdx": {
	id: "fr/reference/configuration-reference.mdx";
  slug: "fr/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/directives-reference.mdx": {
	id: "fr/reference/directives-reference.mdx";
  slug: "fr/reference/directives-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/error-reference.mdx": {
	id: "fr/reference/error-reference.mdx";
  slug: "fr/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/collection-does-not-exist-error.mdx": {
	id: "fr/reference/errors/collection-does-not-exist-error.mdx";
  slug: "fr/reference/errors/collection-does-not-exist-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/config-legacy-key.mdx": {
	id: "fr/reference/errors/config-legacy-key.mdx";
  slug: "fr/reference/errors/config-legacy-key";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/config-not-found.mdx": {
	id: "fr/reference/errors/config-not-found.mdx";
  slug: "fr/reference/errors/config-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/content-collection-type-mismatch-error.mdx": {
	id: "fr/reference/errors/content-collection-type-mismatch-error.mdx";
  slug: "fr/reference/errors/content-collection-type-mismatch-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/content-schema-contains-slug-error.mdx": {
	id: "fr/reference/errors/content-schema-contains-slug-error.mdx";
  slug: "fr/reference/errors/content-schema-contains-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/csssyntax-error.mdx": {
	id: "fr/reference/errors/csssyntax-error.mdx";
  slug: "fr/reference/errors/csssyntax-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/data-collection-entry-parse-error.mdx": {
	id: "fr/reference/errors/data-collection-entry-parse-error.mdx";
  slug: "fr/reference/errors/data-collection-entry-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/generate-content-types-error.mdx": {
	id: "fr/reference/errors/generate-content-types-error.mdx";
  slug: "fr/reference/errors/generate-content-types-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/invalid-content-entry-frontmatter-error.mdx": {
	id: "fr/reference/errors/invalid-content-entry-frontmatter-error.mdx";
  slug: "fr/reference/errors/invalid-content-entry-frontmatter-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/invalid-content-entry-slug-error.mdx": {
	id: "fr/reference/errors/invalid-content-entry-slug-error.mdx";
  slug: "fr/reference/errors/invalid-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/invalid-frontmatter-injection-error.mdx": {
	id: "fr/reference/errors/invalid-frontmatter-injection-error.mdx";
  slug: "fr/reference/errors/invalid-frontmatter-injection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/markdown-frontmatter-parse-error.mdx": {
	id: "fr/reference/errors/markdown-frontmatter-parse-error.mdx";
  slug: "fr/reference/errors/markdown-frontmatter-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/mdx-integration-missing-error.mdx": {
	id: "fr/reference/errors/mdx-integration-missing-error.mdx";
  slug: "fr/reference/errors/mdx-integration-missing-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/mixed-content-data-collection-error.mdx": {
	id: "fr/reference/errors/mixed-content-data-collection-error.mdx";
  slug: "fr/reference/errors/mixed-content-data-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/unknown-clierror.mdx": {
	id: "fr/reference/errors/unknown-clierror.mdx";
  slug: "fr/reference/errors/unknown-clierror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/unknown-config-error.mdx": {
	id: "fr/reference/errors/unknown-config-error.mdx";
  slug: "fr/reference/errors/unknown-config-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/unknown-content-collection-error.mdx": {
	id: "fr/reference/errors/unknown-content-collection-error.mdx";
  slug: "fr/reference/errors/unknown-content-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/unknown-csserror.mdx": {
	id: "fr/reference/errors/unknown-csserror.mdx";
  slug: "fr/reference/errors/unknown-csserror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/errors/unknown-markdown-error.mdx": {
	id: "fr/reference/errors/unknown-markdown-error.mdx";
  slug: "fr/reference/errors/unknown-markdown-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"fr/reference/publish-to-npm.mdx": {
	id: "fr/reference/publish-to-npm.mdx";
  slug: "fr/reference/publish-to-npm";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"it/getting-started.mdx": {
	id: "it/getting-started.mdx";
  slug: "it/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"it/install/auto.mdx": {
	id: "it/install/auto.mdx";
  slug: "it/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/concepts/islands.mdx": {
	id: "ja/concepts/islands.mdx";
  slug: "ja/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/concepts/mpa-vs-spa.mdx": {
	id: "ja/concepts/mpa-vs-spa.mdx";
  slug: "ja/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/concepts/why-astro.mdx": {
	id: "ja/concepts/why-astro.mdx";
  slug: "ja/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/contribute.mdx": {
	id: "ja/contribute.mdx";
  slug: "ja/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/astro-components.mdx": {
	id: "ja/core-concepts/astro-components.mdx";
  slug: "ja/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/astro-pages.mdx": {
	id: "ja/core-concepts/astro-pages.mdx";
  slug: "ja/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/endpoints.mdx": {
	id: "ja/core-concepts/endpoints.mdx";
  slug: "ja/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/framework-components.mdx": {
	id: "ja/core-concepts/framework-components.mdx";
  slug: "ja/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/layouts.mdx": {
	id: "ja/core-concepts/layouts.mdx";
  slug: "ja/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/project-structure.mdx": {
	id: "ja/core-concepts/project-structure.mdx";
  slug: "ja/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/core-concepts/routing.mdx": {
	id: "ja/core-concepts/routing.mdx";
  slug: "ja/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/editor-setup.mdx": {
	id: "ja/editor-setup.mdx";
  slug: "ja/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/getting-started.mdx": {
	id: "ja/getting-started.mdx";
  slug: "ja/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/aliases.mdx": {
	id: "ja/guides/aliases.mdx";
  slug: "ja/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/backend.mdx": {
	id: "ja/guides/backend.mdx";
  slug: "ja/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/client-side-scripts.mdx": {
	id: "ja/guides/client-side-scripts.mdx";
  slug: "ja/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/cms.mdx": {
	id: "ja/guides/cms.mdx";
  slug: "ja/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/cms/buttercms.mdx": {
	id: "ja/guides/cms/buttercms.mdx";
  slug: "ja/guides/cms/buttercms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/cms/contentful.mdx": {
	id: "ja/guides/cms/contentful.mdx";
  slug: "ja/guides/cms/contentful";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/cms/storyblok.mdx": {
	id: "ja/guides/cms/storyblok.mdx";
  slug: "ja/guides/cms/storyblok";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/configuring-astro.mdx": {
	id: "ja/guides/configuring-astro.mdx";
  slug: "ja/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/content.mdx": {
	id: "ja/guides/content.mdx";
  slug: "ja/guides/content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/data-fetching.mdx": {
	id: "ja/guides/data-fetching.mdx";
  slug: "ja/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy.mdx": {
	id: "ja/guides/deploy.mdx";
  slug: "ja/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/flightcontrol.mdx": {
	id: "ja/guides/deploy/flightcontrol.mdx";
  slug: "ja/guides/deploy/flightcontrol";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/google-cloud.mdx": {
	id: "ja/guides/deploy/google-cloud.mdx";
  slug: "ja/guides/deploy/google-cloud";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/google-firebase.mdx": {
	id: "ja/guides/deploy/google-firebase.mdx";
  slug: "ja/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/microsoft-azure.mdx": {
	id: "ja/guides/deploy/microsoft-azure.mdx";
  slug: "ja/guides/deploy/microsoft-azure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/surge.mdx": {
	id: "ja/guides/deploy/surge.mdx";
  slug: "ja/guides/deploy/surge";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/deploy/vercel.mdx": {
	id: "ja/guides/deploy/vercel.mdx";
  slug: "ja/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/environment-variables.mdx": {
	id: "ja/guides/environment-variables.mdx";
  slug: "ja/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/fonts.mdx": {
	id: "ja/guides/fonts.mdx";
  slug: "ja/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/images.mdx": {
	id: "ja/guides/images.mdx";
  slug: "ja/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/imports.mdx": {
	id: "ja/guides/imports.mdx";
  slug: "ja/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/integrations-guide.mdx": {
	id: "ja/guides/integrations-guide.mdx";
  slug: "ja/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/markdown-content.mdx": {
	id: "ja/guides/markdown-content.mdx";
  slug: "ja/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/migrate-to-astro.mdx": {
	id: "ja/guides/migrate-to-astro.mdx";
  slug: "ja/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/rss.mdx": {
	id: "ja/guides/rss.mdx";
  slug: "ja/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/server-side-rendering.mdx": {
	id: "ja/guides/server-side-rendering.mdx";
  slug: "ja/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/styling.mdx": {
	id: "ja/guides/styling.mdx";
  slug: "ja/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/testing.mdx": {
	id: "ja/guides/testing.mdx";
  slug: "ja/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/troubleshooting.mdx": {
	id: "ja/guides/troubleshooting.mdx";
  slug: "ja/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/typescript.mdx": {
	id: "ja/guides/typescript.mdx";
  slug: "ja/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/guides/upgrade-to/v2.mdx": {
	id: "ja/guides/upgrade-to/v2.mdx";
  slug: "ja/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/install/auto.mdx": {
	id: "ja/install/auto.mdx";
  slug: "ja/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/install/manual.mdx": {
	id: "ja/install/manual.mdx";
  slug: "ja/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/integrations/integrations.mdx": {
	id: "ja/integrations/integrations.mdx";
  slug: "ja/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/reference/cli-reference.mdx": {
	id: "ja/reference/cli-reference.mdx";
  slug: "ja/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/reference/configuration-reference.mdx": {
	id: "ja/reference/configuration-reference.mdx";
  slug: "ja/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/reference/error-reference.mdx": {
	id: "ja/reference/error-reference.mdx";
  slug: "ja/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ja/reference/errors/unknown-compiler-error.mdx": {
	id: "ja/reference/errors/unknown-compiler-error.mdx";
  slug: "ja/reference/errors/unknown-compiler-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/concepts/islands.mdx": {
	id: "ko/concepts/islands.mdx";
  slug: "ko/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/concepts/mpa-vs-spa.mdx": {
	id: "ko/concepts/mpa-vs-spa.mdx";
  slug: "ko/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/concepts/why-astro.mdx": {
	id: "ko/concepts/why-astro.mdx";
  slug: "ko/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/core-concepts/astro-components.mdx": {
	id: "ko/core-concepts/astro-components.mdx";
  slug: "ko/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/core-concepts/astro-pages.mdx": {
	id: "ko/core-concepts/astro-pages.mdx";
  slug: "ko/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/core-concepts/framework-components.mdx": {
	id: "ko/core-concepts/framework-components.mdx";
  slug: "ko/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/core-concepts/layouts.mdx": {
	id: "ko/core-concepts/layouts.mdx";
  slug: "ko/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/core-concepts/project-structure.mdx": {
	id: "ko/core-concepts/project-structure.mdx";
  slug: "ko/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/editor-setup.mdx": {
	id: "ko/editor-setup.mdx";
  slug: "ko/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/getting-started.mdx": {
	id: "ko/getting-started.mdx";
  slug: "ko/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/guides/aliases.mdx": {
	id: "ko/guides/aliases.mdx";
  slug: "ko/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/guides/environment-variables.mdx": {
	id: "ko/guides/environment-variables.mdx";
  slug: "ko/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/guides/upgrade-to/v2.mdx": {
	id: "ko/guides/upgrade-to/v2.mdx";
  slug: "ko/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/install/auto.mdx": {
	id: "ko/install/auto.mdx";
  slug: "ko/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ko/install/manual.mdx": {
	id: "ko/install/manual.mdx";
  slug: "ko/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/concepts/why-astro.mdx": {
	id: "pl/concepts/why-astro.mdx";
  slug: "pl/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/editor-setup.mdx": {
	id: "pl/editor-setup.mdx";
  slug: "pl/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/getting-started.mdx": {
	id: "pl/getting-started.mdx";
  slug: "pl/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/guides/upgrade-to/v2.mdx": {
	id: "pl/guides/upgrade-to/v2.mdx";
  slug: "pl/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/install/auto.mdx": {
	id: "pl/install/auto.mdx";
  slug: "pl/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pl/install/manual.mdx": {
	id: "pl/install/manual.mdx";
  slug: "pl/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/concepts/islands.mdx": {
	id: "pt-br/concepts/islands.mdx";
  slug: "pt-br/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/concepts/mpa-vs-spa.mdx": {
	id: "pt-br/concepts/mpa-vs-spa.mdx";
  slug: "pt-br/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/concepts/why-astro.mdx": {
	id: "pt-br/concepts/why-astro.mdx";
  slug: "pt-br/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/contribute.mdx": {
	id: "pt-br/contribute.mdx";
  slug: "pt-br/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/astro-components.mdx": {
	id: "pt-br/core-concepts/astro-components.mdx";
  slug: "pt-br/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/astro-pages.mdx": {
	id: "pt-br/core-concepts/astro-pages.mdx";
  slug: "pt-br/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/endpoints.mdx": {
	id: "pt-br/core-concepts/endpoints.mdx";
  slug: "pt-br/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/framework-components.mdx": {
	id: "pt-br/core-concepts/framework-components.mdx";
  slug: "pt-br/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/layouts.mdx": {
	id: "pt-br/core-concepts/layouts.mdx";
  slug: "pt-br/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/project-structure.mdx": {
	id: "pt-br/core-concepts/project-structure.mdx";
  slug: "pt-br/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/routing.mdx": {
	id: "pt-br/core-concepts/routing.mdx";
  slug: "pt-br/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/core-concepts/sharing-state.mdx": {
	id: "pt-br/core-concepts/sharing-state.mdx";
  slug: "pt-br/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/editor-setup.mdx": {
	id: "pt-br/editor-setup.mdx";
  slug: "pt-br/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/getting-started.mdx": {
	id: "pt-br/getting-started.mdx";
  slug: "pt-br/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/aliases.mdx": {
	id: "pt-br/guides/aliases.mdx";
  slug: "pt-br/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/backend.mdx": {
	id: "pt-br/guides/backend.mdx";
  slug: "pt-br/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/client-side-scripts.mdx": {
	id: "pt-br/guides/client-side-scripts.mdx";
  slug: "pt-br/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/cms.mdx": {
	id: "pt-br/guides/cms.mdx";
  slug: "pt-br/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/configuring-astro.mdx": {
	id: "pt-br/guides/configuring-astro.mdx";
  slug: "pt-br/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/data-fetching.mdx": {
	id: "pt-br/guides/data-fetching.mdx";
  slug: "pt-br/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy.mdx": {
	id: "pt-br/guides/deploy.mdx";
  slug: "pt-br/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/aws.mdx": {
	id: "pt-br/guides/deploy/aws.mdx";
  slug: "pt-br/guides/deploy/aws";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/buddy.mdx": {
	id: "pt-br/guides/deploy/buddy.mdx";
  slug: "pt-br/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/cleavr.mdx": {
	id: "pt-br/guides/deploy/cleavr.mdx";
  slug: "pt-br/guides/deploy/cleavr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/cloudflare.mdx": {
	id: "pt-br/guides/deploy/cloudflare.mdx";
  slug: "pt-br/guides/deploy/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/deno.mdx": {
	id: "pt-br/guides/deploy/deno.mdx";
  slug: "pt-br/guides/deploy/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/edgio.mdx": {
	id: "pt-br/guides/deploy/edgio.mdx";
  slug: "pt-br/guides/deploy/edgio";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/flightcontrol.mdx": {
	id: "pt-br/guides/deploy/flightcontrol.mdx";
  slug: "pt-br/guides/deploy/flightcontrol";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/github.mdx": {
	id: "pt-br/guides/deploy/github.mdx";
  slug: "pt-br/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/gitlab.mdx": {
	id: "pt-br/guides/deploy/gitlab.mdx";
  slug: "pt-br/guides/deploy/gitlab";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/google-cloud.mdx": {
	id: "pt-br/guides/deploy/google-cloud.mdx";
  slug: "pt-br/guides/deploy/google-cloud";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/google-firebase.mdx": {
	id: "pt-br/guides/deploy/google-firebase.mdx";
  slug: "pt-br/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/heroku.mdx": {
	id: "pt-br/guides/deploy/heroku.mdx";
  slug: "pt-br/guides/deploy/heroku";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/kinsta.mdx": {
	id: "pt-br/guides/deploy/kinsta.mdx";
  slug: "pt-br/guides/deploy/kinsta";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/microsoft-azure.mdx": {
	id: "pt-br/guides/deploy/microsoft-azure.mdx";
  slug: "pt-br/guides/deploy/microsoft-azure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/netlify.mdx": {
	id: "pt-br/guides/deploy/netlify.mdx";
  slug: "pt-br/guides/deploy/netlify";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/render.mdx": {
	id: "pt-br/guides/deploy/render.mdx";
  slug: "pt-br/guides/deploy/render";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/sst.mdx": {
	id: "pt-br/guides/deploy/sst.mdx";
  slug: "pt-br/guides/deploy/sst";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/surge.mdx": {
	id: "pt-br/guides/deploy/surge.mdx";
  slug: "pt-br/guides/deploy/surge";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/deploy/vercel.mdx": {
	id: "pt-br/guides/deploy/vercel.mdx";
  slug: "pt-br/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/environment-variables.mdx": {
	id: "pt-br/guides/environment-variables.mdx";
  slug: "pt-br/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/fonts.mdx": {
	id: "pt-br/guides/fonts.mdx";
  slug: "pt-br/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/images.mdx": {
	id: "pt-br/guides/images.mdx";
  slug: "pt-br/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/imports.mdx": {
	id: "pt-br/guides/imports.mdx";
  slug: "pt-br/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/integrations-guide.mdx": {
	id: "pt-br/guides/integrations-guide.mdx";
  slug: "pt-br/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/integrations-guide/deno.mdx": {
	id: "pt-br/guides/integrations-guide/deno.mdx";
  slug: "pt-br/guides/integrations-guide/deno";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/markdown-content.mdx": {
	id: "pt-br/guides/markdown-content.mdx";
  slug: "pt-br/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/migrate-to-astro.mdx": {
	id: "pt-br/guides/migrate-to-astro.mdx";
  slug: "pt-br/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/rss.mdx": {
	id: "pt-br/guides/rss.mdx";
  slug: "pt-br/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/server-side-rendering.mdx": {
	id: "pt-br/guides/server-side-rendering.mdx";
  slug: "pt-br/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/styling.mdx": {
	id: "pt-br/guides/styling.mdx";
  slug: "pt-br/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/testing.mdx": {
	id: "pt-br/guides/testing.mdx";
  slug: "pt-br/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/troubleshooting.mdx": {
	id: "pt-br/guides/troubleshooting.mdx";
  slug: "pt-br/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/typescript.mdx": {
	id: "pt-br/guides/typescript.mdx";
  slug: "pt-br/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/guides/upgrade-to/v2.mdx": {
	id: "pt-br/guides/upgrade-to/v2.mdx";
  slug: "pt-br/guides/upgrade-to/v2";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/install/auto.mdx": {
	id: "pt-br/install/auto.mdx";
  slug: "pt-br/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/install/manual.mdx": {
	id: "pt-br/install/manual.mdx";
  slug: "pt-br/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/integrations/integrations.mdx": {
	id: "pt-br/integrations/integrations.mdx";
  slug: "pt-br/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/adapter-reference.mdx": {
	id: "pt-br/reference/adapter-reference.mdx";
  slug: "pt-br/reference/adapter-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/api-reference.mdx": {
	id: "pt-br/reference/api-reference.mdx";
  slug: "pt-br/reference/api-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/cli-reference.mdx": {
	id: "pt-br/reference/cli-reference.mdx";
  slug: "pt-br/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/configuration-reference.mdx": {
	id: "pt-br/reference/configuration-reference.mdx";
  slug: "pt-br/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/directives-reference.mdx": {
	id: "pt-br/reference/directives-reference.mdx";
  slug: "pt-br/reference/directives-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/error-reference.mdx": {
	id: "pt-br/reference/error-reference.mdx";
  slug: "pt-br/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/client-address-not-available.mdx": {
	id: "pt-br/reference/errors/client-address-not-available.mdx";
  slug: "pt-br/reference/errors/client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/config-legacy-key.mdx": {
	id: "pt-br/reference/errors/config-legacy-key.mdx";
  slug: "pt-br/reference/errors/config-legacy-key";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/config-not-found.mdx": {
	id: "pt-br/reference/errors/config-not-found.mdx";
  slug: "pt-br/reference/errors/config-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/content-schema-contains-slug-error.mdx": {
	id: "pt-br/reference/errors/content-schema-contains-slug-error.mdx";
  slug: "pt-br/reference/errors/content-schema-contains-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/csssyntax-error.mdx": {
	id: "pt-br/reference/errors/csssyntax-error.mdx";
  slug: "pt-br/reference/errors/csssyntax-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/expected-image-options.mdx": {
	id: "pt-br/reference/errors/expected-image-options.mdx";
  slug: "pt-br/reference/errors/expected-image-options";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/expected-image.mdx": {
	id: "pt-br/reference/errors/expected-image.mdx";
  slug: "pt-br/reference/errors/expected-image";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/failed-to-load-module-ssr.mdx": {
	id: "pt-br/reference/errors/failed-to-load-module-ssr.mdx";
  slug: "pt-br/reference/errors/failed-to-load-module-ssr";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/generate-content-types-error.mdx": {
	id: "pt-br/reference/errors/generate-content-types-error.mdx";
  slug: "pt-br/reference/errors/generate-content-types-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/get-static-paths-expected-params.mdx": {
	id: "pt-br/reference/errors/get-static-paths-expected-params.mdx";
  slug: "pt-br/reference/errors/get-static-paths-expected-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/get-static-paths-invalid-route-param.mdx": {
	id: "pt-br/reference/errors/get-static-paths-invalid-route-param.mdx";
  slug: "pt-br/reference/errors/get-static-paths-invalid-route-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/get-static-paths-removed-rsshelper.mdx": {
	id: "pt-br/reference/errors/get-static-paths-removed-rsshelper.mdx";
  slug: "pt-br/reference/errors/get-static-paths-removed-rsshelper";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/get-static-paths-required.mdx": {
	id: "pt-br/reference/errors/get-static-paths-required.mdx";
  slug: "pt-br/reference/errors/get-static-paths-required";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/image-missing-alt.mdx": {
	id: "pt-br/reference/errors/image-missing-alt.mdx";
  slug: "pt-br/reference/errors/image-missing-alt";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-component-args.mdx": {
	id: "pt-br/reference/errors/invalid-component-args.mdx";
  slug: "pt-br/reference/errors/invalid-component-args";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-content-entry-frontmatter-error.mdx": {
	id: "pt-br/reference/errors/invalid-content-entry-frontmatter-error.mdx";
  slug: "pt-br/reference/errors/invalid-content-entry-frontmatter-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-content-entry-slug-error.mdx": {
	id: "pt-br/reference/errors/invalid-content-entry-slug-error.mdx";
  slug: "pt-br/reference/errors/invalid-content-entry-slug-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-frontmatter-injection-error.mdx": {
	id: "pt-br/reference/errors/invalid-frontmatter-injection-error.mdx";
  slug: "pt-br/reference/errors/invalid-frontmatter-injection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-get-static-path-param.mdx": {
	id: "pt-br/reference/errors/invalid-get-static-path-param.mdx";
  slug: "pt-br/reference/errors/invalid-get-static-path-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-get-static-paths-return.mdx": {
	id: "pt-br/reference/errors/invalid-get-static-paths-return.mdx";
  slug: "pt-br/reference/errors/invalid-get-static-paths-return";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-glob.mdx": {
	id: "pt-br/reference/errors/invalid-glob.mdx";
  slug: "pt-br/reference/errors/invalid-glob";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-image-service.mdx": {
	id: "pt-br/reference/errors/invalid-image-service.mdx";
  slug: "pt-br/reference/errors/invalid-image-service";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/invalid-prerender-export.mdx": {
	id: "pt-br/reference/errors/invalid-prerender-export.mdx";
  slug: "pt-br/reference/errors/invalid-prerender-export";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/markdown-content-schema-validation-error.mdx": {
	id: "pt-br/reference/errors/markdown-content-schema-validation-error.mdx";
  slug: "pt-br/reference/errors/markdown-content-schema-validation-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/markdown-frontmatter-parse-error.mdx": {
	id: "pt-br/reference/errors/markdown-frontmatter-parse-error.mdx";
  slug: "pt-br/reference/errors/markdown-frontmatter-parse-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/markdown-image-not-found.mdx": {
	id: "pt-br/reference/errors/markdown-image-not-found.mdx";
  slug: "pt-br/reference/errors/markdown-image-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/mdx-integration-missing-error.mdx": {
	id: "pt-br/reference/errors/mdx-integration-missing-error.mdx";
  slug: "pt-br/reference/errors/mdx-integration-missing-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/missing-image-dimension.mdx": {
	id: "pt-br/reference/errors/missing-image-dimension.mdx";
  slug: "pt-br/reference/errors/missing-image-dimension";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/missing-media-query-directive.mdx": {
	id: "pt-br/reference/errors/missing-media-query-directive.mdx";
  slug: "pt-br/reference/errors/missing-media-query-directive";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-adapter-installed.mdx": {
	id: "pt-br/reference/errors/no-adapter-installed.mdx";
  slug: "pt-br/reference/errors/no-adapter-installed";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-client-entrypoint.mdx": {
	id: "pt-br/reference/errors/no-client-entrypoint.mdx";
  slug: "pt-br/reference/errors/no-client-entrypoint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-client-only-hint.mdx": {
	id: "pt-br/reference/errors/no-client-only-hint.mdx";
  slug: "pt-br/reference/errors/no-client-only-hint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-matching-import.mdx": {
	id: "pt-br/reference/errors/no-matching-import.mdx";
  slug: "pt-br/reference/errors/no-matching-import";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-matching-renderer.mdx": {
	id: "pt-br/reference/errors/no-matching-renderer.mdx";
  slug: "pt-br/reference/errors/no-matching-renderer";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/no-matching-static-path-found.mdx": {
	id: "pt-br/reference/errors/no-matching-static-path-found.mdx";
  slug: "pt-br/reference/errors/no-matching-static-path-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/only-response-can-be-returned.mdx": {
	id: "pt-br/reference/errors/only-response-can-be-returned.mdx";
  slug: "pt-br/reference/errors/only-response-can-be-returned";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/page-number-param-not-found.mdx": {
	id: "pt-br/reference/errors/page-number-param-not-found.mdx";
  slug: "pt-br/reference/errors/page-number-param-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/prerender-dynamic-endpoint-path-collide.mdx": {
	id: "pt-br/reference/errors/prerender-dynamic-endpoint-path-collide.mdx";
  slug: "pt-br/reference/errors/prerender-dynamic-endpoint-path-collide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/reserved-slot-name.mdx": {
	id: "pt-br/reference/errors/reserved-slot-name.mdx";
  slug: "pt-br/reference/errors/reserved-slot-name";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/response-sent-error.mdx": {
	id: "pt-br/reference/errors/response-sent-error.mdx";
  slug: "pt-br/reference/errors/response-sent-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/static-client-address-not-available.mdx": {
	id: "pt-br/reference/errors/static-client-address-not-available.mdx";
  slug: "pt-br/reference/errors/static-client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/static-redirect-not-available.mdx": {
	id: "pt-br/reference/errors/static-redirect-not-available.mdx";
  slug: "pt-br/reference/errors/static-redirect-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-clierror.mdx": {
	id: "pt-br/reference/errors/unknown-clierror.mdx";
  slug: "pt-br/reference/errors/unknown-clierror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-compiler-error.mdx": {
	id: "pt-br/reference/errors/unknown-compiler-error.mdx";
  slug: "pt-br/reference/errors/unknown-compiler-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-config-error.mdx": {
	id: "pt-br/reference/errors/unknown-config-error.mdx";
  slug: "pt-br/reference/errors/unknown-config-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-content-collection-error.mdx": {
	id: "pt-br/reference/errors/unknown-content-collection-error.mdx";
  slug: "pt-br/reference/errors/unknown-content-collection-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-csserror.mdx": {
	id: "pt-br/reference/errors/unknown-csserror.mdx";
  slug: "pt-br/reference/errors/unknown-csserror";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-markdown-error.mdx": {
	id: "pt-br/reference/errors/unknown-markdown-error.mdx";
  slug: "pt-br/reference/errors/unknown-markdown-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unknown-vite-error.mdx": {
	id: "pt-br/reference/errors/unknown-vite-error.mdx";
  slug: "pt-br/reference/errors/unknown-vite-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/errors/unsupported-image-format.mdx": {
	id: "pt-br/reference/errors/unsupported-image-format.mdx";
  slug: "pt-br/reference/errors/unsupported-image-format";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/integrations-reference.mdx": {
	id: "pt-br/reference/integrations-reference.mdx";
  slug: "pt-br/reference/integrations-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"pt-br/reference/publish-to-npm.mdx": {
	id: "pt-br/reference/publish-to-npm.mdx";
  slug: "pt-br/reference/publish-to-npm";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/concepts/islands.mdx": {
	id: "ru/concepts/islands.mdx";
  slug: "ru/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/concepts/mpa-vs-spa.mdx": {
	id: "ru/concepts/mpa-vs-spa.mdx";
  slug: "ru/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/concepts/why-astro.mdx": {
	id: "ru/concepts/why-astro.mdx";
  slug: "ru/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/core-concepts/astro-pages.mdx": {
	id: "ru/core-concepts/astro-pages.mdx";
  slug: "ru/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/core-concepts/layouts.mdx": {
	id: "ru/core-concepts/layouts.mdx";
  slug: "ru/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/core-concepts/project-structure.mdx": {
	id: "ru/core-concepts/project-structure.mdx";
  slug: "ru/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/editor-setup.mdx": {
	id: "ru/editor-setup.mdx";
  slug: "ru/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/getting-started.mdx": {
	id: "ru/getting-started.mdx";
  slug: "ru/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/aliases.mdx": {
	id: "ru/guides/aliases.mdx";
  slug: "ru/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/backend.mdx": {
	id: "ru/guides/backend.mdx";
  slug: "ru/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/cms.mdx": {
	id: "ru/guides/cms.mdx";
  slug: "ru/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/data-fetching.mdx": {
	id: "ru/guides/data-fetching.mdx";
  slug: "ru/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/deploy.mdx": {
	id: "ru/guides/deploy.mdx";
  slug: "ru/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/environment-variables.mdx": {
	id: "ru/guides/environment-variables.mdx";
  slug: "ru/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/fonts.mdx": {
	id: "ru/guides/fonts.mdx";
  slug: "ru/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/integrations-guide.mdx": {
	id: "ru/guides/integrations-guide.mdx";
  slug: "ru/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/markdown-content.mdx": {
	id: "ru/guides/markdown-content.mdx";
  slug: "ru/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/migrate-to-astro.mdx": {
	id: "ru/guides/migrate-to-astro.mdx";
  slug: "ru/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/guides/testing.mdx": {
	id: "ru/guides/testing.mdx";
  slug: "ru/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/install/auto.mdx": {
	id: "ru/install/auto.mdx";
  slug: "ru/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"ru/recipes.mdx": {
	id: "ru/recipes.mdx";
  slug: "ru/recipes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/concepts/islands.mdx": {
	id: "zh-cn/concepts/islands.mdx";
  slug: "zh-cn/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/concepts/mpa-vs-spa.mdx": {
	id: "zh-cn/concepts/mpa-vs-spa.mdx";
  slug: "zh-cn/concepts/mpa-vs-spa";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/concepts/why-astro.mdx": {
	id: "zh-cn/concepts/why-astro.mdx";
  slug: "zh-cn/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/contribute.mdx": {
	id: "zh-cn/contribute.mdx";
  slug: "zh-cn/contribute";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/astro-components.mdx": {
	id: "zh-cn/core-concepts/astro-components.mdx";
  slug: "zh-cn/core-concepts/astro-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/astro-pages.mdx": {
	id: "zh-cn/core-concepts/astro-pages.mdx";
  slug: "zh-cn/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/endpoints.mdx": {
	id: "zh-cn/core-concepts/endpoints.mdx";
  slug: "zh-cn/core-concepts/endpoints";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/framework-components.mdx": {
	id: "zh-cn/core-concepts/framework-components.mdx";
  slug: "zh-cn/core-concepts/framework-components";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/layouts.mdx": {
	id: "zh-cn/core-concepts/layouts.mdx";
  slug: "zh-cn/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/project-structure.mdx": {
	id: "zh-cn/core-concepts/project-structure.mdx";
  slug: "zh-cn/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/routing.mdx": {
	id: "zh-cn/core-concepts/routing.mdx";
  slug: "zh-cn/core-concepts/routing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/core-concepts/sharing-state.mdx": {
	id: "zh-cn/core-concepts/sharing-state.mdx";
  slug: "zh-cn/core-concepts/sharing-state";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/editor-setup.mdx": {
	id: "zh-cn/editor-setup.mdx";
  slug: "zh-cn/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/getting-started.mdx": {
	id: "zh-cn/getting-started.mdx";
  slug: "zh-cn/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/aliases.mdx": {
	id: "zh-cn/guides/aliases.mdx";
  slug: "zh-cn/guides/aliases";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/backend.mdx": {
	id: "zh-cn/guides/backend.mdx";
  slug: "zh-cn/guides/backend";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/client-side-scripts.mdx": {
	id: "zh-cn/guides/client-side-scripts.mdx";
  slug: "zh-cn/guides/client-side-scripts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/cms.mdx": {
	id: "zh-cn/guides/cms.mdx";
  slug: "zh-cn/guides/cms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/configuring-astro.mdx": {
	id: "zh-cn/guides/configuring-astro.mdx";
  slug: "zh-cn/guides/configuring-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/content.mdx": {
	id: "zh-cn/guides/content.mdx";
  slug: "zh-cn/guides/content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/data-fetching.mdx": {
	id: "zh-cn/guides/data-fetching.mdx";
  slug: "zh-cn/guides/data-fetching";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy.mdx": {
	id: "zh-cn/guides/deploy.mdx";
  slug: "zh-cn/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/buddy.mdx": {
	id: "zh-cn/guides/deploy/buddy.mdx";
  slug: "zh-cn/guides/deploy/buddy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/cloudflare.mdx": {
	id: "zh-cn/guides/deploy/cloudflare.mdx";
  slug: "zh-cn/guides/deploy/cloudflare";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/github.mdx": {
	id: "zh-cn/guides/deploy/github.mdx";
  slug: "zh-cn/guides/deploy/github";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/gitlab.mdx": {
	id: "zh-cn/guides/deploy/gitlab.mdx";
  slug: "zh-cn/guides/deploy/gitlab";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/google-firebase.mdx": {
	id: "zh-cn/guides/deploy/google-firebase.mdx";
  slug: "zh-cn/guides/deploy/google-firebase";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/deploy/vercel.mdx": {
	id: "zh-cn/guides/deploy/vercel.mdx";
  slug: "zh-cn/guides/deploy/vercel";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/environment-variables.mdx": {
	id: "zh-cn/guides/environment-variables.mdx";
  slug: "zh-cn/guides/environment-variables";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/fonts.mdx": {
	id: "zh-cn/guides/fonts.mdx";
  slug: "zh-cn/guides/fonts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/images.mdx": {
	id: "zh-cn/guides/images.mdx";
  slug: "zh-cn/guides/images";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/imports.mdx": {
	id: "zh-cn/guides/imports.mdx";
  slug: "zh-cn/guides/imports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/integrations-guide.mdx": {
	id: "zh-cn/guides/integrations-guide.mdx";
  slug: "zh-cn/guides/integrations-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/integrations-guide/mdx.mdx": {
	id: "zh-cn/guides/integrations-guide/mdx.mdx";
  slug: "zh-cn/guides/integrations-guide/mdx";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/integrations-guide/node.mdx": {
	id: "zh-cn/guides/integrations-guide/node.mdx";
  slug: "zh-cn/guides/integrations-guide/node";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/integrations-guide/react.mdx": {
	id: "zh-cn/guides/integrations-guide/react.mdx";
  slug: "zh-cn/guides/integrations-guide/react";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/integrations-guide/tailwind.mdx": {
	id: "zh-cn/guides/integrations-guide/tailwind.mdx";
  slug: "zh-cn/guides/integrations-guide/tailwind";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/markdown-content.mdx": {
	id: "zh-cn/guides/markdown-content.mdx";
  slug: "zh-cn/guides/markdown-content";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/migrate-to-astro.mdx": {
	id: "zh-cn/guides/migrate-to-astro.mdx";
  slug: "zh-cn/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/migrate-to-astro/from-nextjs.mdx": {
	id: "zh-cn/guides/migrate-to-astro/from-nextjs.mdx";
  slug: "zh-cn/guides/migrate-to-astro/from-nextjs";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/rss.mdx": {
	id: "zh-cn/guides/rss.mdx";
  slug: "zh-cn/guides/rss";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/server-side-rendering.mdx": {
	id: "zh-cn/guides/server-side-rendering.mdx";
  slug: "zh-cn/guides/server-side-rendering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/styling.mdx": {
	id: "zh-cn/guides/styling.mdx";
  slug: "zh-cn/guides/styling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/testing.mdx": {
	id: "zh-cn/guides/testing.mdx";
  slug: "zh-cn/guides/testing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/troubleshooting.mdx": {
	id: "zh-cn/guides/troubleshooting.mdx";
  slug: "zh-cn/guides/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/guides/typescript.mdx": {
	id: "zh-cn/guides/typescript.mdx";
  slug: "zh-cn/guides/typescript";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/install/auto.mdx": {
	id: "zh-cn/install/auto.mdx";
  slug: "zh-cn/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/install/manual.mdx": {
	id: "zh-cn/install/manual.mdx";
  slug: "zh-cn/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/integrations/integrations.mdx": {
	id: "zh-cn/integrations/integrations.mdx";
  slug: "zh-cn/integrations/integrations";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/recipes.mdx": {
	id: "zh-cn/recipes.mdx";
  slug: "zh-cn/recipes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/adapter-reference.mdx": {
	id: "zh-cn/reference/adapter-reference.mdx";
  slug: "zh-cn/reference/adapter-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/api-reference.mdx": {
	id: "zh-cn/reference/api-reference.mdx";
  slug: "zh-cn/reference/api-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/cli-reference.mdx": {
	id: "zh-cn/reference/cli-reference.mdx";
  slug: "zh-cn/reference/cli-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/configuration-reference.mdx": {
	id: "zh-cn/reference/configuration-reference.mdx";
  slug: "zh-cn/reference/configuration-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/directives-reference.mdx": {
	id: "zh-cn/reference/directives-reference.mdx";
  slug: "zh-cn/reference/directives-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/error-reference.mdx": {
	id: "zh-cn/reference/error-reference.mdx";
  slug: "zh-cn/reference/error-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/client-address-not-available.mdx": {
	id: "zh-cn/reference/errors/client-address-not-available.mdx";
  slug: "zh-cn/reference/errors/client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/get-static-paths-expected-params.mdx": {
	id: "zh-cn/reference/errors/get-static-paths-expected-params.mdx";
  slug: "zh-cn/reference/errors/get-static-paths-expected-params";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/get-static-paths-invalid-route-param.mdx": {
	id: "zh-cn/reference/errors/get-static-paths-invalid-route-param.mdx";
  slug: "zh-cn/reference/errors/get-static-paths-invalid-route-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/get-static-paths-removed-rsshelper.mdx": {
	id: "zh-cn/reference/errors/get-static-paths-removed-rsshelper.mdx";
  slug: "zh-cn/reference/errors/get-static-paths-removed-rsshelper";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/get-static-paths-required.mdx": {
	id: "zh-cn/reference/errors/get-static-paths-required.mdx";
  slug: "zh-cn/reference/errors/get-static-paths-required";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/image-missing-alt.mdx": {
	id: "zh-cn/reference/errors/image-missing-alt.mdx";
  slug: "zh-cn/reference/errors/image-missing-alt";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/invalid-component-args.mdx": {
	id: "zh-cn/reference/errors/invalid-component-args.mdx";
  slug: "zh-cn/reference/errors/invalid-component-args";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/invalid-get-static-path-param.mdx": {
	id: "zh-cn/reference/errors/invalid-get-static-path-param.mdx";
  slug: "zh-cn/reference/errors/invalid-get-static-path-param";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/invalid-get-static-paths-return.mdx": {
	id: "zh-cn/reference/errors/invalid-get-static-paths-return.mdx";
  slug: "zh-cn/reference/errors/invalid-get-static-paths-return";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/invalid-image-service.mdx": {
	id: "zh-cn/reference/errors/invalid-image-service.mdx";
  slug: "zh-cn/reference/errors/invalid-image-service";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/invalid-prerender-export.mdx": {
	id: "zh-cn/reference/errors/invalid-prerender-export.mdx";
  slug: "zh-cn/reference/errors/invalid-prerender-export";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/missing-image-dimension.mdx": {
	id: "zh-cn/reference/errors/missing-image-dimension.mdx";
  slug: "zh-cn/reference/errors/missing-image-dimension";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/missing-media-query-directive.mdx": {
	id: "zh-cn/reference/errors/missing-media-query-directive.mdx";
  slug: "zh-cn/reference/errors/missing-media-query-directive";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-adapter-installed.mdx": {
	id: "zh-cn/reference/errors/no-adapter-installed.mdx";
  slug: "zh-cn/reference/errors/no-adapter-installed";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-client-entrypoint.mdx": {
	id: "zh-cn/reference/errors/no-client-entrypoint.mdx";
  slug: "zh-cn/reference/errors/no-client-entrypoint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-client-only-hint.mdx": {
	id: "zh-cn/reference/errors/no-client-only-hint.mdx";
  slug: "zh-cn/reference/errors/no-client-only-hint";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-matching-import.mdx": {
	id: "zh-cn/reference/errors/no-matching-import.mdx";
  slug: "zh-cn/reference/errors/no-matching-import";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-matching-renderer.mdx": {
	id: "zh-cn/reference/errors/no-matching-renderer.mdx";
  slug: "zh-cn/reference/errors/no-matching-renderer";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/no-matching-static-path-found.mdx": {
	id: "zh-cn/reference/errors/no-matching-static-path-found.mdx";
  slug: "zh-cn/reference/errors/no-matching-static-path-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/only-response-can-be-returned.mdx": {
	id: "zh-cn/reference/errors/only-response-can-be-returned.mdx";
  slug: "zh-cn/reference/errors/only-response-can-be-returned";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/page-number-param-not-found.mdx": {
	id: "zh-cn/reference/errors/page-number-param-not-found.mdx";
  slug: "zh-cn/reference/errors/page-number-param-not-found";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/reserved-slot-name.mdx": {
	id: "zh-cn/reference/errors/reserved-slot-name.mdx";
  slug: "zh-cn/reference/errors/reserved-slot-name";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/static-client-address-not-available.mdx": {
	id: "zh-cn/reference/errors/static-client-address-not-available.mdx";
  slug: "zh-cn/reference/errors/static-client-address-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/static-redirect-not-available.mdx": {
	id: "zh-cn/reference/errors/static-redirect-not-available.mdx";
  slug: "zh-cn/reference/errors/static-redirect-not-available";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/unknown-compiler-error.mdx": {
	id: "zh-cn/reference/errors/unknown-compiler-error.mdx";
  slug: "zh-cn/reference/errors/unknown-compiler-error";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/errors/unsupported-image-format.mdx": {
	id: "zh-cn/reference/errors/unsupported-image-format.mdx";
  slug: "zh-cn/reference/errors/unsupported-image-format";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/integrations-reference.mdx": {
	id: "zh-cn/reference/integrations-reference.mdx";
  slug: "zh-cn/reference/integrations-reference";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-cn/reference/publish-to-npm.mdx": {
	id: "zh-cn/reference/publish-to-npm.mdx";
  slug: "zh-cn/reference/publish-to-npm";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/concepts/islands.mdx": {
	id: "zh-tw/concepts/islands.mdx";
  slug: "zh-tw/concepts/islands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/concepts/why-astro.mdx": {
	id: "zh-tw/concepts/why-astro.mdx";
  slug: "zh-tw/concepts/why-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/core-concepts/astro-pages.mdx": {
	id: "zh-tw/core-concepts/astro-pages.mdx";
  slug: "zh-tw/core-concepts/astro-pages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/core-concepts/layouts.mdx": {
	id: "zh-tw/core-concepts/layouts.mdx";
  slug: "zh-tw/core-concepts/layouts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/core-concepts/project-structure.mdx": {
	id: "zh-tw/core-concepts/project-structure.mdx";
  slug: "zh-tw/core-concepts/project-structure";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/editor-setup.mdx": {
	id: "zh-tw/editor-setup.mdx";
  slug: "zh-tw/editor-setup";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/getting-started.mdx": {
	id: "zh-tw/getting-started.mdx";
  slug: "zh-tw/getting-started";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/guides/deploy.mdx": {
	id: "zh-tw/guides/deploy.mdx";
  slug: "zh-tw/guides/deploy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/guides/migrate-to-astro.mdx": {
	id: "zh-tw/guides/migrate-to-astro.mdx";
  slug: "zh-tw/guides/migrate-to-astro";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/install/auto.mdx": {
	id: "zh-tw/install/auto.mdx";
  slug: "zh-tw/install/auto";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"zh-tw/install/manual.mdx": {
	id: "zh-tw/install/manual.mdx";
  slug: "zh-tw/install/manual";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
