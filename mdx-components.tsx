import type { MDXComponents } from "mdx/types";

import { articleMdxComponents } from "@/components/mdx/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...articleMdxComponents,
    ...components,
  };
}
