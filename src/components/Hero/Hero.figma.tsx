import figma from "@figma/code-connect";
import Hero from "./Hero";

figma.connect(
  Hero,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=75-7",
  {
    props: {
      heading: figma.string("Heading"),
      subtitle: figma.string("Subtitle"),
      ctaLabel: figma.string("CTA Label"),
    },
    example: (props) => (
      <Hero
        heading={props.heading}
        subtitle={props.subtitle}
        ctaLabel={props.ctaLabel}
      />
    ),
  }
);
