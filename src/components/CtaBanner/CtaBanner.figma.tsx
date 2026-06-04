import figma from "@figma/code-connect";
import CtaBanner from "./CtaBanner";

figma.connect(
  CtaBanner,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=75-9",
  {
    props: {
      heading: figma.string("Heading"),
      subtext: figma.string("Subtext"),
      ctaLabel: figma.string("CTA Label"),
    },
    example: (props) => (
      <CtaBanner
        heading={props.heading}
        subtext={props.subtext}
        ctaLabel={props.ctaLabel}
      />
    ),
  }
);
