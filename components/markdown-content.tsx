"use client";

import MarkdownIt from "markdown-it";

import { cn } from "@/lib/utils";

type MarkdownContentProps = {
	children: string;
	className?: string;
	compact?: boolean;
};

const markdown = new MarkdownIt({
	breaks: false,
	html: true,
	linkify: true,
	typographer: true,
});

const defaultValidateLink = markdown.validateLink.bind(markdown);
const defaultLinkOpenRule = markdown.renderer.rules.link_open;

function isAllowedHref(href: string) {
	if (href.startsWith("/")) {
		return true;
	}

	try {
		const url = new URL(href);
		return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
	} catch {
		return false;
	}
}

markdown.validateLink = (href) => defaultValidateLink(href) && isAllowedHref(href);
markdown.renderer.rules.link_open = (tokens, index, options, environment, self) => {
	const token = tokens[index];
	const href = String(token.attrGet("href") ?? "");

	if (href && !href.startsWith("/")) {
		token.attrSet("target", "_blank");
		token.attrSet("rel", "noopener noreferrer");
	}

	return defaultLinkOpenRule
		? defaultLinkOpenRule(tokens, index, options, environment, self)
		: self.renderToken(tokens, index, options);
};

export function MarkdownContent({ children, className, compact = false }: MarkdownContentProps) {
	const renderedMarkdown = markdown.render(children);

	return (
		<div
			className={cn(
				"min-w-0 [&_a]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-current [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_em]:italic [&_strong]:font-bold",
				compact
					? "[&_blockquote]:border-l [&_blockquote]:border-current/30 [&_blockquote]:pl-3 [&_h1]:inline [&_h2]:inline [&_h3]:inline [&_h4]:inline [&_h5]:inline [&_h6]:inline [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:inline [&_table]:inline-table [&_td]:px-2 [&_th]:px-2 [&_ul]:ml-5 [&_ul]:list-disc"
					: "[&_blockquote]:border-l-2 [&_blockquote]:border-current/30 [&_blockquote]:pl-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_ol]:ml-5 [&_ol]:list-decimal [&_p:not(:last-child)]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black/30 [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_td]:border-current/20 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-current/20 [&_th]:px-2 [&_th]:py-1 [&_ul]:ml-5 [&_ul]:list-disc",
				className,
			)}
			dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
		/>
	);
}
