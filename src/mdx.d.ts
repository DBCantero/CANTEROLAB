declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType<{
    components?: import("mdx/types").MDXComponents;
  }>;

  export const frontmatter: unknown;

  export default MDXComponent;
}
